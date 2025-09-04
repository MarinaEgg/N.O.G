/* ========== CONFIGURATION DU CHAT ========== */

const ChatConfig = {
  // Configuration de l'input
  input: {
    minHeight: 40,
    maxHeight: 200,
    lineHeight: 20,
    placeholder: "Posez votre question à nOg",
    maxLength: 4000,
    autoResize: true,
    submitOnEnter: true,
    allowShiftEnter: true
  },

  // Configuration des animations
  animations: {
    messageAppear: {
      duration: 600,
      easing: 'ease'
    },
    inputResize: {
      duration: 200,
      easing: 'ease'
    },
    typing: {
      speed: 7, // ms par caractère
      cursorBlink: 1000
    }
  },

  // Configuration des messages
  messages: {
    maxWidth: 840,
    showTimestamp: false,
    showAvatar: true,
    enableMarkdown: true,
    enableCodeHighlight: true
  },

  // Configuration des fonctionnalités
  features: {
    copyButton: true,
    likeButton: true,
    dislikeButton: true,
    videoSources: true,
    maxVideoSources: 3,
    autoScroll: true,
    mobileOptimized: true
  },

  // Configuration responsive
  responsive: {
    mobileBreakpoint: 768,
    tabletBreakpoint: 990,
    enableMobileGestures: true,
    preventZoomOnFocus: true
  },

  // Messages de greeting
  greetingMessages: {
    fr: "Bonjour. Je suis N.O.G – Nested Orchestration & Governance.\nJe suis conçu pour orchestrer et gouverner les interactions entre différents agents spécialisés, avec une capacité native de connexion à des systèmes tiers tels qu'iManage, entre autres.\n\nInteropérable avec plusieurs grands modèles de langage (GPT, Mistral, Claude), je prends en charge des opérations complexes tout en assurant une traçabilité fine et systématique de chaque interaction.\n\nCette architecture garantit une gouvernance robuste, conforme aux exigences des environnements juridiques professionnels.",
    en: "Hi. I am N.O.G – Nested Orchestration & Governance.\nI am designed to orchestrate and govern interactions between specialized agents, with native integration capabilities for third-party systems such as iManage, among others.\n\nInteroperable with leading large language models (GPT, Mistral, Claude), I support complex operations while ensuring fine-grained, systematic traceability of every interaction.\n\nThis architecture guarantees robust governance, aligned with the standards and expectations of professional legal environments."
  },

  // Configuration des avertissements
  warnings: {
    fr: "N.O.G peut faire des erreurs, assurez-vous de vérifier ses réponses",
    en: "N.O.G can make mistakes, make sure to verify its responses"
  },

  // Configuration des API
  api: {
    endpoint: '/backend-api/v2/conversation',
    timeout: 30000,
    retryAttempts: 3,
    retryDelay: 1000
  },

  // Configuration du stockage local
  storage: {
    conversationPrefix: 'conversation:',
    maxConversations: 50,
    autoSave: true,
    compressionEnabled: false
  },

  // Configuration de l'accessibilité
  accessibility: {
    enableKeyboardNavigation: true,
    enableScreenReader: true,
    highContrastMode: false,
    focusIndicators: true
  },

  // Configuration de debug
  debug: {
    enabled: false,
    logLevel: 'info', // 'debug', 'info', 'warn', 'error'
    logToConsole: true,
    logToStorage: false
  }
};

// Fonction pour obtenir la configuration avec des valeurs par défaut
function getConfig(path, defaultValue = null) {
  const keys = path.split('.');
  let current = ChatConfig;
  
  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = current[key];
    } else {
      return defaultValue;
    }
  }
  
  return current;
}

// Fonction pour mettre à jour la configuration
function updateConfig(path, value) {
  const keys = path.split('.');
  const lastKey = keys.pop();
  let current = ChatConfig;
  
  for (const key of keys) {
    if (!(key in current)) {
      current[key] = {};
    }
    current = current[key];
  }
  
  current[lastKey] = value;
}

// Fonction pour détecter la langue de l'utilisateur
function getUserLanguage() {
  return navigator.language.startsWith('fr') ? 'fr' : 'en';
}

// Fonction pour obtenir le message de greeting dans la bonne langue
function getGreetingMessage() {
  const language = getUserLanguage();
  return getConfig(`greetingMessages.${language}`, getConfig('greetingMessages.en'));
}

// Fonction pour obtenir l'avertissement dans la bonne langue
function getWarningMessage() {
  const language = getUserLanguage();
  return getConfig(`warnings.${language}`, getConfig('warnings.en'));
}

// Fonction pour vérifier si on est sur mobile
function isMobileDevice() {
  return window.innerWidth <= getConfig('responsive.mobileBreakpoint', 768) || 
         /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// Fonction pour vérifier si on est sur tablette
function isTabletDevice() {
  return window.innerWidth <= getConfig('responsive.tabletBreakpoint', 990) && 
         window.innerWidth > getConfig('responsive.mobileBreakpoint', 768);
}

// Export pour utilisation globale
if (typeof window !== 'undefined') {
  window.ChatConfig = ChatConfig;
  window.getConfig = getConfig;
  window.updateConfig = updateConfig;
  window.getUserLanguage = getUserLanguage;
  window.getGreetingMessage = getGreetingMessage;
  window.getWarningMessage = getWarningMessage;
  window.isMobileDevice = isMobileDevice;
  window.isTabletDevice = isTabletDevice;
}

// Export pour utilisation en module
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    ChatConfig,
    getConfig,
    updateConfig,
    getUserLanguage,
    getGreetingMessage,
    getWarningMessage,
    isMobileDevice,
    isTabletDevice
  };
}
