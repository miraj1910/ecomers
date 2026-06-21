import { Section, Text } from "@react-email/components"

interface ShippingAddressProps {
  name: string
  street: string
  city: string
  state: string
  postal: string
  country: string
}

export function ShippingAddress({ name, street, city, state, postal, country }: ShippingAddressProps) {
  return (
    <Section className="rounded-lg bg-[#16213e] p-6">
      <Text className="m-0 mb-2 text-base font-bold text-white">Shipping Address</Text>
      <Text className="m-0 text-sm text-[#8b8ba7]">{name}</Text>
      <Text className="m-0 text-sm text-[#8b8ba7]">{street}</Text>
      <Text className="m-0 text-sm text-[#8b8ba7]">
        {city}, {state} {postal}
      </Text>
      <Text className="m-0 text-sm text-[#8b8ba7]">{country}</Text>
    </Section>
  )
}
