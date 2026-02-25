export default function Button({
  variant = 'secondary',
  size = 'md',
  active = false,
  className = '',
  children,
  ...props
}) {
  const base = 'inline-flex items-center justify-center font-medium transition-all duration-200 select-none disabled:opacity-40 disabled:pointer-events-none font-[family-name:var(--font-body)]'

  const sizes = {
    sm: 'h-8 px-3 text-xs gap-1.5 rounded-lg',
    md: 'h-10 px-4 text-[13px] gap-2 rounded-xl',
    lg: 'h-12 px-6 text-sm gap-2.5 rounded-xl',
  }

  let v
  if (active) {
    v = 'bg-[var(--accent)] text-white shadow-md cursor-pointer'
  } else {
    switch (variant) {
      case 'primary':
        v = 'bg-[var(--accent)] text-white hover:opacity-90 shadow-md cursor-pointer'
        break
      case 'ghost':
        v = 'text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-hover)] cursor-pointer'
        break
      default: // secondary
        v = 'bg-[var(--surface)] text-[var(--text-secondary)] border border-[var(--border)] hover:border-[var(--accent)] hover:text-[var(--text)] shadow-sm cursor-pointer'
    }
  }

  return (
    <button className={`${base} ${sizes[size]} ${v} ${className}`} {...props}>
      {children}
    </button>
  )
}
