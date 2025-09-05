/* ========== APP.JS - VERSION TEMPORAIRE DE COMPATIBILITÉ ========== */

// Cette version temporaire évite les conflits avec chat.js existant
// À terme, il faudra migrer vers une architecture modulaire complète

/**
 * Classe d'application temporaire qui coexiste avec chat.js
 */
class TemporaryAppManager {
  constructor() {
    this.logger = {
      info: console.log.bind(console, '[APP]'),
      warn: console.warn.bind(console, '[APP]'),
      error: console.error.bind(console, '[APP]')
    };
    
    this.isInitialized = false;
  }

  /**
   * Initialisation minimaliste pour éviter les conflits
   */
  async initialize() {
    try {
      this.logger.info('Initializing temporary app manager...');
      
      // Juste s'assurer que les éléments de base sont présents
      this.checkElements();
      
      // Setup minimal des utilitaires
      this.setupUtilities();
      
      this.isInitialized = true;
      this.logger.info('Temporary app manager initialized');
      
    } catch (error) {
      this.logger.error('Temporary app initialization failed:', error);
    }
  }

  checkElements() {
    const requiredElements = [
      'message-input',
      'messages',
      'send-button',
      'conversations'
    ];

    const missing = [];
    requiredElements.forEach(id => {
      if (!document.getElementById(id)) {
        missing.push(id);
      }
    });

    if (missing.length > 0) {
      this.logger.warn('Missing elements:', missing);
    }
  }

  setupUtilities() {
    // Setup global utilities qui n'interfèrent pas avec chat.js
    
    // Error handling global
    window.addEventListener('error', (event) => {
      this.logger.error('Global error:', event.error);
    });

    // Resize handler non-conflictuel
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        this.handleResize();
      }, 250);
    });
  }

  handleResize() {
    // Actions non-conflictuelles lors du resize
    if (window.chatInputManager && window.chatInputManager.forceResize) {
      window.chatInputManager.forceResize();
    }
  }

  getState() {
    return {
      isInitialized: this.isInitialized,
      timestamp: new Date().toISOString()
    };
  }
}

// Exposition globale pour compatibilité
if (typeof window !== 'undefined') {
  window.TemporaryAppManager = TemporaryAppManager;
  
  // Auto-initialisation après que chat.js soit chargé
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
      if (!window.tempAppManager) {
        window.tempAppManager = new TemporaryAppManager();
        window.tempAppManager.initialize();
      }
    }, 500); // Délai pour laisser chat.js s'initialiser
  });
}
