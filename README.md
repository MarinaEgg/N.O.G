# CSS Architecture - nOg Legal Chatbot Interface

This directory contains the CSS architecture for the nOg Legal Chatbot interface, organized into a modular structure for better maintainability and performance.

## 🏗️ Complete Interface Architecture

The nOg interface is a modern chat application with the following main components:

### **Main Interface Layout**
- **Left Sidebar**: Conversations list with media access and controls
- **Center Panel**: Chat conversation area with messages
- **Input Area**: Responsive chat input with send button
- **Navigation**: Top navigation bar for different sections
- **Modals**: Side navigation panels for media and links

## 📁 CSS Directory Structure

```
css/
├── index.css                    # 🎯 Main CSS entry point (imports all files)
├── style.css                    # 🏠 Core application UI and layout
├── Button.css                   # 🔘 Legacy button styles (deprecated)
├── Button copy.css              # 📋 Backup of legacy buttons
├── README.md                    # 📖 This documentation
├── base/                        # 🏗️ Foundation layer
│   ├── layout.css              # 📐 Main layout structure and responsive design
│   ├── variables.css           # 🎨 CSS custom properties and design tokens
│   ├── reset.css               # 🔄 CSS reset and base element styles
│   └── typography.css          # ✍️ Font definitions and text styling
└── components/                  # 🧩 Modular UI components
    ├── chat-input.css          # 💬 Responsive chat input bar
    ├── chat-features.css       # 🔧 Chat functionality styles
    ├── tables.css              # 📊 Advanced glassmorphic tables
    ├── glass-buttons.css       # ✨ Glass morphism button effects
    └── code-blocks.css         # 💻 Code syntax highlighting
```

## 📋 Detailed File Descriptions

### 🎯 Entry Point

#### `index.css`
**Purpose**: Main CSS entry point that imports all stylesheets  
**Usage**: Link this single file in HTML to load all styles  
```html
<link rel="stylesheet" href="/assets/css/index.css">
```

### 🏠 Core Application Files

#### `style.css`
**Purpose**: Core application UI components and specific styling  
**Contains**:
- Conversation sidebar styling
- Message display and formatting
- Modal overlays and side navigation
- Application-specific UI elements
- Legacy styles being gradually migrated

### 🏗️ Foundation Layer (`base/`)

#### `layout.css`
**Purpose**: Main layout structure and responsive framework  
**Contains**:
- Grid layout system (`.row`, `.column`)
- Main conversation container
- Message area scrolling and layout
- Navigation positioning
- Responsive breakpoints (990px, 768px, 480px)
- Mobile-first responsive design
- Scrollbar customization

#### `variables.css`
**Purpose**: Design system foundation with CSS custom properties  
**Contains**:
- Color palette (whites, grays, accent yellow)
- Spacing scale (`--section-gap`, `--body-gap`)
- Typography scale (`--font-1`)
- Border radius values
- Component-specific variables

#### `reset.css`
**Purpose**: Browser normalization and base element styling  
**Contains**:
- CSS reset rules
- Box-sizing normalization
- Base HTML/body setup
- Font family inheritance

#### `typography.css`
**Purpose**: Text styling and font definitions  
**Contains**:
- Google Fonts imports (Inter font family)
- Heading hierarchy (h1-h6)
- Text formatting (bold, italic, emphasis)
- List and blockquote styling
- Paragraph defaults

### 🧩 UI Components (`components/`)

#### `chat-input.css`
**Purpose**: Responsive chat input bar with dynamic sizing  
**Features**:
- Auto-expanding textarea (40px to 200px height)
- Smooth height transitions
- Mobile-optimized touch targets
- Send button integration
- Scroll handling for long messages

#### `chat-features.css`
**Purpose**: Chat functionality and interaction styles  
**Features**:
- Message actions (copy, like, dislike)
- Typing indicators
- Stop generation button
- Message animations
- User/assistant message differentiation

#### `tables.css`
**Purpose**: Advanced glassmorphic table styling  
**Features**:
- 3D "pull" hover effects
- Animated gradient borders
- Glassmorphic backgrounds with blur
- Touch device optimizations
- Responsive table containers

