/**
 * 格式化日期
 * @param {string|Date} date
 * @param {string} fmt  eg. 'YYYY-MM-DD' | 'YYYY年MM月DD日'
 */
export function formatDate (date, fmt = 'YYYY-MM-DD') {
  if (!date) return ''
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return fmt
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day)
}

/**
 * 截取文章摘要
 */
export function excerpt (html, len = 150) {
  if (!html) return ''
  const text = html.replace(/<[^>]+>/g, '')
  return text.length > len ? text.slice(0, len) + '...' : text
}
