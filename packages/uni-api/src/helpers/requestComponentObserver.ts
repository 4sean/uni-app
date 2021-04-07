import { initIntersectionObserverPolyfill } from './intersection-observer'

export interface RequestComponentObserverOptions {
  selector?: string
  rootMargin?: string
  relativeToSelector?: string
}

function normalizeRect(rect: DOMRect) {
  const { bottom, height, left, right, top, width } = rect || {}
  return {
    bottom,
    height,
    left,
    right,
    top,
    width,
  }
}

export function requestComponentObserver(
  $el: HTMLElement,
  options: UniApp.CreateIntersectionObserverOptions &
    RequestComponentObserverOptions,
  callback: WechatMiniprogram.IntersectionObserverObserveCallback
) {
  // 为了摇树优化，不直接引入该polyfill
  initIntersectionObserverPolyfill()
  const root = options.relativeToSelector
    ? $el.querySelector(options.relativeToSelector)
    : null
  const intersectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entrie) => {
        callback({
          intersectionRatio: entrie.intersectionRatio,
          intersectionRect: normalizeRect(entrie.intersectionRect),
          boundingClientRect: normalizeRect(entrie.boundingClientRect),
          relativeRect: normalizeRect(entrie.rootBounds!),
          time: Date.now(),
          //   dataset: normalizeDataset(entrie.target),
          //   id: entrie.target.id,
        })
      })
    },
    {
      root,
      rootMargin: options.rootMargin,
      threshold: options.thresholds,
    }
  )
  if (options.observeAll) {
    ;(intersectionObserver as any).USE_MUTATION_OBSERVER = true
    const nodeList = $el.querySelectorAll(options.selector!)
    for (let i = 0; i < nodeList.length; i++) {
      intersectionObserver.observe(nodeList[i])
    }
  } else {
    ;(intersectionObserver as any).USE_MUTATION_OBSERVER = false
    const el = $el.querySelector(options.selector!)
    if (!el) {
      console.warn(
        `Node ${options.selector} is not found. Intersection observer will not trigger.`
      )
    } else {
      intersectionObserver.observe(el)
    }
  }
  return intersectionObserver
}
