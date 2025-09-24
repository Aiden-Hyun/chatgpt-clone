// Glassmorphism theme - Dark variant
// Features frosted glass effect with proper transparency, blur, and subtle borders

// Design tokens that are specific to the dark variant of the glassmorphism theme
export const darkColors = {
  // Primary colors - Vibrant with higher transparency for glass effect
  primary: 'rgba(139, 92, 246, 0.85)',      // Vibrant violet with higher transparency
  secondary: 'rgba(236, 72, 153, 0.8)',     // Vibrant pink with transparency
  
  // Background colors - Dark backgrounds with higher transparency
  background: {
    primary: 'rgba(15, 23, 42, 0.85)',      // Slate-900 with higher transparency
    secondary: 'rgba(30, 41, 59, 0.8)',     // Slate-800 with transparency
    tertiary: 'rgba(51, 65, 85, 0.75)',     // Slate-700 with transparency
    avatar: 'rgba(71, 85, 105, 0.7)',       // Slate-600 with transparency
  },
  
  // Glass panel colors - These are specifically for glassmorphic UI elements
  glass: {
    primary: 'rgba(30, 41, 59, 0.5)',       // Slate-800 with 50% transparency for primary glass panels
    secondary: 'rgba(30, 41, 59, 0.4)',     // Slate-800 with 40% transparency for secondary glass panels
    tertiary: 'rgba(30, 41, 59, 0.3)',      // Slate-800 with 30% transparency for tertiary glass panels
  },
  
  // Claymorphism specific colors - For compatibility with claymorphism theme
  claymorphism: {
    // Base colors for clay elements
    background: 'rgba(15, 23, 42, 0.85)',     // Default clay color with transparency
    shadow: 'rgba(139, 92, 246, 0.3)',  // Shadow color with theme color
    highlight: 'rgba(255, 255, 255, 0.1)', // Highlight color with transparency
    
    // Vibrant palette for clay elements
    palette: {
      red: 'rgba(248, 113, 113, 0.8)',      // Red with transparency
      orange: 'rgba(251, 191, 36, 0.8)',   // Orange with transparency
      yellow: 'rgba(251, 191, 36, 0.8)',   // Yellow with transparency
      green: 'rgba(74, 222, 128, 0.8)',    // Green with transparency
      teal: 'rgba(52, 211, 153, 0.8)',     // Teal with transparency
      cyan: 'rgba(96, 165, 250, 0.8)',     // Cyan with transparency
      blue: 'rgba(96, 165, 250, 0.8)',     // Blue with transparency
      indigo: 'rgba(139, 92, 246, 0.8)',   // Indigo with transparency
      purple: 'rgba(139, 92, 246, 0.8)',   // Purple with transparency
      pink: 'rgba(236, 72, 153, 0.8)',     // Pink with transparency
    },
  },
  
  // Text colors - Solid colors for readability on glass backgrounds
  text: {
    primary: 'rgba(248, 250, 252, 1)',      // Slate-50, fully opaque for readability
    secondary: 'rgba(226, 232, 240, 1)',    // Slate-200, fully opaque
    tertiary: 'rgba(203, 213, 225, 1)',     // Slate-300, fully opaque
    quaternary: 'rgba(148, 163, 184, 1)',   // Slate-400, fully opaque
    inverted: 'rgba(15, 23, 42, 1)',        // Slate-900, fully opaque
  },
  

  
  // Status colors - More vibrant with higher transparency
  status: {
    success: {
      primary: 'rgba(74, 222, 128, 0.85)',   // Emerald-400 with transparency
      secondary: 'rgba(52, 211, 153, 0.8)',
      tertiary: 'rgba(16, 185, 129, 0.75)',
      background: 'rgba(6, 78, 59, 0.9)',
      border: 'rgba(6, 95, 70, 0.6)',
    },
    error: {
      primary: 'rgba(248, 113, 113, 0.85)',  // Red-400 with transparency
      secondary: 'rgba(236, 72, 153, 0.8)',
      tertiary: 'rgba(185, 28, 28, 0.75)',
      background: 'rgba(127, 29, 29, 0.9)',
      border: 'rgba(153, 27, 27, 0.6)',
    },
    warning: {
      primary: 'rgba(251, 191, 36, 0.85)',   // Amber-400 with transparency
      secondary: 'rgba(245, 158, 11, 0.8)',
      tertiary: 'rgba(217, 119, 6, 0.75)',
      background: 'rgba(120, 53, 15, 0.9)',
      border: 'rgba(146, 64, 14, 0.6)',
    },
    info: {
      primary: 'rgba(96, 165, 250, 0.85)',   // Blue-400 with transparency
      secondary: 'rgba(139, 92, 246, 0.8)',
      tertiary: 'rgba(37, 99, 235, 0.75)',
      background: 'rgba(30, 58, 138, 0.9)',
      border: 'rgba(37, 99, 235, 0.6)',
    },
    neutral: {
      primary: 'rgba(148, 163, 184, 0.85)',  // Slate-400 with transparency
      secondary: 'rgba(203, 213, 225, 0.8)',
      tertiary: 'rgba(226, 232, 240, 0.75)',
      background: 'rgba(30, 41, 59, 0.9)',
      border: 'rgba(51, 65, 85, 0.6)',
    },
  },
  
  // Interactive States - More pronounced feedback with transparency
  interactive: {
    hover: {
      primary: 'rgba(139, 92, 246, 0.2)',
      secondary: 'rgba(139, 92, 246, 0.25)',
      tertiary: 'rgba(139, 92, 246, 0.3)',
    },
    pressed: {
      primary: 'rgba(139, 92, 246, 0.25)',
      secondary: 'rgba(139, 92, 246, 0.3)',
      tertiary: 'rgba(139, 92, 246, 0.35)',
    },
    focus: {
      primary: 'rgba(139, 92, 246, 0.35)',
      secondary: 'rgba(139, 92, 246, 0.3)',
      tertiary: 'rgba(139, 92, 246, 0.25)',
    },
    disabled: {
      primary: 'rgba(100, 116, 139, 0.6)',
      secondary: 'rgba(100, 116, 139, 0.5)',
      tertiary: 'rgba(100, 116, 139, 0.4)',
    },
  },
  
  // Feedback Colors - More vibrant with transparency
  feedback: {
    loading: {
      primary: 'rgba(148, 163, 184, 0.9)',
      secondary: 'rgba(203, 213, 225, 0.8)',
      pulse: 'rgba(139, 92, 246, 0.4)',
    },
    highlight: {
      primary: 'rgba(245, 158, 11, 0.8)',
      secondary: 'rgba(217, 119, 6, 0.7)',
      tertiary: 'rgba(180, 83, 9, 0.6)',
    },
    selection: {
      primary: 'rgba(139, 92, 246, 0.3)',
      secondary: 'rgba(139, 92, 246, 0.25)',
    },
    overlay: {
      light: 'rgba(0, 0, 0, 0.4)',
      medium: 'rgba(0, 0, 0, 0.6)',
      dark: 'rgba(0, 0, 0, 0.8)',
    },
  },
  
  // Button colors - Glassmorphic buttons with vibrant colors
  button: {
    primary: 'rgba(139, 92, 246, 0.85)',     // Violet with transparency
    secondary: 'rgba(51, 65, 85, 0.6)',     // Slate-700 with transparency for glass effect
    text: 'rgba(15, 23, 42, 1)',            // Dark text, fully opaque for readability
    secondaryText: 'rgba(248, 250, 252, 1)', // Light text, fully opaque for readability
    disabled: 'rgba(71, 85, 105, 0.6)',      // Slate-600 with transparency
    disabledText: 'rgba(148, 163, 184, 0.8)', // Light gray with transparency
  },
  
  // Message bubbles - Glassmorphic message bubbles with vibrant colors
  message: {
    user: 'rgba(139, 92, 246, 0.85)',        // Violet with transparency
    assistant: 'rgba(51, 65, 85, 0.6)',     // Slate-700 with transparency for glass effect
    userText: 'rgba(248, 250, 252, 1)',     // Light text, fully opaque for readability
    assistantText: 'rgba(248, 250, 252, 1)', // Light text, fully opaque for readability
  },



  // Code syntax highlighting colors - More vibrant VS Code Dark+ inspired
  syntax: {
    keyword: 'rgba(139, 92, 246, 1)',        // Violet for keywords
    string: 'rgba(236, 72, 153, 1)',         // Pink for strings
    comment: 'rgba(74, 222, 128, 1)',       // Emerald for comments
    number: 'rgba(52, 211, 153, 1)',        // Emerald-400 for numbers
    function: 'rgba(251, 191, 36, 1)',       // Amber for function names
    variable: 'rgba(96, 165, 250, 1)',       // Blue for variables
    operator: 'rgba(248, 250, 252, 1)',      // Slate-50 for operators
    background: 'rgba(30, 41, 59, 0.7)',     // Slate-800 background with transparency
    type: 'rgba(52, 211, 153, 1)',          // Emerald-400 for types
    builtin: 'rgba(139, 92, 246, 1)',       // Violet for built-in functions
    tag: 'rgba(236, 72, 153, 1)',            // Pink for HTML tags
    attribute: 'rgba(251, 191, 36, 1)',      // Amber for attributes
  },
};

// Dark mode shadows - Enhanced for glassmorphism
export const darkShadows = {
  light: {
    shadowColor: 'rgba(139, 92, 246, 0.3)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 3,
  },
  medium: {
    shadowColor: 'rgba(139, 92, 246, 0.4)',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 6,
  },
  heavy: {
    shadowColor: 'rgba(139, 92, 246, 0.5)',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 12,
  },
  button: {
    shadowColor: 'rgba(139, 92, 246, 0.4)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  card: {
    shadowColor: 'rgba(139, 92, 246, 0.3)',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
};