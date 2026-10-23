# Fiche projet pour le portfolio

> **À qui s'adresse ce document** : à l'assistant IA (ou à la personne) qui travaille dans ce projet.
> **Ce qu'il faut faire** : analyser ce projet et remplir la fiche ci-dessous. Elle sera recopiée telle quelle dans le portfolio de Ginique LAWANI (Admin → Projets).

## Règles générales

- **Cadre** : présenter le projet comme un **projet client** sur lequel Ginique a travaillé. Ne jamais écrire « j'ai imaginé », ne pas dire que c'est son propre projet, ne pas mentionner s'il le porte lui-même.
- **Source** : uniquement les documents et l'historique disponibles (cahier des charges, journal de bord, code, notes, historique Git, conversation). **Ne rien inventer.** Si une information est introuvable, écrire `À compléter`.
- **Court et direct.** Écrire en français ; les noms de technologies restent tels quels (Next.js, NestJS, PostgreSQL…).
- **Pas de tiret cadratin (—)** ; utiliser des virgules ou des deux-points.
- Respecter les longueurs indiquées : le site coupe les textes trop longs.

## Rubrique « Ce que j'ai fait » : règles précises

**Format**
- Entre **5 et 8 points**, selon ce que le projet justifie. Ne pas forcer un nombre.
- Un point = **une ligne courte, une seule idée**.
- Chaque point commence par un **nom d'action** : Conception, Modélisation, Mise en place, Développement, Intégration, Déploiement, Réalisation, Tests.
- Utiliser le **terme technique exact** (RBAC, multi-tenant, API REST, CI/CD, i18n, ORM…), sans le définir.
- **Regrouper les détails** : « Développement du front-end (Next.js, responsive, bilingue) », pas la liste des pages.
- **Préciser où et comment** : « Intégration de l'IA pour structurer des notes en tâches, fournisseur interchangeable », pas juste « Intégration de l'IA ».
- Pas de phrases longues, pas de verbes d'intention (visé, prévu, envisagé).

**Honnêteté**
- Une fonctionnalité qui tourne sur des **données de démonstration** ou qui n'est **pas branchée à une vraie API** ne s'écrit pas comme livrée.
- **Aucun point sur les tests, la sécurité ou le déploiement** sans trace dans les documents ou le code.

## Fiche à rendre

Rendre uniquement le bloc ci-dessous, rempli :

```markdown
## Nom du projet
<Nom affiché, ex. OOffix>

## Catégories
<une ou plusieurs parmi : Fullstack, Frontend, Backend, Mobile, AI oriented>

## Lien du site
<URL en ligne, ou « Aucun »>

## Description courte
<1 à 2 phrases, 160 caractères maximum. Ce que fait le produit et pour qui.>

## Stack technique
- <technologie>
- <technologie>
<Liste seulement, sans description. Langages, frameworks, bases de données, services, outils d'infra et d'IA réellement utilisés.>

## Présentation
<2 à 3 phrases maximum. Le contexte du client, le problème résolu, la solution.>

## Ce que j'ai fait
- <Nom d'action + ce qui a été fait, où et comment (règles ci-dessus)>
- <5 à 8 points>

## Méthodologie
<1 à 2 phrases : organisation du travail (Agile/Scrum, sprints, revues de code, CI/CD…), uniquement ce qui est visible dans le projet ou confirmé.>

## Images suggérées pour la galerie
- <Écran à capturer> : <légende en une phrase>
<3 à 5 écrans qui montrent le mieux le projet.>

## À vérifier avec toi
- <Point non confirmé> : <question précise>
<Tout ce qui n'a pas pu être confirmé par les documents, une question précise par point. Écrire « Rien » si tout est confirmé.>
```

## Exemple de ton attendu

```markdown
## Description courte
Work OS : un bureau en ligne qui centralise le travail d'une équipe, des projets aux tâches suivies.

## Ce que j'ai fait
- Conception de l'architecture monorepo (API NestJS, front Next.js, PostgreSQL via Prisma).
- Mise en place de l'authentification JWT avec vérification par OTP et RBAC par bureau.
- Développement du front-end (Next.js, responsive, bilingue).
- Développement du chat d'équipe en temps réel (WebSocket, pièces jointes).
- Intégration de l'IA pour structurer des notes en tâches priorisées (Gemini, traitement en file BullMQ).
- Déploiement de l'API sur Railway et du front sur Vercel, avec migrations automatiques.

## À vérifier avec toi
- Tests automatisés : aucun fichier de test trouvé, en existe-t-il ailleurs ?
```
