import {
  Body,
  Container,
  Head,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components"
import { EmailHeader } from "./components/email-header"
import { EmailFooter } from "./components/email-footer"
import { OrderSummary } from "./components/order-summary"

interface OrderDeliveredEmailProps {
  customerName: string
  orderNumber: string
  items: {
    name: string
    quantity: number
    price: number
    size?: string | null
    image?: string | null
  }[]
  total: number
}

export default function OrderDeliveredEmail({
  customerName,
  orderNumber,
  items,
  total,
}: OrderDeliveredEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Your order #{orderNumber.slice(0, 8)} has been delivered</Preview>
      <Body className="bg-[#0f0f23] font-sans">
        <Container className="mx-auto max-w-[600px]">
          <EmailHeader preview="Your package has arrived" />

          <Section className="px-8 pt-8">
            <Text className="m-0 text-2xl font-bold text-white">
              Delivered, {customerName}!
            </Text>
            <Text className="mt-2 text-[#8b8ba7]">
              Your order <span className="font-mono text-[#e94560]">#{orderNumber.slice(0, 8)}</span> has been delivered.{" "}
              We hope you love everything!
            </Text>
          </Section>

          <Section className="px-8 pb-4">
            <OrderSummary items={items} total={total} />
          </Section>

          <Section className="px-8 pb-4">
            <Text className="m-0 text-sm text-[#8b8ba7]">
              Loved your purchase? Consider leaving a review — your feedback helps other shoppers make informed decisions.
            </Text>
          </Section>

          <EmailFooter />
        </Container>
      </Body>
    </Html>
  )
}
