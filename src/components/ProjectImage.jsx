import { useState } from 'react'
import { tokens as A } from '../tokens'

const RATIO_MAP = {
  '16/10': '62.5%',
  '4/3': '75%',
  '3/2': '66.67%',
  '1/1': '100%',
}

export default function ProjectImage({ proj, ratio = '4/3', title, style = {} }) {
  const [hovered, setHovered] = useState(false)
  const paddingTop = RATIO_MAP[ratio] ?? '75%'
  const isPhoto = proj?.tone !== 'plan'

  const stripeStyle = isPhoto
    ? { backgroundImage: `repeating-linear-gradient(135deg, #d8d5ce 0px, #d8d5ce 1px, #e8e6e0 1px, #e8e6e0 12px)` }
    : { backgroundImage: `repeating-linear-gradient(90deg, #c4c1b8 0px, #c4c1b8 1px, #e0ddd5 1px, #e0ddd5 8px)` }

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ position: 'relative', width: '100%', paddingTop, overflow: 'hidden', cursor: 'pointer', ...stripeStyle, ...style }}
    >
      {proj?.image && (
        <img
          src={proj.image}
          alt={proj.titel}
          style={{
            position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover',
            transform: hovered ? 'scale(1.03)' : 'scale(1)',
            transition: 'transform 0.4s ease',
          }}
        />
      )}
      {/* gradient overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(to top, rgba(0,0,0,0.62) 0%, rgba(0,0,0,0.08) 55%, transparent 100%)',
        opacity: hovered ? 1 : 0,
        transition: 'opacity 0.3s ease',
        pointerEvents: 'none',
      }} />
      {/* title on hover */}
      {title && (
        <div style={{
          position: 'absolute', left: 0, right: 0, bottom: 0,
          padding: '18px 16px',
          fontSize: 20, fontWeight: 700, lineHeight: 1.2,
          color: '#fff',
          opacity: hovered ? 1 : 0,
          transform: hovered ? 'translateY(0)' : 'translateY(8px)',
          transition: 'opacity 0.3s ease, transform 0.3s ease',
          pointerEvents: 'none',
        }}>
          {title}
        </div>
      )}
    </div>
  )
}
