import { useState } from 'react'

// Shared shimmer keyframes — injected once.
let stylesInjected = false
export function ensureImageStyles() {
  if (stylesInjected || typeof document === 'undefined') return
  stylesInjected = true
  const el = document.createElement('style')
  el.textContent = `
@keyframes slf-shimmer { 0% { background-position: -200% 0 } 100% { background-position: 200% 0 } }
.slf-img-skeleton {
  position: absolute; inset: 0;
  background: linear-gradient(100deg, #eceae4 25%, #f5f4ef 50%, #eceae4 75%);
  background-size: 200% 100%;
  animation: slf-shimmer 1.4s ease-in-out infinite;
}
@media (prefers-reduced-motion: reduce) { .slf-img-skeleton { animation: none; } }
`
  document.head.appendChild(el)
}

/**
 * Image with a loading skeleton (shimmer) that fades out once the image loads.
 * Props mirror <img> — pass src, alt, style, onClick, className, etc.
 * `wrapperStyle` styles the positioning wrapper (defaults to filling its parent).
 */
export default function SmartImage({ src, alt = '', style = {}, wrapperStyle = {}, onClick, className, fit = 'cover', ...rest }) {
  ensureImageStyles()
  const [loaded, setLoaded] = useState(false)

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden', ...wrapperStyle }}>
      {!loaded && <div className="slf-img-skeleton" />}
      {src && (
        <img
          src={src}
          alt={alt}
          className={className}
          onClick={onClick}
          onLoad={() => setLoaded(true)}
          onError={() => setLoaded(true)}
          style={{
            display: 'block',
            width: '100%',
            height: '100%',
            objectFit: fit,
            opacity: loaded ? 1 : 0,
            transition: 'opacity 0.4s ease',
            ...style,
          }}
          {...rest}
        />
      )}
    </div>
  )
}
