const HONEYPOT_FIELD = "website_url"
const MIN_SUBMIT_TIME_MS = 1_500
const MAX_SUBMIT_TIME_MS = 3_600_000

interface BotCheckInput {
  honeypotValue: string
  submittedAt: number
}

export function checkBot(input: BotCheckInput): { isBot: boolean; reason?: string } {
  if (input.honeypotValue) {
    return { isBot: true, reason: "honeypot filled" }
  }

  const elapsed = Date.now() - input.submittedAt
  if (elapsed < MIN_SUBMIT_TIME_MS) {
    return { isBot: true, reason: "submitted too fast" }
  }
  if (elapsed > MAX_SUBMIT_TIME_MS) {
    return { isBot: true, reason: "submitted too slow" }
  }

  return { isBot: false }
}

export function HoneypotField() {
  return (
    <div aria-hidden="true" className="absolute -left-[9999px] opacity-0 pointer-events-none" tabIndex={-1}>
      <label htmlFor={HONEYPOT_FIELD}>Leave this empty</label>
      <input
        id={HONEYPOT_FIELD}
        name={HONEYPOT_FIELD}
        type="text"
        autoComplete="off"
        tabIndex={-1}
        defaultValue=""
      />
    </div>
  )
}
