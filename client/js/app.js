/* ========== MAIN APPLICATION CLASS ========== */

import { ChatContainer } from './components/chat-container.js';
import { ChatInputManager } from './components/chat-input.js';
import { MessageRenderer } from './components/message-renderer.js';
import { SidebarManager } from './components/sidebar-manager.js';
import { ModalManager } from './components/modal-manager.js';
import { ApiClient } from './utils/api-client.js';
import { StorageManager } from './utils/storage-manager.js';
import { EventBus } from './utils/event-bus.js';
import { Logger } from './utils/logger.js';

/**
 * Main application class that orchestrates all components
 */
export class ChatApplication {
  constructor() {
    this.logger = new Logger('ChatApplication');
    this.eventBus = new EventBus();
    this.apiClient = new ApiClient();
    this.storageManager = new StorageManager();
    
    // Components
    this.chatContainer = null;
    this.chatInput = null;
    this.messageRenderer = null;
    this.sidebarManager = null;
    this.modalManager = null;
    
    // State
    this.isInitialized = false;
    this.currentConversationId = null;
    this.isGenerating = false;
  }

  /**
   * Initialize the application
   */
  async initialize() {
    try {
      this.logger.info('Initializing application components...');
      
      // Initialize core utilities
      await this.initializeUtilities();
      
      // Initialize UI components
      await this.initializeComponents();
      
      // Setup event listeners
      this.setupEventListeners();
      
      // Load initial state
      await this.loadInitialState();
      
      this.isInitialized = true;
      this.logger.info('Application initialization complete');
      
    } catch (error) {
      this.logger.error('Application initialization failed:', error);
      throw error;
    }
  }

  /**
   * Initialize core utilities
   */
  async initializeUtilities() {
    // Initialize API client
    await this.apiClient.initialize();
    
    // Initialize storage
    await this.storageManager.initialize();
    
    // Setup global error handling
    this.setupErrorHandling();
  }

  /**
   * Initialize UI components
   */
  async initializeComponents() {
    // Initialize message renderer first (needed by other components)
    this.messageRenderer = new MessageRenderer(this.eventBus);
    await this.messageRenderer.initialize();
    
    // Initialize chat container
    this.chatContainer = new ChatContainer(this.eventBus, this.messageRenderer);
    await this.chatContainer.initialize();
    
    // Initialize chat input
    this.chatInput = new ChatInputManager(this.eventBus);
    await this.chatInput.initialize();
    
    // Initialize sidebar
    this.sidebarManager = new SidebarManager(this.eventBus, this.storageManager);
    await this.sidebarManager.initialize();
    
    // Initialize modals
    this.modalManager = new ModalManager(this.eventBus);
    await this.modalManager.initialize();
  }

  /**
   * Setup application-level event listeners
   */
  setupEventListeners() {
    // Chat input events
    this.eventBus.on('chat:sendMessage', this.handleSendMessage.bind(this));
    this.eventBus.on('chat:stopGeneration', this.handleStopGeneration.bind(this));
    
    // Conversation events
    this.eventBus.on('conversation:new', this.handleNewConversation.bind(this));
    this.eventBus.on('conversation:delete', this.handleDeleteConversation.bind(this));
    this.eventBus.on('conversation:deleteAll', this.handleDeleteAllConversations.bind(this));
    
    // Message events
    this.eventBus.on('message:copy', this.handleCopyMessage.bind(this));
    this.eventBus.on('message:like', this.handleLikeMessage.bind(this));
    this.eventBus.on('message:dislike', this.handleDislikeMessage.bind(this));
    
    // Modal events
    this.eventBus.on('modal:openLibrary', this.handleOpenLibrary.bind(this));
    this.eventBus.on('modal:openLinks', this.handleOpenLinks.bind(this));
    
    // Window events
    window.addEventListener('beforeunload', this.handleBeforeUnload.bind(this));
    window.addEventListener('resize', this.handleWindowResize.bind(this));
  }

  /**
   * Load initial application state
   */
  async loadInitialState() {
    try {
      // Load conversation history
      const conversations = await this.storageManager.getConversations();
      this.sidebarManager.updateConversationsList(conversations);
      
      // Load current conversation if exists
      const currentId = await this.storageManager.getCurrentConversationId();
      if (currentId) {
        await this.loadConversation(currentId);
      } else {
        await this.handleNewConversation();
      }
      
    } catch (error) {
      this.logger.error('Failed to load initial state:', error);
      // Create new conversation as fallback
      await this.handleNewConversation();
    }
  }

  /**
   * Handle sending a message
   */
  async handleSendMessage(data) {
    if (this.isGenerating) {
      this.logger.warn('Message sending blocked - generation in progress');
      return;
    }

    try {
      const { message } = data;
      this.logger.info('Sending message:', message);
      
      // Add user message to chat
      const userMessageId = await this.chatContainer.addUserMessage(message);
      
      // Clear input
      this.chatInput.clear();
      
      // Start generation
      this.isGenerating = true;
      this.eventBus.emit('generation:started');
      
      // Add assistant message placeholder
      const assistantMessageId = await this.chatContainer.addAssistantMessage('');
      
      // Send to API and stream response
      await this.streamResponse(message, assistantMessageId);
      
    } catch (error) {
      this.logger.error('Failed to send message:', error);
      this.eventBus.emit('error:message', { error: error.message });
    } finally {
      this.isGenerating = false;
      this.eventBus.emit('generation:stopped');
    }
  }

