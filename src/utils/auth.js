const ACCESS_TOKEN_KEY = 'accessToken'

export function getAccessToken () {
  return sessionStorage.getItem(ACCESS_TOKEN_KEY) || ''
}

export function setAccessToken (token) {
  sessionStorage.setItem(ACCESS_TOKEN_KEY, token)
}

export function clearAccessToken () {
  sessionStorage.removeItem(ACCESS_TOKEN_KEY)
}
