import {
  Body,
  Container,
  Head,
  Html,
  Preview,
  Section,
  Text,
  Row,
  Column,
} from "@react-email/components"
import { EmailHeader } from "./components/email-header"
import { EmailFooter } from "./components/email-footer"

interface CartItemProps {
  name: string
  price: number
  quantity: number
  image?: string
  size?: string
}

interface CartRecoveryEmailProps {
  customerEmail: string
  cartItems: CartItemProps[]
  total: number
  recoveryLink?: string
}

export default function CartRecoveryEmail({
  customerEmail,
  cartItems,
  total,
  recoveryLink,
}: CartRecoveryEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>You left something behind — complete your purchase</Preview>
      <Body className="bg-[#0f0f23] font-sans">
        <Container className="mx-auto max-w-[600px]">
          <EmailHeader preview="Your cart is waiting" />

          <Section className="px-8 pt-8">
            <Text className="m-0 text-2xl font-bold text-white">
              You left something behind!
            </Text>
            <Text className="mt-2 text-[#8b8ba7]">
              We noticed you added some items to your cart but haven&apos;t completed the purchase.{" "}
              Your cart is still saved — come back and finish your order.
            </Text>
          </Section>

          <Section className="px-8 pb-4">
            <div className="rounded-lg bg-[#16213e] p-6">
              <Text className="m-0 mb-4 text-base font-bold text-white">Your Cart</Text>
              {cartItems.map((item, i) => (
                <Row key={i} className="border-b border-[#2a2a3e] py-3">
                  <Column>
                    <Text className="m-0 text-sm text-white">{item.name}</Text>
                    {item.size && <Text className="m-0 text-xs text-[#8b8ba7]">Size: {item.size}</Text>}
                    <Text className="m-0 text-xs text-[#8b8ba7]">Qty: {item.quantity}</Text>
                  </Column>
                  <Column align="right">
                    <Text className="m-0 text-sm text-white">
                      ${(item.price * item.quantity).toFixed(2)}
                    </Text>
                  </Column>
                </Row>
              ))}
              <Row className="pt-3">
                <Column>
                  <Text className="m-0 font-bold text-white">Total</Text>
                </Column>
                <Column align="right">
                  <Text className="m-0 font-bold text-[#e94560]">${total.toFixed(2)}</Text>
                </Column>
              </Row>
            </div>
          </Section>

          {recoveryLink && (
            <Section className="px-8 pb-4 text-center">
              <a
                href={recoveryLink}
                className="inline-block rounded-lg bg-[#e94560] px-8 py-3 text-sm font-bold text-white no-underline"
              >
                Complete Your Order
              </a>
            </Section>
          )}

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
