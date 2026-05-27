export const PROJEKTE_NAV = [
  { label: '(Gesamt-) Übersicht', key: null },
  { label: 'Entwicklungskonzepte', key: 'entwicklungskonzepte' },
  { label: 'Wettbewerbe', key: 'wettbewerbe' },
  { label: 'Bauleitplanung', key: 'bauleitplanung' },
  { label: 'Verfahrensbetreuung', key: 'verfahrensbetreuung' },
  { label: 'Projektliste', key: 'projektliste' },
]

export const FILTER_FN = {
  entwicklungskonzepte: (p) => p.kategorie === 'Entwicklungskonzepte',
  wettbewerbe: (p) => p.kategorie === 'Wettbewerbe',
  bauleitplanung: (p) => p.kategorie === 'Bauleitplanung',
  verfahrensbetreuung: (p) => p.kategorie === 'Verfahrensbetreuung',
  projektliste: () => true,
}

export function filterHref(key) {
  return key ? `/projekte?filter=${key}` : '/projekte'
}