#### `glass-buttons.css`
**Purpose**: Glass morphism effects for interactive buttons  
**Features**:
- Frosted glass appearance
- Animated conic gradient borders
- Hover and active state animations
- High specificity overrides
- Touch-friendly interactions

**Targets**:
- "New conversation" button
- "Delete conversations" button
- Send message button
- Media page buttons

#### `code-blocks.css`
**Purpose**: Code display and syntax highlighting  
**Features**:
- Highlight.js integration
- Frosted glass code containers
- Inline vs block code styling
- Custom syntax color scheme
- Copy-friendly formatting

## 🎨 Design System

### Color Palette
```css
--colour-1: #ffffff;        /* Primary background */
--colour-3: #2f2f2e;        /* Primary text */
--colour-4: #f9e479;        /* Accent yellow */
--light-gray: #f7f7f7;      /* UI backgrounds */
--blur-border: rgba(0,0,0,0.251); /* Glass borders */
```

### Layout System
- **Main Layout**: Flexbox-based row/column system
- **Responsive**: Mobile-first with 3 breakpoints
- **Spacing**: Consistent gap system using CSS variables
- **Typography**: Inter font family with weight variations

### Visual Effects
- **Glassmorphism**: Backdrop blur with subtle transparency
- **3D Interactions**: Transform-based hover effects
- **Smooth Animations**: CSS transitions with custom easing
- **Dot Pattern**: Subtle background texture

## 🚀 Usage in HTML

The HTML structure uses this CSS architecture:

```html
<!DOCTYPE html>
<html>
<head>
  <!-- Core CSS imports -->
  <link rel="stylesheet" href="/assets/css/base/layout.css" />
  <link rel="stylesheet" href="/assets/css/components/chat-input.css" />
  <link rel="stylesheet" href="/assets/css/components/chat-features.css" />
  <link rel="stylesheet" href="/assets/css/style.css" />
  <link rel="stylesheet" href="/assets/css/glass-buttons.css" />
</head>
<body>
  <div class="row">
    <!-- Left sidebar -->
    <div class="conversations shadow">
      <button class="new_convo">New conversation</button>
    </div>
    
    <!-- Main chat area -->
    <div class="conversation disable-scrollbars">
      <div id="messages"></div>
      <div class="user-input-container">
        <textarea id="message-input"></textarea>
        <div id="send-button"></div>
      </div>
    </div>
  </div>
</body>
</html>
```

## 📱 Responsive Design

### Breakpoints
- **Desktop**: > 990px (full sidebar visible)
- **Tablet**: 768px - 990px (sidebar hidden)
- **Mobile**: < 768px (optimized touch targets)
- **Small Mobile**: < 480px (compact layout)

### Mobile Optimizations
- Touch-friendly button sizes
- Optimized input area
- Simplified navigation
- Reduced spacing and padding

## 🔧 Development Guidelines

### Adding New Components
1. Create new file in `components/` directory
2. Follow naming convention: `component-name.css`
3. Include component-specific CSS variables
4. Add responsive considerations
5. Update this documentation

### Modifying Existing Styles
1. **Layout changes**: Edit `base/layout.css`
2. **Color/spacing**: Update `base/variables.css`
3. **Component styles**: Edit respective component file
4. **Core UI**: Modify `style.css` (gradually migrate to components)

### Performance Considerations
- Use CSS custom properties for theming
- Minimize specificity conflicts
- Leverage CSS containment where possible
- Optimize for mobile-first loading

## 🔄 Migration Status

This architecture represents an ongoing migration from a monolithic CSS structure:

### ✅ Completed
- Table styles → `components/tables.css`
- Glass buttons → `components/glass-buttons.css`
- Code blocks → `components/code-blocks.css`
- Base layout → `base/layout.css`
- Typography → `base/typography.css`

### 🚧 In Progress
- Chat input → `components/chat-input.css`
- Chat features → `components/chat-features.css`
- Conversation styles (in `style.css`)

### 📋 Planned
- Modal system → `components/modals.css`
- Navigation → `components/navigation.css`
- Sidebar → `components/sidebar.css`

## 🌍 Browser Support

- **Chrome**: 80+
- **Firefox**: 75+
- **Safari**: 13+
- **Edge**: 80+
- **Mobile**: iOS 13+, Android 8+

Optimized for modern browsers with CSS Grid, Flexbox, and backdrop-filter support.
