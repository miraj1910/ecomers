"use client"

type AnalyticsEvent = {
  name: string
  properties?: Record<string, string | number | boolean | null>
}

type PageView = {
  path: string
  title: string
}

function sendToAnalytics(event: AnalyticsEvent | PageView) {
  try {
    if ("path" in event) {
      navigator.sendBeacon(
        "/api/analytics/pageview",
        JSON.stringify(event)
      )
    } else {
      navigator.sendBeacon(
        "/api/analytics/event",
        JSON.stringify(event)
      )
    }
  } catch {
    // silently fail — analytics should never block the app
  }
}

export function trackPageView(path: string, title: string) {
  sendToAnalytics({ path, title })
}

export function trackEvent(name: string, properties?: Record<string, string | number | boolean | null>) {
  sendToAnalytics({ name, properties })
}
