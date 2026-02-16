import { useState } from 'react'

function readStoredValue(key, fallbackValue) {
  if (typeof window === 'undefined') {
    return fallbackValue
  }

  try {
    const rawValue = window.localStorage.getItem(key)
    if (rawValue === null) {
      return fallbackValue
    }

    return JSON.parse(rawValue)
  } catch {
    return fallbackValue
  }
}

function usePersistentState(key, fallbackValue) {
  const [value, setValue] = useState(() => readStoredValue(key, fallbackValue))

  function setPersistentValue(nextValue) {
    setValue((previousValue) => {
      const resolvedValue =
        typeof nextValue === 'function' ? nextValue(previousValue) : nextValue

      try {
        window.localStorage.setItem(key, JSON.stringify(resolvedValue))
      } catch {
        // Ignore storage write failures and keep UI responsive.
      }

      return resolvedValue
    })
  }

  return [value, setPersistentValue]
}

export default usePersistentState
