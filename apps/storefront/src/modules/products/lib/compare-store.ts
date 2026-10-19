"use client"

import { useEffect, useState } from "react"

import { COMPARE_KEY, COMPARE_MAX } from "./compare-constants"

export { COMPARE_KEY, COMPARE_MAX }
const EVENT = "ib-compare-change"

export const readCompare = (): string[] => {
  try {
    const raw = JSON.parse(window.localStorage.getItem(COMPARE_KEY) || "[]")
    return Array.isArray(raw)
      ? raw.filter((id): id is string => typeof id === "string").slice(0, COMPARE_MAX)
      : []
  } catch {
    return []
  }
}

export const writeCompare = (ids: string[]) => {
  try {
    window.localStorage.setItem(
      COMPARE_KEY,
      JSON.stringify(ids.slice(0, COMPARE_MAX))
    )
  } catch {}
  window.dispatchEvent(new Event(EVENT))
}

// Live compare list, synced across components and tabs.
export const useCompareList = () => {
  const [ids, setIds] = useState<string[]>([])

  useEffect(() => {
    const sync = () => setIds(readCompare())
    sync()
    window.addEventListener(EVENT, sync)
    window.addEventListener("storage", sync)
    return () => {
      window.removeEventListener(EVENT, sync)
      window.removeEventListener("storage", sync)
    }
  }, [])

  return ids
}
