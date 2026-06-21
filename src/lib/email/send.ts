import { getResendClient, isResendConfigured } from "./client"
import { renderTemplate, renderTemplatePlainText } from "./templates"
import type { ReactElement } from "react"

interface SendEmailOptions {
  to: string | string[]
  subject: string
  template: ReactElement
}

interface SendResult {
  success: boolean
  id?: string
  error?: string
}

const MAX_RETRIES = 3
const RETRY_DELAY_MS = 1000

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function sendEmail({ to, subject, template }: SendEmailOptions): Promise<SendResult> {
  if (!isResendConfigured()) {
    console.warn("[Email] RESEND_API_KEY not configured — skipping send")
    return { success: false, error: "RESEND_API_KEY not configured" }
  }

  const recipients = Array.isArray(to) ? to : [to]
  const from = process.env.EMAIL_FROM ?? "orders@example.com"

  let lastError: string | undefined

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const [html, text] = await Promise.all([
        renderTemplate(template),
        renderTemplatePlainText(template),
      ])

      const resend = getResendClient()
      const { data, error } = await resend.emails.send({
        from,
        to: recipients,
        subject,
        html,
        text,
      })

      if (error) {
        throw new Error(error.message)
      }

      console.log(`[Email] Sent "${subject}" to ${recipients.join(", ")} (id: ${data?.id})`)
      return { success: true, id: data?.id }
    } catch (err) {
      lastError = err instanceof Error ? err.message : "Unknown email error"
      console.error(
        `[Email] Attempt ${attempt}/${MAX_RETRIES} failed for "${subject}" to ${recipients.join(", ")}: ${lastError}`
      )

      if (attempt < MAX_RETRIES) {
        await sleep(RETRY_DELAY_MS * attempt)
      }
    }
  }

  console.error(`[Email] All ${MAX_RETRIES} attempts failed for "${subject}" to ${recipients.join(", ")}`)
  return { success: false, error: lastError }
}
