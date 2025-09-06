/* ========== APP.JS - VERSION TEMPORAIRE DE COMPATIBILITÉ ========== */
// Cette version temporaire évite les conflits avec chat.js existant
// À terme, il faudra migrer vers une architecture modulaire complète

/**
 * Classe d'application temporaire pour éviter les conflits
 * Ne fait que des vérifications de base sans interferer avec chat.js
 */
class TempChatApp {
  constructor() {
    this.isInitialized = false;
    this.debugMode = false;
    
    console.log('🔧 TempChatApp: Version de compatibilité chargée');
  }

  /**
   * Initialisation minimale qui ne cause pas de conflits
   */
  async init() {
    if (this.isInitialized) {
      console.warn('⚠️ TempChatApp déjà initialisé');
      return;
    }

    try {
      // Vérifications de base uniquement
      await this.checkDOMElements();
      
      // Marquer comme initialisé
      this.isInitialized = true;
      console.log('✅ TempChatApp initialisé en mode compatibilité');
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'initialisation TempChatApp:', error);
    }
  }

  /**
   * Vérifier que les éléments essentiels sont présents
   */
  async checkDOMElements() {
    const requiredElements = [
      '#message-input',
      '#send-button', 
      '#messages',
      '.conversations'
    ];

    const missingElements = [];
    
    for (const selector of requiredElements) {
      const element = document.querySelector(selector);
      if (!element) {
        missingElements.push(selector);
      }
    }

    if (missingElements.length > 0) {
      console.warn('⚠️ Éléments DOM manquants:', missingElements);
    } else {
      console.log('✅ Tous les éléments DOM essentiels sont présents');
    }
  }

  /**
   * Méthode utilitaire pour debug
   */
  enableDebug() {
    this.debugMode = true;
    console.log('🐛 Mode debug activé pour TempChatApp');
  }

  /**
   * Vérifier l'état de l'application
   */
  getStatus() {
    return {
      initialized: this.isInitialized,
      debugMode: this.debugMode,
      timestamp: new Date().toISOString()
    };
  }
}

// Initialisation automatique SANS conflits
if (typeof window !== 'undefined') {
  // Attendre que le DOM soit prêt
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initTempApp();
    });
  } else {
    initTempApp();
  }
}

function initTempApp() {
  // Ne créer l'instance que si elle n'existe pas
  if (!window.tempChatApp) {
    window.tempChatApp = new TempChatApp();
    
    // Initialiser après un délai pour laisser chat.js se charger en premier
    setTimeout(() => {
      window.tempChatApp.init();
    }, 100);
  }
}

// Export pour compatibilité
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TempChatApp;
}
