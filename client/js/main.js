/* ========== MAIN.JS - VERSION SIMPLIFIÉE TEMPORAIRE ========== */

/**
 * Version temporaire de main.js qui évite les conflits avec chat.js
 * Cette version ne fait que des vérifications de base et laisse chat.js gérer l'application
 */

// Logger simple pour debug
const logger = {
  info: (msg) => console.log(`ℹ️ [Main] ${msg}`),
  warn: (msg) => console.warn(`⚠️ [Main] ${msg}`),
  error: (msg) => console.error(`❌ [Main] ${msg}`),
  success: (msg) => console.log(`✅ [Main] ${msg}`)
};

/**
 * Vérifications de base au chargement
 */
function performBasicChecks() {
  logger.info('Démarrage des vérifications de base...');
  
  // Vérifier que les scripts essentiels sont chargés
  const checks = {
    'chat.js': typeof window.handle_ask === 'function',
    'links.js': typeof window.openLinks === 'function', 
    'highlight.js': typeof hljs !== 'undefined',
    'markdownit': typeof markdown !== 'undefined'
  };
  
  let allGood = true;
  for (const [script, loaded] of Object.entries(checks)) {
    if (loaded) {
      logger.success(`${script} chargé correctement`);
    } else {
      logger.warn(`${script} non trouvé ou non chargé`);
      allGood = false;
    }
  }
  
  if (allGood) {
    logger.success('Toutes les vérifications de base sont passées');
  } else {
    logger.warn('Certains scripts manquent - fonctionnalités limitées');
  }
  
  return allGood;
}

/**
 * Vérifier l'état de l'interface utilisateur
 */
function checkUIState() {
  const elements = {
    messageInput: document.getElementById('message-input'),
    sendButton: document.getElementById('send-button'),
    messagesContainer: document.getElementById('messages'),
    conversationsList: document.querySelector('.conversations')
  };
  
  let uiReady = true;
  for (const [name, element] of Object.entries(elements)) {
    if (element) {
      logger.success(`Élément UI ${name} trouvé`);
    } else {
      logger.warn(`Élément UI ${name} manquant`);
      uiReady = false;
    }
  }
  
  return uiReady;
}

/**
 * Configuration minimale sans conflit
 */
function setupMinimalConfig() {
  // Configuration globale minimale qui n'interfère pas
  if (!window.chatConfig) {
    window.chatConfig = {
      version: 'temp-compat-1.0',
      mode: 'compatibility',
      initialized: new Date().toISOString()
    };
  }
  
  logger.info('Configuration minimale appliquée');
}

/**
 * Fonction d'initialisation principale
 */
function initializeMain() {
  logger.info('Initialisation de main.js en mode compatibilité');
  
  try {
    // Vérifications de base
    const scriptsOk = performBasicChecks();
    const uiOk = checkUIState();
    
    if (scriptsOk && uiOk) {
      logger.success('Interface prête - chat.js peut prendre le relais');
    } else {
      logger.warn('Problèmes détectés - fonctionnalités limitées possibles');
    }
    
    // Configuration minimale
    setupMinimalConfig();
    
    // Marquer comme initialisé
    window.mainInitialized = true;
    
    logger.success('main.js initialisé en mode compatibilité');
    
  } catch (error) {
    logger.error('Erreur lors de l\'initialisation:', error.message);
  }
}

/**
 * Fonction utilitaire pour diagnostics
 */
function runDiagnostics() {
  logger.info('=== DIAGNOSTICS ===');
  console.table({
    'DOM Ready': document.readyState,
    'chat.js loaded': typeof window.handle_ask === 'function',
    'ChatInputManager': typeof window.chatInputManager !== 'undefined',
    'Main initialized': window.mainInitialized === true,
    'User agent': navigator.userAgent.includes('Mobile') ? 'Mobile' : 'Desktop'
  });
  logger.info('=== FIN DIAGNOSTICS ===');
}

// Initialisation automatique
if (typeof window !== 'undefined') {
  // Attendre que le DOM soit prêt
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeMain);
  } else {
    // DOM déjà prêt - attendre un peu pour laisser les autres scripts se charger
    setTimeout(initializeMain, 50);
  }
  
  // Exposer les diagnostics globalement pour debug
  window.runDiagnostics = runDiagnostics;
}

// Export pour compatibilité
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    initializeMain,
    runDiagnostics,
    logger
  };
}
