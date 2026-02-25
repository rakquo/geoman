/**
 * Reusable button — shadcn-inspired.
 *
 * Variants: primary | secondary (default) | ghost | outline
 * Sizes:    sm | md (default) | lg
 */
export default function Button({
  variant = 'secondary',
  size = 'md',
  active = false,
  className = '',
  children,
  ...props
}) {
  const base = [
    'inline-flex items-center justify-center gap-2',
    'font-semibold whitespace-nowrap select-none',
    'transition-colors duration-150 cursor-pointer',
    'disabled:opacity-40 disabled:pointer-events-none',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]',
  ].join(' ')

  const sizes = {
    sm:  'h-8  px-3  text-xs  rounded-md',
    md:  'h-9  px-4  text-sm  rounded-lg',
    lg:  'h-11 px-5  text-sm  rounded-lg',
  }

  let v
  if (active) {
    v = 'text-white'
  } else {
    switch (variant) {
      case 'primary':
        v = 'text-white'
        break
      case 'ghost':
        v = ''
        break
      case 'outline':
        v = ''
        break
      default: // secondary
        v = ''
    }
  }

  /* Colors via inline style so CSS vars work reliably */
  const getStyle = () => {
    if (active) {
      return {
        background: 'var(--accent)',
        border: '1px solid var(--accent)',
        color: '#fff',
      }
    }
    switch (variant) {
      case 'primary':
        return {
          background: 'var(--accent)',
          border: '1px solid var(--accent)',
          color: '#fff',
        }
      case 'ghost':
        return {
          background: 'transparent',
          border: '1px solid transparent',
          color: 'var(--text-secondary)',
        }
      case 'outline':
        return {
          background: 'transparent',
          border: '1.5px solid var(--border)',
          color: 'var(--text-secondary)',
        }
      default: // secondary
        return {
          background: 'var(--surface)',
          border: '1.5px solid var(--border)',
          color: 'var(--text-secondary)',
        }
    }
  }

  return (
    <button
      className={`${base} ${sizes[size] || sizes.md} ${v} ${className}`}
      style={getStyle()}
      {...props}
    >
      {children}
    </button>
  )
}
