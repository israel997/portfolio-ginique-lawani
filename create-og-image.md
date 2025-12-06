# Créer votre image Open Graph optimale

## Option 1: Utiliser un outil en ligne (RAPIDE)

### A) Canva (Recommandé)
1. Allez sur https://www.canva.com
2. Créez un design de **1200 x 630 px**
3. Utilisez ce template:
   - Fond: Dégradé rose/violet/indigo (comme votre site)
   - Photo: Votre profil sur la gauche
   - Texte à droite:
     ```
     GINIQUE DEV
     Développeur Fullstack Bénin
     React • Vue.js • Node.js • Laravel
     ```
   - Logo/Icônes des technologies en bas
4. Téléchargez en **JPG de qualité maximale**
5. Renommez en `og-image.jpg`
6. Placez dans `/public/og-image.jpg`

### B) Figma (Professionnel)
1. https://www.figma.com
2. Frame: 1200 x 630 px
3. Même template que Canva
4. Export en JPG ou PNG

## Option 2: Modifier l'image actuelle

```bash
# Si vous avez ImageMagick installé
convert profile2.jpg -resize 1200x630^ -gravity center -extent 1200x630 public/og-image.jpg
```

## Une fois l'image créée

Mettez `og-image.jpg` dans `/public/` puis je mettrai à jour les meta tags.

## Tester le résultat

Après déploiement, testez sur:
- **Facebook**: https://developers.facebook.com/tools/debug/
- **Twitter**: https://cards-dev.twitter.com/validator
- **LinkedIn**: Partagez le lien dans un post brouillon
- **WhatsApp**: Envoyez le lien à vous-même

## Dimensions recommandées

| Réseau | Taille optimale | Format |
|--------|----------------|--------|
| Facebook/LinkedIn | 1200 x 630 px | JPG/PNG |
| Twitter | 1200 x 675 px | JPG/PNG |
| WhatsApp | 300 x 300 px | JPG |

**Note:** 1200x630 fonctionne partout !
