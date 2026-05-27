#!/usr/bin/env node
// ⚠️ NE PAS ÉDITER — généré automatiquement, lancé via `npm run sync` ou `npm run build`.

import { writeFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const WP_BASE = 'https://www.slf-berlin.de/wp-json/wp/v2';
const OUTPUT_PATH = join(__dirname, '../src/data/projects.js');

const KNOWN_SLUGS = new Set([
  'entwicklungskonzepte',
  'wettbewerbe',
  'bauleitplanung',
  'verfahrensbetreuung',
]);

// Maps WP category slug → display label used by FILTER_FN in filters.js
const CATEGORY_LABEL = {
  entwicklungskonzepte: 'Entwicklungskonzepte',
  wettbewerbe: 'Wettbewerbe',
  bauleitplanung: 'Bauleitplanung',
  verfahrensbetreuung: 'Verfahrensbetreuung',
};

function decodeHtmlEntities(str) {
  return str
    .replace(/­/g, '')       // soft hyphens inserted by WordPress
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#8211;/g, '–') // en-dash
    .replace(/&#8212;/g, '—') // em-dash
    .replace(/&#8216;/g, '‘')
    .replace(/&#8217;/g, '’')
    .replace(/&#8220;/g, '“')
    .replace(/&#8221;/g, '”')
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(parseInt(code, 10)))
    .replace(/&[a-z]+;/g, '');
}

function stripHtml(html) {
  return decodeHtmlEntities(
    html
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
  );
}

// Extracts the Zeitraum value from the Projektdaten block in raw WP HTML.
// The block is a series of alternating <p>label</p><p>value</p> pairs.
function extractZeitraum(html) {
  if (!html) return null;
  const m = html.match(/<p[^>]*>\s*Zeitraum\s*<\/p>[\s\S]*?<p[^>]*>([\s\S]*?)<\/p>/i);
  if (!m) return null;
  const text = decodeHtmlEntities(m[1].replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim());
  return text || null;
}

// Strips Elementor/structural wrappers, keeps semantic block + inline tags
function extractProse(html) {
  if (!html) return null;
  return decodeHtmlEntities(
    html
      .replace(/<\/?(div|section|article|aside|figure|figcaption|header|footer|nav|main|span)[^>]*>/gi, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/<(p|h[1-6]|li|ul|ol)[^>]*>\s*<\/\1>/gi, '')
      .replace(/[ \t]+/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .trim()
  );
}

function pickImageUrl(featuredMedia) {
  if (!featuredMedia) return null;
  const sizes = featuredMedia.media_details?.sizes ?? {};
  return (
    sizes.large?.source_url ??
    sizes.medium_large?.source_url ??
    featuredMedia.source_url ??
    null
  );
}

async function fetchAllPosts() {
  const posts = [];
  let page = 1;

  while (true) {
    const url = `${WP_BASE}/posts?per_page=100&page=${page}&_embed&status=publish`;
    const res = await fetch(url);

    if (res.status === 400) break; // WP returns 400 when page exceeds total
    if (!res.ok) throw new Error(`WP API responded ${res.status} for page ${page}`);

    const batch = await res.json();
    if (!batch.length) break;

    posts.push(...batch);

    const totalPages = parseInt(res.headers.get('X-WP-TotalPages') ?? '1', 10);
    if (page >= totalPages) break;
    page++;
  }

  return posts;
}

function mapPost(post) {
  const terms = post._embedded?.['wp:term']?.[0] ?? [];
  const primaryTerm = terms.find(t => KNOWN_SLUGS.has(t.slug));
  if (!primaryTerm) return null; // skip uncategorized / non-project posts

  const featuredMedia = post._embedded?.['wp:featuredmedia']?.[0];
  const imageUrl = pickImageUrl(featuredMedia);
  const beschreibung = stripHtml(post.excerpt?.rendered ?? post.content?.rendered ?? '');

  return {
    id: post.slug,
    titel: decodeHtmlEntities(post.title.rendered),
    untertitel: '',
    beschreibung,
    content: extractProse(post.content?.rendered ?? null),
    ort: null,
    jahr: extractZeitraum(post.content?.rendered ?? null),
    kategorie: CATEGORY_LABEL[primaryTerm.slug],
    flaeche: null,
    auftraggeber: null,
    tone: imageUrl ? 'photo' : 'plan',
    image: imageUrl,
    wpId: post.id,
    wpDate: post.date,
    wpLink: post.link,
  };
}

async function main() {
  console.log('🔄  Syncing projects from WordPress…');
  console.log(`    Source: ${WP_BASE}/posts`);

  let posts;
  try {
    posts = await fetchAllPosts();
  } catch (err) {
    console.error(`\n❌  Failed to fetch from WordPress: ${err.message}`);
    if (existsSync(OUTPUT_PATH)) {
      console.warn('⚠️   Keeping existing src/data/projects.js as fallback — build will use stale data.');
      process.exit(0);
    }
    console.error('    No fallback file found. Aborting build.');
    process.exit(1);
  }

  console.log(`    Fetched ${posts.length} published posts`);

  const projects = posts
    .map(mapPost)
    .filter(Boolean)
    .sort((a, b) => new Date(b.wpDate) - new Date(a.wpDate)); // newest first

  // Stats
  const byCategory = {};
  for (const p of projects) {
    byCategory[p.kategorie] = (byCategory[p.kategorie] ?? 0) + 1;
  }
  for (const [cat, count] of Object.entries(byCategory)) {
    console.log(`    ${cat}: ${count}`);
  }

  // Warnings
  const skipped = posts.length - projects.length;
  if (skipped > 0) {
    console.warn(`⚠️   Skipped ${skipped} posts with unknown/missing category`);
  }
  const noImage = projects.filter(p => !p.image);
  if (noImage.length) {
    console.warn(`⚠️   ${noImage.length} projects have no featured image: ${noImage.map(p => p.id).join(', ')}`);
  }

  // Deduplicate slugs
  const seenIds = new Set();
  for (const p of projects) {
    if (seenIds.has(p.id)) {
      console.warn(`⚠️   Duplicate slug detected: "${p.id}" (wpId ${p.wpId}) — appending suffix`);
      p.id = `${p.id}-${p.wpId}`;
    }
    seenIds.add(p.id);
  }

  const now = new Date().toISOString();
  const output =
    `// ⚠️ FICHIER GÉNÉRÉ AUTOMATIQUEMENT depuis WordPress.\n` +
    `// Ne pas éditer à la main — modifier dans WordPress puis lancer \`npm run sync\`.\n` +
    `// Dernière synchro : ${now}\n` +
    `// Source : ${WP_BASE}/posts\n\n` +
    `const projects = ${JSON.stringify(projects, null, 2)};\n\nexport default projects;\n`;

  writeFileSync(OUTPUT_PATH, output, 'utf8');
  console.log(`\n✅  Wrote ${projects.length} projects to src/data/projects.js`);
}

main().catch(err => {
  console.error('\n❌  Unexpected error:', err);
  process.exit(1);
});
