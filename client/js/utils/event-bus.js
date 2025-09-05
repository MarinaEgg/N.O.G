/* ========== EVENT BUS UTILITY ========== */

/**
 * Event bus for decoupled communication between components
 */
export class EventBus {
  constructor() {
    this.events = new Map();
    this.wildcardEvents = new Map();
  }

  /**
   * Subscribe to an event
   * @param {string} eventName - Event name (supports wildcards with *)
   * @param {function} callback - Callback function
   * @param {object} options - Options (once, priority)
   */
  on(eventName, callback, options = {}) {
    if (typeof callback !== 'function') {
      throw new Error('Callback must be a function');
    }

    const { once = false, priority = 0 } = options;
    const listener = { callback, once, priority };

    if (eventName.includes('*')) {
      // Handle wildcard events
      if (!this.wildcardEvents.has(eventName)) {
        this.wildcardEvents.set(eventName, []);
      }
      this.wildcardEvents.get(eventName).push(listener);
    } else {
      // Handle regular events
      if (!this.events.has(eventName)) {
        this.events.set(eventName, []);
      }
      this.events.get(eventName).push(listener);
    }

    // Sort by priority (higher priority first)
    const listeners = eventName.includes('*') 
      ? this.wildcardEvents.get(eventName)
      : this.events.get(eventName);
    
    listeners.sort((a, b) => b.priority - a.priority);

    // Return unsubscribe function
    return () => this.off(eventName, callback);
  }

  /**
   * Subscribe to an event once
   */
  once(eventName, callback, options = {}) {
    return this.on(eventName, callback, { ...options, once: true });
  }

  /**
   * Unsubscribe from an event
   */
  off(eventName, callback) {
    const events = eventName.includes('*') ? this.wildcardEvents : this.events;
    
    if (events.has(eventName)) {
      const listeners = events.get(eventName);
      const index = listeners.findIndex(listener => listener.callback === callback);
      
      if (index !== -1) {
        listeners.splice(index, 1);
        
        // Clean up empty event arrays
        if (listeners.length === 0) {
          events.delete(eventName);
        }
      }
    }
  }

  /**
   * Emit an event
   */
  emit(eventName, data = null) {
    const results = [];

    // Emit to regular listeners
    if (this.events.has(eventName)) {
      const listeners = [...this.events.get(eventName)]; // Copy to avoid mutation issues
      
      for (const listener of listeners) {
        try {
          const result = listener.callback(data, eventName);
          results.push(result);
          
          // Remove one-time listeners
          if (listener.once) {
            this.off(eventName, listener.callback);
          }
        } catch (error) {
          console.error(`Error in event listener for "${eventName}":`, error);
        }
      }
    }

    // Emit to wildcard listeners
    for (const [pattern, listeners] of this.wildcardEvents) {
      if (this.matchesPattern(eventName, pattern)) {
        const listenersCopy = [...listeners]; // Copy to avoid mutation issues
        
        for (const listener of listenersCopy) {
          try {
            const result = listener.callback(data, eventName);
            results.push(result);
            
            // Remove one-time listeners
            if (listener.once) {
              this.off(pattern, listener.callback);
            }
          } catch (error) {
            console.error(`Error in wildcard event listener for "${pattern}":`, error);
          }
        }
      }
    }

    return results;
  }

  /**
   * Emit an event asynchronously
   */
  async emitAsync(eventName, data = null) {
    const promises = [];

    // Emit to regular listeners
    if (this.events.has(eventName)) {
      const listeners = [...this.events.get(eventName)];
      
      for (const listener of listeners) {
        try {
          const result = listener.callback(data, eventName);
          if (result instanceof Promise) {
            promises.push(result);
          }
          
          // Remove one-time listeners
          if (listener.once) {
            this.off(eventName, listener.callback);
          }
        } catch (error) {
          console.error(`Error in event listener for "${eventName}":`, error);
        }
      }
    }

    // Emit to wildcard listeners
    for (const [pattern, listeners] of this.wildcardEvents) {
      if (this.matchesPattern(eventName, pattern)) {
        const listenersCopy = [...listeners];
        
        for (const listener of listenersCopy) {
          try {
            const result = listener.callback(data, eventName);
            if (result instanceof Promise) {
              promises.push(result);
            }
            
            // Remove one-time listeners
            if (listener.once) {
              this.off(pattern, listener.callback);
            }
          } catch (error) {
            console.error(`Error in wildcard event listener for "${pattern}":`, error);
          }
        }
      }
    }

    return Promise.all(promises);
  }

  /**
   * Check if event name matches wildcard pattern
   */
  matchesPattern(eventName, pattern) {
    const regex = new RegExp(
      '^' + pattern.replace(/\*/g, '.*') + '$'
    );
    return regex.test(eventName);
  }

  /**
   * Get all event names
   */
  getEventNames() {
    return [
      ...Array.from(this.events.keys()),
      ...Array.from(this.wildcardEvents.keys())
    ];
  }

  /**
   * Get listener count for an event
   */
  getListenerCount(eventName) {
    let count = 0;
    
    if (this.events.has(eventName)) {
      count += this.events.get(eventName).length;
    }
    
    // Count wildcard matches
    for (const pattern of this.wildcardEvents.keys()) {
      if (this.matchesPattern(eventName, pattern)) {
        count += this.wildcardEvents.get(pattern).length;
      }
    }
    
    return count;
  }

  /**
   * Clear all listeners
   */
  clear() {
    this.events.clear();
    this.wildcardEvents.clear();
  }

  /**
   * Clear listeners for a specific event
   */
  clearEvent(eventName) {
    this.events.delete(eventName);
    this.wildcardEvents.delete(eventName);
  }
}
