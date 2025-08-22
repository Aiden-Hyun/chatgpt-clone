// Gradient Neumorphism theme - Light variant
// Features gradient backgrounds with enhanced neumorphic shadows

// Design tokens that are specific to the light variant of the gradient neumorphism theme
export const lightColors = {
  // Primary colors - Gradient-based
  primary: '#6366F1',      // Indigo for accent elements
  secondary: '#8B5CF6',    // Purple for secondary elements
  
  // Gradient color palettes
  gradients: {
    primary: ['#cacaca', '#f0f0f0'],      // Classic gray gradient
    secondary: ['#e0e5ec', '#f8f9fa'],    // Soft blue-gray gradient
    accent: ['#ff6b6b', '#ffa500'],       // Orange-red gradient
    success: ['#4ecdc4', '#44a08d'],      // Teal-green gradient
    warning: ['#ffd93d', '#ff6b6b'],      // Yellow-orange gradient
    error: ['#ff6b6b', '#ee5a52'],        // Red gradient
    neutral: ['#e8e8e8', '#f5f5f5'],      // Neutral gradient
    warm: ['#ffeaa7', '#fab1a0'],         // Warm gradient
    cool: ['#74b9ff', '#a29bfe'],         // Cool gradient
  },
  
  // Background colors - Optimized for gradients
  background: {
    primary: '#e0e0e0',    // Classic neumorphic background
    secondary: '#f0f0f0',  // Gradient end color
    tertiary: '#d8d8d8',   // Alternative gradient start
    avatar: '#e0e0e0',     // Avatar background
  },
  
  // Glass panel colors - For compatibility with other themes
  glass: {
    primary: 'rgba(255, 255, 255, 0.35)',
    secondary: 'rgba(255, 255, 255, 0.25)',
    tertiary: 'rgba(255, 255, 255, 0.2)',
    overlay: 'rgba(255, 255, 255, 0.15)',
  },
  
  // Claymorphism specific colors - For compatibility
  claymorphism: {
    background: '#e0e0e0',
    shadow: 'rgba(99, 102, 241, 0.2)',
    highlight: 'rgba(255, 255, 255, 0.6)',
    palette: {
      red: 'rgba(239, 68, 68, 0.8)',
      orange: 'rgba(245, 158, 11, 0.8)',
      yellow: 'rgba(251, 191, 36, 0.8)',
      green: 'rgba(34, 197, 94, 0.8)',
      teal: 'rgba(16, 185, 129, 0.8)',
      cyan: 'rgba(59, 130, 246, 0.8)',
      blue: 'rgba(59, 130, 246, 0.8)',
      indigo: 'rgba(99, 102, 241, 0.8)',
      purple: 'rgba(168, 85, 247, 0.8)',
      pink: 'rgba(236, 72, 153, 0.8)',
    },
  },
  
  // Text colors - High contrast for gradient backgrounds
  text: {
    primary: '#2d3748',         // Dark gray for primary text
    secondary: '#4a5568',       // Medium gray for secondary text
    tertiary: '#718096',        // Light gray for tertiary text
    quaternary: '#a0aec0',      // Very light gray for quaternary text
    inverted: '#ffffff',        // White for inverted text
  },
  
  // Border colors - Subtle borders for gradient elements
  border: {
    light: 'rgba(255, 255, 255, 0.6)',      // Light border
    medium: 'rgba(226, 232, 240, 0.4)',     // Medium border
    dark: 'rgba(203, 213, 225, 0.3)',       // Dark border
  },
  
  // Status colors - Gradient-compatible
  status: {
    success: {
      primary: '#48bb78',
      secondary: '#38a169',
      tertiary: '#2f855a',
      background: 'rgba(72, 187, 120, 0.1)',
      border: '#48bb78',
    },
    error: {
      primary: '#f56565',
      secondary: '#e53e3e',
      tertiary: '#c53030',
      background: 'rgba(245, 101, 101, 0.1)',
      border: '#f56565',
    },
    warning: {
      primary: '#ed8936',
      secondary: '#dd6b20',
      tertiary: '#c05621',
      background: 'rgba(237, 137, 54, 0.1)',
      border: '#ed8936',
    },
    info: {
      primary: '#4299e1',
      secondary: '#3182ce',
      tertiary: '#2b6cb0',
      background: 'rgba(66, 153, 225, 0.1)',
      border: '#4299e1',
    },
    neutral: {
      primary: '#718096',
      secondary: '#4a5568',
      tertiary: '#2d3748',
      background: 'rgba(113, 128, 150, 0.1)',
      border: '#e2e8f0',
    },
  },
  
  // Interactive States - Enhanced for gradients
  interactive: {
    hover: {
      primary: 'rgba(45, 55, 72, 0.04)',
      secondary: 'rgba(45, 55, 72, 0.08)',
      tertiary: 'rgba(45, 55, 72, 0.12)',
    },
    pressed: {
      primary: 'rgba(45, 55, 72, 0.08)',
      secondary: 'rgba(45, 55, 72, 0.12)',
      tertiary: 'rgba(45, 55, 72, 0.16)',
    },
    focus: {
      primary: 'rgba(99, 102, 241, 0.15)',
      secondary: 'rgba(99, 102, 241, 0.1)',
      tertiary: 'rgba(99, 102, 241, 0.05)',
    },
    disabled: {
      primary: 'rgba(160, 174, 192, 0.4)',
      secondary: 'rgba(160, 174, 192, 0.3)',
      tertiary: 'rgba(160, 174, 192, 0.2)',
    },
  },
  
  // Feedback Colors - Enhanced for gradients
  feedback: {
    loading: {
      primary: '#a0aec0',
      secondary: '#cbd5e0',
      pulse: 'rgba(99, 102, 241, 0.4)',
    },
    highlight: {
      primary: 'rgba(251, 191, 36, 0.8)',
      secondary: 'rgba(245, 158, 11, 0.7)',
      tertiary: 'rgba(217, 119, 6, 0.6)',
    },
    selection: {
      primary: 'rgba(99, 102, 241, 0.25)',
      secondary: 'rgba(99, 102, 241, 0.2)',
    },
    overlay: {
      light: 'rgba(45, 55, 72, 0.08)',
      medium: 'rgba(45, 55, 72, 0.15)',
      dark: 'rgba(45, 55, 72, 0.25)',
    },
  },
  
  // Button colors - Gradient-based
  button: {
    primary: '#ff6b6b',     // Uses gradient accent color
    secondary: '#cacaca',  // Uses gradient primary color
    text: '#ffffff',               // White text for gradient buttons
    secondaryText: '#2d3748',      // Dark text for light gradients
    disabled: 'rgba(160, 174, 192, 0.6)',
    disabledText: 'rgba(160, 174, 192, 0.8)',
  },
  
  // Message bubbles - Gradient-based
  message: {
    user: '#ff6b6b',        // Uses gradient accent color
    assistant: '#e0e0e0',  // Uses gradient neutral color
    userText: '#ffffff',           // White text for gradient backgrounds
    assistantText: '#2d3748',      // Dark text for light gradients
  },

  // Shadow colors - Enhanced for gradient backgrounds
  shadow: {
    light: 'rgba(255, 255, 255, 0.8)',  // Light shadow for highlights
    medium: 'rgba(90, 90, 90, 0.6)',    // Medium shadow for depth
    dark: 'rgba(90, 90, 90, 0.8)',      // Dark shadow for depth
  },

  // Code syntax highlighting colors - Enhanced
  syntax: {
    keyword: '#6366F1',        // Indigo for keywords
    string: '#e53e3e',         // Red for strings
    comment: '#38a169',        // Green for comments
    number: '#3182ce',         // Blue for numbers
    function: '#d69e2e',       // Yellow for function names
    variable: '#805ad5',       // Purple for variables
    operator: '#2d3748',       // Dark for operators
    background: 'rgba(248, 250, 252, 0.7)',
    type: '#38a169',           // Green for types
    builtin: '#6366F1',        // Indigo for built-in functions
    tag: '#e53e3e',            // Red for HTML tags
    attribute: '#d69e2e',      // Yellow for attributes
  },
};

