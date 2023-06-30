export function getModels() {
    let userAgentInfo = navigator.userAgent
    let mobileAgents = [
      'Android',
      'iPhone',
      'SymbianOS',
      'Windows Phone',
      'iPad',
      'iPod',
    ]
    return mobileAgents.reduce((prev, ua) => {
      return userAgentInfo.includes(ua) || prev
    }, false)
  }