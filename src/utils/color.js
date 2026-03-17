const HEX_COLOR_REG = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/
const HEX_ALPHA_COLOR_REG = /^#([0-9a-fA-F]{8})$/
const RGB_COLOR_REG = /^rgba?\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}(\s*,\s*(0|1|0?\.\d+))?\s*\)$/i
const HSL_COLOR_REG = /^hsla?\(.+\)$/i

export function normalizeColor (color) {
  const value = (color || '').trim()
  if (!value) {
    return ''
  }

  if (HEX_COLOR_REG.test(value) || HEX_ALPHA_COLOR_REG.test(value) || RGB_COLOR_REG.test(value) || HSL_COLOR_REG.test(value)) {
    return value
  }

  return ''
}

function hexToRgb (hex) {
  let value = hex.replace('#', '')
  if (value.length === 3) {
    value = value.split('').map(char => char + char).join('')
  }

  if (value.length === 8) {
    value = value.slice(0, 6)
  }

  if (value.length !== 6) {
    return null
  }

  const r = parseInt(value.slice(0, 2), 16)
  const g = parseInt(value.slice(2, 4), 16)
  const b = parseInt(value.slice(4, 6), 16)
  if ([r, g, b].some(Number.isNaN)) {
    return null
  }

  return { r, g, b }
}

function rgbToRgba (rgb, alpha) {
  const match = rgb.match(/rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})/i)
  if (!match) {
    return ''
  }

  const r = Number(match[1])
  const g = Number(match[2])
  const b = Number(match[3])
  if ([r, g, b].some(num => Number.isNaN(num) || num < 0 || num > 255)) {
    return ''
  }

  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

function colorToRgba (color, alpha) {
  if (color.startsWith('#')) {
    const rgb = hexToRgb(color)
    if (!rgb) {
      return ''
    }
    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`
  }

  if (/^rgba?/i.test(color)) {
    return rgbToRgba(color, alpha)
  }

  return ''
}

export function buildTagStyle (color, active = false) {
  const safeColor = normalizeColor(color)
  if (!safeColor) {
    return {}
  }

  const style = {
    color: '#fff',
    borderColor: safeColor,
    backgroundColor: safeColor
  }

  if (active) {
    style.boxShadow = `0 0 0 2px ${colorToRgba(safeColor, 0.22) || 'rgba(0, 181, 173, 0.22)'}`
  }

  return style
}
