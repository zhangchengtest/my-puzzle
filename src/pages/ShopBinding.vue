<template>
  <div class="shop-mock">
    <header class="topbar">
      <div class="brand">
        <span class="logo">🛒</span>
        <div>
          <div class="brand-name">PuzzleMart</div>
          <div class="brand-sub">模拟电商平台 · Seller Console</div>
        </div>
      </div>
      <div class="env-tag">{{ apiBaseLabel }}</div>
    </header>

    <main class="layout">
      <section class="panel">
        <h2>卖家信息</h2>
        <p class="hint">填写后调用 account-binding/request，用返回的 redirectUrl 跳转到 mp-frontend 店铺绑定页。</p>

        <div class="grid">
          <label>
            <span>Seller ID *</span>
            <input v-model.trim="form.sellerId" placeholder="平台侧卖家唯一 ID" />
          </label>
          <label>
            <span>Seller Cert No *</span>
            <input v-model.trim="form.sellerCertNo" placeholder="证件号 / 注册号" />
          </label>
          <label>
            <span>Seller Name *</span>
            <input v-model.trim="form.sellerName" placeholder="卖家名称" />
          </label>
          <label>
            <span>Store Name *</span>
            <input v-model.trim="form.storeName" placeholder="店铺名称" />
          </label>
          <label class="full">
            <span>Store URL *</span>
            <input v-model.trim="form.storeUrl" placeholder="https://shop.example.com/store/xxx" />
          </label>
          <label>
            <span>Entity Type *</span>
            <select v-model="form.entityType">
              <option value="Individual">Individual</option>
              <option value="Corporate">Corporate</option>
            </select>
          </label>
          <label>
            <span>Country (ISO 3166-1 alpha-3) *</span>
            <input v-model.trim="form.country" placeholder="如 GBR / CHN / HKG" />
          </label>
          <label>
            <span>Currency *</span>
            <input v-model.trim="form.currency" placeholder="如 GBP / USD / CNH" />
          </label>
          <label>
            <span>Request No</span>
            <input v-model.trim="form.requestNo" placeholder="留空则自动生成" />
          </label>
          <label class="full">
            <span>Backlink URL</span>
            <input v-model.trim="form.backlinkUrl" placeholder="绑定完成后回跳电商平台的地址（可选）" />
          </label>
          <label class="full">
            <span>Note</span>
            <input v-model.trim="form.note" placeholder="备注（可选）" />
          </label>
        </div>

        <div class="actions">
          <button class="primary" :disabled="loading" @click="startBinding">
            {{ loading ? '请求中…' : '绑定收款账户 → 跳转 Infinia' }}
          </button>
          <button class="ghost" :disabled="loading" @click="fillDemo">填充示例</button>
          <button class="ghost" :disabled="loading || !redirectUrl" @click="openRedirect">仅打开链接</button>
        </div>
      </section>

      <section class="panel">
        <div class="panel-head">
          <h2>OpenAPI 凭证</h2>
          <button class="link" @click="showCreds = !showCreds">{{ showCreds ? '收起' : '展开' }}</button>
        </div>
        <p class="hint">appId + 平台私钥（签名/解密）+ Infinia 公钥（加密）。保存在本机 localStorage。</p>

        <div v-show="showCreds" class="grid">
          <label class="full">
            <span>API Base</span>
            <input v-model.trim="creds.apiBase" placeholder="/openapi-proxy 或 https://s2t-openapi.infiniax.com" />
          </label>
          <label class="full">
            <span>App ID *</span>
            <input v-model.trim="creds.appId" placeholder="平台 appId" />
          </label>
          <label class="full">
            <span>Infinia Public Key *</span>
            <textarea v-model.trim="creds.infiniaPublicKey" rows="3" placeholder="用于加密 requestData 的 Infinia 公钥（Base64，可无 PEM 头尾）" />
          </label>
          <label class="full">
            <span>Platform Private Key *</span>
            <textarea v-model.trim="creds.platformPrivateKey" rows="4" placeholder="平台 PKCS8 私钥（Base64，可无 PEM 头尾）" />
          </label>
        </div>
        <div class="actions">
          <button class="ghost" @click="saveCreds">保存凭证</button>
          <button class="ghost" @click="clearCreds">清除凭证</button>
        </div>
      </section>

      <section class="panel result" v-if="error || redirectUrl || responseJson">
        <h2>结果</h2>
        <p v-if="error" class="error">{{ error }}</p>
        <div v-if="redirectUrl" class="redirect-box">
          <div class="label">Redirect URL</div>
          <a :href="redirectUrl" target="_blank" rel="noopener">{{ redirectUrl }}</a>
        </div>
        <pre v-if="responseJson">{{ responseJson }}</pre>
      </section>
    </main>
  </div>
</template>

<script>
import axios from 'axios'
import { buildOpenApiRequest, parseOpenApiResponse } from '@/utils/openapiCrypto'

const STORAGE_KEY = 'puzzlemart-openapi-creds'

