# JavaScript Architecture - nOg Legal Chatbot

This directory contains the refactored JavaScript architecture for the nOg Legal Chatbot, organized into a modular, maintainable structure suitable for professional handoff.

## 🏗️ Architecture Overview

The JavaScript architecture follows modern patterns with:
- **Modular Components**: Self-contained, reusable components
- **Event-Driven Communication**: Decoupled components using event bus
- **Centralized Configuration**: Single source of truth for settings
- **Utility Classes**: Shared functionality across components
- **Professional Structure**: Clear separation of concerns

## 📁 Directory Structure

```
js/
├── main.js                     # 🎯 Application entry point
├── app.js                      # 🏠 Main application orchestrator
├── components/                 # 🧩 UI Components
│   ├── chat-container.js       # 💬 Chat messages container
│   ├── chat-input.js          # ⌨️ Responsive input manager (existing)
│   ├── message-renderer.js     # 📝 Message rendering and formatting
│   ├── sidebar-manager.js      # 📋 Conversations sidebar
│   └── modal-manager.js        # 🔲 Modal dialogs (library, links)
├── utils/                      # 🔧 Utility Classes
│   ├── api-client.js          # 🌐 HTTP API communication
│   ├── storage-manager.js      # 💾 Local storage operations
│   ├── event-bus.js           # 📡 Event system
│   ├── logger.js              # 📊 Logging utility
│   ├── dom-helpers.js         # 🎨 DOM manipulation helpers
│   └── validators.js          # ✅ Input validation
├── config/                     # ⚙️ Configuration
│   └── chat-config.js         # 📋 Application configuration (existing)
├── libs/                       # 📚 Third-party libraries
│   ├── highlight.min.js       # 🎨 Syntax highlighting
│   └── highlightjs-copy.min.js # 📋 Copy button plugin
└── README.md                   # 📖 This documentation
```

## 🎯 Core Components

### **main.js** - Application Entry Point
- Initializes the application when DOM is ready
- Handles global error catching
- Sets up debugging tools in development mode

### **app.js** - Application Orchestrator
- Main application class that coordinates all components
- Manages application state and lifecycle
- Handles high-level event coordination
- Provides centralized error handling

### **Components** (`components/`)

#### **chat-container.js** - Chat Messages Container
- Manages the messages display area
- Handles message rendering and updates
- Manages scroll behavior and message history
- Coordinates with message renderer

#### **chat-input.js** - Responsive Input Manager ✅
- **Status**: Already implemented and working
- Auto-expanding textarea with height limits
- Mobile-optimized touch interactions
- Keyboard shortcuts and event handling

#### **message-renderer.js** - Message Rendering
- Renders user and assistant messages
- Handles markdown parsing and syntax highlighting
- Manages message actions (copy, like, dislike)
- Processes streaming message updates

#### **sidebar-manager.js** - Conversations Sidebar
- Manages conversation list display
- Handles conversation creation/deletion
- Manages active conversation state
- Integrates with storage manager

#### **modal-manager.js** - Modal Dialogs
- Manages library and links modals
- Handles modal open/close animations
- Manages modal content loading
- Provides modal event handling

### **Utilities** (`utils/`)

#### **api-client.js** - HTTP API Communication
- Handles all backend API communication
- Manages streaming responses
- Implements retry logic and error handling
- Provides request cancellation

#### **storage-manager.js** - Local Storage Operations
- Manages conversation persistence
- Handles conversation history
- Provides data export/import functionality
- Manages storage cleanup and optimization

#### **event-bus.js** - Event System
- Decoupled communication between components
- Supports wildcard event patterns
- Provides async event handling
- Includes priority-based event ordering

#### **logger.js** - Logging Utility
- Consistent logging across the application
- Configurable log levels and outputs
- Storage-based logging for debugging
- Development and production modes

## 🔄 Migration from Legacy Code

### **Current State**
- `chat.js` - Large monolithic file (2400+ lines) ❌
- Mixed concerns and responsibilities ❌
- Global variables and functions ❌
- Difficult to maintain and test ❌

### **New Architecture Benefits**
- **Modular**: Each component has a single responsibility ✅
- **Testable**: Components can be unit tested independently ✅
- **Maintainable**: Clear structure and documentation ✅
- **Scalable**: Easy to add new features and components ✅
- **Professional**: Industry-standard patterns and practices ✅

### **Migration Strategy**

#### Phase 1: Core Infrastructure ✅
- [x] Create main.js entry point
- [x] Create app.js orchestrator
- [x] Implement utility classes (logger, event-bus, api-client, storage-manager)
- [x] Move third-party libraries to libs/

