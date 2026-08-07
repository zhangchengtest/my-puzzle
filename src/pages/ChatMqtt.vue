<template>
  <div class="chat-page">
    <header class="chat-header">
      <h1>房间聊天 · MQTT</h1>
      <p class="hint">
        纯前端 P2P，信令走国内公共 MQTT（EMQX）。消息仍经 WebRTC，不经自有服务器。建议同房 ≤6 人。
        与「房间聊天」互不互通。
      </p>
      <p v-if="!secureOk" class="secure-warn">
        当前不是安全上下文（需要 HTTPS 或 localhost），浏览器禁用了 Web Crypto / WebRTC，无法进房。
        <template v-if="localhostHint">请改用 <a :href="localhostHint">{{ localhostHint }}</a></template>
        <template v-else>请用 https 打开本站，或本地用 http://localhost 访问。</template>
      </p>
    </header>

    <section v-if="!joined" class="lobby">
      <label>
        昵称
        <input v-model.trim="nickname" maxlength="20" placeholder="怎么称呼你" @keyup.enter="join" />
      </label>
      <label>
        房间号
        <div class="room-row">
          <input v-model.trim="roomId" maxlength="32" placeholder="输入或生成房间号" @keyup.enter="join" />
          <button type="button" class="ghost" @click="generateRoomId">随机</button>
        </div>
      </label>
      <button type="button" class="primary" :disabled="!canJoin || !secureOk" @click="join">进入房间</button>
      <p v-if="error" class="error">{{ error }}</p>
    </section>

    <section v-else class="room">
      <div class="room-bar">
        <div>
          <strong>{{ roomId }}</strong>
          <span class="meta">在线 {{ peerCount + 1 }} · 信令 {{ relayLabel }} · 我是 {{ nickname }}</span>
        </div>
        <div class="actions">
          <button type="button" class="ghost" @click="copyShareLink">{{ copied ? '已复制' : '复制链接' }}</button>
          <button type="button" class="ghost" @click="leave">离开</button>
        </div>
      </div>

      <div ref="messageList" class="messages">
        <div
          v-for="msg in messages"
          :key="msg.id"
          class="msg"
          :class="msg.kind"
        >
          <template v-if="msg.kind === 'system'">
            {{ systemText(msg) }}
          </template>
          <template v-else>
            <div class="msg-head">
              <span class="name">{{ displayName(msg) }}</span>
              <span class="time">{{ formatTime(msg.at) }}</span>
            </div>
            <div class="msg-body">{{ msg.text }}</div>
          </template>
        </div>
        <div v-if="!messages.length" class="empty">还没有消息，打个招呼吧</div>
      </div>

      <form class="composer" @submit.prevent="send">
        <input
          v-model="draft"
          maxlength="2000"
          placeholder="输入消息，Enter 发送"
          :disabled="sending"
        />
        <button type="submit" class="primary" :disabled="!draft.trim() || sending">发送</button>
      </form>
    </section>
  </div>
</template>

<script>
import { getRelaySockets, joinRoom, selfId } from '@trystero-p2p/mqtt'

const APP_ID = 'my-puzzle-chat-mqtt-v1'
const NICK_KEY = 'puzzle-chat-nickname'

// 优先国内 EMQX 公共节点；另加一个国际节点作备份
const MQTT_URLS = [
  'wss://broker-cn.emqx.io:8084/mqtt',
  'wss://broker.emqx.io:8084/mqtt',
]

function randomRoomId() {
  const alphabet = 'abcdefghjkmnpqrstuvwxyz23456789'
  let id = ''
  for (let i = 0; i < 6; i++) {
    id += alphabet[Math.floor(Math.random() * alphabet.length)]
  }
  return id
}

function isCryptoReady() {
  return Boolean(window.isSecureContext && globalThis.crypto?.subtle?.importKey)
}

function suggestLocalhostUrl() {
  const { protocol, hostname, port, pathname, search, hash } = window.location
  if (protocol !== 'http:') return ''
  if (hostname === 'localhost' || hostname === '127.0.0.1') return ''
  const p = port ? `:${port}` : ''
  return `http://localhost${p}${pathname}${search}${hash}`
}

function isRelayConnected(client) {
  if (!client) return false
  if (client.connected === true) return true
  if (typeof WebSocket !== 'undefined' && client.readyState === WebSocket.OPEN) return true
  return false
}

