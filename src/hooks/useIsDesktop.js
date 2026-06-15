import { useState, useEffect } from 'react'

const STORAGE_KEY = 'brnx-view-override'
const CHANGE_EVENT = 'brnx-view-change'

function readState() {
  const override = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null
  if (override === 'desktop') return true
  if (override === 'mobile') return false
  return typeof window !== 'undefined' && window.innerWidth >= 1024
}

export function setViewOverride(mode) {
  localStorage.setItem(STORAGE_KEY, mode)
  window.dispatchEvent(new Event(CHANGE_EVENT))
}

export default function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(readState)

  useEffect(() => {
    const sync = () => setIsDesktop(readState())
    const mq = window.matchMedia('(min-width: 1024px)')
    window.addEventListener(CHANGE_EVENT, sync)
    mq.addEventListener('change', sync)
    return () => {
      window.removeEventListener(CHANGE_EVENT, sync)
      mq.removeEventListener('change', sync)
    }
  }, [])

  return isDesktop
}