#### Phase 2: Component Extraction 🚧
- [ ] Extract message rendering from chat.js → message-renderer.js
- [ ] Extract chat container logic → chat-container.js
- [ ] Extract sidebar management → sidebar-manager.js
- [ ] Extract modal management → modal-manager.js

#### Phase 3: Integration & Testing 📋
- [ ] Update HTML to use new entry point
- [ ] Test all functionality with new architecture
- [ ] Remove legacy chat.js file
- [ ] Update documentation

## 🎨 Event System

The new architecture uses an event-driven approach for component communication:

```javascript
// Example: Sending a message
eventBus.emit('chat:sendMessage', { message: 'Hello' });

// Example: Listening for events
eventBus.on('message:received', (data) => {
  console.log('New message:', data.message);
});

// Example: Wildcard events
eventBus.on('chat:*', (data, eventName) => {
  console.log('Chat event:', eventName, data);
});
```

### **Key Events**
- `chat:sendMessage` - User sends a message
- `chat:stopGeneration` - Stop message generation
- `message:received` - New message received
- `conversation:new` - Create new conversation
- `conversation:delete` - Delete conversation
- `modal:openLibrary` - Open library modal
- `error:*` - Error events (wildcard)

## 🔧 Configuration

All configuration is centralized in `config/chat-config.js`:

```javascript
// Access configuration
const inputConfig = getConfig('input.maxHeight');
const apiEndpoint = getConfig('api.endpoint');

// Update configuration
updateConfig('debug.enabled', true);
```

## 🚀 Usage

### **Development Setup**
1. Include the main.js file in your HTML:
```html
<script type="module" src="/assets/js/main.js"></script>
```

2. The application will automatically initialize when DOM is ready

3. Enable debug mode for development:
```javascript
updateConfig('debug.enabled', true);
updateConfig('debug.logLevel', 'debug');
```

### **Production Setup**
1. Set production configuration:
```javascript
updateConfig('debug.enabled', false);
updateConfig('debug.logLevel', 'error');
```

2. Consider bundling modules for better performance

## 🧪 Testing Strategy

### **Unit Testing**
Each component can be tested independently:
```javascript
// Example: Testing the logger
import { Logger } from './utils/logger.js';

const logger = new Logger('Test');
logger.info('Test message');
```

### **Integration Testing**
Test component interactions through the event bus:
```javascript
// Example: Testing message sending
eventBus.emit('chat:sendMessage', { message: 'test' });
// Assert expected behavior
```

### **End-to-End Testing**
Test complete user workflows:
- Send message → Receive response → Display in chat
- Create conversation → Send messages → Save to storage
- Open modal → Load content → Close modal

## 📊 Performance Considerations

### **Lazy Loading**
- Components are loaded only when needed
- Third-party libraries loaded on demand
- Modal content loaded when opened

### **Memory Management**
- Event listeners properly cleaned up
- Storage cleanup for old conversations
- Request cancellation to prevent memory leaks

### **Optimization**
- Debounced input handling
- Efficient DOM updates
- Minimal re-renders

## 🔍 Debugging

### **Debug Mode**
Enable debug mode to access debugging tools:
```javascript
// Enable debug mode
updateConfig('debug.enabled', true);

// Access app instance
window.nogApp.getState();

// View logs
Logger.getLogs();

// Monitor events
eventBus.on('*', (data, eventName) => {
  console.log('Event:', eventName, data);
});
```

### **Common Issues**
1. **Components not initializing**: Check console for errors
2. **Events not firing**: Verify event names and listeners
3. **API requests failing**: Check network tab and API client logs
4. **Storage issues**: Check localStorage availability and quotas

## 🌍 Browser Support

- **Modern Browsers**: Chrome 80+, Firefox 75+, Safari 13+, Edge 80+
- **ES6 Modules**: Required for the new architecture
- **LocalStorage**: Required for conversation persistence
- **Fetch API**: Required for API communication

## 📋 Next Steps

1. **Complete Migration**: Finish extracting components from legacy chat.js
2. **Add Testing**: Implement unit and integration tests
3. **Bundle Optimization**: Consider webpack/rollup for production
4. **TypeScript**: Consider migrating to TypeScript for better type safety
5. **PWA Features**: Add service worker for offline functionality

## 🤝 Contributing

When adding new components or features:

1. **Follow the established patterns**: Use event bus for communication
2. **Add proper logging**: Use the Logger utility for consistent logging
3. **Update configuration**: Add new settings to chat-config.js
4. **Document changes**: Update this README and add inline documentation
5. **Test thoroughly**: Ensure new code doesn't break existing functionality

This architecture provides a solid foundation for the nOg Legal Chatbot that is maintainable, scalable, and ready for professional handoff.
