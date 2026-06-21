"use client"

import Image from "next/image"
import Link from "next/link"
import { X } from "lucide-react"
import { QuantitySelector } from "@/components/shared/quantity-selector"
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
    <li className="flex gap-5">
      <div className="relative h-24 w-20 shrink-0 overflow-hidden bg-bg-secondary">
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
              className="text-sm font-medium text-text-primary hover:text-text-secondary transition-colors"
              onClick={onClose}
            >
              {item.name}
            </Link>
            {item.size && (
              <p className="mt-0.5 text-xs text-text-secondary">
                Size: {item.size}
              </p>
            )}
          </div>
          <button
            onClick={() => onRemove(item.productId)}
            aria-label="Remove item"
            className="text-text-muted hover:text-text-primary transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <QuantitySelector
            value={item.quantity}
            onChange={(q) => onUpdateQuantity(item.productId, q)}
            max={item.stock ?? 99}
            size="sm"
          />
          <span className="text-sm font-medium text-text-primary">
            ${(item.price * item.quantity).toFixed(0)}
          </span>
        </div>
      </div>
    </li>
  )
}
