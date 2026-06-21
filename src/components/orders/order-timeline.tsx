import { Check } from "lucide-react"

interface TimelineStep {
  label: string
  completed: boolean
  active: boolean
}

interface OrderTimelineProps {
  orderStatus: string
  paymentStatus: string
}

const STEPS: { label: string; status: string; type: "order" | "payment" }[] = [
  { label: "Placed", status: "PENDING", type: "order" },
  { label: "Paid", status: "PAID", type: "payment" },
  { label: "Processing", status: "PROCESSING", type: "order" },
  { label: "Shipped", status: "SHIPPED", type: "order" },
  { label: "Delivered", status: "DELIVERED", type: "order" },
]

function getStepState(step: (typeof STEPS)[0], orderStatus: string, paymentStatus: string): TimelineStep {
  const current = step.type === "order" ? orderStatus : paymentStatus
  const stepOrder = STEPS.indexOf(step)
  const currentOrder = STEPS.findIndex(
    (s) => s.type === step.type && s.status === current
  )

  return {
    label: step.label,
    completed: stepOrder < currentOrder,
    active: stepOrder === currentOrder,
  }
}

export function OrderTimeline({ orderStatus, paymentStatus }: OrderTimelineProps) {
  return (
    <div className="w-full">
      <ol className="flex w-full items-center">
        {STEPS.map((step, i) => {
          const state = getStepState(step, orderStatus, paymentStatus)

          return (
            <li
              key={step.label}
              className={`relative flex items-center ${
                i < STEPS.length - 1 ? "flex-1" : ""
              }`}
            >
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-bold transition-colors ${
                    state.completed
                      ? "border-emerald-500 bg-emerald-500 text-foreground"
                      : state.active
                        ? "border-accent bg-accent text-foreground"
                        : "border-border bg-surface text-secondary"
                  }`}
                >
                  {state.completed ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    i + 1
                  )}
                </div>
                <span
                  className={`mt-1.5 text-center text-[10px] font-medium leading-tight ${
                    state.completed || state.active
                      ? "text-foreground"
                      : "text-secondary"
                  }`}
                >
                  {step.label}
                </span>
              </div>

              {i < STEPS.length - 1 && (
                <div
                  className={`mx-2 h-px flex-1 transition-colors ${
                    STEPS.slice(0, i + 1).every(
                      (s) =>
                        getStepState(s, orderStatus, paymentStatus).completed
                    )
                      ? "bg-emerald-500"
                      : "bg-border"
                  }`}
                />
              )}
            </li>
          )
        })}
      </ol>
    </div>
  )
}
