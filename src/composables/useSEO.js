// SEO composable for dynamic meta tags
import { useI18n } from 'vue-i18n'
import { watch } from 'vue'

export function useSEO() {
  const { locale } = useI18n()

  const updateSEO = () => {
    const isFrench = locale.value === 'fr'
    
    // Update HTML lang attribute
    document.documentElement.lang = isFrench ? 'fr' : 'en'
    
    // Update meta description
    const description = isFrench
      ? 'Ginique Dev (Israel Oriadé LAWANI) - Développeur Fullstack au Bénin avec 8 ans d\'expertise. Spécialiste React, Vue.js, Node.js, Laravel. Transformation digitale et solutions business. Dev Bénin, Ginique Développeur, LAWANI Développeur.'
      : 'Ginique Dev (Israel Oriadé LAWANI) - Fullstack Developer in Benin with 8 years of expertise. React, Vue.js, Node.js, Laravel specialist. Digital transformation and business solutions. Dev Benin, Ginique Developer, LAWANI Developer.'
    
    const metaDescription = document.querySelector('meta[name="description"]')
    if (metaDescription) {
      metaDescription.setAttribute('content', description)
    }
    
    // Update title
    const title = isFrench
      ? 'Ginique Dev - Développeur Fullstack Bénin | Israel LAWANI Portfolio'
      : 'Ginique Dev - Fullstack Developer Benin | Israel LAWANI Portfolio'
    
    document.title = title
    
    // Update OG tags
    const ogTitle = document.querySelector('meta[property="og:title"]')
    const ogDescription = document.querySelector('meta[property="og:description"]')
    const twitterTitle = document.querySelector('meta[property="twitter:title"]')
    const twitterDescription = document.querySelector('meta[property="twitter:description"]')
    
    const ogTitleContent = isFrench
      ? 'Ginique Dev - Développeur Fullstack Bénin | Israel LAWANI'
      : 'Ginique Dev - Fullstack Developer Benin | Israel LAWANI'
    
    if (ogTitle) ogTitle.setAttribute('content', ogTitleContent)
    if (twitterTitle) twitterTitle.setAttribute('content', ogTitleContent)
    if (ogDescription) ogDescription.setAttribute('content', description)
    if (twitterDescription) twitterDescription.setAttribute('content', description)
  }

  // Update SEO when locale changes
  watch(locale, updateSEO)
  
  // Initial update
  updateSEO()
  
  return {
    updateSEO
  }
}
