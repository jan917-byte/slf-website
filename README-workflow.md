# Workflow — Publier un projet sur le site

## Comment ça marche

Le nouveau site React récupère automatiquement tous les projets depuis le WordPress existant
(`slf-berlin.de`) au moment du build. Vous continuez à utiliser WordPress comme d'habitude.

---

## Ajouter ou modifier un projet

1. Connectez-vous à l'administration WordPress sur `slf-berlin.de/wp-admin`
2. Créez ou modifiez un **Article** (post)
3. Renseignez :
   - **Titre** — affiché tel quel sur le nouveau site
   - **Extrait** — description du projet (texte sans formatage, idéalement 2–3 phrases)
   - **Image à la une** — photo ou plan principal du projet
   - **Catégorie** — choisir parmi les 4 catégories existantes :
     - *Entwicklungskonzepte*
     - *Wettbewerbe*
     - *Bauleitplanung*
     - *Verfahrensbetreuung*
4. Cliquez **Publier**

---

## Mettre à jour le site après une modification WordPress

### Option A — Redéploiement manuel (configuration actuelle)

Après avoir publié dans WordPress :

1. Allez sur le tableau de bord de votre hébergeur (Netlify / Vercel / etc.)
2. Cliquez sur **"Trigger deploy"** ou **"Redeploy"**
3. Attendez ~2 minutes
4. Le projet est visible sur le site

### Option B — Mise à jour automatique (recommandée, à configurer une fois)

Avec un webhook WordPress → hébergeur, le site se met à jour tout seul dès que vous publiez.
Demandez à votre développeur de configurer cette connexion — c'est une opération unique.

---

## Ce que le site affiche pour chaque projet

| Champ WordPress | Affiché sur le site |
|---|---|
| Titre | ✅ Titre du projet |
| Extrait | ✅ Description |
| Image à la une | ✅ Photo / plan |
| Catégorie | ✅ Filtre sur la page Projekte |
| Contenu (corps) | ❌ Pas encore (prévu page détail) |

Les champs **Ville**, **Année**, **Surface**, **Maître d'ouvrage** ne sont pas encore
structurés dans WordPress. Pour les ajouter proprement, il faudra installer le plugin
**ACF (Advanced Custom Fields)** et créer des champs dédiés — demandez à votre développeur.

---

## Infos techniques

- Source WordPress : `https://www.slf-berlin.de/wp-json/wp/v2/posts`
- Script de synchro : `scripts/sync-from-wordpress.mjs`
- La synchro tourne automatiquement à chaque `npm run build`
- Pour synchroniser sans rebuilder : `npm run sync`
- En cas d'indisponibilité de WordPress, le build utilise la dernière version connue des projets