/** 与 payment-openapi bootstrap-dev 中的 Infinia 公钥一致，s2t 环境通常相同；若不通可在页面改 */
const DEFAULT_INFINIA_PUB =
  'MIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEA8gmwEYKZoZKK5ubCagz22CeVlzQItf8Gh1spkHzp3SlSuEaDg/1uVzzBWoqjFylw144oPZm9WKhbGXNC33WKO45Tz5zpbfNA/6v99uwxZMEf8rjo9MOWbtMReZl8F2pm8upQXliyY43Sz6m/sPlbzl37L7zo0C6kpR9Eje8Xquen5ZMGh3HP8HtFLJJBFRRg1haXV4rkvMdsNaKHXx7eQZLcQLRzbgGblqKG0BVKQMeDA8t0IJXxdew4rQyLW7w6NgPR74V3ILe4IL27+Ydft4QUPCQwyOpazL7fxjmPrmMRDZLSNyCPutqsFAHzUz0li6GGjgDYKiLzQVU5qO8BhiLXiNXKIYvEJhkj1QhLKq0k1SrLf/WWllUORessiMCvRuV/JKhhYIS8Z+M6eU54r8S9vRpUPfMgxL19jzskimtTD1UPEbFXPcJOpl3u1OtJdLO8HS7aJyxIfEFwoMHDJIGbM16+uS8EX8mci/KRj1iKRzRSUcfie27oJYYEeEeXfqY0R9TqYZQOGEX+t7OhZVtIw5x1v6FtaYFuZOS5J3mj/48dGPX7IJAW/Uyg99vVwXi7J7hLIcb2trazNkLrcdKvW6+hlH2S0UXRM2YkctarbOqzjTIV3OAVSvbkN4l9Pfc+xD0SSDm2W3OOypFpb7FgQglM2oRv6D14JpO4mScCAwEAAQ=='

export default {
  name: 'ShopBinding',
  data() {
    return {
      loading: false,
      showCreds: true,
      error: '',
      redirectUrl: '',
      responseJson: '',
      form: {
        requestNo: '',
        sellerId: '',
        sellerCertNo: '',
        sellerName: '',
        storeName: '',
        storeUrl: '',
        entityType: 'Corporate',
        country: 'GBR',
        currency: 'GBP',
        note: '',
        backlinkUrl: typeof window !== 'undefined' ? window.location.origin + '/shopbinding' : '',
      },
      creds: {
        apiBase: '/openapi-proxy',
        appId: '',
        infiniaPublicKey: DEFAULT_INFINIA_PUB,
        platformPrivateKey: '',
      },
    }
  },
  computed: {
    apiBaseLabel() {
      return this.creds.apiBase || '/openapi-proxy'
    },
  },
  created() {
    this.loadCreds()
  },
  methods: {
    uuid() {
      if (crypto?.randomUUID) return crypto.randomUUID().replace(/-/g, '')
      return `${Date.now()}${Math.random().toString(16).slice(2)}`
    },
    loadCreds() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (!raw) return
        this.creds = { ...this.creds, ...JSON.parse(raw) }
      } catch (_) {
        /* ignore */
      }
    },
    saveCreds() {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.creds))
      this.error = ''
      alert('凭证已保存到 localStorage')
    },
    clearCreds() {
      localStorage.removeItem(STORAGE_KEY)
      this.creds = {
        apiBase: '/openapi-proxy',
        appId: '',
        infiniaPublicKey: DEFAULT_INFINIA_PUB,
        platformPrivateKey: '',
      }
    },
    fillDemo() {
      const id = this.uuid().slice(0, 12)
      this.form = {
        ...this.form,
        requestNo: this.uuid(),
        sellerId: `seller_${id}`,
        sellerCertNo: `CERT${id.toUpperCase()}`,
        sellerName: `Demo Seller ${id}`,
        storeName: `Demo Store ${id}`,
        storeUrl: `https://puzzlemart.local/store/${id}`,
        entityType: 'Corporate',
        country: 'GBR',
        currency: 'GBP',
        note: 'my-puzzle mock binding',
        backlinkUrl: window.location.origin + '/shopbinding',
      }
    },
    validate() {
      const requiredForm = ['sellerId', 'sellerCertNo', 'sellerName', 'storeName', 'storeUrl', 'entityType', 'country', 'currency']
      for (const key of requiredForm) {
        if (!this.form[key]) throw new Error(`请填写 ${key}`)
      }
      if (!this.creds.appId) throw new Error('请填写 App ID')
      if (!this.creds.infiniaPublicKey) throw new Error('请填写 Infinia Public Key')
      if (!this.creds.platformPrivateKey) throw new Error('请填写 Platform Private Key')
    },
    openRedirect() {
      if (this.redirectUrl) window.location.href = this.redirectUrl
    },
    async startBinding() {
      this.error = ''
      this.redirectUrl = ''
      this.responseJson = ''
      this.loading = true
      try {
        this.validate()
        const requestBody = {
          requestNo: this.form.requestNo || this.uuid(),
          sellerId: this.form.sellerId,
          sellerCertNo: this.form.sellerCertNo,
          sellerName: this.form.sellerName,
          storeName: this.form.storeName,
          storeUrl: this.form.storeUrl,
          entityType: this.form.entityType,
          country: this.form.country,
          currency: this.form.currency,
          note: this.form.note || undefined,
          backlinkUrl: this.form.backlinkUrl || undefined,
        }

        const payload = buildOpenApiRequest({
          appId: this.creds.appId,
          requestBody,
          infiniaPublicKey: this.creds.infiniaPublicKey,
          platformPrivateKey: this.creds.platformPrivateKey,
        })

        const base = (this.creds.apiBase || '/openapi-proxy').replace(/\/$/, '')
        const { data: resp } = await axios.post(`${base}/api/v1/account-binding/request`, payload, {
          headers: { 'Content-Type': 'application/json' },
          timeout: 30000,
        })

        const okCodes = ['SUC-200', '00000000', 'SUCCESS', '0']
        if (resp.code && !okCodes.includes(String(resp.code)) && !resp.responseData) {
          throw new Error(resp.message || `接口错误 code=${resp.code}`)
        }
        if (resp.code && !okCodes.includes(String(resp.code)) && String(resp.status) === '0') {
          throw new Error(resp.message || `接口错误 code=${resp.code}`)
        }

        const { data, raw } = parseOpenApiResponse(resp, this.creds.platformPrivateKey)
        this.responseJson = JSON.stringify({ envelope: raw, decrypted: data }, null, 2)

        const url = data?.redirectUrl
        if (!url) throw new Error('响应中没有 redirectUrl')
        this.redirectUrl = url
        // 跳转到 mp-frontend 店铺绑定 loading 页
        window.location.href = url
      } catch (e) {
        const msg =
          e?.response?.data?.message ||
          e?.response?.data?.msg ||
          (typeof e?.response?.data === 'string' ? e.response.data : null) ||
          e?.message ||
          String(e)
        this.error = msg
        if (e?.response?.data) {
          this.responseJson = JSON.stringify(e.response.data, null, 2)
        }
      } finally {
        this.loading = false
      }
    },
  },
}
</script>

