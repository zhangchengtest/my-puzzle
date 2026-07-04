<template>
  <div class="container">
    <div class="toolbar">
      <div class="path-bar">
        <button class="btn-icon" @click="goUp" :disabled="!currentPath" title="上级目录">↑</button>
        <span class="path-label">/{{ currentPath || '' }}</span>
        <button class="btn" @click="loadFiles" :disabled="loading">刷新</button>
      </div>
      <div class="upload-bar">
        <input type="file" ref="fileInput" @change="onFileSelected" />
        <button class="btn primary" @click="uploadSelected" :disabled="!selectedFile || uploading">
          {{ uploading ? '上传中...' : '上传' }}
        </button>
      </div>
    </div>

    <p v-if="error" class="error">{{ error }}</p>
    <p v-if="loading" class="hint">加载中...</p>

    <table v-if="!loading && files.length" class="file-table">
      <thead>
        <tr>
          <th>名称</th>
          <th>大小</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in files" :key="item.href" @dblclick="onRowDblClick(item)">
          <td>
            <span :class="['file-icon', item.isDir ? 'dir' : 'file']">{{ item.isDir ? '📁' : '📄' }}</span>
            <a
              v-if="item.isDir"
              href="javascript:void(0)"
              @click="enterDir(item)"
            >{{ item.name }}</a>
            <span v-else>{{ item.name }}</span>
          </td>
          <td>{{ item.isDir ? '-' : formatSize(item.size) }}</td>
          <td class="actions">
            <button v-if="!item.isDir" class="btn-sm" @click="downloadFile(item)">下载</button>
            <button v-if="!item.isDir" class="btn-sm danger" @click="deleteFile(item)">删除</button>
            <button v-if="item.isDir" class="btn-sm" @click="enterDir(item)">打开</button>
          </td>
        </tr>
      </tbody>
    </table>

    <p v-if="!loading && !files.length && !error" class="hint">目录为空</p>

    <details class="help">
      <summary>服务器配置说明</summary>
      <p>将 nginx 目录 <code>/ROOT/downloads</code> 映射为 <code>/files/</code>：</p>
      <pre>location /files/ {
    alias /ROOT/downloads/;
    autoindex on;
    autoindex_exact_size off;
    autoindex_localtime on;
}</pre>
      <p>以上配置即可浏览、下载。上传/删除需要 WebDAV，源码安装的 nginx 需重新编译：</p>
      <pre>./configure ...原有参数... --with-http_dav_module
make && cp objs/nginx /usr/local/nginx/sbin/nginx</pre>
      <p>编译完成后在 location 里加上：</p>
      <pre>dav_methods PUT DELETE;
create_full_put_path on;
dav_access user:rw group:rw all:r;
client_max_body_size 100m;</pre>
      <p>并确保 nginx 运行用户对 <code>/ROOT/downloads</code> 有写权限。</p>
    </details>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { downloadsUrl } from '@/config'

const currentPath = ref('')
const files = ref([])
const loading = ref(false)
const uploading = ref(false)
const error = ref('')
const selectedFile = ref(null)
const fileInput = ref(null)

function joinUrl(...parts) {
  const base = downloadsUrl.replace(/\/+$/, '')
  const rest = parts.filter(Boolean).join('/').replace(/^\/+/, '')
  return rest ? `${base}/${rest}` : `${base}/`
}

function formatSize(bytes) {
  if (bytes == null || bytes === '-') return '-'
  const n = Number(bytes)
  if (Number.isNaN(n)) return bytes
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  if (n < 1024 * 1024 * 1024) return `${(n / 1024 / 1024).toFixed(1)} MB`
  return `${(n / 1024 / 1024 / 1024).toFixed(1)} GB`
}

function parseNginxAutoindex(html) {
  const doc = new DOMParser().parseFromString(html, 'text/html')
  const items = []
  const seen = new Set()

  for (const a of doc.querySelectorAll('a')) {
    const href = a.getAttribute('href')
    if (!href || href === '../' || href.startsWith('?') || href.startsWith('#')) continue

    const isDir = href.endsWith('/')
    const name = decodeURIComponent(href.replace(/\/$/, ''))
    if (!name || seen.has(href)) continue
    seen.add(href)

    let size = null
    const row = a.closest('tr') || a.parentElement
    if (row) {
      const text = row.textContent.replace(a.textContent, '').trim()
      const sizeMatch = text.match(/(\d+(?:\.\d+)?[KMG]?|-)\s*$/)
      if (sizeMatch) size = sizeMatch[1]
    }

    items.push({ name, href, isDir, size })
  }

  return items.sort((a, b) => {
    if (a.isDir !== b.isDir) return a.isDir ? -1 : 1
    return a.name.localeCompare(b.name)
  })
}

function parseWebDav(xmlText) {
  const doc = new DOMParser().parseFromString(xmlText, 'application/xml')
  const items = []

  for (const resp of doc.querySelectorAll('response')) {
    const hrefEl = resp.querySelector('href')
    if (!hrefEl) continue

    const fullHref = decodeURIComponent(hrefEl.textContent.trim())
    const name = fullHref.replace(/\/$/, '').split('/').pop()
    if (!name) continue

    const isCollection = resp.querySelector('collection') !== null
    const lenEl = resp.querySelector('getcontentlength')
    const size = lenEl ? lenEl.textContent.trim() : null

    items.push({
      name,
      href: name + (isCollection ? '/' : ''),
      isDir: isCollection,
      size,
    })
  }

  return items.sort((a, b) => {
    if (a.isDir !== b.isDir) return a.isDir ? -1 : 1
    return a.name.localeCompare(b.name)
  })
}

