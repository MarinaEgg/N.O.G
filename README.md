# Architecture du Client Chat N.O.G

## Structure des Répertoires

```
client/
├── css/
│   ├── base/
│   │   └── layout.css              # Styles de base et layout principal
│   ├── components/
│   │   ├── chat-input.css          # Styles pour la barre de chat responsive
│   │   └── chat-features.css       # Styles pour les fonctionnalités du chat
│   ├── Button.css                  # Styles des boutons (existant)
│   ├── glass-buttons.css           # Styles des boutons glass (existant)
│   └── style.css                   # Styles principaux (existant, modifié)
├── js/
│   ├── config/
│   │   └── chat-config.js          # Configuration centralisée du chat
│   ├── components/
│   │   └── chat-input.js           # Gestionnaire de la barre de chat responsive
│   ├── chat.js                     # Logique principale du chat (existant, modifié)
│   ├── icons.js                    # Icônes (existant)
│   └── links.js                    # Gestion des liens (existant)
├── html/
│   ├── index.html                  # Page principale (modifiée)
│   ├── links.html                  # Page des liens (existant)
│   └── onboarding.html             # Page d'onboarding (existant)
└── img/                            # Images (existant)
```

## Nouvelles Fonctionnalités

### 1. Barre de Chat Responsive

La barre de chat est maintenant entièrement responsive avec les fonctionnalités suivantes :

- **Hauteur dynamique** : S'agrandit automatiquement quand l'utilisateur tape du texte
- **Hauteur minimale** : 40px par défaut
- **Hauteur maximale** : 200px avec scroll interne si nécessaire
- **Transition fluide** : Animation douce lors du redimensionnement
- **Support mobile** : Optimisé pour les appareils tactiles

#### Utilisation

```javascript
// Le gestionnaire est automatiquement initialisé
// Accès via window.chatInputManager

// Méthodes disponibles :
chatInputManager.setValue("Nouveau texte");
chatInputManager.getValue();
chatInputManager.focus();
chatInputManager.resetHeight();
chatInputManager.disable();
chatInputManager.enable();
```

### 2. Architecture Modulaire

#### Configuration Centralisée

Toute la configuration est centralisée dans `chat-config.js` :

```javascript
// Accès à la configuration
const inputConfig = getConfig('input');
const mobileBreakpoint = getConfig('responsive.mobileBreakpoint');

// Mise à jour de la configuration
updateConfig('input.maxHeight', 300);
```

#### Composants Séparés

- **ChatInputManager** : Gère la barre de chat responsive
- **Configuration** : Paramètres centralisés et configurables
- **Styles modulaires** : CSS organisé par fonctionnalité

### 3. Événements Personnalisés

Le système utilise des événements personnalisés pour la communication :

```javascript
// Écouter les changements d'input
document.addEventListener('chatInputChange', (event) => {
  console.log('Nouvelle valeur:', event.detail.value);
});

// Écouter l'envoi de messages
document.addEventListener('chatSendMessage', (event) => {
  console.log('Message envoyé:', event.detail.message);
});

// Écouter le redimensionnement
document.addEventListener('chatInputResize', (event) => {
  console.log('Nouvelles dimensions:', event.detail);
});
```

## Fonctionnalités Techniques

### Responsive Design

- **Mobile First** : Optimisé pour les appareils mobiles
- **Breakpoints** : 480px, 768px, 990px
- **Touch Friendly** : Boutons et zones de clic adaptés au tactile
- **Prévention du zoom** : Sur iOS lors du focus des inputs

### Performance

- **Transitions CSS** : Utilisation des transitions CSS pour les animations
- **Debouncing** : Évite les calculs excessifs lors du redimensionnement
- **Lazy Loading** : Chargement différé des composants non critiques

### Accessibilité

- **Navigation clavier** : Support complet du clavier
- **Screen readers** : Compatible avec les lecteurs d'écran
- **Contraste** : Respect des ratios de contraste WCAG
- **Focus indicators** : Indicateurs de focus visibles

## Migration depuis l'Ancien Code

### Fonctions de Compatibilité

Les anciennes fonctions sont maintenues pour la compatibilité :

```javascript
// Ancien code (toujours fonctionnel)
resizeTextarea(textarea);
resetChatBarHeight();

// Nouveau code (recommandé)
chatInputManager.resizeTextarea();
chatInputManager.resetHeight();
```

### Styles CSS

Les anciens styles sont préservés dans `style.css`, les nouveaux styles sont ajoutés dans les fichiers de composants.

## Configuration

### Variables CSS Personnalisables

```css
:root {
  --chat-input-min-height: 40px;
  --chat-input-max-height: 200px;
  --chat-container-min-height: 60px;
  --chat-height-offset: 0px;
  --chat-transition: all 0.2s ease;
}
```

### Configuration JavaScript

```javascript
// Dans chat-config.js
const ChatConfig = {
  input: {
    minHeight: 40,
    maxHeight: 200,
    lineHeight: 20,
    autoResize: true,
    submitOnEnter: true
  },
  // ... autres configurations
};
```

## Développement

### Ajout de Nouvelles Fonctionnalités

1. **Créer un nouveau composant** dans `js/components/`
2. **Ajouter les styles** dans `css/components/`
3. **Mettre à jour la configuration** dans `chat-config.js`
4. **Inclure les fichiers** dans `index.html`

### Tests

Pour tester les fonctionnalités :

1. **Test responsive** : Redimensionner la fenêtre
2. **Test mobile** : Utiliser les outils de développement mobile
3. **Test accessibilité** : Navigation au clavier uniquement
4. **Test performance** : Vérifier les animations fluides

## Support Navigateurs

- **Chrome** : 80+
- **Firefox** : 75+
- **Safari** : 13+
- **Edge** : 80+
- **Mobile** : iOS 13+, Android 8+

## Notes de Version

### v2.0.0 - Architecture Modulaire
- ✅ Barre de chat responsive
- ✅ Architecture modulaire
- ✅ Configuration centralisée
- ✅ Événements personnalisés
- ✅ Support mobile amélioré
- ✅ Compatibilité avec l'ancien code