export default {
  name: 'ChatMqtt',
  data() {
    return {
      nickname: localStorage.getItem(NICK_KEY) || '',
      roomId: '',
      joined: false,
      draft: '',
      sending: false,
      copied: false,
      error: '',
      messages: [],
      peerNames: {},
      peerCount: 0,
      room: null,
      sendChat: null,
      sendName: null,
      msgSeq: 0,
      relayOk: 0,
      relayTimer: null,
      secureOk: isCryptoReady(),
      localhostHint: suggestLocalhostUrl(),
    }
  },
  computed: {
    canJoin() {
      return Boolean(this.nickname && this.roomId)
    },
    relayLabel() {
      if (this.relayOk > 0) return `已连接 ${this.relayOk}`
      return '连接中…'
    },
  },
  mounted() {
    const q = this.$route.query
    if (q.room) this.roomId = String(q.room)
    if (q.nick) this.nickname = String(q.nick)
    if (!this.roomId) this.roomId = randomRoomId()
    if (!this.secureOk) {
      this.error = '请先用 HTTPS 或 localhost 打开本页'
    }
  },
  beforeUnmount() {
    this.teardownRoom()
  },
  methods: {
    generateRoomId() {
      this.roomId = randomRoomId()
    },
    peerLabel(peerId) {
      if (!peerId) return '某人'
      return this.peerNames[peerId] || peerId.slice(0, 6)
    },
    displayName(msg) {
      if (msg.kind === 'mine') return msg.name
      return this.peerLabel(msg.peerId)
    },
    systemText(msg) {
      if (msg.event === 'join') return `${this.peerLabel(msg.peerId)} 加入了房间`
      if (msg.event === 'leave') return `${msg.name || this.peerLabel(msg.peerId)} 离开了房间`
      return msg.text
    },
    syncPeerCount() {
      if (!this.room?.getPeers) return
      this.peerCount = Object.keys(this.room.getPeers()).length
    },
    pushMessage(msg) {
      this.msgSeq += 1
      this.messages.push({ id: `${Date.now()}-${this.msgSeq}`, ...msg })
      this.$nextTick(() => {
        const el = this.$refs.messageList
        if (el) el.scrollTop = el.scrollHeight
      })
    },
    formatTime(at) {
      const d = new Date(at)
      return d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    },
    join() {
      this.error = ''
      this.secureOk = isCryptoReady()
      if (!this.secureOk) {
        this.localhostHint = suggestLocalhostUrl()
        this.error = '当前环境无 Web Crypto（需 HTTPS 或 localhost），无法进入房间'
        return
      }
      if (!this.canJoin) {
        this.error = '请填写昵称和房间号'
        return
      }

      localStorage.setItem(NICK_KEY, this.nickname)
      this.teardownRoom()

      try {
        const room = joinRoom(
          {
            appId: APP_ID,
            relayConfig: { urls: MQTT_URLS },
          },
          this.roomId,
          {
            onJoinError: ({ error: err }) => {
              console.error(err)
              this.error = '进房失败：信令或加密初始化出错，请确认使用 HTTPS / localhost'
              this.leave()
            },
          },
        )
        this.startRelayWatch()
        const chat = room.makeAction('chat')
        const name = room.makeAction('name')

        chat.onMessage = (data, { peerId }) => {
          const text = typeof data === 'string' ? data : data?.text
          if (!text) return
          const nick = typeof data === 'object' && data?.name
            ? String(data.name).slice(0, 20)
            : ''
          if (nick) {
            this.peerNames = { ...this.peerNames, [peerId]: nick }
          }
          this.pushMessage({
            kind: 'peer',
            text: String(text),
            at: Date.now(),
            peerId,
          })
        }

        name.onMessage = (value, { peerId }) => {
          const nick = String(value || '').slice(0, 20)
          if (!nick) return
          this.peerNames = { ...this.peerNames, [peerId]: nick }
        }

        room.onPeerJoin = (peerId) => {
          this.syncPeerCount()
          name.send(this.nickname, { target: peerId })
          this.pushMessage({
            kind: 'system',
            event: 'join',
            peerId,
            at: Date.now(),
          })
        }

        room.onPeerLeave = (peerId) => {
          const leftName = this.peerLabel(peerId)
          const next = { ...this.peerNames }
          delete next[peerId]
          this.peerNames = next
          this.syncPeerCount()
          this.pushMessage({
            kind: 'system',
            event: 'leave',
            peerId,
            name: leftName,
            at: Date.now(),
          })
        }

        this.room = room
        this.sendChat = chat.send
        this.sendName = name.send
        this.joined = true
        this.messages = []
        this.peerNames = {}
        this.peerCount = 0

        this.$router.replace({
          query: { ...this.$route.query, room: this.roomId },
        }).catch(() => {})

        this.pushMessage({
          kind: 'system',
          text: `已进入房间 ${this.roomId}（${selfId.slice(0, 6)}），分享链接给好友即可`,
          at: Date.now(),
        })
      } catch (e) {
        console.error(e)
        this.error = '进入房间失败，请刷新重试'
        this.teardownRoom()
      }
    },
    async send() {
      const text = this.draft.trim()
      if (!text || !this.sendChat) return
      this.sending = true
      try {
        await this.sendChat({ text, name: this.nickname })
        this.pushMessage({
          kind: 'mine',
          name: this.nickname,
          text,
          at: Date.now(),
        })
        this.draft = ''
      } catch (e) {
        console.error(e)
        this.pushMessage({
          kind: 'system',
          text: '发送失败：可能尚未连上其他对等端',
          at: Date.now(),
        })
      } finally {
        this.sending = false
      }
    },
    async copyShareLink() {
      const url = new URL(window.location.href)
      url.searchParams.set('room', this.roomId)
      try {
        await navigator.clipboard.writeText(url.toString())
        this.copied = true
        setTimeout(() => { this.copied = false }, 1500)
      } catch {
        prompt('复制房间链接', url.toString())
      }
    },
    leave() {
      this.teardownRoom()
      this.joined = false
      this.messages = []
      this.peerCount = 0
    },
    startRelayWatch() {
      this.stopRelayWatch()
      const tick = () => {
        try {
          const sockets = getRelaySockets?.() || {}
          this.relayOk = Object.values(sockets).filter(isRelayConnected).length
        } catch {
          this.relayOk = 0
        }
      }
      tick()
      this.relayTimer = setInterval(tick, 2000)
    },
    stopRelayWatch() {
      if (this.relayTimer) {
        clearInterval(this.relayTimer)
        this.relayTimer = null
      }
      this.relayOk = 0
    },
    teardownRoom() {
      this.stopRelayWatch()
      try {
        this.room?.leave?.()
      } catch (_) { /* ignore */ }
      this.room = null
      this.sendChat = null
      this.sendName = null
    },
  },
}
</script>

