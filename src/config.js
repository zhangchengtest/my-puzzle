export const apiUrl = import.meta.env.VITE_APP_API_URL
export const ssoUrl = import.meta.env.VITE_APP_SSO_URL
export const shareImageUrl = import.meta.env.VITE_APP_SHARE_IMAGE_URL
export const downloadsUrl = import.meta.env.VITE_APP_DOWNLOADS_URL || '/files/'

export function wsUrl(path) {
  const base = apiUrl.replace(/^https/, 'wss').replace(/^http/, 'ws')
  return `${base}${path.startsWith('/') ? path : `/${path}`}`
}
