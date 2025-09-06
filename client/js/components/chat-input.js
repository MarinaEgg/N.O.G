/* ========== GESTIONNAIRE DE LA BARRE DE CHAT RESPONSIVE - VERSION CORRÉGÉE ========== */

class ChatInputManager {
  constructor() {
    this.textarea = null;
    this.inputBox = null;
    this.sendButton = null;
    this.messagesContainer = null;
    this.minHeight = 40;
    this.maxHeight = 200;
    this.lineHeight = 20;
    this.isInitialized = false;
    
    // Mode compatibilité pour éviter les conflits avec chat.js
    this.compatibilityMode = true;
    
    this.init();
  }

  init() {
    // Attendre que le DOM soit chargé
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setupElements());
    } else {
      this.setupElements();
    }
  }

  setupElements() {
    this.textarea = document.getElementById('message-input');
    this.inputBox = document.querySelector('.input-box');
    this.sendButton = document.getElementById('send-button');
    this.messagesContainer = document.getElementById('messages');
    
    if (!this.textarea || !this.inputBox) {
      console.warn('Éléments de chat non trouvés, retry dans 100ms');
      setTimeout(() => this.setupElements(), 100);
      return;
    }

    // En mode compatibilité, on ne setup PAS d'event listeners
    // On laisse chat.js s'occuper de ça
    this.isInitialized = true;
    console.log('✅ ChatInputManager initialisé en mode compatibilité');
  }

  resizeTextarea() {
    if (!this.textarea || !this.inputBox) return;

    // Sauvegarder la position de scroll
    const scrollTop = this.textarea.scrollTop;
    
    // Reset height pour calculer la nouvelle hauteur
    this.textarea.style.height = 'auto';
    
    // Calculer la hauteur nécessaire
    const scrollHeight = this.textarea.scrollHeight;
    let newHeight;

    if (scrollHeight <= this.minHeight) {
      newHeight = this.minHeight;
      this.textarea.classList.remove('scrollable');
    } else if (scrollHeight >= this.maxHeight) {
      newHeight = this.maxHeight;
      this.textarea.classList.add('scrollable');
    } else {
      newHeight = Math.max(this.minHeight, scrollHeight);
      this.textarea.classList.remove('scrollable');
    }
    
    // Appliquer la nouvelle hauteur
    this.textarea.style.height = newHeight + 'px';
    
    // Ajuster la hauteur du conteneur
    this.adjustContainerHeight(newHeight);
    
    // Restaurer la position de scroll si nécessaire
    if (this.textarea.classList.contains('scrollable')) {
      this.textarea.scrollTop = scrollTop;
    }
  }

  adjustContainerHeight(textareaHeight) {
    // Calculer la hauteur du conteneur
    const containerMinHeight = 60;
    const padding = 20;
    const containerHeight = Math.max(textareaHeight + padding, containerMinHeight);
    
    // Appliquer la hauteur au conteneur
    this.inputBox.style.minHeight = containerHeight + 'px';
    
    // Calculer l'offset pour les autres éléments
    const heightDifference = containerHeight - containerMinHeight;
    
    // Ajuster la zone de messages
    this.adjustMessagesContainer(heightDifference);
  }

  adjustMessagesContainer(heightDifference) {
    if (!this.messagesContainer) return;

    const basePadding = 120;
    if (heightDifference > 0) {
      this.messagesContainer.style.paddingBottom = `${basePadding + heightDifference}px`;
    } else {
      this.messagesContainer.style.paddingBottom = `${basePadding}px`;
    }
  }

  resetHeight() {
    if (!this.textarea || !this.inputBox) return;

    this.textarea.style.height = this.minHeight + 'px';
    this.textarea.classList.remove('scrollable');
    this.inputBox.style.minHeight = '60px';
    
    // Reset du conteneur de messages
    if (this.messagesContainer) {
      this.messagesContainer.style.paddingBottom = '120px';
    }
  }
}

// Fonctions globales pour maintenir la compatibilité avec chat.js
function resizeTextarea(textarea) {
  if (window.chatInputManager && window.chatInputManager.isInitialized) {
    window.chatInputManager.resizeTextarea();
  }
}

function resetChatBarHeight() {
  if (window.chatInputManager && window.chatInputManager.isInitialized) {
    window.chatInputManager.resetHeight();
  }
}

// Fonction pour gérer la suppression de texte
function handleTextDeletion(textarea) {
  if (window.chatInputManager && window.chatInputManager.isInitialized) {
    setTimeout(() => window.chatInputManager.resizeTextarea(), 0);
  }
}

// Initialiser le gestionnaire automatiquement
if (typeof window !== 'undefined') {
  // Pas de délai - initialiser immédiatement
  if (!window.chatInputManager) {
    window.chatInputManager = new ChatInputManager();
  }
  
  // Exposer les méthodes principales globalement
  window.resizeTextarea = resizeTextarea;
  window.resetChatBarHeight = resetChatBarHeight;
  window.handleTextDeletion = handleTextDeletion;
}

// Export pour utilisation en module (si nécessaire)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ChatInputManager;
}
