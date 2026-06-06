"use client"

import Image from "next/image"
import Link from "next/link"
import { Trash2 } from "lucide-react"
import { QuantitySelector } from "@/components/shared/quantity-selector"
import { formatCartPrice } from "@/lib/cart"
import type { CartItem as CartItemType } from "@/types"

interface CartItemProps {
  item: CartItemType
  onUpdateQuantity: (productId: string, quantity: number) => void
  onRemove: (productId: string) => void
  onClose?: () => void
}

export function CartItemRow({
  item,
  onUpdateQuantity,
  onRemove,
  onClose,
}: CartItemProps) {
  const href = item.slug ? `/products/${item.slug}` : `/products/${item.productId}`

  return (
    <li className="flex gap-4 rounded-2xl border border-border bg-foreground/[0.04] p-3">
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-muted">
        <Image
          src={item.image}
          alt={item.name}
          fill
          sizes="80px"
          className="object-cover"
        />
      </div>

      <div className="flex flex-1 flex-col justify-between">
        <div className="flex items-start justify-between gap-2">
          <div>
            <Link
              href={href}
              className="text-sm font-medium text-foreground hover:text-accent"
              onClick={onClose}
            >
              {item.name}
            </Link>
            {item.size && (
              <p className="mt-0.5 text-xs text-secondary">
                Size: {item.size}
              </p>
            )}
          </div>
          <button
            onClick={() => onRemove(item.productId)}
            aria-label="Remove item"
            className="text-secondary hover:text-foreground transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <QuantitySelector
            value={item.quantity}
            onChange={(q) => onUpdateQuantity(item.productId, q)}
            max={item.stock ?? 99}
            size="sm"
          />
          <span className="text-sm font-medium tabular-nums text-accent">
            {formatCartPrice(item.price * item.quantity)}
          </span>
        </div>
      </div>
    </li>
  )
}
