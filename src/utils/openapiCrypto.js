import forge from 'node-forge'

/** 与 Java CipherUtil.encryptRsa 保持一致：每 64 字节一块 */
const ENCRYPT_CHUNK = 64

function toPem(base64Key, type) {
  const cleaned = String(base64Key || '')
    .replace(/-----BEGIN[\s\S]+?-----/g, '')
    .replace(/-----END[\s\S]+?-----/g, '')
    .replace(/\s+/g, '')
  const body = cleaned.match(/.{1,64}/g)?.join('\n') || cleaned
  return `-----BEGIN ${type}-----\n${body}\n-----END ${type}-----`
}

/**
 * RSA/ECB/PKCS1Padding 分段加密（对齐 CipherUtil.encryptRsa）
 * @param {string} publicKeyBase64 X509 公钥（无头尾）
 * @param {string} plainText UTF-8 明文
 */
export function encryptRsa(publicKeyBase64, plainText) {
  const publicKey = forge.pki.publicKeyFromPem(toPem(publicKeyBase64, 'PUBLIC KEY'))
  const bytes = forge.util.encodeUtf8(plainText)
  let encrypted = ''
  for (let i = 0; i < bytes.length; i += ENCRYPT_CHUNK) {
    const chunk = bytes.substring(i, i + ENCRYPT_CHUNK)
    encrypted += publicKey.encrypt(chunk, 'RSAES-PKCS1-V1_5')
  }
  return forge.util.encode64(encrypted)
}

/**
 * RSA/ECB/PKCS1Padding 分段解密（对齐 CipherUtil.decryptRsa）
 * @param {string} privateKeyBase64 PKCS8 私钥（无头尾）
 * @param {string} cipherTextBase64 Base64 密文
 */
export function decryptRsa(privateKeyBase64, cipherTextBase64) {
  const privateKey = forge.pki.privateKeyFromPem(toPem(privateKeyBase64, 'PRIVATE KEY'))
  const encrypted = forge.util.decode64(cipherTextBase64)
  // 4096 位密钥密文块 512；按模长自适应，兼容 2048/4096
  const blockSize = Math.ceil(privateKey.n.bitLength() / 8)
  let decrypted = ''
  for (let i = 0; i < encrypted.length; i += blockSize) {
    const chunk = encrypted.substring(i, i + blockSize)
    decrypted += privateKey.decrypt(chunk, 'RSAES-PKCS1-V1_5')
  }
  return forge.util.decodeUtf8(decrypted)
}

/** SHA256withRSA 签名（对齐 CipherUtil.sign） */
export function signSha256Rsa(data, privateKeyBase64) {
  const privateKey = forge.pki.privateKeyFromPem(toPem(privateKeyBase64, 'PRIVATE KEY'))
  const md = forge.md.sha256.create()
  md.update(data, 'utf8')
  return forge.util.encode64(privateKey.sign(md))
}

/**
 * 组装 OpenAPI 加密请求体
 * requestData = RSA(Infinia公钥, JSON)
 * signature   = Sign(平台私钥, requestData)
 */
export function buildOpenApiRequest({ appId, requestBody, infiniaPublicKey, platformPrivateKey, version = '1.0' }) {
  const requestData = encryptRsa(infiniaPublicKey, JSON.stringify(requestBody))
  const signature = signSha256Rsa(requestData, platformPrivateKey)
  return {
    appId,
    version,
    dataType: 'JSON',
    requestData,
    signature,
  }
}

/** 解密 OpenAPI 响应 responseData */
export function parseOpenApiResponse(response, platformPrivateKey) {
  if (!response?.responseData) {
    return { raw: response, data: null }
  }
  const plain = decryptRsa(platformPrivateKey, response.responseData)
  return { raw: response, data: JSON.parse(plain) }
}
