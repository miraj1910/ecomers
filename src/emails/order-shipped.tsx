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
import { ShippingAddress } from "./components/shipping-address"

interface OrderShippedEmailProps {
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
  trackingUrl?: string
  shippingName: string
  shippingStreet: string
  shippingCity: string
  shippingState: string
  shippingPostal: string
  shippingCountry: string
}

export default function OrderShippedEmail({
  customerName,
  orderNumber,
  items,
  total,
  trackingUrl,
  shippingName,
  shippingStreet,
  shippingCity,
  shippingState,
  shippingPostal,
  shippingCountry,
}: OrderShippedEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Your order #{orderNumber.slice(0, 8)} has shipped!</Preview>
      <Body className="bg-[#0f0f23] font-sans">
        <Container className="mx-auto max-w-[600px]">
          <EmailHeader preview="Your package is on its way" />

          <Section className="px-8 pt-8">
            <Text className="m-0 text-2xl font-bold text-white">
              On its way, {customerName}!
            </Text>
            <Text className="mt-2 text-[#8b8ba7]">
              Your order <span className="font-mono text-[#e94560]">#{orderNumber.slice(0, 8)}</span> has been shipped.{" "}
              Get ready — it&apos;s heading your way.
            </Text>
          </Section>

          <Section className="px-8 pb-4">
            <OrderSummary items={items} total={total} />
          </Section>

          <Section className="px-8 pb-4">
            <ShippingAddress
              name={shippingName}
              street={shippingStreet}
              city={shippingCity}
              state={shippingState}
              postal={shippingPostal}
              country={shippingCountry}
            />
          </Section>

          {trackingUrl && (
            <Section className="px-8 pb-4 text-center">
              <Text className="m-0 mb-2 text-sm text-white">Track your package:</Text>
              <a
                href={trackingUrl}
                className="inline-block rounded-lg bg-[#e94560] px-6 py-3 text-sm font-bold text-white no-underline"
              >
                Track Order
              </a>
            </Section>
          )}

          <EmailFooter />
        </Container>
      </Body>
    </Html>
  )
}
