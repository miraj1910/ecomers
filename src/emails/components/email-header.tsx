import { Column, Img, Row, Section, Text } from "@react-email/components"

interface EmailHeaderProps {
  preview?: string
}

const logoUrl = "https://placehold.co/160x40/1a1a2e/e94560?text=STORE"

export function EmailHeader({ preview }: EmailHeaderProps) {
  return (
    <Section className="bg-[#1a1a2e] px-8 py-6">
      {preview && (
        <Text className="m-0 text-center text-xs text-[#8b8ba7]">
          {preview}
        </Text>
      )}
      <Row>
        <Column align="center">
          <Img
            src={logoUrl}
            alt="Store Logo"
            width="160"
            height="40"
            className="block"
          />
        </Column>
      </Row>
    </Section>
  )
}
