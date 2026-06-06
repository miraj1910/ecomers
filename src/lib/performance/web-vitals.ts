"use client"

import { useReportWebVitals as nextWebVitals } from "next/web-vitals"

type WebVitalMetric = {
  id: string
  name: string
  value: number
  rating?: string
}

type VitalReportHandler = (metric: WebVitalMetric) => void

const defaultHandler: VitalReportHandler = (metric) => {
  if (process.env.NODE_ENV === "development") {
    console.log(`[Web Vitals] ${metric.name}: ${metric.value.toFixed(2)}ms`)
  }
}

export function useReportWebVitals(handler?: VitalReportHandler) {
  nextWebVitals((metric) => {
    const data: WebVitalMetric = {
      id: metric.id,
      name: metric.name,
      value: metric.value,
      rating: metric.rating,
    }

    const reportFn = handler ?? defaultHandler
    reportFn(data)
  })
}
