export const translations = {
  en: {
    title: 'PDF Form Field Editor',
    subtitle: 'Upload a PDF to rename form fields in bulk',
    upload: {
      dragDrop: 'Drag & drop a PDF here, or click to select',
      dropHere: 'Drop the PDF here',
      onlyPdf: 'Only PDF files are supported',
      error: 'Please upload a valid PDF file'
    },
    processing: 'Processing PDF...',
    fields: {
      found: 'field',
      foundPlural: 'fields',
      type: 'Type',
      was: 'was',
      noFieldsRenamed: 'No fields have been renamed'
    },
    buttons: {
      remove: 'Remove',
      resetAll: 'Reset All',
      download: 'Download Renamed PDF',
      save: 'Save',
      cancel: 'Cancel'
    },
    messages: {
      successRenamed: 'Successfully renamed',
      field: 'field',
      fields: 'fields',
      failedAnalyze: 'Failed to analyze PDF. Please try again.',
      failedRename: 'Failed to rename PDF fields. Please try again.'
    },
    footer: {
      poweredBy: 'Powered by',
      madeWith: 'Made with'
    }
  },
  fr: {
    title: 'Éditeur de champs de formulaire PDF',
    subtitle: 'Téléchargez un PDF pour renommer les champs en masse',
    upload: {
      dragDrop: 'Glissez-déposez un PDF ici, ou cliquez pour sélectionner',
      dropHere: 'Déposez le PDF ici',
      onlyPdf: 'Seuls les fichiers PDF sont supportés',
      error: 'Veuillez télécharger un fichier PDF valide'
    },
    processing: 'Traitement du PDF...',
    fields: {
      found: 'champ',
      foundPlural: 'champs',
      type: 'Type',
      was: 'était',
      noFieldsRenamed: 'Aucun champ n\'a été renommé'
    },
    buttons: {
      remove: 'Supprimer',
      resetAll: 'Réinitialiser tout',
      download: 'Télécharger le PDF renommé',
      save: 'Enregistrer',
      cancel: 'Annuler'
    },
    messages: {
      successRenamed: 'Renommé avec succès',
      field: 'champ',
      fields: 'champs',
      failedAnalyze: 'Échec de l\'analyse du PDF. Veuillez réessayer.',
      failedRename: 'Échec du renommage des champs PDF. Veuillez réessayer.'
    },
    footer: {
      poweredBy: 'Propulsé par',
      madeWith: 'Fait avec'
    }
  }
}

export type Language = keyof typeof translations

export function detectLanguage(): Language {
  if (typeof window === 'undefined') return 'en'
  
  const browserLang = navigator.language.toLowerCase()
  if (browserLang.startsWith('fr')) return 'fr'
  return 'en'
}