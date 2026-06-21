import { sendEmail } from "./send"
import OrderConfirmationEmail from "@/emails/order-confirmation"
import OrderShippedEmail from "@/emails/order-shipped"
import OrderDeliveredEmail from "@/emails/order-delivered"
import CartRecoveryEmail from "@/emails/cart-recovery"

interface OrderEmailData {
  id: string
  totalAmount: number
  shippingName: string
  shippingEmail: string | null
  shippingStreet: string
  shippingCity: string
  shippingState: string
  shippingPostal: string
  shippingCountry: string
  items: {
    name: string
    quantity: number
    price: number
    size: string | null
    image: string | null
  }[]
  user?: { name: string | null; email: string | null } | null
}

function getCustomerName(order: OrderEmailData): string {
  return order.shippingName || order.user?.name || "Valued Customer"
}

function getRecipientEmail(order: OrderEmailData): string | null {
  return order.shippingEmail || order.user?.email || null
}

function getOrderNumber(id: string): string {
  return id.slice(0, 8)
}

export async function sendOrderConfirmationEmail(order: OrderEmailData): Promise<void> {
  const email = getRecipientEmail(order)
  if (!email) {
    console.warn(`[Email] No email address for order ${order.id} — skipping confirmation`)
    return
  }

  await sendEmail({
    to: email,
    subject: `Order #${getOrderNumber(order.id)} confirmed`,
    template: OrderConfirmationEmail({
      customerName: getCustomerName(order),
      orderNumber: getOrderNumber(order.id),
      items: order.items,
      total: Number(order.totalAmount),
      shippingName: order.shippingName,
      shippingStreet: order.shippingStreet,
      shippingCity: order.shippingCity,
      shippingState: order.shippingState,
      shippingPostal: order.shippingPostal,
      shippingCountry: order.shippingCountry,
    }),
  })
}

export async function sendOrderShippedEmail(order: OrderEmailData): Promise<void> {
  const email = getRecipientEmail(order)
  if (!email) {
    console.warn(`[Email] No email address for order ${order.id} — skipping shipped notification`)
    return
  }

  await sendEmail({
    to: email,
    subject: `Order #${getOrderNumber(order.id)} has shipped`,
    template: OrderShippedEmail({
      customerName: getCustomerName(order),
      orderNumber: getOrderNumber(order.id),
      items: order.items,
      total: Number(order.totalAmount),
      shippingName: order.shippingName,
      shippingStreet: order.shippingStreet,
      shippingCity: order.shippingCity,
      shippingState: order.shippingState,
      shippingPostal: order.shippingPostal,
      shippingCountry: order.shippingCountry,
    }),
  })
}

export async function sendOrderDeliveredEmail(order: OrderEmailData): Promise<void> {
  const email = getRecipientEmail(order)
  if (!email) {
    console.warn(`[Email] No email address for order ${order.id} — skipping delivered notification`)
    return
  }

  await sendEmail({
    to: email,
    subject: `Order #${getOrderNumber(order.id)} has been delivered`,
    template: OrderDeliveredEmail({
      customerName: getCustomerName(order),
      orderNumber: getOrderNumber(order.id),
      items: order.items,
      total: Number(order.totalAmount),
    }),
  })
}

interface CartRecoveryEmailData {
  email: string
  cartItems: {
    name: string
    price: number
    quantity: number
    image?: string
    size?: string
  }[]
  total: number
  recoveryId: string
}

export async function sendCartRecoveryEmail(data: CartRecoveryEmailData): Promise<void> {
  if (!data.email) {
    console.warn(`[Email] No email address for cart recovery — skipping`)
    return
  }

  const recoveryLink = `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/cart?recovery=${data.recoveryId}`

  await sendEmail({
    to: data.email,
    subject: "You left something behind — complete your purchase",
    template: CartRecoveryEmail({
      customerEmail: data.email,
      cartItems: data.cartItems,
      total: data.total,
      recoveryLink,
    }),
  })
}
