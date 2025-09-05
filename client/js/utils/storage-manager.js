/* ========== STORAGE MANAGER UTILITY ========== */

import { Logger } from './logger.js';

/**
 * Storage manager for handling local storage operations
 */
export class StorageManager {
  constructor() {
    this.logger = new Logger('StorageManager');
    this.config = window.ChatConfig?.storage || {
      conversationPrefix: 'conversation:',
      maxConversations: 50,
      autoSave: true,
      compressionEnabled: false
    };
    
    this.isInitialized = false;
  }

  /**
   * Initialize storage manager
   */
  async initialize() {
    this.logger.info('Initializing storage manager...');
    
    try {
      // Test localStorage availability
      this.testStorageAvailability();
      
      // Clean up old conversations if needed
      await this.cleanupOldConversations();
      
      this.isInitialized = true;
      this.logger.info('Storage manager initialized successfully');
      
    } catch (error) {
      this.logger.error('Failed to initialize storage manager:', error);
      throw error;
    }
  }

  /**
   * Test if localStorage is available
   */
  testStorageAvailability() {
    try {
      const testKey = '__storage_test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
    } catch (error) {
      throw new Error('localStorage is not available');
    }
  }

  /**
   * Save a conversation
   */
  async saveConversation(conversationId, conversation) {
    try {
      const key = this.getConversationKey(conversationId);
      const data = {
        ...conversation,
        id: conversationId,
        lastModified: Date.now()
      };

      const serialized = this.config.compressionEnabled 
        ? this.compress(JSON.stringify(data))
        : JSON.stringify(data);

      localStorage.setItem(key, serialized);
      
      // Update conversation list
      await this.updateConversationsList(conversationId, conversation);
      
      this.logger.debug('Conversation saved:', conversationId);
      
    } catch (error) {
      this.logger.error('Failed to save conversation:', error);
      throw error;
    }
  }

  /**
   * Get a conversation
   */
  async getConversation(conversationId) {
    try {
      const key = this.getConversationKey(conversationId);
      const data = localStorage.getItem(key);
      
      if (!data) {
        return null;
      }

      const parsed = this.config.compressionEnabled 
        ? JSON.parse(this.decompress(data))
        : JSON.parse(data);

      return parsed;
      
    } catch (error) {
      this.logger.error('Failed to get conversation:', error);
      return null;
    }
  }

  /**
   * Delete a conversation
   */
  async deleteConversation(conversationId) {
    try {
      const key = this.getConversationKey(conversationId);
      localStorage.removeItem(key);
      
      // Update conversation list
      await this.removeFromConversationsList(conversationId);
      
      this.logger.debug('Conversation deleted:', conversationId);
      
    } catch (error) {
      this.logger.error('Failed to delete conversation:', error);
      throw error;
    }
  }

  /**
   * Get all conversations
   */
  async getConversations() {
    try {
      const listData = localStorage.getItem('conversations_list');
      if (!listData) {
        return [];
      }

      const list = JSON.parse(listData);
      
      // Sort by last modified (newest first)
      return list.sort((a, b) => b.lastModified - a.lastModified);
      
    } catch (error) {
      this.logger.error('Failed to get conversations list:', error);
      return [];
    }
  }

  /**
   * Clear all conversations
   */
  async clearAllConversations() {
    try {
      const conversations = await this.getConversations();
      
      // Remove individual conversation data
      for (const conv of conversations) {
        const key = this.getConversationKey(conv.id);
        localStorage.removeItem(key);
      }
      
      // Clear conversations list
      localStorage.removeItem('conversations_list');
      localStorage.removeItem('current_conversation_id');
      
      this.logger.info('All conversations cleared');
      
    } catch (error) {
      this.logger.error('Failed to clear conversations:', error);
      throw error;
    }
  }

  /**
   * Set current conversation ID
   */
  async setCurrentConversationId(conversationId) {
    try {
      localStorage.setItem('current_conversation_id', conversationId);
    } catch (error) {
      this.logger.error('Failed to set current conversation ID:', error);
    }
  }

  /**
   * Get current conversation ID
   */
  async getCurrentConversationId() {
    try {
      return localStorage.getItem('current_conversation_id');
    } catch (error) {
      this.logger.error('Failed to get current conversation ID:', error);
      return null;
    }
  }

