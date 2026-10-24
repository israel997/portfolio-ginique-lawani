# Portfolio Ginique LAWANI — Journal de travail et référence complète

> Document vivant. **À chaque ajustement, correction ou nouvelle fonctionnalité, il est mis à jour** : une entrée datée dans le [journal](#12-journal-chronologique) et, si besoin, la section de référence concernée.
> Objectif : pouvoir comprendre, reprendre et **répliquer** ce projet de A à Z.
>
> Heures en heure du Bénin (UTC+1), prises sur les commits Git. Les décisions prises sans commit sont datées au jour près.

---

## Sommaire

1. [Vue d'ensemble](#1-vue-densemble)
2. [Répliquer le projet pas à pas](#2-répliquer-le-projet-pas-à-pas)
3. [Design system](#3-design-system)
4. [Site public](#4-site-public)
5. [Back-office (/admin)](#5-back-office-admin)
6. [Sécurité et authentification](#6-sécurité-et-authentification)
7. [Base de données et migrations](#7-base-de-données-et-migrations)
8. [API (fonctions Vercel)](#8-api-fonctions-vercel)
9. [Images, logos et fichiers](#9-images-logos-et-fichiers)
10. [Langues et traduction](#10-langues-et-traduction)
11. [Conventions de travail](#11-conventions-de-travail)
12. [Journal chronologique](#12-journal-chronologique)
13. [Fonctionnalités à venir](#13-fonctionnalités-à-venir)
14. [Limites connues](#14-limites-connues)

---

## 1. Vue d'ensemble

| | |
|---|---|
| **Site** | https://portfolio-ginique-lawani.vercel.app (domaine conservé ; un domaine personnalisé sera acheté plus tard) |
| **Admin** | https://portfolio-ginique-lawani.vercel.app/admin |
| **Dépôt** | `github.com/israel997/portfolio-ginique-lawani`, branche `main` (déploiement automatique sur Vercel) |
| **Front** | Vue 3 (`<script setup>`) + Vite 7 + Tailwind CSS 4 + vue-router 4 + vue-i18n 9 |
| **Icônes** | Lucide (`lucide-vue-next`) ; logos de marques en SVG |
| **Back** | Fonctions serverless Vercel (Node) dans `api/` |
| **Base** | Vercel Postgres (Neon) via `@vercel/postgres` |
| **Fichiers** | Vercel Blob (CV, photos, images de projets) |
| **Mesure d'audience** | Vercel Analytics |
| **Autres libs** | `bcryptjs` (mots de passe), `cropperjs` (recadrage), `sharp` (optimisation d'images, en dev) |
| **Correcteur** | LanguageTool (API publique, sans clé) |

Choix structurants :
- **On reste sur Vue** (pas de migration React/Next, décidé le 22/10/2026) : le rendu pro vient du design, pas du framework.
- **Plan Vercel Hobby** : 12 fonctions serverless maximum. Les routes sont regroupées avec des segments dynamiques (`[resource]`, `[action]`) : **6 fonctions** aujourd'hui.
- **Zéro configuration externe** pour l'admin (pas d'OAuth, pas de variable à ajouter dans Vercel).

---

## 2. Répliquer le projet pas à pas

1. **Cloner** le dépôt, puis `npm install`.
2. **Créer un projet Vercel** relié au dépôt (framework : Vite, build `npm run build`, sortie `dist`).
3. **Ajouter les intégrations** Vercel **Postgres (Neon)** et **Blob** au projet : elles injectent `POSTGRES_URL` et `BLOB_READ_WRITE_TOKEN`.
4. **Récupérer les variables en local** : `npx vercel link` puis `npx vercel env pull .env.local`.
5. **Créer le schéma et les données de départ** : `npm run db:seed`. Le script crée les tables de `scripts/schema.sql`, insère le contenu d'origine, applique les migrations et régénère `src/content/fallback.json`.
6. **Admin** : l'email admin et le hash du mot de passe par défaut sont dans `api/_lib/auth.js` (`ADMIN_EMAIL`, `DEFAULT_PASSWORD_HASH`). Pour un autre propriétaire, changer l'email et générer un hash : `node -e "console.log(require('bcryptjs').hashSync('mot-de-passe', 12))"`. Ensuite, le mot de passe se change depuis **Admin → Sécurité**.
7. **Clé de session** : rien à faire. Elle est dérivée de `POSTGRES_URL` (ou de `SESSION_SECRET` si défini).
8. **Développement** : `npm run dev` (interface seule) ou `npm run dev:api` (`vercel dev`, interface + API).
9. **Mise en ligne** : `git push origin main`, puis Vercel déploie (compter **jusqu'à 10 minutes**). Les migrations de base s'appliquent toutes seules au premier appel de l'API.
10. **Images** : après avoir ajouté des images dans `public/`, lancer `npm run images:optimize`.

---

## 3. Design system

### 3.1 Polices (reprises de la landing d'OOffix)

| Usage | Police | Classe Tailwind |
|---|---|---|
| Titres (h1–h4) | **Space Grotesk** 400–700 | `font-display` |
| Texte courant | **IBM Plex Sans** 300–700 | `font-sans` (par défaut) |
| Étiquettes, chiffres, surtitres | **IBM Plex Mono** 400–600 | `font-mono` |

Chargées depuis Google Fonts dans `index.html` (balise `<link>`, pas `@import`, pour ne pas bloquer le CSS). Déclarées dans `src/style.css` (`@theme`).

### 3.2 Règles visuelles

- **Aucun dégradé, aucun effet néon** : pas de lueur, pas de blob flou animé, pas de texte en dégradé, pas d'animation en boucle permanente. Couleurs **unies** uniquement. *(Décision du 22/10/2026.)*
- **Une seule couleur d'accent** : le **bleu OOffix `#2e5cff`**, identique en mode clair et en mode sombre. *(Le pourpre `#7e22ce` a été essayé puis abandonné le 22/10/2026 : changer de couleur en changeant de thème était déroutant.)*
- Icônes : **Lucide** partout ; logos de marques en SVG (voir §9).
- Boutons pleins en `bg-brand` (survol `bg-brand-hover`), toujours avec texte blanc.
- **Aucun tiret cadratin (—)** dans le site (titres d'onglet, textes, libellés) : on utilise « | », « : » ou « , ». *(Demandé le 23/10/2026.)*
- Coins : `rounded-xl` (boutons, champs), `rounded-2xl` (cartes), `rounded-full` (puces, pastilles).
- Conteneur max **1180 px** (`.band-inner`), marges latérales 16 px (mobile) / 24 px.

### 3.3 Couleurs par rôle (thèmes sombre et clair)

Les composants n'utilisent **jamais** de couleur brute : ils utilisent des **rôles** (`text-ink`, `bg-surface`, `border-line`…), définis une fois par thème dans `src/style.css`.

| Rôle (classe) | Sens | Sombre | Clair (palette OOffix) |
|---|---|---|---|
| `page` | fond de page | `#0f172a` | `#f6f8fe` |
| `ink` | texte principal | `#ffffff` | `#0b1b3f` |
| `ink-2` | texte secondaire fort | `#cbd5e1` | `#2a3a5e` |
| `muted` | texte secondaire | `#94a3b8` | `#5b6478` |
| `subtle` | texte tertiaire | `#64748b` | `#8891a6` |
| `line` | bordures | blanc 10 % | `#d3dcf3` (bleuté, renforcé le 23/10) |
| `line-strong` | bordures marquées | blanc 20 % | `#aebfeb` |
| `surface` | cartes | blanc 4 % | `#ffffff` |
| `surface-hover` | cartes au survol | blanc 8 % | `#eef2fb` |
| `panel` | fonds d'images | `#0f172a` | `#e9edf8` |
| `panel-deep` | cadre du carrousel | `#0a0e1a` | `#e3e8f4` |
| `nav` | barre de navigation | `#0f172a` à 75 % | `#f6f8fe` à 82 % |
| `footer` | pied de page | `#0b1120` | `#eef1f9` |
| `accent` | surtitres, puces | `#5b9bff` | `#2e5cff` |
| `brand` | boutons | `#2e5cff` | `#2e5cff` |
| `brand-hover` | boutons au survol | `#1f47e0` | `#1f47e0` |
| `brand-text` | texte accentué (nom LAWANI…) | `#5b9bff` | `#2e5cff` |
| `link` | liens (WhatsApp) | `#38bdf8` | `#0b63f6` |
| `success` | disponibilité, validations | `#34d399` | `#17a05b` |

Barre de progression de lecture : `bg-blue-500`.

**Ombre des cartes** (`shadow-card`) : aucune en sombre ; en clair `0 1px 2px rgb(11 27 63 / .05), 0 10px 28px -14px rgb(11 27 63 / .18)`. Appliquée aux cartes (projets, compétences, parcours, références, carrousels, contact, photo, image du Hero, image et encadrés de la page projet). Les images en haut des cartes ont un filet `border-b border-line` pour qu'une capture au fond blanc ne se confonde pas avec la carte.

### 3.4 Fonds de section (variés, unis, avec motifs discrets)

Chaque section est une « bande » pleine largeur avec son propre fond, pour éviter un fond monotone.

| Section | Sombre | Clair | Motif |
|---|---|---|---|
| Hero | `#0f172a` | `#f6f8fe` | **grand disque uni** qui déborde du coin supérieur droit, comme sur OOffix (`.hero-orb` : clair `#dfe8ff`, sombre bleu marque à 12 %) ; 15 rem sur mobile, 34 rem dès 768 px ; **animé** : glisse vers le côté opposé en descendant de 9 rem puis revient (40 s par trajet, `ease-in-out`, boucle aller-retour, coupé si « réduire les animations ») |
| À propos | `#111a30` | `#f1f4fc` (teinte du Hero, un peu plus foncée ; blanc avant le 23/10) | grille 48 px |
| Projets | `#0b1120` | `#f6f8fe` | aucun |
| Compétences | `#0d1426` | `#eef2fb` | points 22 px |
| Savoir-faire | `#140f26` | `#ffffff` | aucun |
| Parcours | `#0f172a` | `#f6f8fe` | **grille rectangulaire** 64 × 96 px (colonnes 64 px, lignes tous les 96 px) |
| Références | `#161229` | `#eef2fb` | aucun |
| Contact | `#0f172a` | `#ffffff` | points 22 px + **petit disque uni** immobile en bas à gauche (`.section-orb`, même couleur que celui du Hero ; 9 rem mobile, 18 rem dès 768 px) |

Teinte des grilles et des points : sombre blanc à 3 % (points 7 %) ; clair encre à **7,5 %** (renforcée le 23/10, points 9 %).

### 3.5 Couleurs des points clés (À propos)

Choisies par point dans l'admin ; nuance plus vive en sombre, plus foncée en clair (lisibilité).

| Nom | Sombre | Clair |
|---|---|---|
| Pourpre | `#c084fc` | `#7e22ce` |
| Magenta | `#e879f9` | `#c026d3` |
| Orange | `#fdba74` | `#ea580c` |
| Bleu | `#5b9bff` | `#2e5cff` |
| Vert | `#4ade80` | `#16a34a` |
| Turquoise | `#2dd4bf` | `#0d9488` |
| Jaune | `#facc15` | `#ca8a04` |
| Rouge | `#f87171` | `#dc2626` |

### 3.6 Animations

- **Titres de section** : le surtitre (« 02 / PROJETS ») glisse depuis la gauche, puis le titre depuis la droite, 150 ms plus tard. Directive `v-reveal` (`src/directives/reveal.js`). Déclenchement une seule fois, **après le premier défilement**, quand le titre atteint les 2/3 de l'écran.
- **Chiffres** (points clés) : comptent de 0 à leur valeur en environ 1,4 s, en ralentissant (`CountUp.vue`).
- **Carrousels** : défilement fluide ; les flèches avancent ou reculent d'une image depuis la position actuelle ; celui de l'accueil avance seul toutes les 5 s (pause au survol ou au toucher, reprise après 10 s).
- **Machine à écrire** dans le Hero (titres animés).
- **Bulle du Hero** : dérive lente d'un coin à l'autre (40 s, aller-retour).
- Tout est **désactivé** si l'appareil demande de réduire les animations (`prefers-reduced-motion`).

---

## 4. Site public

### 4.1 Structure de la page d'accueil (ordre)

Hero → **01** À propos → **02** Projets → **03** Compétences → **04** Savoir-faire → **05** Parcours → **06** Références → **07** Contact → Pied de page.
La numérotation suit les sections visibles : si une section est vide (ex. Savoir-faire sans image), les numéros se resserrent.

### 4.2 Navigation

- Les **noms des sections** (menus, surtitres, titres) viennent de **Admin → Sections**, sinon du texte d'origine de la langue affichée (`src/composables/sectionTexts.js`).
- **Navbar collante** en haut : liens des sections (desktop ≥ 1024 px) avec surlignage de la section en cours, bouton thème ☀/☾, sélecteur **FR EN** (deux boutons, sans barre oblique), bouton Contact. *(Le bloc « GL Ginique LAWANI » a été retiré le 22/10/2026.)*
- **Barre de navigation en bas sur mobile et tablette** (< 1024 px) : À propos, Projets, Compétences, Parcours, Contact.
- Liens d'ancre décalés sous la navbar (80 px desktop, 68 px mobile). Depuis une page projet, le lien attend que la section existe (jusqu'à 3 s), puis reste calé dessus pendant 5 s le temps que les images et le contenu finissent de charger (sauf si l'on fait défiler soi-même).
- Bouton « Retour en haut » et barre de progression de lecture.

### 4.3 Sections

- **Hero** : surtitre animé (machine à écrire) dans une bulle de **taille fixe** (celle de la phrase la plus longue : seul le texte bouge), nom complet **sur une seule ligne** à toutes les largeurs (taille fluide `clamp(1.6rem, 8.4vw, 6rem)`), « LAWANI » en couleur d'accent, accroche en texte normal (non gras), deux boutons « **Voir les projets** » (plein, icône dossier) et « **Voir le CV** » (contour), côte à côte sur mobile, image du certificat NASA chargée en priorité.
- **À propos** : photo, « Je suis, », deux paragraphes de bio, **liste à puces des points clés** (puce + chiffre animé coloré + texte), gérée depuis l'admin.
- **Projets** : sur **tous les écrans**, sélecteur de vue **centré** sur sa propre ligne au-dessus des filtres (deux icônes seules, nom en info-bulle) : **Carrousel** (par défaut ; cartes complètes, 1 visible sur téléphone, 2 sur tablette, 3 sur ordinateur ; glisser, points, flèches d'une carte à la fois ; points et flèches masqués quand tout tient à l'écran) ou **Grille** (tuiles compactes : image, nom, catégories ; 2 colonnes téléphone, 3 tablette et ordinateur ; 8 premières sur téléphone, 6 au-delà, puis « Voir tous les projets (N) ») ; choix mémorisé. Filtres par catégorie (seulement ceux qui ont des projets), cartes avec image, **badges de toutes les catégories**, nom, description (3 lignes), technos, bouton « **Voir les détails** » (icône œil) vers la page projet, petit bouton carré ↗ vers le site en ligne, petit bouton carré **Partager**.
- **Compétences** : cartes par domaine ; les technos s'affichent en **logos avec leur nom dessous** ; une techno sans logo garde une étiquette texte. *(La bande de logos défilante a été retirée le 22/10/2026.)*
- **Savoir-faire** (« Ce que je sais faire ») : **carrousel** d'images avec titre et description. Images affichées entières, quel que soit leur format. Glisser au doigt, flèches, points, défilement automatique. Masqué tant qu'il est vide.
- **Parcours** : frise verticale (alternée sur desktop), année, titre, organisation, description.
- **Références** : cartes témoignages (citation, étoiles, initiales sur pastille unie).
- **Contact** : email, **WhatsApp** (lien `wa.me` en bleu, icône bulle de discussion), **numéro d'appel** (masqué s'il est identique au WhatsApp), localisation **Cotonou, Bénin**, disponibilité, **bouton « Copier » sur l'email et chaque numéro**, réseaux sociaux. *(Formulaire nom/email/message supprimé le 22/10/2026.)*

### 4.4 Page détail d'un projet : `/<lien>` (ex. `/ooffix`)

- **Adresse courte** : `/<lien>` (ex. `portfolio-ginique-lawani.vercel.app/ooffix`), le « lien de partage » du projet ; l'ancien format `/projets/<id>` fonctionne toujours ; un lien court inconnu renvoie à l'accueil.
- Retour « Tous les projets », catégories, nom, description, technos, boutons « Voir le site en ligne » et **« Partager »** ; tout en bas, après « Projet précédent / suivant », le bouton **« Voir tout le portfolio »**.
- Image de couverture.
- Blocs **Présentation**, **Ce que j'ai fait**, **Méthodologie** (chacun affiché seulement s'il est rempli ; sinon la description courte sert de présentation).
- Encadré : catégories, stack, lien.
- **Galerie en carrousel** (titre + description par image), clic sur une image → **plein écran** (flèches, Échap).
- Projet précédent / suivant dans **une seule barre** sans séparation : précédent à gauche, suivant à droite (téléphone compris).
- Titre de l'onglet : « Nom du projet | Ginique Oriadé LAWANI ».
- **Partager** : sur téléphone, menu de partage natif (WhatsApp, Messenger…) ; sur PC, le lien court est copié (bulle « Lien copié »).

### 4.5 Thèmes clair et sombre

- Bouton ☀/☾ dans la navbar.
- Premier passage : suit le réglage de l'appareil ; ensuite le choix est **mémorisé** (localStorage `theme`).
- Un petit script dans `index.html` applique le thème **avant l'affichage** (pas de flash).
- Logos noirs (Next.js, Notion, Copilot) **inversés en blanc** en mode sombre.
- L'admin reste **toujours en sombre**.

### 4.6 Mobile (exigence forte)

Zones tactiles ≥ 44 px, champs en 16 px (pas de zoom iOS), encoches et barres système respectées (`env(safe-area-inset-*)`), aucun défilement horizontal (vérifié de 320 px au desktop), carrousels au doigt, pas de défilement imbriqué.

### 4.7 SEO

Balises meta, Open Graph, Twitter Card et JSON-LD (Person, WebSite, ProfessionalService) dans `index.html` ; localisation **Cotonou** (6.3654 ; 2.4183) ; `robots.txt` + `sitemap.xml` ; `useSEO.js` met à jour titre et description selon la langue. `/admin` et `/api/` sont **exclus** des moteurs (robots.txt + en-tête `X-Robots-Tag: noindex`).

### 4.8 Contenu de secours

`src/content/fallback.json` est une copie figée du contenu, intégrée au site. Elle s'affiche immédiatement, puis est remplacée par les données de l'API. Si l'API ne répond pas, le site reste complet.

---

## 5. Back-office (/admin)

### 5.1 Pages

| Menu | Contenu |
|---|---|
| Profil & Contact | nom, titres animés, accroche, bio, contact (email, **WhatsApp**, **téléphone d'appel**, localisation), disponibilité, CV, photo de profil, image du Hero |
| **Sections** | renommer chaque section : nom (menu + surtitre « 02 / … »), titre, et sous-titre pour À propos (« Je suis, ») et Contact ; FR/EN ; champ vide = texte d'origine (affiché en grisé) |
| **Points clés** | liste à puces d'À propos : chiffre (facultatif), texte FR/EN, **couleur** |
| Projets | voir §5.3 |
| Compétences | titre, description, **icône** (12 choix), technos (avec aperçu des logos) |
| **Savoir-faire** | images du carrousel + titre + description |
| Parcours | année, titre, organisation, description |
| Témoignages | nom, initiales (déduites du nom si vides), rôle, citation |
| Réseaux sociaux | réseau (LinkedIn, GitHub, WhatsApp, Email, Autre + SVG), nom, lien |
| **Sécurité** | changer le mot de passe |

### 5.2 Fonctionnement commun des listes

- **Cartes repliées** : flèches ↑↓ pour l'ordre, résumé (année/titre…), interrupteur « visible sur le site », modifier, supprimer.
- **Panneau latéral** d'édition (plein écran par le bas sur mobile).
- **Champs FR/EN à onglets** : point orange = langue vide ; pastille rouge = fautes détectées.
- **Notifications** (toasts), confirmation avant suppression.
- **Brouillons automatiques** (§5.6) et **correcteur** (§5.5).

### 5.3 Projets

- Image de couverture (recadrage 16:10 conseillé), nom, **lien de partage** (`/ooffix` : rempli depuis le nom, modifiable, unique, mots réservés refusés, bouton « Copier »), **catégories multiples** à cocher (Fullstack, Frontend, Backend, Mobile, **AI oriented**), description courte FR/EN.
- **Stack / technologies** avec **suggestions** au fil de la frappe (logo + nom, lettres tapées en gras) : taper « ne » propose Nest.js, Next.js… On peut aussi **ajouter n'importe quelle techno absente** (ligne « Ajouter « … » », bouton « + Ajouter », Entrée ou virgule, y compris sur clavier mobile).
- Lien du site (facultatif).
- Page du projet : **Présentation**, **Ce que j'ai fait**, **Méthodologie** (FR/EN). Chaque bloc a un **format** : Paragraphe, **Liste numérotée** (affichée « 01, 02… ») ou **Liste à tirets** (tiret de couleur), et en liste une **couleur des numéros / tirets** : Par défaut (accent bleu), l'une des 8 couleurs, ou **Multicolore** (une couleur par point, dans l'ordre pourpre, magenta, orange, bleu, vert, turquoise, jaune, rouge). En liste, les points s'ajoutent un par un (« + Ajouter un point », Entrée = point suivant, Retour arrière sur un point vide = le retirer, un texte collé sur plusieurs lignes devient plusieurs points) ; la numérotation n'est jamais tapée à la main, et les « 1- », « 02 », « • » déjà saisis sont retirés automatiquement.
- **Galerie** : images (recadrage **4:3**, le cadre du carrousel) + **titre** facultatif avec **couleur au choix** (8 couleurs des points clés ou par défaut) + **description**, réordonnables.
- Visibilité.

### 5.4 Images et recadrage

- Glisser-déposer ou choix de fichier, envoi direct vers Vercel Blob.
- **Éditeur de recadrage** (Cropper.js) à chaque nouvelle image : formats Libre, 16:10, 16:9, 4:3, 1:1, 4:5, 3:4 ; le **format du site** est indiqué sous le champ (« Format sur le site : 4:3 »), rappelé en haut de l'éditeur, pré-sélectionné et mis en évidence, avec un avertissement si l'on en choisit un autre (couverture projet 16:10, galerie et carrousel 4:3, photo de profil 4:5) ; pivoter, zoomer, réinitialiser, ou « Sans recadrer ».
- Bouton **« Recadrer »** sur une image déjà en ligne.
- Export plafonné à 2000 px ; PNG conservé en PNG, le reste en JPEG.
- L'aperçu montre l'image entière (ce qui sera vraiment enregistré).

### 5.5 Correcteur français / anglais (LanguageTool)

- Sur tous les champs texte FR/EN : soulignement **rouge** (orthographe, accents) et **jaune** (grammaire, accords, ponctuation, espaces).
- Sous le champ : liste des fautes, **correction en un clic**, **Tout corriger**, **Ignorer** / **Ajouter au dictionnaire**.
- Remarques de « style » ignorées ; technos et vocabulaire technique jamais soulignés (dictionnaire intégré + dictionnaire personnel dans le navigateur).
- Le correcteur du navigateur (en anglais) est désactivé sur ces champs.
- **Avant d'enregistrer**, tout le formulaire est relu. S'il reste des fautes, une fenêtre « N fautes possibles » propose **Revoir** ou **Enregistrer quand même**. L'enregistrement n'est jamais bloqué si le service ne répond pas.
- Économie d'appels : vérification 0,9 s après la frappe, résultats mis en cache, un seul appel par langue au moment d'enregistrer.

### 5.6 Brouillons automatiques

- Chaque modification non enregistrée est sauvegardée **dans le navigateur** au fil de la frappe.
- Indicateur vert : « **Brouillon sauvegardé sur cet appareil · HH:MM:SS** ».
- Après une actualisation, un plantage, une coupure de courant ou une session expirée : bandeau « **Brouillon non enregistré : … — Reprendre / Supprimer** » ; en rouvrant l'élément, le brouillon est restauré, avec « **Revenir à la version enregistrée** ».
- Fermer le panneau sans enregistrer **garde** le brouillon.
- Le brouillon est supprimé une fois enregistré. Valable aussi pour Profil & Contact.

---

## 6. Sécurité et authentification

- **Un seul compte admin** : email `israellawani.pro@gmail.com` + mot de passe (hash bcrypt, coût 12).
- Mot de passe modifiable dans **Admin → Sécurité** (12 caractères minimum). Le nouveau hash est stocké en base (`admin_auth`) et remplace celui du code.
- **Session de 12 heures** (cookie `HttpOnly`, `Secure`, `SameSite=Strict`, signé HMAC). Après expiration, retour automatique à l'écran de connexion (le travail en cours reste en brouillon).
- La clé de signature dérive du mot de passe en cours : **changer le mot de passe déconnecte toutes les autres sessions**.
- **Blocage anti-force brute** : 5 échecs depuis une même IP → connexion bloquée 15 minutes (`login_attempts`).
- Toutes les routes `/api/admin/*`, le changement de mot de passe et l'envoi de fichiers vérifient la session **côté serveur**.
- Vérifié en production (22/10/2026) : sans session, lecture et écriture refusées (401), faux cookie refusé, envoi de fichier refusé.

---

## 7. Base de données et migrations

### 7.1 Tables

| Table | Rôle |
|---|---|
| `admin_settings` | profil, accroche, bio, contact (`email`, `phone`, `whatsapp`, `location`), disponibilité, CV, photos, `sections` (noms personnalisés des sections, JSONB) — ligne unique `id = 1` |
| `timeline_items` | parcours |
| `skills` | compétences (`techs` = liste de technos, `icon_key`) |
| `tech_logos` | **bibliothèque de logos** (nom + image), utilisée pour les cartes Compétences et les suggestions |
| `projects` | projets (`slug` = lien de partage unique, toujours rempli par l'API ; `details_style` / `contributions_style` / `methodology_style` = paragraphe ou liste ; `categories` TEXT[], `tags`, `details_*`, `contributions_*`, `methodology_*`, `gallery` JSONB) |
| `testimonials` | références |
| `social_links` | réseaux sociaux |
| `showcase_items` | carrousel Savoir-faire |
| `key_figures` | points clés d'À propos (`value`, `label_fr/en`, `color`) |
| `admin_auth` | hash du mot de passe défini depuis l'admin |
| `login_attempts` | échecs de connexion (blocage) |
| `schema_migrations` | version des migrations appliquées |

Champs bilingues : suffixes `_fr` / `_en`. Ordre : `sort_order`. Visibilité : `is_visible`.

### 7.2 Migrations automatiques (`api/_lib/migrations.js`)

Appliquées par l'API au premier appel après un déploiement. Toutes idempotentes, testées sur un Postgres jetable avant chaque mise en ligne.

| Version | Date | Contenu |
|---|---|---|
| v1 | 22/10/2026 | `whatsapp` (rempli avec l'ancien numéro), localisation → Cotonou, colonnes de la page projet, `gallery`, catégorie « AI oriented », table `showcase_items` |
| v2 | 22/10/2026 | numéro d'appel +229 01 61 77 71 86, 9 images de démonstration dans le carrousel |
| v3 | 22/10/2026 | 9 logos ajoutés à `tech_logos` |
| v4 | 22/10/2026 | tables `admin_auth` et `login_attempts` |
| v5 | 23/10/2026 | table `key_figures`, reprise des 3 anciennes statistiques |
| v6 | 23/10/2026 | `key_figures.color` (pourpre / magenta / orange pour l'existant) |
| v7 | 23/10/2026 | `projects.categories` (multi-catégories, reprise de `category`) |
| v8 | 23/10/2026 | `admin_settings.sections` (JSONB) : noms et titres de sections personnalisés |
| v9 | 23/10/2026 | `projects.slug` (lien de partage) généré depuis le nom (accents retirés, doublons suffixés par l'id, mots réservés évités), index unique |
| v10 | 23/10/2026 | lien de partage pour les projets qui n'en avaient pas ; colonnes `details_style`, `contributions_style` (défaut liste numérotée), `methodology_style` |
| v11 | 23/10/2026 | `details_color`, `contributions_color`, `methodology_color` : couleur des numéros / tirets (`''`, nom de couleur ou `mixed`) |

Pour ajouter une migration : nouvelle entrée `{ version: N, statements: [...] }` en fin de tableau, avec des requêtes idempotentes (`IF NOT EXISTS`…).

---

## 8. API (fonctions Vercel)

| Fichier | Routes | Rôle |
|---|---|---|
| `api/content.js` | `GET /api/content` | tout le contenu public (éléments visibles), cache CDN de 3 s (+5 s de revalidation) : une modification de l'admin apparaît en quelques secondes |
| `api/admin/[resource]/index.js` | `GET/POST /api/admin/<ressource>` | lister / créer |
| `api/admin/[resource]/[id].js` | `GET/PATCH/DELETE /api/admin/<ressource>/<id>` | lire / modifier / supprimer |
| `api/admin/settings.js` | `GET/PATCH /api/admin/settings` | profil & contact |
| `api/auth/[action].js` | `login`, `logout`, `session`, `password` | authentification |
| `api/blob/upload-token.js` | `POST` | jeton d'envoi de fichier vers Blob (connecté uniquement) |
| `api/og.js` | `/`, `/<lien>`, `/projets/<id>` pour les **robots d'aperçu** | renvoie la page avec des balises d'aperçu à jour : photo de profil actuelle (accueil) ou image, nom et description du projet (cache 60 s) |

Ressources CRUD (`api/_lib/crud.js`) : `timeline`, `skills`, `logos`, `projects`, `testimonials`, `social-links`, `showcase`, `key-figures`.
Total : **7 fonctions** sur 12 autorisées par le plan Hobby.

**Aperçus de liens** : WhatsApp, Facebook, LinkedIn, X, Telegram, Slack, Discord, Google… ne lisent que les balises de la page. `vercel.json` envoie ces robots (reconnus à leur user-agent) vers `api/og.js` ; les visiteurs reçoivent `app.html`. Pour que l'accueil puisse aussi être intercepté, `npm run build` copie `dist/index.html` en `dist/app.html` et, sur Vercel, supprime `index.html` (`scripts/postbuild.mjs`).

---

## 9. Images, logos et fichiers

- `public/images/` : captures des projets, certificat NASA (`nasa.jpg`), `public/images/showcase/1.jpg` à `9.jpg` (photos du carrousel, renommées le 22/10/2026).
- `public/logos/` : 29 logos SVG. Les 9 ajoutés le 22/10/2026 viennent de **Simple Icons** (libres de droits, CC0) : Vue.js, Flask, Trello, Notion, Git, ClickUp, Claude, GitHub Copilot, Google Gemini.
- **Technos sans logo** (affichées par leur nom) : Agile, Scrum, Transformation Digitale (pas de logo officiel), Microsoft Teams (retiré des bibliothèques libres), Grok, Antigravity, Raptor (absents).
- `npm run images:optimize` (`scripts/optimize-images.mjs`, sharp) : recompresse sur place toutes les images de `public/`, côté long ≤ 1800 px, JPEG mozjpeg qualité 78, sans changer les adresses. Premier passage : **4,7 Mo → 1,1 Mo (−77 %)**. Plusieurs `.jpg` étaient en réalité des PNG lourds.
- Images envoyées depuis l'admin → Vercel Blob (recadrées, ≤ 2000 px).

---

## 10. Langues et traduction

- Site en **français et anglais** : textes fixes dans `src/i18n/translations.js` (vue-i18n) ; contenus dans les champs `_fr` / `_en` de la base.
- Si un champ anglais est vide, **le français s'affiche** à la place.
- **Traduction automatique (depuis le 24/10/2026)** : tu remplis uniquement le français. À chaque enregistrement dans l'admin, chaque champ anglais **vide** est traduit depuis le français (Google Traduction gratuit, appelé depuis ton navigateur car Google refuse les serveurs ; aucune clé ni configuration). Tant que tu ne retouches pas l'anglais, il suit les modifications du français ; si tu l'écris ou le corriges à la main, il n'est plus jamais écrasé ; si tu vides le français, l'anglais automatique est vidé aussi. Pour revenir à la traduction automatique d'un champ, vide son anglais. Concerne projets (et galerie), parcours, compétences, savoir-faire, points clés, témoignages, profil et noms de sections. Bouton **« Tout traduire en anglais »** (barre latérale de l'admin, icône langues sur mobile) : passe tout le site d'un coup. Si le service est indisponible, rien n'est perdu : le champ reste tel quel et sera traduit au prochain enregistrement. Technique : `src/admin/composables/autoTranslate.js`, colonne `auto_en` (JSONB, migration v12) qui garde pour chaque champ le français source et l'anglais généré `{ from, to }` ; dans la galerie, chaque image a son propre `auto_en`.

---

## 11. Conventions de travail

- Commits sur **`main`**, poussés directement (pas de branche ni de PR), messages `feat:` / `fix:` / `style:` en anglais, **jamais de ligne `Co-Authored-By`**.
- **Avant d'annoncer qu'une modification est en ligne**, vérifier que Vercel sert bien la nouvelle version (les déploiements peuvent prendre ~10 min), puis recharger les onglets de l'admin déjà ouverts.
- Toute modification passe par : build, tests (captures mobile et desktop, sombre et clair) et, pour la base, test des migrations sur un Postgres jetable.
- **Ce document est mis à jour à chaque changement.**

---

## 12. Journal chronologique

### Phase 1 — Création du portfolio (nov.–déc. 2025)

| Date | Commit | Changement |
|---|---|---|
| 30/11/2025 23:36 | `153e21a` | Première version du portfolio (Vue 3 + Vite + Tailwind) |
| 01/12/2025 01:49 | `f5b06c6` | Style des différentes sections |
| 01/12/2025 03:34 | `9e49717` | Design des sections |
| 01/12/2025 09:44 – 09:55 | `1aaf12f`, `5c0423a` | Suppression du second `index.html` |
| 01/12/2025 10:25 | `db0f016` | Ajustement des tailles d'images |
| 01/12/2025 10:38 | `bf2567b` | Image du projet WeTrust |
| 01/12/2025 12:46 | `4581254` | Design de l'interface |
| 01/12/2025 15:08 | `e5c6fb9` | Style de la section Projets |
| 05/12/2025 20:57 | `2ef3589` | **Internationalisation** (FR/EN) |
| 05/12/2025 21:45 | `2ac47d8` | Optimisation mobile |
| 05/12/2025 21:51 | `3f76a6f` | Traductions avec vue-i18n |
| 05/12/2025 22:23 | `5b4c827` | Bouton retour en haut |
| 05/12/2025 23:49 | `fd4d621` | SEO : `robots.txt`, `sitemap.xml`, `useSEO.js` |
| 06/12/2025 00:47 | `460aa21` | Vérification Google Search Console |
| 06/12/2025 01:28 – 10:26 | `5c8cc24`, `0ef19d7`, `3433e62`, `5f9354a` | Meta, Open Graph, Twitter Card, description des liens |
| 06/12/2025 11:41 | `584e35e` | Bouton anglais/français |
| 06/12/2025 11:50 | `2302ac0` | Correction de bugs sur l'email |
| 06/12/2025 11:58 | `b1f4221` | Corrections de phrases dans les traductions |
| 06/12/2025 20:58 | `bcc16a5` | Divers changements |
| 06/12/2025 22:04 – 22:45 | `ec80854`, `12e9f7d` | Sitemap et Google Search Console |
| 08/12/2025 15:30 – 21:27 | `791234a`, `b5a7825` | **Vercel Analytics** (Search Console retiré) |
| 09/12/2025 00:31 | `6474ae7` | Logos des stacks et animations |
| 09/12/2025 00:47 – 03:09 | `dbc6345`, `c3f86fd`, `159636d`, `f41eb70` | Animations et espacements mobile, Hero mobile |
| 09/12/2025 09:57 | `a75d81f` | Couleur de la barre de progression |

### Phase 2 — Back-office (juillet 2026)

| Date | Commit | Changement |
|---|---|---|
| 29/07/2026 02:02 | `1713019` | **Back-office /admin** : contenu en base (Postgres + Blob), CRUD, connexion, migration de tout le contenu codé en dur, `useContent()` + `fallback.json` |
| 29/07/2026 02:17 | `6ef8f68` | Fusion avec l'historique existant |
| 29/07/2026 10:26 | `2578ecb` | Routes regroupées (18 → 6 fonctions) pour la limite Vercel Hobby |
| 29/07/2026 10:30 | `1155f50` | Merge de la PR #2 |

### Phase 3 — Refonte (22–24 octobre 2026)

#### Mercredi 22/10/2026

| Heure | Commit | Changement |
|---|---|---|
| — | — | **Décisions** : rester sur Vue ; reprendre les polices d'OOffix ; admin par email + mot de passe sans configuration externe ; plus de « Co-Authored-By » ; garder d'abord les couleurs existantes mais varier les fonds par section |
| 04:23 | `bfff5ab` | **Fondations de la refonte** : polices Space Grotesk / IBM Plex Sans / IBM Plex Mono ; fonds différents par section ; navbar collante ; « Portfolio.Dev » remplacé ; **double « À propos » corrigé** ; filtre projets « Tous » (affichait « Mobile ») corrigé ; **FR / EN** en texte au lieu des drapeaux ; icônes **Lucide** ; optimisation mobile (zones tactiles, champs 16 px, encoches, pas de défilement imbriqué) ; retrait des animations en boucle ; contact par email pré-rempli au lieu d'une fausse confirmation ; **connexion admin email + mot de passe** ; refonte de l'admin Projets (liste, interrupteur de visibilité, panneau, glisser-déposer, onglets FR/EN, tags) |
| — | — | Push sur une branche puis **fusion sur `main`** : désormais tout se fait sur `main` |
| 05:32 | `c3d0fd6` | **Page détail par projet** (présentation, ce que j'ai fait, méthodologie, galerie + plein écran) ; catégorie **AI oriented** ; section **Savoir-faire** (carrousel) ; nouvel ordre des sections ; **WhatsApp** cliquable (wa.me, icône messagerie) + numéro d'appel séparé ; localisation **Cotonou** ; **listes repliées** dans tout l'admin (flèches + année/titre) ; migrations automatiques (v1) |
| 10:04 | `73ff7b4` | **Fin des dégradés et effets néon** ; une seule couleur pleine (pourpre `#7e22ce` à ce moment-là) ; fonds de section unis avec motifs ; Hero : « Collaborer » supprimé, « Voir les projets » + « Voir le CV » côte à côte sur mobile, moins d'espace sous la navbar ; 9 photos rangées en `images/showcase/1–9.jpg` et carrousel de démonstration ; numéro d'appel +229 01 61 77 71 86 (v2) ; **script d'optimisation des images** (−77 %) ; ancres sous la navbar corrigées |
| — | — | **Domaine** : renommer en `ginique-lawani.vercel.app` envisagé, puis **conservé** tel quel ; domaine personnalisé plus tard |
| 10:22 | `99f9cd8` | **Mode clair / mode sombre** : couleurs par rôle, palette OOffix en clair, bouton ☀/☾, mémorisation, pas de flash, admin toujours sombre |
| 10:31 | `2587e0f` | Nom du Hero **sur une ligne** ; bloc « GL Ginique LAWANI » retiré de la navbar ; accroche en texte normal ; **formulaire de contact supprimé** ; **boutons Copier** (email, WhatsApp, téléphone) |
| 10:38 | `944d7d8` | **Logos dans chaque carte Compétences** ; bande de logos retirée ; 9 logos Simple Icons (v3) ; logos noirs inversés en sombre ; aperçu des logos dans l'admin |
| 10:46 | `c52d165` | **Noms remis sous les logos** |
| 11:09 | `105e95d` | **Sécurité admin** : sessions 12 h, blocage après 5 échecs, page Sécurité (changer le mot de passe, déconnexion des autres sessions), `/admin` exclu des moteurs (v4) ; **bleu OOffix aussi en mode sombre** (fin du pourpre et du rose) |
| 11:27 | `c81cc65` | Chiffres d'À propos en pourpre / magenta / orange clair |
| 11:46 | `c8e7bc6` | **Compteur animé** sur les chiffres ; **titres de section qui glissent** (surtitre depuis la gauche, titre depuis la droite) |
| 12:26 | `f099eb2` | Correctif : l'animation du titre 01 se jouait pendant le chargement sur mobile ; image du Hero chargée en priorité |

#### Jeudi 23/10/2026

| Heure | Commit | Changement |
|---|---|---|
| 01:20 | `6029815` | **Recadrage des images** dans l'admin ; chiffres d'À propos en **liste à puces** gérée dans **Admin → Points clés** (v5) |
| 01:31 | `0a839cb` | **Couleur au choix** pour chaque point clé (8 couleurs, v6) |
| 01:38 | `8da9978` | **Plusieurs catégories par projet** (cases à cocher, badges, filtres, v7) |
| 01:49 | `f2b2626` | **Galerie de projet en carrousel** + titre facultatif par image ; carrousel commun avec Savoir-faire |
| 01:55 | `5518c27` | **Suggestions de technos** dans l'admin (Projets et Compétences) |
| 02:08 | `5150df0` | Correctif : technos **hors liste** acceptées (WebSocket…), Entrée n'impose plus une suggestion, virgule des claviers mobiles, bouton « Ajouter » |
| — | — | **Décision** : tu écris le français, je génère l'anglais à la demande |
| 12:49 | `102a3a3` | **Correcteur français/anglais** (LanguageTool) avec correction en un clic et rappel avant d'enregistrer ; **brouillons automatiques** |
| ~12:55 | — | **Incident** : un texte en cours a été perdu en actualisant. Le déploiement avait pris 10 min, la page tournait encore sur l'ancienne version sans brouillons. Règle ajoutée : vérifier la mise en ligne avant de l'annoncer |
| 13:04 | `a247f47` | **Indicateur « Brouillon sauvegardé sur cet appareil · HH:MM:SS »** |
| 13:43 | `80debd9` | Création de ce document `work.md` (référence complète + journal daté) |
| 13:57 | `03fd6b1` | **Mode clair plus lisible** : bordures bleutées plus visibles (`#d3dcf3` / `#aebfeb`, 1 px), ombre douce sous les cartes (clair uniquement), filet sous les images des cartes ; survol des cartes projet en bleu |
| 14:16 | `ae79940` | Correctifs : **flèche « Précédent » du carrousel sur PC** (bloquée en fin de carrousel) ; **barre du bas depuis une page projet sur mobile** (le lien n'attendait que 60 ms que la section existe, trop court sur téléphone ; recalage pendant 5 s) |
| 14:20 | `4cd5402` | **Renommer les sections** : page Admin → Sections (nom, titre, sous-titre, FR/EN), noms utilisés dans les menus et titres du site (v8) |
| 14:45 | `61868ee` | **Partager un projet** : lien court `/<nom-du-projet>` (v9), bouton carré « Partager » sur chaque carte, « Partager » + « Voir tout le portfolio » sur la page projet, champ « Lien de partage » dans l'admin ; **suppression des tirets cadratins** (titre d'onglet « OOffix \| Ginique Oriadé LAWANI ») |
| 14:50 | `ca2a018` | Ajout de `info.md` : fiche à envoyer dans chaque autre projet pour obtenir description courte, stack (liste), présentation, ce que j'ai fait (une phrase par point), méthodologie et images de galerie |
| 14:51 | `071b592` | `info.md` complété avec les règles précises de « Ce que j'ai fait » (projet client, 5 à 8 points commençant par un nom d'action, termes techniques exacts, honnêteté) et une partie « À vérifier avec toi » |
| 15:01 | `fb284f5` | Bouton « Voir tout le portfolio » déplacé **tout en bas** de la page projet, après « Projet précédent / suivant » (bouton plein, pleine largeur sur mobile) |
| 17:15 | `6454bad` | **Lien de partage toujours présent** (créé par le serveur si absent, ex. Vibe & Go affichait `/projets/7`) ; **listes numérotées / à tirets** dans Présentation, Ce que j'ai fait, Méthodologie (fini la numérotation à la main) ; **couleur des titres de galerie** ; **format de recadrage du site** affiché partout, galerie en 4:3 (v10) |
| 17:21 | `9f11b1e` | **Couleur des numéros / tirets au choix** pour chaque bloc en liste (par défaut, 8 couleurs, ou Multicolore) (v11) |
| 17:27 | `90ac1b5` | **Cache du contenu réduit** de 60 s (+5 min) à 3 s (+5 s) : les modifications de l'admin (ex. couleur des points) mettaient jusqu'à plusieurs minutes à apparaître |
| 17:44 | `12c888d` | **Aperçus de liens à jour** : la photo de profil actuelle (accueil) et l'image, le nom et la description de chaque projet (`/ooffix`) dans WhatsApp, LinkedIn, Facebook… via `api/og.js` ; `index.html` devient `app.html` en production |
| 17:56 | `e999ff9` | **Disque décoratif** dans le coin supérieur droit de la première section, sobre et uni (clair `#dfe8ff`, sombre bleu à 12 %), comme sur la landing OOffix |
| 17:59 | `0f50ee0` | **Bulle du Hero animée** (glisse lentement vers le côté opposé et revient, 40 s par trajet) ; **petit disque** en bas à gauche de la section Contact |
| 18:11 | `68bf1be` | Mode clair : fond de la section **À propos** passé du blanc à `#f1f4fc` (teinte du Hero, un peu plus foncée) |
| 18:37 | `997762e` | Mode clair : **grilles plus visibles** (4,5 % → 7,5 %) ; **Parcours** : vraie grille rectangulaire 64 × 96 px au lieu de lignes verticales seules |
| 19:20 | `4e5008f` | **Projets sur mobile** : vue **Carrousel** (par défaut) ou **Grille 2 × 4** compacte (image, nom, catégories), au choix et mémorisée ; ordinateur inchangé |
| 19:32 | `897821a` | Sélecteur « Carrousel / Grille » déplacé **au-dessus** des catégories, avec icône + texte, pour ne plus se confondre avec elles |
| 20:29 | `556671c` | **Carrousel / Grille aussi sur ordinateur et tablette** (3 et 2 cartes visibles, flèches ; grille de tuiles 4 et 3 colonnes) |

#### Samedi 24/10/2026

| Heure | Commit | Changement |
|---|---|---|
| 02:06 | `f264e9c` | Sélecteur « Carrousel / Grille » **centré** ; grille sur tablette et ordinateur : **3 tuiles par ligne** (plus grandes), 6 avant « Voir tous les projets » ; **surtitre du Hero** : la bulle garde la taille de la phrase la plus longue, seul le texte s'écrit et s'efface |
| 02:18 | `84a9ec3` | Sélecteur de langue : **barre « / » retirée** entre FR et EN ; sélecteur Carrousel / Grille : **icônes seules**, centrées (nom en info-bulle) |
| 02:23 | `ec55097` | Plus d'espace entre le sélecteur Carrousel / Grille et les catégories (12 px → 20 px, 24 px sur ordinateur) |
| 02:34 | `62aef5a` | **Traduction anglaise automatique** : à l'enregistrement, chaque champ anglais vide est traduit du français et suit ses changements tant qu'il n'est pas retouché à la main ; bouton « **Tout traduire en anglais** » dans l'admin ; migration v12 (`auto_en`) |
| 02:39 | `dd2c79c` | Hero : bouton « **Voir les projets** » avec une icône (dossier) à gauche, comme « Voir le CV », visible aussi sur mobile |
| 03:03 | `5625dcd` | Page projet : **précédent / suivant réunis dans une seule barre** (précédent à gauche, suivant à droite), au lieu de deux cartes empilées sur mobile |
| 03:06 | `6d55422` | Barre précédent / suivant : **trait de séparation central retiré** |
| HH:MM | `COMMIT` | Savoir-faire : les **anglais provisoires** (« Title coming soon », « Placeholder description ») sont vidés (migration v13) ; vus comme écrits à la main, ils bloquaient la traduction automatique. Relancer « Tout traduire en anglais » |

---

## 13. Fonctionnalités à venir

### 13.1 Partager le lien d'un seul projet ⭐ (demandé le 23/10/2026)

**Besoin** : quand quelqu'un demande « tu as déjà fait un projet dans tel domaine ? », envoyer **le lien de ce projet seulement**, plutôt que tout le portfolio. La personne voit le projet, puis peut cliquer sur **« Voir tout le portfolio »**.

**Fait le 23/10/2026** : lien court `/<nom-du-projet>`, bouton « Partager » (cartes + page projet, partage natif sur mobile, copie sur PC), champ « Lien de partage » dans l'admin, bouton « Voir tout le portfolio ».

**Reste à faire :**

1. ~~**Aperçu du lien**~~ **fait le 23/10/2026** (`api/og.js`) : (image + titre + description du projet dans WhatsApp, LinkedIn, Messenger) : les robots de ces applis ne lisent pas le JavaScript. Il faut donc servir, pour `/projets/:slug`, une page HTML avec les balises Open Graph du projet. Piste : une fonction Vercel dédiée (7e fonction sur 12) qui renvoie le `index.html` avec les balises du projet injectées.
2. **Page d'arrivée « mode partage »** : un court rappel de qui tu es (photo, nom, titre, contact) pour un visiteur qui arrive sans contexte.
3. Optionnel : mesurer les ouvertures de chaque lien partagé (Vercel Analytics, événement par projet).

### 13.2 Autres évolutions notées

- **Versions anglaises** : automatiques depuis le 24/10/2026 (§10) ; relire les traductions générées.
- **Logos manquants** : Microsoft Teams, Grok, Antigravity, Raptor (à fournir) ; icône générique éventuelle pour Agile / Scrum / Transformation Digitale.
- **Domaine personnalisé** : à l'achat, l'ajouter dans Vercel, rediriger `*.vercel.app` (308), mettre à jour les URL SEO (`index.html`, `sitemap.xml`, `robots.txt`).
- **Remplacer les textes provisoires du carrousel** Savoir-faire (titres « Titre à venir 01… »).
- **Version publique « créez votre portfolio »** (idée du 23/10/2026) : plusieurs comptes, données séparées par utilisateur, brouillons et dictionnaire en base (synchronisés sur tous les appareils), LanguageTool payant ou auto-hébergé, inscription, domaines par utilisateur, et sortir l'email admin du code.
- **SEO des pages projets** : sitemap incluant chaque projet ; pré-rendu des pages pour le référencement.

---

## 14. Limites connues

- **Brouillons et dictionnaire du correcteur** : stockés dans le navigateur. Ils ne suivent pas d'un appareil à l'autre et disparaissent si l'on efface les données du site.
- **Correcteur** : version gratuite de LanguageTool (environ 20 vérifications par minute) ; les textes sont envoyés à LanguageTool pour relecture.
- **Aperçus de liens** : générés à jour par `api/og.js`, mais WhatsApp, Facebook et LinkedIn gardent en mémoire un aperçu déjà vu ; pour forcer la mise à jour : Facebook Sharing Debugger (sert aussi pour WhatsApp) et LinkedIn Post Inspector.
- **Déploiements Vercel** : jusqu'à ~10 min ; un onglet admin ouvert garde l'ancienne version tant qu'il n'est pas rechargé.
- Le mot de passe admin initial a été généré le 22/10/2026 ; il est conseillé de le remplacer via Admin → Sécurité.
