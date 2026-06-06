"use client"

import { useReportWebVitals } from "next/web-vitals"

export function WebVitalsReporter() {
  useReportWebVitals((metric) => {
    if (metric.name === "FCP" || metric.name === "LCP" || metric.name === "CLS") {
      const body = JSON.stringify({
        id: metric.id,
        name: metric.name,
        value: metric.value,
        rating: metric.rating,
      })
      try {
        navigator.sendBeacon("/api/analytics/vitals", body)
      } catch {
        // analytics must never throw
      }
    }
  })

  return null
}