<style scoped>
.chat-page {
  max-width: 720px;
  margin: 0 auto;
  padding: 24px 16px 40px;
  text-align: left;
  box-sizing: border-box;
}

.chat-header h1 {
  margin: 0 0 8px;
  font-size: 1.75rem;
}

.hint {
  margin: 0 0 24px;
  color: #888;
  font-size: 0.9rem;
  line-height: 1.5;
}

.secure-warn {
  margin: -12px 0 24px;
  padding: 12px 14px;
  border-radius: 8px;
  background: rgba(229, 115, 115, 0.15);
  border: 1px solid rgba(229, 115, 115, 0.45);
  color: #e57373;
  font-size: 0.9rem;
  line-height: 1.5;
}

.secure-warn a {
  color: #90caf9;
  word-break: break-all;
}

.lobby {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.lobby label {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 0.9rem;
  font-weight: 600;
}

input {
  width: 100%;
  box-sizing: border-box;
  padding: 10px 12px;
  border: 1px solid #444;
  border-radius: 8px;
  background: transparent;
  color: inherit;
  font: inherit;
}

.room-row {
  display: flex;
  gap: 8px;
}

.room-row input {
  flex: 1;
}

button {
  font: inherit;
  cursor: pointer;
  border-radius: 8px;
  padding: 10px 16px;
  border: 1px solid transparent;
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.primary {
  background: #3d5a80;
  color: #fff;
}

.ghost {
  background: transparent;
  border-color: #555;
  color: inherit;
}

.error {
  color: #e57373;
  margin: 0;
}

.room {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 70vh;
}

.room-bar {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  flex-wrap: wrap;
}

.meta {
  display: block;
  margin-top: 4px;
  color: #888;
  font-size: 0.85rem;
  font-weight: 400;
}

.actions {
  display: flex;
  gap: 8px;
}

.messages {
  flex: 1;
  min-height: 320px;
  max-height: 55vh;
  overflow-y: auto;
  padding: 12px;
  border: 1px solid #444;
  border-radius: 10px;
  background: rgba(127, 127, 127, 0.06);
}

.msg {
  margin-bottom: 12px;
  text-align: left;
}

.msg.system {
  text-align: center;
  color: #888;
  font-size: 0.8rem;
}

.msg.mine .msg-body {
  background: #3d5a80;
  color: #fff;
}

.msg.peer .msg-body {
  background: rgba(127, 127, 127, 0.18);
}

.msg-head {
  display: flex;
  gap: 8px;
  align-items: baseline;
  margin-bottom: 4px;
  font-size: 0.8rem;
}

.msg.mine .msg-head {
  justify-content: flex-end;
}

.name {
  font-weight: 600;
}

.time {
  color: #888;
}

.msg-body {
  display: inline-block;
  max-width: 85%;
  padding: 8px 12px;
  border-radius: 10px;
  white-space: pre-wrap;
  word-break: break-word;
  line-height: 1.45;
}

.msg.mine {
  text-align: right;
}

.empty {
  color: #888;
  text-align: center;
  padding: 40px 0;
}

.composer {
  display: flex;
  gap: 8px;
}

.composer input {
  flex: 1;
}

@media (prefers-color-scheme: light) {
  input {
    border-color: #ccc;
  }
  .messages {
    border-color: #ddd;
  }
  .ghost {
    border-color: #ccc;
  }
  .hint,
  .meta,
  .time,
  .msg.system,
  .empty {
    color: #666;
  }
}
</style>