<style scoped>
.shop-mock {
  min-height: 100vh;
  background:
    radial-gradient(ellipse at 10% 0%, #1a3a2f 0%, transparent 50%),
    radial-gradient(ellipse at 90% 10%, #2a2440 0%, transparent 45%),
    #12141a;
  color: #e8ebe9;
  padding: 24px 16px 48px;
  box-sizing: border-box;
}

.topbar {
  max-width: 960px;
  margin: 0 auto 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo {
  font-size: 28px;
  line-height: 1;
}

.brand-name {
  font-size: 22px;
  font-weight: 700;
  letter-spacing: 0.02em;
}

.brand-sub {
  font-size: 12px;
  opacity: 0.65;
}

.env-tag {
  font-size: 12px;
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
  max-width: 50%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.layout {
  max-width: 960px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.panel {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 14px;
  padding: 20px;
}

.panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

h2 {
  margin: 0 0 8px;
  font-size: 18px;
}

.hint {
  margin: 0 0 16px;
  font-size: 13px;
  opacity: 0.7;
  line-height: 1.5;
}

.grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

label {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 12px;
  opacity: 0.95;
}

label.full {
  grid-column: 1 / -1;
}

label span {
  opacity: 0.75;
}

input,
select,
textarea {
  width: 100%;
  box-sizing: border-box;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  background: rgba(0, 0, 0, 0.25);
  color: inherit;
  padding: 10px 12px;
  font: inherit;
  font-size: 14px;
}

textarea {
  resize: vertical;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 12px;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 16px;
}

button {
  cursor: pointer;
  border-radius: 8px;
  border: 1px solid transparent;
  padding: 0.6em 1.1em;
  font: inherit;
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.primary {
  background: #3dcf9a;
  color: #0b1a14;
  font-weight: 600;
}

.ghost {
  background: transparent;
  border-color: rgba(255, 255, 255, 0.2);
  color: inherit;
}

.link {
  background: none;
  border: none;
  color: #7dd3b0;
  padding: 0;
  font-size: 13px;
}

.error {
  color: #ff8f8f;
  margin: 0 0 12px;
}

.redirect-box {
  margin-bottom: 12px;
  padding: 12px;
  border-radius: 8px;
  background: rgba(61, 207, 154, 0.08);
  border: 1px solid rgba(61, 207, 154, 0.25);
  word-break: break-all;
}

.redirect-box .label {
  font-size: 12px;
  opacity: 0.7;
  margin-bottom: 6px;
}

.redirect-box a {
  color: #7dd3b0;
}

pre {
  margin: 0;
  padding: 12px;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.35);
  overflow: auto;
  font-size: 12px;
  line-height: 1.45;
  max-height: 360px;
}

@media (max-width: 720px) {
  .grid {
    grid-template-columns: 1fr;
  }
}
</style>
