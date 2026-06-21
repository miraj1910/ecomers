import { Column, Row, Section, Text } from "@react-email/components"

interface OrderItemProps {
  name: string
  quantity: number
  price: number
  size?: string | null
  image?: string | null
}

interface OrderSummaryProps {
  items: OrderItemProps[]
  total: number
}

function LineItem({ name, quantity, price, size }: OrderItemProps) {
  return (
    <Row className="border-b border-[#2a2a3e] py-3">
      <Column>
        <Text className="m-0 text-sm text-white">{name}</Text>
        {size && <Text className="m-0 text-xs text-[#8b8ba7]">Size: {size}</Text>}
        <Text className="m-0 text-xs text-[#8b8ba7]">Qty: {quantity}</Text>
      </Column>
      <Column align="right">
        <Text className="m-0 text-sm text-white">${(price * quantity).toFixed(2)}</Text>
      </Column>
    </Row>
  )
}

export function OrderSummary({ items, total }: OrderSummaryProps) {
  return (
    <Section className="rounded-lg bg-[#16213e] p-6">
      <Text className="m-0 mb-4 text-base font-bold text-white">Order Summary</Text>
      {items.map((item, i) => (
        <LineItem key={i} {...item} />
      ))}
      <Row className="pt-3">
        <Column>
          <Text className="m-0 font-bold text-white">Total</Text>
        </Column>
        <Column align="right">
          <Text className="m-0 font-bold text-[#e94560]">
            ${total.toFixed(2)}
          </Text>
        </Column>
      </Row>
    </Section>
  )
}
