/* ========== MAIN APPLICATION ENTRY POINT ========== */

/**
 * Main application initialization
 * This file serves as the entry point for the nOg chat application
 */

import { ChatApplication } from './app.js';
import { Logger } from './utils/logger.js';

// Initialize logger
const logger = new Logger('Main');

/**
 * Initialize the application when DOM is ready
 */
document.addEventListener('DOMContentLoaded', async () => {
  try {
    logger.info('Initializing nOg Chat Application...');
    
    // Initialize the main application
    const app = new ChatApplication();
    await app.initialize();
    
    // Make app globally available for debugging
    if (window.ChatConfig?.debug?.enabled) {
      window.nogApp = app;
    }
    
    logger.info('Application initialized successfully');
    
  } catch (error) {
    logger.error('Failed to initialize application:', error);
    
    // Show user-friendly error message
    const errorContainer = document.createElement('div');
    errorContainer.className = 'app-error';
    errorContainer.innerHTML = `
      <div class="error-content">
        <h2>Application Error</h2>
        <p>Failed to initialize the chat application. Please refresh the page.</p>
        <button onclick="window.location.reload()">Refresh Page</button>
      </div>
    `;
    document.body.appendChild(errorContainer);
  }
});

/**
 * Handle unhandled errors
 */
window.addEventListener('error', (event) => {
  logger.error('Unhandled error:', event.error);
});

/**
 * Handle unhandled promise rejections
 */
window.addEventListener('unhandledrejection', (event) => {
  logger.error('Unhandled promise rejection:', event.reason);
  event.preventDefault();
});