  /**
   * Stream response from API
   */
  async streamResponse(message, messageId) {
    try {
      const stream = await this.apiClient.sendMessage(message, this.currentConversationId);
      
      for await (const chunk of stream) {
        if (chunk.type === 'content') {
          await this.chatContainer.updateAssistantMessage(messageId, chunk.content);
        } else if (chunk.type === 'sources') {
          await this.chatContainer.addMessageSources(messageId, chunk.sources);
        }
      }
      
      // Save conversation
      await this.saveCurrentConversation();
      
    } catch (error) {
      if (error.name === 'AbortError') {
        this.logger.info('Message generation was cancelled');
      } else {
        throw error;
      }
    }
  }

  /**
   * Handle stopping generation
   */
  async handleStopGeneration() {
    if (this.isGenerating) {
      this.apiClient.abortCurrentRequest();
      this.isGenerating = false;
      this.eventBus.emit('generation:stopped');
    }
  }

  /**
   * Handle creating new conversation
   */
  async handleNewConversation() {
    try {
      this.currentConversationId = this.generateConversationId();
      await this.chatContainer.clear();
      await this.chatContainer.showGreeting();
      
      // Update sidebar
      this.sidebarManager.setActiveConversation(this.currentConversationId);
      
      // Save state
      await this.storageManager.setCurrentConversationId(this.currentConversationId);
      
      this.logger.info('New conversation created:', this.currentConversationId);
      
    } catch (error) {
      this.logger.error('Failed to create new conversation:', error);
    }
  }

  /**
   * Handle deleting a conversation
   */
  async handleDeleteConversation(data) {
    try {
      const { conversationId } = data;
      await this.storageManager.deleteConversation(conversationId);
      
      // If deleting current conversation, create new one
      if (conversationId === this.currentConversationId) {
        await this.handleNewConversation();
      }
      
      // Update sidebar
      const conversations = await this.storageManager.getConversations();
      this.sidebarManager.updateConversationsList(conversations);
      
    } catch (error) {
      this.logger.error('Failed to delete conversation:', error);
    }
  }

  /**
   * Handle deleting all conversations
   */
  async handleDeleteAllConversations() {
    try {
      await this.storageManager.clearAllConversations();
      await this.handleNewConversation();
      
    } catch (error) {
      this.logger.error('Failed to delete all conversations:', error);
    }
  }

  /**
   * Handle copying message
   */
  async handleCopyMessage(data) {
    try {
      const { content } = data;
      await navigator.clipboard.writeText(content);
      this.eventBus.emit('notification:show', { 
        message: 'Message copied to clipboard',
        type: 'success'
      });
    } catch (error) {
      this.logger.error('Failed to copy message:', error);
    }
  }

  /**
   * Handle liking message
   */
  async handleLikeMessage(data) {
    try {
      const { messageId } = data;
      // Implement feedback logic here
      this.logger.info('Message liked:', messageId);
    } catch (error) {
      this.logger.error('Failed to like message:', error);
    }
  }

  /**
   * Handle disliking message
   */
  async handleDislikeMessage(data) {
    try {
      const { messageId } = data;
      // Implement feedback logic here
      this.logger.info('Message disliked:', messageId);
    } catch (error) {
      this.logger.error('Failed to dislike message:', error);
    }
  }

  /**
   * Handle opening library modal
   */
  async handleOpenLibrary() {
    this.modalManager.openLibrary();
  }

  /**
   * Handle opening links modal
   */
  async handleOpenLinks(data) {
    const { videoIds, titles } = data;
    this.modalManager.openLinks(videoIds, titles);
  }

  /**
   * Load a specific conversation
   */
  async loadConversation(conversationId) {
    try {
      const conversation = await this.storageManager.getConversation(conversationId);
      if (conversation) {
        this.currentConversationId = conversationId;
        await this.chatContainer.loadConversation(conversation);
        this.sidebarManager.setActiveConversation(conversationId);
      }
    } catch (error) {
      this.logger.error('Failed to load conversation:', error);
    }
  }

  /**
   * Save current conversation
   */
  async saveCurrentConversation() {
    try {
      const messages = this.chatContainer.getMessages();
      await this.storageManager.saveConversation(this.currentConversationId, {
        id: this.currentConversationId,
        messages,
        timestamp: Date.now()
      });
    } catch (error) {
      this.logger.error('Failed to save conversation:', error);
    }
  }

  /**
   * Generate unique conversation ID
   */
  generateConversationId() {
    return `conversation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Setup global error handling
   */
  setupErrorHandling() {
    this.eventBus.on('error:*', (error) => {
      this.logger.error('Application error:', error);
    });
  }

  /**
   * Handle window resize
   */
  handleWindowResize() {
    // Notify components about resize
    this.eventBus.emit('window:resize', {
      width: window.innerWidth,
      height: window.innerHeight
    });
  }

  /**
   * Handle before unload
   */
  async handleBeforeUnload(event) {
    if (this.isGenerating) {
      event.preventDefault();
      event.returnValue = 'A message is being generated. Are you sure you want to leave?';
      return event.returnValue;
    }
    
    // Save current state
    await this.saveCurrentConversation();
  }

  /**
   * Get application state for debugging
   */
  getState() {
    return {
      isInitialized: this.isInitialized,
      currentConversationId: this.currentConversationId,
      isGenerating: this.isGenerating,
      components: {
        chatContainer: !!this.chatContainer,
        chatInput: !!this.chatInput,
        messageRenderer: !!this.messageRenderer,
        sidebarManager: !!this.sidebarManager,
        modalManager: !!this.modalManager
      }
    };
  }
}
