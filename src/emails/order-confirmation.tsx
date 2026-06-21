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

interface OrderConfirmationEmailProps {
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
  shippingName: string
  shippingStreet: string
  shippingCity: string
  shippingState: string
  shippingPostal: string
  shippingCountry: string
}

export default function OrderConfirmationEmail({
  customerName,
  orderNumber,
  items,
  total,
  shippingName,
  shippingStreet,
  shippingCity,
  shippingState,
  shippingPostal,
  shippingCountry,
}: OrderConfirmationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Order #{orderNumber.slice(0, 8)} confirmed — thank you!</Preview>
      <Body className="bg-[#0f0f23] font-sans">
        <Container className="mx-auto max-w-[600px]">
          <EmailHeader preview="Your order has been placed successfully" />

          <Section className="px-8 pt-8">
            <Text className="m-0 text-2xl font-bold text-white">
              Thank you, {customerName}!
            </Text>
            <Text className="mt-2 text-[#8b8ba7]">
              Your order <span className="font-mono text-[#e94560]">#{orderNumber.slice(0, 8)}</span> has been confirmed.{" "}
              We&apos;ll notify you once it ships.
            </Text>
          </Section>

          <Section className="px-8 py-4">
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

          <Section className="px-8 pb-4">
            <Text className="m-0 text-xs text-[#6b6b87]">
              If you have any questions, reply to this email or contact our support team.
            </Text>
          </Section>

          <EmailFooter />
        </Container>
      </Body>
    </Html>
  )
}
