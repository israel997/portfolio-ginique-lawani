# Internationalisation (i18n) du Portfolio

## 🌍 Configuration

Le portfolio supporte maintenant le **français** et l'**anglais** grâce à Vue I18n.

### Structure des fichiers

```
src/
├── i18n/
│   ├── index.js           # Configuration i18n
│   └── translations.js    # Toutes les traductions
└── components/
    └── LanguageSwitcher.vue  # Sélecteur de langue
```

## 🚀 Utilisation dans les composants

### 1. Dans le template
```vue
<template>
  <h1>{{ $t('hero.title') }}</h1>
  <p>{{ $t('about.description') }}</p>
</template>
```

### 2. Dans le script
```vue
<script setup>
import { useI18n } from 'vue-i18n'

const { t, locale } = useI18n()

// Utiliser la traduction
const title = t('hero.title')

// Changer la langue
locale.value = 'en'
</script>
```

## ✏️ Ajouter/Modifier des traductions

Ouvrir `src/i18n/translations.js` et modifier les sections `fr` ou `en` :

```javascript
export default {
  fr: {
    hero: {
      title: 'Mon Portfolio',  // ← Modifier ici
      subtitle: 'Développeur Fullstack'
    }
  },
  en: {
    hero: {
      title: 'My Portfolio',   // ← Et ici
      subtitle: 'Fullstack Developer'
    }
  }
}
```

## 🎯 Ajouter une nouvelle langue

1. **Ajouter les traductions** dans `src/i18n/translations.js` :
```javascript
export default {
  fr: { /* ... */ },
  en: { /* ... */ },
  es: {  // ← Nouvelle langue
    nav: {
      about: 'Acerca de',
      contact: 'Contacto'
    }
  }
}
```

2. **Ajouter la langue** dans `LanguageSwitcher.vue` :
```javascript
const languages = [
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'es', name: 'Español', flag: '🇪🇸' }  // ← Ajouter ici
]
```

## 💾 Persistance

La langue sélectionnée est **sauvegardée automatiquement** dans `localStorage` et restaurée au rechargement de la page.

## 📝 Composants à traduire

Pour traduire un composant existant :

1. Identifier les textes statiques
2. Les remplacer par `{{ $t('cle.traduction') }}`
3. Ajouter les traductions dans `translations.js`

### Exemple avec Hero.vue

**Avant :**
```vue
<h1>Ginique Oriadé LAWANI</h1>
<p>Développeur Fullstack</p>
```

**Après :**
```vue
<h1>Ginique Oriadé LAWANI</h1>
<p>{{ $t('hero.description') }}</p>
```

## 🔧 Commandes utiles

```bash
# Installer i18n (déjà fait)
npm install vue-i18n@9

# Développement
npm run dev

# Build avec toutes les langues
npm run build
```

## 📋 Checklist d'internationalisation

- [x] Configuration i18n
- [x] Fichiers de traduction (FR/EN)
- [x] Sélecteur de langue dans Navbar
- [x] Persistance avec localStorage
- [ ] Traduire Hero.vue
- [ ] Traduire About.vue
- [ ] Traduire Skills.vue
- [ ] Traduire Timeline.vue
- [ ] Traduire Projects.vue
- [ ] Traduire Testimonials.vue
- [ ] Traduire Contact.vue
- [ ] Traduire Footer.vue

## 🎨 Personnalisation du sélecteur

Le `LanguageSwitcher.vue` peut être personnalisé :

- Changer les drapeaux emoji
- Modifier les styles
- Ajouter des transitions
- Changer la position (droite de la navbar actuellement)
