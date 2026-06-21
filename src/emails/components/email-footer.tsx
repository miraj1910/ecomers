import { Hr, Link, Section, Text } from "@react-email/components"

export function EmailFooter() {
  return (
    <Section className="px-8 pb-8 pt-4">
      <Hr className="border-[#2a2a3e]" />
      <Text className="mb-1 mt-4 text-center text-xs text-[#6b6b87]">
        Need help? Contact{" "}
        <Link href="mailto:support@example.com" className="text-[#e94560] underline">
          support@example.com
        </Link>
      </Text>
      <Text className="m-0 text-center text-xs text-[#6b6b87]">
        &copy; {new Date().getFullYear()} EcomStore. All rights reserved.
      </Text>
      <Text className="m-0 text-center text-xs text-[#6b6b87]">
        123 Commerce St, Suite 100, San Francisco, CA 94102
      </Text>
    </Section>
  )
}