// Light mode shadows - Using the specific neumorphic shadow values
export const lightShadows = {
  light: {
    shadowColor: '#bebebe',
    shadowOffset: { width: 20, height: 20 },
    shadowOpacity: 1,
    shadowRadius: 60,
    elevation: 20,
  },
  medium: {
    shadowColor: '#bebebe',
    shadowOffset: { width: 15, height: 15 },
    shadowOpacity: 1,
    shadowRadius: 45,
    elevation: 15,
  },
  heavy: {
    shadowColor: '#bebebe',
    shadowOffset: { width: 25, height: 25 },
    shadowOpacity: 1,
    shadowRadius: 75,
    elevation: 25,
  },
  // Classic neumorphic dual shadow system
  neumorphic: {
    light: {
      shadowColor: '#ffffff',
      shadowOffset: { width: -20, height: -20 },
      shadowOpacity: 1,
      shadowRadius: 60,
      elevation: 20,
    },
    dark: {
      shadowColor: '#bebebe',
      shadowOffset: { width: 20, height: 20 },
      shadowOpacity: 1,
      shadowRadius: 60,
      elevation: 20,
    },
  },
  // Inset neumorphic shadows for pressed state
  inset: {
    light: {
      shadowColor: '#ffffff',
      shadowOffset: { width: 20, height: 20 },
      shadowOpacity: 1,
      shadowRadius: 60,
      elevation: 20,
    },
    dark: {
      shadowColor: '#bebebe',
      shadowOffset: { width: -20, height: -20 },
      shadowOpacity: 1,
      shadowRadius: 60,
      elevation: 20,
    },
  },
};
