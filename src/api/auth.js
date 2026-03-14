import request from '@/utils/request'

export function getPublicKey () {
  return request.get('/profile/publicKey')
}

export function generateCaptcha () {
  return request.get('/profile/generate/captcha')
}

export function sendEmailCode (email) {
  return request.get('/profile/sendEmailCode', {
    params: { email }
  })
}

export function login (data) {
  return request.post('/login', data)
}

export function getProfileInfo () {
  return request.get('/profile/info')
}