async function fetchAutoindex(url) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`无法读取目录 (${res.status})`)
  const html = await res.text()
  if (!html.includes('<a ') && !html.includes('<A ')) {
    throw new Error('响应不是目录列表，请检查 nginx autoindex 配置')
  }
  return parseNginxAutoindex(html)
}

async function fetchWebDav(url) {
  const body = `<?xml version="1.0" encoding="utf-8"?>
<d:propfind xmlns:d="DAV:">
  <d:prop><d:displayname/><d:getcontentlength/><d:resourcetype/></d:prop>
</d:propfind>`

  const res = await fetch(url, {
    method: 'PROPFIND',
    headers: {
      Depth: '1',
      'Content-Type': 'application/xml',
    },
    body,
  })

  if (!res.ok) throw new Error(`WebDAV 列表失败 (${res.status})`)
  return parseWebDav(await res.text())
}

async function loadFiles() {
  loading.value = true
  error.value = ''
  files.value = []

  const url = joinUrl(currentPath.value)
  try {
    files.value = await fetchAutoindex(url)
  } catch (e1) {
    try {
      files.value = await fetchWebDav(url)
    } catch (e2) {
      error.value = e1.message || '加载失败'
      console.error(e1, e2)
    }
  } finally {
    loading.value = false
  }
}

function enterDir(item) {
  currentPath.value = currentPath.value
    ? `${currentPath.value}/${item.name}`
    : item.name
  loadFiles()
}

function goUp() {
  if (!currentPath.value) return
  const parts = currentPath.value.split('/')
  parts.pop()
  currentPath.value = parts.join('/')
  loadFiles()
}

function onRowDblClick(item) {
  if (item.isDir) enterDir(item)
  else downloadFile(item)
}

function fileUrl(item) {
  return joinUrl(currentPath.value, item.name)
}

function downloadFile(item) {
  const a = document.createElement('a')
  a.href = fileUrl(item)
  a.download = item.name
  a.target = '_blank'
  a.rel = 'noopener'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}

async function deleteFile(item) {
  if (!confirm(`确定删除 ${item.name}？`)) return
  try {
    const res = await fetch(fileUrl(item), { method: 'DELETE' })
    if (res.status === 405) throw new Error('删除失败 (405)：nginx 未启用 WebDAV (dav_methods DELETE)')
    if (!res.ok) throw new Error(`删除失败 (${res.status})`)
    await loadFiles()
  } catch (e) {
    error.value = e.message
  }
}

function onFileSelected(e) {
  selectedFile.value = e.target.files[0] || null
}

async function uploadSelected() {
  if (!selectedFile.value) return
  uploading.value = true
  error.value = ''

  const url = joinUrl(currentPath.value, selectedFile.value.name)
  try {
    const res = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': selectedFile.value.type || 'application/octet-stream',
      },
      body: selectedFile.value,
    })
    if (res.status === 405) throw new Error('上传失败 (405)：nginx 未启用 WebDAV，需重新编译并加 --with-http_dav_module，再配置 dav_methods PUT')
    if (!res.ok) throw new Error(`上传失败 (${res.status})`)
    selectedFile.value = null
    if (fileInput.value) fileInput.value.value = ''
    await loadFiles()
  } catch (e) {
    error.value = e.message
  } finally {
    uploading.value = false
  }
}

onMounted(loadFiles)
</script>

<style scoped>
.container {
  max-width: 900px;
  margin: 0 auto;
  padding: 1rem;
}

.toolbar {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.path-bar,
.upload-bar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.path-label {
  flex: 1;
  font-family: monospace;
  background: #f3f4f6;
  padding: 0.4rem 0.6rem;
  border-radius: 4px;
  word-break: break-all;
}

.btn,
.btn-sm,
.btn-icon {
  cursor: pointer;
  border: 1px solid #ccc;
  background: #fff;
  border-radius: 4px;
  padding: 0.35rem 0.75rem;
}

.btn-icon {
  font-size: 1.1rem;
  padding: 0.25rem 0.6rem;
}

.btn.primary {
  background: #3b82f6;
  color: #fff;
  border-color: #3b82f6;
}

.btn-sm {
  padding: 0.2rem 0.5rem;
  font-size: 0.85rem;
}

.btn-sm.danger {
  color: #dc2626;
  border-color: #fca5a5;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.file-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 0.5rem;
}

.file-table th,
.file-table td {
  border: 1px solid #e5e7eb;
  padding: 0.5rem 0.75rem;
  text-align: left;
}

.file-table th {
  background: #f9fafb;
}

.file-table tbody tr:hover {
  background: #f0f9ff;
}

.file-icon {
  margin-right: 0.4rem;
}

.actions {
  white-space: nowrap;
}

.error {
  color: #dc2626;
  margin: 0.5rem 0;
}

.hint {
  color: #6b7280;
  margin: 1rem 0;
}

.help {
  margin-top: 2rem;
  font-size: 0.85rem;
  color: #6b7280;
}

.help pre {
  background: #f3f4f6;
  padding: 0.75rem;
  overflow-x: auto;
  border-radius: 4px;
  font-size: 0.8rem;
}

@media (max-width: 600px) {
  .file-table th:nth-child(2),
  .file-table td:nth-child(2) {
    display: none;
  }
}
</style>
