"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { shippingAddressSchema, type ShippingAddressInput } from "@/lib/validations/address"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface AddressFormProps {
  defaultValues?: ShippingAddressInput
  onSubmit: (data: ShippingAddressInput) => void
  isSubmitting?: boolean
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return <p className="mt-1 text-xs text-error">{message}</p>
}

export function AddressForm({ defaultValues, onSubmit, isSubmitting }: AddressFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ShippingAddressInput>({
    resolver: zodResolver(shippingAddressSchema),
    defaultValues: defaultValues ?? {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      country: "US",
      postalCode: "",
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="firstName" className="mb-1 block text-sm font-medium text-text-primary">
            First Name
          </label>
          <Input id="firstName" {...register("firstName")} />
          <FieldError message={errors.firstName?.message} />
        </div>
        <div>
          <label htmlFor="lastName" className="mb-1 block text-sm font-medium text-text-primary">
            Last Name
          </label>
          <Input id="lastName" {...register("lastName")} />
          <FieldError message={errors.lastName?.message} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium text-text-primary">
            Email
          </label>
          <Input id="email" type="email" {...register("email")} />
          <FieldError message={errors.email?.message} />
        </div>
        <div>
          <label htmlFor="phone" className="mb-1 block text-sm font-medium text-text-primary">
            Phone
          </label>
          <Input id="phone" type="tel" {...register("phone")} />
          <FieldError message={errors.phone?.message} />
        </div>
      </div>

      <div>
        <label htmlFor="addressLine1" className="mb-1 block text-sm font-medium text-text-primary">
          Address Line 1
        </label>
        <Input id="addressLine1" {...register("addressLine1")} />
        <FieldError message={errors.addressLine1?.message} />
      </div>

      <div>
        <label htmlFor="addressLine2" className="mb-1 block text-sm font-medium text-text-primary">
          Address Line 2 <span className="text-text-secondary">(optional)</span>
        </label>
        <Input id="addressLine2" {...register("addressLine2")} />
        <FieldError message={errors.addressLine2?.message} />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor="city" className="mb-1 block text-sm font-medium text-text-primary">
            City
          </label>
          <Input id="city" {...register("city")} />
          <FieldError message={errors.city?.message} />
        </div>
        <div>
          <label htmlFor="state" className="mb-1 block text-sm font-medium text-text-primary">
            State
          </label>
          <Input id="state" {...register("state")} />
          <FieldError message={errors.state?.message} />
        </div>
        <div>
          <label htmlFor="postalCode" className="mb-1 block text-sm font-medium text-text-primary">
            Postal Code
          </label>
          <Input id="postalCode" {...register("postalCode")} />
          <FieldError message={errors.postalCode?.message} />
        </div>
      </div>

      <div>
        <label htmlFor="country" className="mb-1 block text-sm font-medium text-text-primary">
          Country
        </label>
        <select
          id="country"
          {...register("country")}
          className={cn(
            "flex h-11 w-full border border-border-subtle bg-bg-surface px-3.5 py-2 text-sm text-text-primary placeholder:text-text-muted focus-visible:outline-none focus-visible:border-text-primary"
          )}
        >
          <option value="US">United States</option>
          <option value="CA">Canada</option>
          <option value="GB">United Kingdom</option>
          <option value="AU">Australia</option>
          <option value="DE">Germany</option>
          <option value="FR">France</option>
          <option value="JP">Japan</option>
        </select>
      </div>

      <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
        {isSubmitting ? "Saving..." : "Continue to Review"}
      </Button>
    </form>
  )
}