  /**
   * Update conversations list
   */
  async updateConversationsList(conversationId, conversation) {
    try {
      const conversations = await this.getConversations();
      
      // Remove existing entry if it exists
      const filtered = conversations.filter(c => c.id !== conversationId);
      
      // Add new/updated entry
      const title = this.generateConversationTitle(conversation);
      filtered.unshift({
        id: conversationId,
        title,
        lastModified: Date.now(),
        messageCount: conversation.messages ? conversation.messages.length : 0
      });
      
      // Keep only max conversations
      const limited = filtered.slice(0, this.config.maxConversations);
      
      localStorage.setItem('conversations_list', JSON.stringify(limited));
      
    } catch (error) {
      this.logger.error('Failed to update conversations list:', error);
    }
  }

  /**
   * Remove from conversations list
   */
  async removeFromConversationsList(conversationId) {
    try {
      const conversations = await this.getConversations();
      const filtered = conversations.filter(c => c.id !== conversationId);
      localStorage.setItem('conversations_list', JSON.stringify(filtered));
    } catch (error) {
      this.logger.error('Failed to remove from conversations list:', error);
    }
  }

  /**
   * Generate conversation title from first message
   */
  generateConversationTitle(conversation) {
    if (!conversation.messages || conversation.messages.length === 0) {
      return 'New Conversation';
    }

    const firstUserMessage = conversation.messages.find(m => m.role === 'user');
    if (firstUserMessage && firstUserMessage.content) {
      // Take first 50 characters
      return firstUserMessage.content.substring(0, 50).trim() + 
             (firstUserMessage.content.length > 50 ? '...' : '');
    }

    return 'New Conversation';
  }

  /**
   * Clean up old conversations
   */
  async cleanupOldConversations() {
    try {
      const conversations = await this.getConversations();
      
      if (conversations.length > this.config.maxConversations) {
        const toDelete = conversations.slice(this.config.maxConversations);
        
        for (const conv of toDelete) {
          await this.deleteConversation(conv.id);
        }
        
        this.logger.info(`Cleaned up ${toDelete.length} old conversations`);
      }
    } catch (error) {
      this.logger.error('Failed to cleanup old conversations:', error);
    }
  }

  /**
   * Get conversation storage key
   */
  getConversationKey(conversationId) {
    return `${this.config.conversationPrefix}${conversationId}`;
  }

  /**
   * Get storage usage info
   */
  getStorageInfo() {
    try {
      let totalSize = 0;
      let conversationCount = 0;
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith(this.config.conversationPrefix)) {
          const value = localStorage.getItem(key);
          totalSize += key.length + (value ? value.length : 0);
          conversationCount++;
        }
      }
      
      return {
        totalSize,
        conversationCount,
        maxConversations: this.config.maxConversations,
        compressionEnabled: this.config.compressionEnabled
      };
      
    } catch (error) {
      this.logger.error('Failed to get storage info:', error);
      return null;
    }
  }

  /**
   * Simple compression (if enabled)
   */
  compress(data) {
    // Simple LZ-string compression could be implemented here
    // For now, just return the data as-is
    return data;
  }

  /**
   * Simple decompression (if enabled)
   */
  decompress(data) {
    // Simple LZ-string decompression could be implemented here
    // For now, just return the data as-is
    return data;
  }

  /**
   * Export conversations for backup
   */
  async exportConversations() {
    try {
      const conversations = await this.getConversations();
      const data = [];
      
      for (const conv of conversations) {
        const fullConversation = await this.getConversation(conv.id);
        if (fullConversation) {
          data.push(fullConversation);
        }
      }
      
      return {
        version: '1.0',
        exportDate: new Date().toISOString(),
        conversations: data
      };
      
    } catch (error) {
      this.logger.error('Failed to export conversations:', error);
      throw error;
    }
  }

  /**
   * Import conversations from backup
   */
  async importConversations(backupData) {
    try {
      if (!backupData.conversations || !Array.isArray(backupData.conversations)) {
        throw new Error('Invalid backup data format');
      }
      
      for (const conversation of backupData.conversations) {
        if (conversation.id) {
          await this.saveConversation(conversation.id, conversation);
        }
      }
      
      this.logger.info(`Imported ${backupData.conversations.length} conversations`);
      
    } catch (error) {
      this.logger.error('Failed to import conversations:', error);
      throw error;
    }
  }
}
