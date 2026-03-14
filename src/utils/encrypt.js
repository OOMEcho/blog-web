import forge from 'node-forge'

export function rsaEncrypt (data, publicKey) {
  const formattedKey = (publicKey || '').replace(/\r?\n|\r/g, '')
  const keyLines = formattedKey.match(/.{1,64}/g) || []
  const pemKey = `-----BEGIN PUBLIC KEY-----\n${keyLines.join('\n')}\n-----END PUBLIC KEY-----`
  const pub = forge.pki.publicKeyFromPem(pemKey)
  const encrypted = pub.encrypt(data, 'RSA-OAEP', {
    md: forge.md.sha256.create(),
    mgf1: { md: forge.md.sha1.create() }
  })
  return forge.util.encode64(encrypted)
}
