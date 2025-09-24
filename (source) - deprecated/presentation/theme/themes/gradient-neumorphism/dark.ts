// Gradient Neumorphism theme - Dark variant
// Features dark gradient backgrounds with enhanced neumorphic shadows

// Design tokens that are specific to the dark variant of the gradient neumorphism theme
export const darkColors = {
  // Primary colors - Gradient-based
  primary: '#8B5CF6',      // Purple for accent elements
  secondary: '#A78BFA',    // Light purple for secondary elements
  
  // Gradient color palettes - Dark variants
  gradients: {
    primary: ['#2d3748', '#4a5568'],      // Dark gray gradient
    secondary: ['#1a202c', '#2d3748'],    // Darker gray gradient
    accent: ['#ff6b6b', '#ff8e53'],       // Bright orange-red gradient
    success: ['#38a169', '#48bb78'],      // Green gradient
    warning: ['#d69e2e', '#ed8936'],      // Orange gradient
    error: ['#e53e3e', '#f56565'],        // Red gradient
    neutral: ['#2d3748', '#4a5568'],      // Dark neutral gradient
    warm: ['#744210', '#975a16'],         // Dark warm gradient
    cool: ['#2c5282', '#3182ce'],         // Dark cool gradient
  },
  
  // Background colors - Optimized for dark gradients
  background: {
    primary: '#2d3748',    // Dark neumorphic background
    secondary: '#4a5568',  // Gradient end color
    tertiary: '#1a202c',   // Alternative gradient start
    avatar: '#2d3748',     // Avatar background
  },
  
  // Glass panel colors - For compatibility with other themes
  glass: {
    primary: 'rgba(45, 55, 72, 0.5)',
    secondary: 'rgba(45, 55, 72, 0.4)',
    tertiary: 'rgba(45, 55, 72, 0.3)',
  },
  
  // Claymorphism specific colors - For compatibility
  claymorphism: {
    background: '#2d3748',
    shadow: 'rgba(139, 92, 246, 0.3)',
    highlight: 'rgba(255, 255, 255, 0.1)',
    palette: {
      red: 'rgba(248, 113, 113, 0.8)',
      orange: 'rgba(251, 191, 36, 0.8)',
      yellow: 'rgba(251, 191, 36, 0.8)',
      green: 'rgba(74, 222, 128, 0.8)',
      teal: 'rgba(52, 211, 153, 0.8)',
      cyan: 'rgba(96, 165, 250, 0.8)',
      blue: 'rgba(96, 165, 250, 0.8)',
      indigo: 'rgba(139, 92, 246, 0.8)',
      purple: 'rgba(139, 92, 246, 0.8)',
      pink: 'rgba(236, 72, 153, 0.8)',
    },
  },
  
  // Text colors - High contrast for dark gradient backgrounds
  text: {
    primary: '#f7fafc',         // Light gray for primary text
    secondary: '#e2e8f0',       // Medium light gray for secondary text
    tertiary: '#cbd5e0',        // Medium gray for tertiary text
    quaternary: '#a0aec0',      // Light gray for quaternary text
    inverted: '#2d3748',        // Dark for inverted text
  },
  

  
  // Status colors - Dark gradient-compatible
  status: {
    success: {
      primary: '#48bb78',
      secondary: '#38a169',
      tertiary: '#2f855a',
      background: 'rgba(72, 187, 120, 0.2)',
      border: '#48bb78',
    },
    error: {
      primary: '#f56565',
      secondary: '#e53e3e',
      tertiary: '#c53030',
      background: 'rgba(245, 101, 101, 0.2)',
      border: '#f56565',
    },
    warning: {
      primary: '#ed8936',
      secondary: '#dd6b20',
      tertiary: '#c05621',
      background: 'rgba(237, 137, 54, 0.2)',
      border: '#ed8936',
    },
    info: {
      primary: '#4299e1',
      secondary: '#3182ce',
      tertiary: '#2b6cb0',
      background: 'rgba(66, 153, 225, 0.2)',
      border: '#4299e1',
    },
    neutral: {
      primary: '#a0aec0',
      secondary: '#cbd5e0',
      tertiary: '#e2e8f0',
      background: 'rgba(160, 174, 192, 0.2)',
      border: '#4a5568',
    },
  },
  
  // Interactive States - Enhanced for dark gradients
  interactive: {
    hover: {
      primary: 'rgba(247, 250, 252, 0.04)',
      secondary: 'rgba(247, 250, 252, 0.08)',
      tertiary: 'rgba(247, 250, 252, 0.12)',
    },
    pressed: {
      primary: 'rgba(247, 250, 252, 0.08)',
      secondary: 'rgba(247, 250, 252, 0.12)',
      tertiary: 'rgba(247, 250, 252, 0.16)',
    },
    focus: {
      primary: 'rgba(139, 92, 246, 0.15)',
      secondary: 'rgba(139, 92, 246, 0.1)',
      tertiary: 'rgba(139, 92, 246, 0.05)',
    },
    disabled: {
      primary: 'rgba(160, 174, 192, 0.4)',
      secondary: 'rgba(160, 174, 192, 0.3)',
      tertiary: 'rgba(160, 174, 192, 0.2)',
    },
  },
  
  // Feedback Colors - Enhanced for dark gradients
  feedback: {
    loading: {
      primary: '#a0aec0',
      secondary: '#cbd5e0',
      pulse: 'rgba(139, 92, 246, 0.4)',
    },
    highlight: {
      primary: 'rgba(251, 191, 36, 0.8)',
      secondary: 'rgba(245, 158, 11, 0.7)',
      tertiary: 'rgba(217, 119, 6, 0.6)',
    },
    selection: {
      primary: 'rgba(139, 92, 246, 0.25)',
      secondary: 'rgba(139, 92, 246, 0.2)',
    },
    overlay: {
      light: 'rgba(247, 250, 252, 0.08)',
      medium: 'rgba(247, 250, 252, 0.15)',
      dark: 'rgba(247, 250, 252, 0.25)',
    },
  },
  
  // Button colors - Dark gradient-based
  button: {
    primary: '#ff6b6b',     // Uses gradient accent color
    secondary: '#2d3748',  // Uses gradient primary color
    text: '#ffffff',               // White text for gradient buttons
    secondaryText: '#f7fafc',      // Light text for dark gradients
    disabled: 'rgba(160, 174, 192, 0.6)',
    disabledText: 'rgba(160, 174, 192, 0.8)',
  },
  
  // Message bubbles - Dark gradient-based
  message: {
    user: '#ff6b6b',        // Uses gradient accent color
    assistant: '#2d3748',  // Uses gradient neutral color
    userText: '#ffffff',           // White text for gradient backgrounds
    assistantText: '#f7fafc',      // Light text for dark gradients
  },



  // Code syntax highlighting colors - Dark theme
  syntax: {
    keyword: '#8B5CF6',        // Purple for keywords
    string: '#f56565',         // Red for strings
    comment: '#48bb78',        // Green for comments
    number: '#4299e1',         // Blue for numbers
    function: '#ed8936',       // Orange for function names
    variable: '#a78bfa',       // Light purple for variables
    operator: '#f7fafc',       // Light for operators
    background: 'rgba(45, 55, 72, 0.7)',
    type: '#48bb78',           // Green for types
    builtin: '#8B5CF6',        // Purple for built-in functions
    tag: '#f56565',            // Red for HTML tags
    attribute: '#ed8936',      // Orange for attributes
  },
};

