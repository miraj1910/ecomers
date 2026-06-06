const components = {
  h1: (props: React.ComponentPropsWithoutRef<"h1">) => (
    <h1 className="text-3xl font-semibold tracking-tight mt-12 mb-4" {...props} />
  ),
  h2: (props: React.ComponentPropsWithoutRef<"h2">) => (
    <h2 className="text-2xl font-semibold tracking-tight mt-10 mb-3" {...props} />
  ),
  h3: (props: React.ComponentPropsWithoutRef<"h3">) => (
    <h3 className="text-xl font-semibold tracking-tight mt-8 mb-2" {...props} />
  ),
  h4: (props: React.ComponentPropsWithoutRef<"h4">) => (
    <h4 className="text-lg font-semibold mt-6 mb-2" {...props} />
  ),
  p: (props: React.ComponentPropsWithoutRef<"p">) => (
    <p className="text-base leading-relaxed text-secondary mb-5" {...props} />
  ),
  ul: (props: React.ComponentPropsWithoutRef<"ul">) => (
    <ul className="mb-5 list-disc pl-6 space-y-2 text-secondary" {...props} />
  ),
  ol: (props: React.ComponentPropsWithoutRef<"ol">) => (
    <ol className="mb-5 list-decimal pl-6 space-y-2 text-secondary" {...props} />
  ),
  li: (props: React.ComponentPropsWithoutRef<"li">) => (
    <li className="text-base leading-relaxed" {...props} />
  ),
  a: (props: React.ComponentPropsWithoutRef<"a">) => (
    <a
      className="text-accent underline underline-offset-4 hover:no-underline transition-all"
      {...props}
    />
  ),
  blockquote: (props: React.ComponentPropsWithoutRef<"blockquote">) => (
    <blockquote className="border-l-2 border-foreground pl-6 italic text-secondary my-8" {...props} />
  ),
  hr: () => <hr className="my-12 border-border" />,
  strong: (props: React.ComponentPropsWithoutRef<"strong">) => (
    <strong className="font-semibold text-foreground" {...props} />
  ),
  table: (props: React.ComponentPropsWithoutRef<"table">) => (
    <div className="overflow-x-auto my-8">
      <table className="w-full text-sm border-collapse" {...props} />
    </div>
  ),
  thead: (props: React.ComponentPropsWithoutRef<"thead">) => (
    <thead className="border-b border-border" {...props} />
  ),
  th: (props: React.ComponentPropsWithoutRef<"th">) => (
    <th className="px-4 py-3 text-left font-medium text-foreground" {...props} />
  ),
  td: (props: React.ComponentPropsWithoutRef<"td">) => (
    <td className="px-4 py-3 text-secondary border-b border-border" {...props} />
  ),
  code: (props: React.ComponentPropsWithoutRef<"code">) => (
    <code className="rounded-lg bg-foreground/[0.08] px-1.5 py-0.5 text-sm font-mono text-foreground" {...props} />
  ),
  pre: (props: React.ComponentPropsWithoutRef<"pre">) => (
    <pre className="overflow-x-auto rounded-2xl border border-border bg-foreground/[0.06] p-4 my-6 text-sm font-mono text-foreground" {...props} />
  ),
  img: (props: React.ComponentPropsWithoutRef<"img">) => (
    <div className="relative aspect-video my-8 overflow-hidden rounded-xl bg-muted">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={props.src}
        alt={props.alt ?? ""}
        className="h-full w-full object-cover"
        loading="lazy"
      />
    </div>
  ),
}

export function useMDXComponents() {
  return components
}

export { components }
