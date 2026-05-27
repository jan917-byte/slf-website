import { useParams, Navigate, Link } from 'react-router-dom'
import { tokens as A, base } from '../tokens'
import Nav from '../components/Nav'
import Footer from '../components/Footer'
import projects from '../data/projects'
import { useWindowWidth } from '../hooks/useWindowWidth'

const PROSE_STYLES = `
.slf-prose p { margin: 0 0 1.2em; line-height: 1.65; }
.slf-prose p:last-child { margin-bottom: 0; }
.slf-prose h2 { font-size: 1.1em; font-weight: 500; margin: 1.6em 0 0.5em; letter-spacing: -0.01em; }
.slf-prose h3 { font-size: 1em; font-weight: 500; margin: 1.4em 0 0.4em; }
.slf-prose ul, .slf-prose ol { margin: 0 0 1.2em; padding-left: 1.4em; }
.slf-prose li { margin-bottom: 0.35em; line-height: 1.6; }
.slf-prose strong { font-weight: 500; }
.slf-prose a { color: inherit; text-decoration: underline; text-underline-offset: 3px; }
.slf-prose blockquote { margin: 1.4em 0; padding-left: 1.2em; border-left: 2px solid #e6e5e2; color: #6b6b6e; font-style: italic; }
.slf-prose img { max-width: 100%; height: auto; display: block; margin: 1.4em 0; }
.slf-prose figure { margin: 1.4em 0; }
.slf-prose figcaption { font-size: 0.85em; color: #6b6b6e; margin-top: 0.4em; }
.slf-prose .slf-daten-heading { font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase; color: #8a8765; font-weight: 500; margin: 2em 0 0.5em; line-height: 1; }
.slf-prose .slf-daten { margin: 0; border-bottom: 1px solid #e6e5e2; }
.slf-prose .slf-daten dt { font-size: 10px; letter-spacing: 0.12em; text-transform: uppercase; color: #6b6b6e; border-top: 1px solid #e6e5e2; padding: 8px 0 2px; margin: 0; }
.slf-prose .slf-daten dd { font-size: 13px; color: #0e0e10; padding: 0 0 8px; margin: 0; line-height: 1.5; overflow-wrap: break-word; }
`

// Detect the Projektdaten block (alternating <p>label</p><p>value</p> pairs produced by
// Elementor's table widget) and transform it into a styled <dl>.
function processContent(html) {
  if (!html) return html;
  return html.replace(
    /<p[^>]*>\s*<strong>\s*Projektdaten\s*<\/strong>\s*<\/p>([\s\S]*)$/i,
    (_, rest) => {
      const items = [];
      const pRe = /<p[^>]*>([\s\S]*?)<\/p>/g;
      let m;
      while ((m = pRe.exec(rest)) !== null) {
        const text = m[1].replace(/<[^>]+>/g, '').trim();
        if (text) items.push(text);
      }
      let dl = '<p class="slf-daten-heading">Projektdaten</p><dl class="slf-daten">';
      for (let i = 0; i + 1 < items.length; i += 2) {
        const val = items[i + 1];
        const valHtml = /^https?:\/\//i.test(val)
          ? `<a href="${val}" target="_blank" rel="noopener noreferrer">${val}</a>`
          : val;
        dl += `<dt>${items[i]}</dt><dd>${valHtml}</dd>`;
      }
      // orphan label (no value) — display without dd
      if (items.length % 2 !== 0) {
        dl += `<dt>${items[items.length - 1]}</dt>`;
      }
      dl += '</dl>';
      return dl;
    }
  );
}

