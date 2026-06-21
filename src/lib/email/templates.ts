import { render } from "@react-email/components"
import type { ReactElement } from "react"

export async function renderTemplate(component: ReactElement): Promise<string> {
  return render(component)
}

export async function renderTemplatePlainText(component: ReactElement): Promise<string> {
  const { render } = await import("@react-email/components")
  return render(component, { plainText: true })
}
