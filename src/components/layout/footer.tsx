import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="editorial-container py-8">
        <div className="grid gap-9 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          <div className="lg:col-span-1">
            <Link href="/">
              <span className="font-serif text-xl uppercase tracking-[0.48em] text-foreground">
                STORE
              </span>
            </Link>
            <p className="mt-4 max-w-[210px] text-xs leading-5 text-secondary">
              Timeless essentials crafted for modern living.
            </p>
          </div>

          <div>
            <h3 className="editorial-kicker mb-4 text-foreground">
              Shop
            </h3>
            <ul className="space-y-3">
              {["New Arrivals", "Clothing", "Accessories", "Sale", "All Products"].map((link) => (
                <li key={link}>
                  <Link
                    href="#"
                    className="text-xs text-secondary transition-colors hover:text-foreground"
                  >
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="editorial-kicker mb-4 text-foreground">
              Company
            </h3>
            <ul className="space-y-3">
              {["About", "Careers", "Press", "Sustainability"].map((link) => (
                <li key={link}>
                  <Link
                    href="#"
                    className="text-xs text-secondary transition-colors hover:text-foreground"
                  >
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="editorial-kicker mb-4 text-foreground">
              Support
            </h3>
            <ul className="space-y-3">
              {["Help Center", "Shipping", "Returns", "Size Guide", "Contact"].map((link) => (
                <li key={link}>
                  <Link
                    href="#"
                    className="text-xs text-secondary transition-colors hover:text-foreground"
                  >
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="editorial-kicker mb-4 text-foreground">
              Legal
            </h3>
            <ul className="space-y-3">
              {["Privacy Policy", "Terms of Service", "Cookie Policy"].map((link) => (
                <li key={link}>
                  <Link
                    href="#"
                    className="text-xs text-secondary transition-colors hover:text-foreground"
                  >
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-border pt-5 md:flex-row">
          <p className="text-xs text-muted">
            &copy; {new Date().getFullYear()} STORE. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            {["Twitter", "Instagram", "Facebook", "YouTube"].map((social) => (
              <Link
                key={social}
                href="#"
                className="text-xs text-muted transition-colors hover:text-foreground"
              >
                {social}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
