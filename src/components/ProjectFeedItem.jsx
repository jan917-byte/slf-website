import { useState } from 'react'
import { tokens as A } from '../tokens'
import ProjectImage from './ProjectImage'
import { useWindowWidth } from '../hooks/useWindowWidth'

export default function ProjectFeedItem({ proj, align = 'L', large = false }) {
  const [ctaHovered, setCtaHovered] = useState(false)
  const width = useWindowWidth()
  const isMobile = width < 768

  const Img = (
    <div style={{ gridColumn: isMobile ? '1' : (align === 'L' ? '1 / span 7' : '6 / span 7') }}>
      <ProjectImage proj={proj} ratio={large ? '16/10' : '4/3'} />
    </div>
  )

  const Txt = (
    <div style={{
      gridColumn: isMobile ? '1' : (align === 'L' ? '9 / span 4' : '1 / span 4'),
      alignSelf: 'end',
      paddingBottom: 6,
    }}>
      <div style={{
        fontSize: 11, color: A.mute,
        letterSpacing: '0.1em', textTransform: 'uppercase',
        display: 'flex', gap: 12, alignItems: 'center',
      }}>
        <span>{proj.kategorie}</span>
        <span style={{ width: 18, height: 3, background: A.accent }} />
        <span>{proj.jahr}</span>
      </div>

      <h3 style={{
        fontSize: isMobile ? 18 : 22, fontWeight: 400, lineHeight: 1.15,
        letterSpacing: '-0.01em',
        margin: '12px 0 0',
      }}>
        {proj.titel}
      </h3>

      {proj.untertitel && (
        <div style={{ fontSize: 14, color: A.mute, marginTop: 6 }}>{proj.untertitel}</div>
      )}

      <div style={{
        marginTop: 10,
        fontSize: 11, color: A.accentDeep,
        letterSpacing: '0.08em', textTransform: 'uppercase',
      }}>
        {proj.ort}
      </div>

      {proj.beschreibung && (
        <p style={{
          fontSize: 16, lineHeight: 1.6, color: A.ink,
          margin: '16px 0 0', maxWidth: 400,
        }}>
          {proj.beschreibung}
        </p>
      )}

      <div style={{ marginTop: 24, fontSize: 14 }}>
        <span
          onMouseEnter={() => setCtaHovered(true)}
          onMouseLeave={() => setCtaHovered(false)}
          style={{
            borderBottom: `3px solid ${ctaHovered ? A.accentDeep : A.accent}`,
            paddingBottom: 3,
            color: ctaHovered ? A.ink : A.mute,
            cursor: 'pointer',
            transition: 'border-color 0.15s ease, color 0.15s ease',
          }}
        >
          Zum Projekt →
        </span>
      </div>
    </div>
  )

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : 'repeat(12, 1fr)',
      gap: isMobile ? 20 : 24,
      padding: isMobile ? '40px 20px' : '64px 56px',
      borderTop: `1px solid ${A.ruleSoft}`,
    }}>
      {(isMobile || align === 'L') ? <>{Img}{Txt}</> : <>{Txt}{Img}</>}
    </div>
  )
}
