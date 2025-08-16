// Glassmorphism theme - Light variant
// Features frosted glass effect with proper transparency, blur, and subtle borders

// Design tokens that are specific to the light variant of the glassmorphism theme
export const lightColors = {
  // Primary colors - Vibrant with higher transparency for glass effect
  primary: 'rgba(99, 102, 241, 0.85)',      // Vibrant indigo with higher transparency
  secondary: 'rgba(168, 85, 247, 0.8)',     // Vibrant purple with transparency
  
  // Background colors - Light backgrounds with higher transparency
  background: {
    primary: 'rgba(255, 255, 255, 0.85)',   // White with higher transparency
    secondary: 'rgba(248, 250, 252, 0.8)',  // Very light gray with transparency
    tertiary: 'rgba(241, 245, 249, 0.75)',  // Light gray with transparency
    avatar: 'rgba(226, 232, 240, 0.7)',     // Medium light gray with transparency
  },
  
  // Glass panel colors - These are specifically for glassmorphic UI elements
  glass: {
    primary: 'rgba(255, 255, 255, 0.35)',    // White with 35% transparency for primary glass panels
    secondary: 'rgba(255, 255, 255, 0.25)',  // White with 25% transparency for secondary glass panels
    tertiary: 'rgba(255, 255, 255, 0.2)',   // White with 20% transparency for tertiary glass panels
    overlay: 'rgba(255, 255, 255, 0.15)',    // White with 15% transparency for overlay glass panels
  },
  
  // Claymorphism specific colors - For compatibility with claymorphism theme
  claymorphism: {
    // Base colors for clay elements
    background: 'rgba(255, 255, 255, 0.85)',     // Default clay color with transparency
    shadow: 'rgba(99, 102, 241, 0.2)',  // Shadow color with theme color
    highlight: 'rgba(255, 255, 255, 0.6)', // Highlight color with transparency
    
    // Vibrant palette for clay elements
    palette: {
      red: 'rgba(239, 68, 68, 0.8)',      // Red with transparency
      orange: 'rgba(245, 158, 11, 0.8)',   // Orange with transparency
      yellow: 'rgba(251, 191, 36, 0.8)',   // Yellow with transparency
      green: 'rgba(34, 197, 94, 0.8)',    // Green with transparency
      teal: 'rgba(16, 185, 129, 0.8)',     // Teal with transparency
      cyan: 'rgba(59, 130, 246, 0.8)',     // Cyan with transparency
      blue: 'rgba(59, 130, 246, 0.8)',     // Blue with transparency
      indigo: 'rgba(99, 102, 241, 0.8)',   // Indigo with transparency
      purple: 'rgba(168, 85, 247, 0.8)',   // Purple with transparency
      pink: 'rgba(236, 72, 153, 0.8)',     // Pink with transparency
    },
  },
  
  // Text colors - Solid colors for readability on glass backgrounds
  text: {
    primary: 'rgba(15, 23, 42, 1)',         // Slate-900, fully opaque for readability
    secondary: 'rgba(51, 65, 85, 1)',       // Slate-700, fully opaque
    tertiary: 'rgba(100, 116, 139, 1)',     // Slate-500, fully opaque
    quaternary: 'rgba(148, 163, 184, 1)',   // Slate-400, fully opaque
    inverted: 'rgba(255, 255, 255, 1)',     // White, fully opaque
  },
  
  // Border colors - More pronounced borders to define glass edges
  border: {
    light: 'rgba(255, 255, 255, 0.6)',      // White with 60% transparency for light borders
    medium: 'rgba(226, 232, 240, 0.4)',     // Light gray with 40% transparency for medium borders
    dark: 'rgba(203, 213, 225, 0.3)',       // Medium gray with 30% transparency for dark borders
  },
  
  // Status colors - More vibrant with higher transparency
  status: {
    success: {
      primary: 'rgba(34, 197, 94, 0.85)',    // Emerald-500 with transparency
      secondary: 'rgba(16, 185, 129, 0.8)',
      tertiary: 'rgba(5, 150, 105, 0.75)',
      background: 'rgba(236, 253, 245, 0.9)',
      border: 'rgba(167, 243, 208, 0.6)',
    },
    error: {
      primary: 'rgba(239, 68, 68, 0.85)',    // Red-500 with transparency
      secondary: 'rgba(220, 38, 127, 0.8)',
      tertiary: 'rgba(185, 28, 28, 0.75)',
      background: 'rgba(254, 242, 242, 0.9)',
      border: 'rgba(252, 165, 165, 0.6)',
    },
    warning: {
      primary: 'rgba(245, 158, 11, 0.85)',   // Amber-500 with transparency
      secondary: 'rgba(251, 191, 36, 0.8)',
      tertiary: 'rgba(217, 119, 6, 0.75)',
      background: 'rgba(255, 251, 235, 0.9)',
      border: 'rgba(253, 230, 138, 0.6)',
    },
    info: {
      primary: 'rgba(59, 130, 246, 0.85)',   // Blue-500 with transparency
      secondary: 'rgba(99, 102, 241, 0.8)',
      tertiary: 'rgba(37, 99, 235, 0.75)',
      background: 'rgba(239, 246, 255, 0.9)',
      border: 'rgba(191, 219, 254, 0.6)',
    },
    neutral: {
      primary: 'rgba(100, 116, 139, 0.85)',  // Slate-500 with transparency
      secondary: 'rgba(148, 163, 184, 0.8)',
      tertiary: 'rgba(203, 213, 225, 0.75)',
      background: 'rgba(248, 250, 252, 0.9)',
      border: 'rgba(226, 232, 240, 0.6)',
    },
  },
  
  // Interactive States - More pronounced feedback with transparency
  interactive: {
    hover: {
      primary: 'rgba(99, 102, 241, 0.15)',
      secondary: 'rgba(99, 102, 241, 0.2)',
      tertiary: 'rgba(99, 102, 241, 0.25)',
    },
    pressed: {
      primary: 'rgba(99, 102, 241, 0.2)',
      secondary: 'rgba(99, 102, 241, 0.25)',
      tertiary: 'rgba(99, 102, 241, 0.3)',
    },
    focus: {
      primary: 'rgba(99, 102, 241, 0.3)',
      secondary: 'rgba(99, 102, 241, 0.25)',
      tertiary: 'rgba(99, 102, 241, 0.2)',
    },
    disabled: {
      primary: 'rgba(148, 163, 184, 0.6)',
      secondary: 'rgba(148, 163, 184, 0.5)',
      tertiary: 'rgba(148, 163, 184, 0.4)',
    },
  },
  
  // Feedback Colors - More vibrant with transparency
  feedback: {
    loading: {
      primary: 'rgba(148, 163, 184, 0.9)',
      secondary: 'rgba(203, 213, 225, 0.8)',
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
      light: 'rgba(15, 23, 42, 0.08)',
      medium: 'rgba(15, 23, 42, 0.15)',
      dark: 'rgba(15, 23, 42, 0.25)',
    },
  },
  
  // Button colors - Glassmorphic buttons with vibrant colors
  button: {
    primary: 'rgba(99, 102, 241, 0.85)',     // Indigo with transparency
    secondary: 'rgba(255, 255, 255, 0.6)',  // White with transparency for glass effect
    text: 'rgba(255, 255, 255, 1)',         // White text, fully opaque for readability
    secondaryText: 'rgba(15, 23, 42, 1)',   // Dark text, fully opaque for readability
    disabled: 'rgba(226, 232, 240, 0.6)',   // Light gray with transparency
    disabledText: 'rgba(148, 163, 184, 0.8)', // Medium gray with transparency
  },
  
  // Message bubbles - Glassmorphic message bubbles with vibrant colors
  message: {
    user: 'rgba(99, 102, 241, 0.85)',        // Indigo with transparency
    assistant: 'rgba(255, 255, 255, 0.6)',  // White with transparency for glass effect
    userText: 'rgba(255, 255, 255, 1)',     // White text, fully opaque for readability
    assistantText: 'rgba(15, 23, 42, 1)',   // Dark text, fully opaque for readability
  },

  // Shadow colors - Enhanced shadows for depth
  shadow: {
    light: 'rgba(99, 102, 241, 0.1)',
    medium: 'rgba(99, 102, 241, 0.15)',
    dark: 'rgba(99, 102, 241, 0.2)',
  },

  // Code syntax highlighting colors - More vibrant VS Code Light+ inspired
  syntax: {
    keyword: 'rgba(99, 102, 241, 1)',        // Indigo for keywords
    string: 'rgba(220, 38, 127, 1)',         // Pink for strings
    comment: 'rgba(34, 197, 94, 1)',        // Emerald for comments
    number: 'rgba(16, 185, 129, 1)',        // Teal for numbers
    function: 'rgba(245, 158, 11, 1)',       // Amber for function names
    variable: 'rgba(59, 130, 246, 1)',       // Blue for variables
    operator: 'rgba(15, 23, 42, 1)',         // Slate-900 for operators
    background: 'rgba(248, 250, 252, 0.7)', // Very light gray background with transparency
    type: 'rgba(16, 185, 129, 1)',          // Teal for types
    builtin: 'rgba(99, 102, 241, 1)',       // Indigo for built-in functions
    tag: 'rgba(220, 38, 127, 1)',            // Pink for HTML tags
    attribute: 'rgba(245, 158, 11, 1)',      // Amber for attributes
  },
};

// Light mode shadows - Enhanced for glassmorphism
export const lightShadows = {
  light: {
    shadowColor: 'rgba(99, 102, 241, 0.15)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 3,
  },
  medium: {
    shadowColor: 'rgba(99, 102, 241, 0.2)',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 6,
  },
  heavy: {
    shadowColor: 'rgba(99, 102, 241, 0.25)',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 12,
  },
};