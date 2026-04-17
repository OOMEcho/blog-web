export function observeOnce (el, callback, options = {}) {
  if (!el || typeof callback !== 'function') {
    return () => {}
  }

  if (typeof window === 'undefined' || typeof window.IntersectionObserver === 'undefined') {
    callback(el)
    return () => {}
  }

  const observer = new window.IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        callback(entry.target)
        observer.disconnect()
      }
    })
  }, { threshold: 0.15, ...options })

  observer.observe(el)

  return () => observer.disconnect()
}
