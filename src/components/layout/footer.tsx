import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t border-border-subtle bg-bg-surface">
      <div className="editorial-container py-20">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <Link href="/">
              <span className="font-serif text-2xl tracking-[0.3em] uppercase text-text-primary">
                ATELIER
              </span>
            </Link>
            <p className="mt-6 max-w-xs text-sm leading-relaxed text-text-secondary">
              Timeless objects and apparel crafted with intention. Premium materials, expert craftsmanship, enduring design.
            </p>
          </div>

          <div>
            <h3 className="meta mb-6">Shop</h3>
            <ul className="space-y-3">
              {["New Arrivals", "Clothing", "Accessories", "Home", "All Products"].map((link) => (
                <li key={link}>
                  <Link
                    href="#"
                    className="text-sm text-text-secondary transition-colors hover:text-text-primary"
                  >
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="meta mb-6">Company</h3>
            <ul className="space-y-3">
              {["About", "Journal", "Careers", "Sustainability", "Press"].map((link) => (
                <li key={link}>
                  <Link
                    href={link === "About" ? "/about" : link === "Journal" ? "/blog" : "#"}
                    className="text-sm text-text-secondary transition-colors hover:text-text-primary"
                  >
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="meta mb-6">Support</h3>
            <ul className="space-y-3">
              {["Help Center", "Shipping & Returns", "Size Guide", "Contact"].map((link) => (
                <li key={link}>
                  <Link
                    href="#"
                    className="text-sm text-text-secondary transition-colors hover:text-text-primary"
                  >
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-20 flex flex-col items-center justify-between gap-6 border-t border-border-subtle pt-8 md:flex-row">
          <p className="text-xs text-text-muted">
            &copy; {new Date().getFullYear()} ATELIER. All rights reserved.
          </p>
          <div className="flex items-center gap-8">
            {["Instagram", "Pinterest", "Twitter"].map((social) => (
              <Link
                key={social}
                href="#"
                className="text-xs text-text-muted transition-colors hover:text-text-primary"
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
