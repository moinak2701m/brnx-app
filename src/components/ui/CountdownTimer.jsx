import { useState, useEffect } from 'react'

export default function CountdownTimer({ expiresAt, onExpire }) {
  const [secondsLeft, setSecondsLeft] = useState(() =>
    Math.max(0, Math.floor((expiresAt - Date.now()) / 1000))
  )

  useEffect(() => {
    if (secondsLeft <= 0) {
      onExpire?.()
      return
    }
    const id = setInterval(() => {
      const s = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000))
      setSecondsLeft(s)
      if (s === 0) onExpire?.()
    }, 1000)
    return () => clearInterval(id)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expiresAt])

  const mins = String(Math.floor(secondsLeft / 60)).padStart(2, '0')
  const secs = String(secondsLeft % 60).padStart(2, '0')
  const isUrgent = secondsLeft <= 30

  return (
    <span
      className="text-sm font-semibold tabular-nums"
      style={{ color: isUrgent ? '#dc2626' : '#f97316' }}
    >
      {mins}:{secs}
    </span>
  )
}
