const svg = (xml) => 'data:image/svg+xml;utf8,' + encodeURIComponent(xml)

const STAR = svg('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#00b5ad"><path d="M12 2l2.9 6.9L22 10l-5.5 4.8L18 22l-6-3.6L6 22l1.5-7.2L2 10l7.1-1.1L12 2z"/></svg>')
const HEART = svg('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#f8a5c2"><path d="M12 21s-7.5-4.7-10-9.5C.5 7.6 3 4 6.5 4c2 0 3.6 1 5.5 3 1.9-2 3.5-3 5.5-3C21 4 23.5 7.6 22 11.5 19.5 16.3 12 21 12 21z"/></svg>')
const TRIANGLE = svg('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#ffd36e"><path d="M12 3l10 18H2z"/></svg>')
const SNOW = svg('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#7fb2ff"><path d="M12 1v22M1 12h22M4 4l16 16M20 4L4 20" stroke="#7fb2ff" stroke-width="2" stroke-linecap="round"/></svg>')

export const PARTICLE_IMAGE_SOURCES = [STAR, HEART, TRIANGLE, SNOW]

export const PARTICLE_STYLES = [
  { key: 'off', label: '关闭', icon: 'el-icon-close' },
  { key: 'connect', label: '连线', icon: 'el-icon-connection' },
  { key: 'randomColors', label: '随机色', icon: 'el-icon-magic-stick' },
  { key: 'parallax', label: '视差', icon: 'el-icon-aim' },
  { key: 'multipleImages', label: '图标粒子', icon: 'el-icon-picture-outline' },
  { key: 'growingParticles', label: '生长粒子', icon: 'el-icon-sunrise' },
  { key: 'emitters', label: '喷射', icon: 'el-icon-upload' }
]

const baseCommon = {
  fullScreen: { enable: false },
  background: { color: 'transparent' },
  fpsLimit: 60,
  detectRetina: true,
  pauseOnBlur: true,
  pauseOnOutsideViewport: false
}

export const PARTICLE_PRESETS = {
  connect: {
    ...baseCommon,
    particles: {
      number: { value: 60, density: { enable: true, area: 900 } },
      color: { value: '#00b5ad' },
      shape: { type: 'circle' },
      opacity: { value: 0.5 },
      size: { value: { min: 1, max: 3 } },
      links: { enable: false },
      move: { enable: true, speed: 0.9, outModes: { default: 'out' } }
    },
    interactivity: {
      events: { onHover: { enable: true, mode: 'connect' } },
      modes: {
        connect: { distance: 160, links: { opacity: 0.35 }, radius: 120 }
      }
    }
  },

  randomColors: {
    ...baseCommon,
    particles: {
      number: { value: 50, density: { enable: true, area: 900 } },
      color: { value: ['#ff7a59', '#ffd36e', '#7fb2ff', '#a3e635', '#f8a5c2', '#00b5ad'] },
      shape: { type: 'circle' },
      opacity: { value: 0.7 },
      size: { value: { min: 2, max: 4 } },
      links: {
        enable: true,
        distance: 130,
        color: 'random',
        opacity: 0.4,
        width: 1
      },
      move: { enable: true, speed: 1.2, outModes: { default: 'out' } }
    }
  },

  parallax: {
    ...baseCommon,
    particles: {
      number: { value: 40, density: { enable: true, area: 900 } },
      color: { value: '#00b5ad' },
      shape: { type: 'circle' },
      opacity: { value: 0.55 },
      size: { value: { min: 2, max: 8 } },
      links: {
        enable: true,
        distance: 150,
        color: '#00b5ad',
        opacity: 0.3,
        width: 1
      },
      move: { enable: true, speed: 0.8, outModes: { default: 'out' } }
    },
    interactivity: {
      events: {
        onHover: { enable: true, mode: 'grab', parallax: { enable: true, force: 60, smooth: 10 } }
      },
      modes: {
        grab: { distance: 140, links: { opacity: 0.6 } }
      }
    }
  },

  multipleImages: {
    ...baseCommon,
    particles: {
      number: { value: 35, density: { enable: true, area: 900 } },
      shape: {
        type: 'image',
        options: {
          image: PARTICLE_IMAGE_SOURCES.map(src => ({ src, width: 24, height: 24 }))
        }
      },
      opacity: { value: 0.85 },
      size: { value: { min: 16, max: 28 } },
      move: {
        enable: true,
        direction: 'none',
        speed: { min: 0.6, max: 1.4 },
        random: true,
        straight: false,
        outModes: { default: 'out' }
      },
      rotate: {
        value: { min: 0, max: 360 },
        animation: { enable: true, speed: 4, sync: false }
      }
    }
  },

  growingParticles: {
    ...baseCommon,
    particles: {
      number: { value: 30, density: { enable: true, area: 900 } },
      color: { value: ['#00b5ad', '#7fb2ff', '#f8a5c2'] },
      shape: { type: 'circle' },
      opacity: { value: 0.7 },
      size: {
        value: { min: 2, max: 14 },
        animation: {
          enable: true,
          speed: 5,
          startValue: 'min',
          destroy: 'max',
          sync: false
        }
      },
      life: {
        duration: { value: 3, sync: false },
        count: 0
      },
      move: { enable: true, speed: 0.5, outModes: { default: 'out' } }
    }
  },

  emitters: {
    ...baseCommon,
    particles: {
      number: { value: 0 },
      color: { value: ['#00b5ad', '#7fb2ff', '#f8a5c2', '#ffd36e'] },
      shape: { type: 'circle' },
      opacity: { value: 0.8 },
      size: { value: { min: 2, max: 4 } },
      move: {
        enable: true,
        direction: 'top',
        speed: { min: 2, max: 4 },
        straight: false,
        outModes: { default: 'destroy', top: 'destroy' }
      },
      life: { duration: { value: 4 }, count: 1 }
    },
    emitters: [
      {
        position: { x: 20, y: 100 },
        rate: { delay: 0.15, quantity: 2 },
        size: { width: 0, height: 0 }
      },
      {
        position: { x: 80, y: 100 },
        rate: { delay: 0.18, quantity: 2 },
        size: { width: 0, height: 0 }
      }
    ]
  }
}
