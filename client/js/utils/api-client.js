/* ========== API CLIENT UTILITY ========== */

import { Logger } from './logger.js';

/**
 * API client for handling communication with the backend
 */
export class ApiClient {
  constructor() {
    this.logger = new Logger('ApiClient');
    this.config = window.ChatConfig?.api || {
      endpoint: '/backend-api/v2/conversation',
      timeout: 30000,
      retryAttempts: 3,
      retryDelay: 1000
    };
    
    this.currentController = null;
    this.isInitialized = false;
  }

  /**
   * Initialize the API client
   */
  async initialize() {
    this.logger.info('Initializing API client...');
    this.isInitialized = true;
  }

  /**
   * Send a message and return a stream of responses
   */
  async sendMessage(message, conversationId = null) {
    if (!this.isInitialized) {
      throw new Error('API client not initialized');
    }

    // Abort any existing request
    this.abortCurrentRequest();

    // Create new abort controller
    this.currentController = new AbortController();

    const requestData = {
      message,
      conversation_id: conversationId || this.generateConversationId(),
      model: 'Eggon-V1'
    };

    this.logger.info('Sending message to API:', { message, conversationId });

    try {
      const response = await this.makeRequest(requestData);
      return this.createResponseStream(response);
    } catch (error) {
      this.currentController = null;
      throw error;
    }
  }

  /**
   * Make HTTP request with retry logic
   */
  async makeRequest(data, attempt = 1) {
    try {
      const response = await fetch(this.config.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream'
        },
        body: JSON.stringify(data),
        signal: this.currentController.signal
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return response;

    } catch (error) {
      if (error.name === 'AbortError') {
        throw error;
      }

      if (attempt < this.config.retryAttempts) {
        this.logger.warn(`Request failed (attempt ${attempt}), retrying...`, error);
        await this.delay(this.config.retryDelay * attempt);
        return this.makeRequest(data, attempt + 1);
      }

      throw error;
    }
  }

  /**
   * Create async generator for streaming response
   */
  async* createResponseStream(response) {
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep incomplete line in buffer

        for (const line of lines) {
          const trimmedLine = line.trim();
          if (trimmedLine) {
            try {
              const chunk = this.parseStreamChunk(trimmedLine);
              if (chunk) {
                yield chunk;
              }
            } catch (error) {
              this.logger.warn('Failed to parse stream chunk:', error);
            }
          }
        }
      }

      // Process any remaining buffer
      if (buffer.trim()) {
        try {
          const chunk = this.parseStreamChunk(buffer.trim());
          if (chunk) {
            yield chunk;
          }
        } catch (error) {
          this.logger.warn('Failed to parse final chunk:', error);
        }
      }

    } finally {
      reader.releaseLock();
      this.currentController = null;
    }
  }

  /**
   * Parse individual stream chunk
   */
  parseStreamChunk(line) {
    // Handle Server-Sent Events format
    if (line.startsWith('data: ')) {
      const data = line.substring(6);
      
      if (data === '[DONE]') {
        return { type: 'done' };
      }

      try {
        const parsed = JSON.parse(data);
        return this.processChunkData(parsed);
      } catch (error) {
        // Handle plain text chunks
        return {
          type: 'content',
          content: data
        };
      }
    }

    // Handle direct JSON chunks
    try {
      const parsed = JSON.parse(line);
      return this.processChunkData(parsed);
    } catch (error) {
      // Handle plain text
      return {
        type: 'content',
        content: line
      };
    }
  }

  /**
   * Process parsed chunk data
   */
  processChunkData(data) {
    // Handle different response formats
    if (data.choices && data.choices[0]) {
      const choice = data.choices[0];
      
      if (choice.delta && choice.delta.content) {
        return {
          type: 'content',
          content: choice.delta.content
        };
      }
      
      if (choice.message && choice.message.content) {
        return {
          type: 'content',
          content: choice.message.content
        };
      }
    }

    // Handle direct content
    if (data.content) {
      return {
        type: 'content',
        content: data.content
      };
    }

    // Handle sources/references
    if (data.sources || data.references) {
      return {
        type: 'sources',
        sources: data.sources || data.references
      };
    }

    // Handle metadata
    if (data.metadata) {
      return {
        type: 'metadata',
        metadata: data.metadata
      };
    }

    return null;
  }

  /**
   * Abort current request
   */
  abortCurrentRequest() {
    if (this.currentController) {
      this.currentController.abort();
      this.currentController = null;
      this.logger.info('Current request aborted');
    }
  }

  /**
   * Check if request is in progress
   */
  isRequestInProgress() {
    return this.currentController !== null;
  }

  /**
   * Generate conversation ID
   */
  generateConversationId() {
    return `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Delay utility for retries
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get API status
   */
  async getStatus() {
    try {
      const response = await fetch('/api/status', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        return await response.json();
      }

      return { status: 'unknown' };
    } catch (error) {
      this.logger.error('Failed to get API status:', error);
      return { status: 'error', error: error.message };
    }
  }
}
