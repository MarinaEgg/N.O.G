/* ========== MAIN.JS - VERSION SIMPLIFIÉE TEMPORAIRE ========== */

/**
 * Version temporaire de main.js qui évite les conflits avec chat.js
 * Cette version ne fait que des vérifications de base et laisse chat.js gérer l'application
 */

// Logger simple
const logger = {
  info: (msg, ...args) => console.log('[MAIN]', msg, ...args),
  warn: (msg, ...args) => console.warn('[MAIN]', msg, ...args),
  error: (msg, ...args) => console.error('[MAIN]', msg, ...args)
};

/**
 * Vérifications de base au chargement
 */
document.addEventListener('DOMContentLoaded', () => {
  logger.info('DOM loaded, running basic checks...');
  
  try {
    // Vérifier que les éléments essentiels sont présents
    checkEssentialElements();
    
    // Vérifier que les scripts essentiels sont chargés
    checkEssentialScripts();
    
    // Setup des handlers d'erreur globaux
    setupErrorHandlers();
    
    logger.info('Basic checks completed successfully');
    
  } catch (error) {
    logger.error('Basic checks failed:', error);
    showErrorFallback(error);
  }
});

/**
 * Vérifier la présence des éléments HTML essentiels
 */
function checkEssentialElements() {
  const essentialElements = [
    { id: 'message-input', name: 'Message Input' },
    { id: 'messages', name: 'Messages Container' },
    { id: 'send-button', name: 'Send Button' },
    { id: 'conversations', name: 'Conversations Sidebar' }
  ];

  const missing = [];
  
  essentialElements.forEach(({ id, name }) => {
    const element = document.getElementById(id);
    if (!element) {
      missing.push(name);
      logger.warn(`Missing element: ${name} (#${id})`);
    }
  });

  if (missing.length > 0) {
    throw new Error(`Missing essential elements: ${missing.join(', ')}`);
  }

  logger.info('All essential elements found');
}

/**
 * Vérifier que les scripts essentiels sont disponibles
 */
function checkEssentialScripts() {
  const essentialGlobals = [
    'markdown',
    'marked',
    'hljs'
  ];

  const missing = [];
  
  essentialGlobals.forEach(global => {
    if (typeof window[global] === 'undefined') {
      missing.push(global);
      logger.warn(`Missing global: ${global}`);
    }
  });

  if (missing.length > 0) {
    logger.warn(`Missing globals: ${missing.join(', ')} - some features may not work`);
  }

  logger.info('Script availability check completed');
}

/**
 * Setup des gestionnaires d'erreur globaux
 */
function setupErrorHandlers() {
  // Gestionnaire d'erreur JavaScript global
  window.addEventListener('error', (event) => {
    logger.error('Unhandled JavaScript error:', {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      error: event.error
    });
  });

  // Gestionnaire de promesses rejetées
  window.addEventListener('unhandledrejection', (event) => {
    logger.error('Unhandled promise rejection:', event.reason);
    
    // Empêcher l'affichage d'erreur par défaut du navigateur
    event.preventDefault();
  });

  logger.info('Error handlers setup completed');
}

/**
 * Afficher une interface d'erreur de secours
 */
function showErrorFallback(error) {
  const errorContainer = document.createElement('div');
  errorContainer.className = 'app-error-fallback';
  errorContainer.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    color: white;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    z-index: 9999;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    text-align: center;
    padding: 20px;
    box-sizing: border-box;
  `;

  errorContainer.innerHTML = `
    <div style="max-width: 500px;">
      <h2 style="color: #ff6b6b; margin-bottom: 20px;">Application Error</h2>
      <p style="margin-bottom: 20px; line-height: 1.5;">
        The chat application encountered an error during initialization. 
        This might be due to missing resources or a temporary issue.
      </p>
      <p style="font-size: 14px; color: #ccc; margin-bottom: 30px;">
        Error: ${error.message}
      </p>
      <button onclick="window.location.reload()" style="
        background: #4CAF50;
        color: white;
        border: none;
        padding: 12px 24px;
        font-size: 16px;
        border-radius: 5px;
        cursor: pointer;
        margin-right: 10px;
      ">Reload Page</button>
      <button onclick="this.parentElement.parentElement.remove()" style="
        background: transparent;
        color: #ccc;
        border: 1px solid #666;
        padding: 12px 24px;
        font-size: 16px;
        border-radius: 5px;
        cursor: pointer;
      ">Dismiss</button>
    </div>
  `;

  document.body.appendChild(errorContainer);

  // Auto-remove après 30 secondes
  setTimeout(() => {
    if (errorContainer.parentElement) {
      errorContainer.remove();
    }
  }, 30000);
}

// Fonction utilitaire pour vérifier l'état de l'application
window.checkAppStatus = function() {
  const status = {
    timestamp: new Date().toISOString(),
    dom: document.readyState,
    chat: {
      messageInput: !!document.getElementById('message-input'),
      messagesContainer: !!document.getElementById('messages'),
      sendButton: !!document.getElementById('send-button')
    },
    globals: {
      markdown: typeof window.markdown !== 'undefined',
      marked: typeof window.marked !== 'undefined',
      hljs: typeof window.hljs !== 'undefined',
      chatInputManager: typeof window.chatInputManager !== 'undefined'
    }
  };
  
  console.table(status);
  return status;
};

logger.info('Main.js temporary version loaded');
