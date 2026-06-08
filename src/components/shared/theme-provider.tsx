"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react"
import type { ReactNode } from "react"

type Theme = "light" | "dark" | "system"

interface ThemeContextValue {
  theme: Theme
  resolvedTheme: "light" | "dark"
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

const THEME_KEY = "theme"

function getStoredTheme(): Theme {
  try {
    if (typeof window === "undefined") return "light"
    const stored = localStorage.getItem(THEME_KEY) as Theme | null
    if (stored === "light" || stored === "dark" || stored === "system") {
      return stored
    }
  } catch {}
  return "light"
}

function resolveTheme(theme: Theme): "light" | "dark" {
  if (theme === "system") {
    try {
      if (typeof window === "undefined") return "light"
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
    } catch {
      return "light"
    }
  }
  return theme
}

function applyTheme(resolved: "light" | "dark") {
  const root = document.documentElement
  root.classList.remove("light", "dark")
  root.classList.add(resolved)
  root.style.colorScheme = resolved
}

function storeTheme(theme: Theme) {
  try {
    localStorage.setItem(THEME_KEY, theme)
    const resolved = resolveTheme(theme)
    document.cookie = `theme=${resolved};path=/;max-age=31536000;SameSite=Lax`
  } catch {}
}

function getInitialTheme(): Theme {
  try {
    if (typeof window === "undefined") return "light"
    const stored = localStorage.getItem(THEME_KEY) as Theme | null
    if (stored === "light" || stored === "dark" || stored === "system") return stored
  } catch {}
  return "light"
}

function getInitialResolved(): "light" | "dark" {
  try {
    if (typeof window === "undefined") return "light"
    const stored = (localStorage.getItem(THEME_KEY) as Theme | null) ?? "light"
    if (stored === "light" || stored === "dark" || stored === "system") {
      return resolveTheme(stored)
    }
  } catch {}
  return "light"
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(getInitialTheme)
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">(getInitialResolved)

  useEffect(() => {
    const stored = getStoredTheme()
    applyTheme(resolveTheme(stored))
    storeTheme(stored)
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") return
    const mq = window.matchMedia("(prefers-color-scheme: dark)")
    const handler = () => {
      if (theme === "system") {
        const sys = mq.matches ? "dark" : "light"
        setResolvedTheme(sys)
        applyTheme(sys)
        storeTheme("system")
      }
    }
    mq.addEventListener("change", handler)
    return () => mq.removeEventListener("change", handler)
  }, [theme])

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme)
    const resolved = resolveTheme(newTheme)
    storeTheme(newTheme)
    setResolvedTheme(resolved)
    applyTheme(resolved)
  }, [])

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return ctx
}