// Dark mode shadows - Using neumorphic shadow values for dark theme
export const darkShadows = {
  light: {
    shadowColor: '#1a202c',
    shadowOffset: { width: 20, height: 20 },
    shadowOpacity: 1,
    shadowRadius: 60,
    elevation: 20,
  },
  medium: {
    shadowColor: '#1a202c',
    shadowOffset: { width: 15, height: 15 },
    shadowOpacity: 1,
    shadowRadius: 45,
    elevation: 15,
  },
  heavy: {
    shadowColor: '#1a202c',
    shadowOffset: { width: 25, height: 25 },
    shadowOpacity: 1,
    shadowRadius: 75,
    elevation: 25,
  },
  button: {
    shadowColor: '#1a202c',
    shadowOffset: { width: 12, height: 12 },
    shadowOpacity: 1,
    shadowRadius: 36,
    elevation: 12,
  },
  card: {
    shadowColor: '#1a202c',
    shadowOffset: { width: 18, height: 18 },
    shadowOpacity: 1,
    shadowRadius: 54,
    elevation: 18,
  },
  // Classic neumorphic dual shadow system for dark theme
  neumorphic: {
    light: {
      shadowColor: '#4a5568',
      shadowOffset: { width: -20, height: -20 },
      shadowOpacity: 1,
      shadowRadius: 60,
      elevation: 20,
    },
    dark: {
      shadowColor: '#1a202c',
      shadowOffset: { width: 20, height: 20 },
      shadowOpacity: 1,
      shadowRadius: 60,
      elevation: 20,
    },
  },
  // Inset neumorphic shadows for pressed state
  inset: {
    light: {
      shadowColor: '#4a5568',
      shadowOffset: { width: 20, height: 20 },
      shadowOpacity: 1,
      shadowRadius: 60,
      elevation: 20,
    },
    dark: {
      shadowColor: '#1a202c',
      shadowOffset: { width: -20, height: -20 },
      shadowOpacity: 1,
      shadowRadius: 60,
      elevation: 20,
    },
  },
};