export default function ProjectDetail() {
  const { id } = useParams()
  const width = useWindowWidth()
  const isMobile = width < 768

  const idx = projects.findIndex(p => p.id === id)
  if (idx === -1) return <Navigate to="/projekte" replace />

  const project = projects[idx]
  const prev = idx > 0 ? projects[idx - 1] : null
  const next = idx < projects.length - 1 ? projects[idx + 1] : null

  const year = project.jahr ?? (project.wpDate ? new Date(project.wpDate).getFullYear() : null)
  const hPad = isMobile ? 20 : 56

  const metaRows = [
    { label: 'Kategorie', value: project.kategorie },
    { label: 'Zeitraum', value: year },
    { label: 'Ort', value: project.ort },
    { label: 'Auftraggeber', value: project.auftraggeber },
    { label: 'Fläche', value: project.flaeche },
  ].filter(row => row.value != null)

  const hasImage = !!project.image
  const contentRow = !isMobile && hasImage ? '2' : '1'

  return (
    <div style={base}>
      <style>{PROSE_STYLES}</style>
      <Nav />

      {/* Back link */}
      <div style={{
        padding: `20px ${hPad}px 0`,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
      }}>
        <Link
          to="/projekte"
          style={{
            fontSize: 11,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: A.accentDeep,
            fontWeight: 500,
            textDecoration: 'none',
          }}
        >
          ← Alle Projekte
        </Link>
      </div>

      {/* Main grid */}
      <div style={{
        padding: isMobile ? '32px 20px 0' : '48px 56px 0',
        ...(isMobile ? {} : {
          display: 'grid',
          gridTemplateColumns: 'repeat(12, 1fr)',
          gap: '32px 24px',
        }),
      }}>

        {/* Hero image — desktop: cols 3–10, row 1 (aligned with body text) */}
        {hasImage && !isMobile && (
          <div style={{ gridColumn: '3 / span 8', gridRow: '1' }}>
            <img
              src={project.image}
              alt={project.titel}
              style={{ width: '100%', display: 'block' }}
            />
          </div>
        )}

        {/* Section label */}
        {!isMobile && (
          <div style={{ gridColumn: '1 / span 1', gridRow: contentRow, paddingTop: 4 }}>
            <span style={{
              fontSize: 11,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: A.accentDeep,
              fontWeight: 500,
            }}>
              Projekt
            </span>
          </div>
        )}

        {/* Content column */}
        <div style={isMobile ? {} : { gridColumn: '3 / span 8', gridRow: contentRow }}>

          {/* Mobile hero image */}
          {hasImage && isMobile && (
            <div style={{ marginBottom: 28 }}>
              <img
                src={project.image}
                alt={project.titel}
                style={{ width: '100%', display: 'block' }}
              />
            </div>
          )}

          {/* Title */}
          <h1 style={{
            fontSize: isMobile ? 22 : 32,
            fontWeight: 400,
            letterSpacing: '-0.02em',
            lineHeight: 1.2,
            margin: '0 0 8px',
            color: A.ink,
          }}>
            {project.titel}
          </h1>

          {/* Subtitle */}
          {project.untertitel && (
            <p style={{
              fontSize: isMobile ? 15 : 17,
              color: A.mute,
              margin: '0 0 0',
              lineHeight: 1.5,
            }}>
              {project.untertitel}
            </p>
          )}

          {/* Structured metadata (from tokens — currently all null in WP data) */}
          {metaRows.length > 0 && (
            <div style={{ margin: '24px 0 32px' }}>
              {metaRows.map((row, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    borderTop: `1px solid ${A.rule}`,
                    ...(i === metaRows.length - 1 ? { borderBottom: `1px solid ${A.rule}` } : {}),
                    padding: '8px 0',
                    gap: 24,
                  }}
                >
                  <span style={{
                    minWidth: 110,
                    fontSize: 10,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color: A.mute,
                    flexShrink: 0,
                  }}>
                    {row.label}
                  </span>
                  <span style={{ fontSize: 13, color: A.ink }}>
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Prose content — Projektdaten block transformed into styled <dl> */}
          {project.content ? (
            <div
              className="slf-prose"
              style={{
                fontSize: isMobile ? 15 : 16,
                color: A.ink,
                lineHeight: 1.65,
                marginTop: metaRows.length > 0 ? 0 : 24,
              }}
              dangerouslySetInnerHTML={{ __html: processContent(project.content) }}
            />
          ) : (
            <p style={{ fontSize: 16, color: A.ink, lineHeight: 1.65, marginTop: 24 }}>
              {project.beschreibung}
            </p>
          )}

          {/* Link to WordPress */}
          {project.wpLink && (
            <div style={{ marginTop: 32 }}>
              <a
                href={project.wpLink}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontSize: 12,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: A.accentDeep,
                  textDecoration: 'none',
                  borderBottom: `1px solid ${A.accent}`,
                  paddingBottom: 2,
                }}
              >
                Zum Artikel →
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Prev / Next navigation */}
      <div style={{
        padding: isMobile ? '48px 20px 0' : '72px 56px 0',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 24,
        borderTop: `1px solid ${A.rule}`,
        marginTop: isMobile ? 48 : 72,
      }}>
        <div>
          {prev && (
            <Link
              to={`/projekte/${prev.id}`}
              style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
            >
              <div style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: A.mute, marginBottom: 8 }}>
                ← Vorheriges Projekt
              </div>
              <div style={{ fontSize: isMobile ? 14 : 15, color: A.ink, fontWeight: 400, letterSpacing: '-0.01em' }}>
                {prev.titel}
              </div>
            </Link>
          )}
        </div>
        <div style={{ textAlign: 'right' }}>
          {next && (
            <Link
              to={`/projekte/${next.id}`}
              style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
            >
              <div style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: A.mute, marginBottom: 8 }}>
                Nächstes Projekt →
              </div>
              <div style={{ fontSize: isMobile ? 14 : 15, color: A.ink, fontWeight: 400, letterSpacing: '-0.01em' }}>
                {next.titel}
              </div>
            </Link>
          )}
        </div>
      </div>

      <Footer />
    </div>
  )
}
