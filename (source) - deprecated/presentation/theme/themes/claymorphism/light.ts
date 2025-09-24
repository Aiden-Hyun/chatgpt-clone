// Claymorphism theme - Light variant
// Features soft, puffy 3D elements with vibrant pastel colors

// Design tokens that are specific to the light variant of the claymorphism theme
export const lightColors = {
  // Primary colors - Vibrant pastels for clay elements
  primary: '#6366F1',      // Indigo
  secondary: '#EC4899',    // Pink
  
  // Background colors - Soft, light backgrounds
  background: {
    primary: '#F9FAFB',    // Off-white
    secondary: '#F3F4F6',  // Light gray
    tertiary: '#E5E7EB',   // Medium light gray
    avatar: '#D1D5DB',     // Medium gray
  },
  
  // Glass panel colors - For compatibility with glassmorphism theme
  glass: {
    primary: '#F9FAFB',    // Off-white for primary glass panels
    secondary: '#F3F4F6',  // Light gray for secondary glass panels
    tertiary: '#E5E7EB',   // Medium light gray for tertiary glass panels
  },
  
  // Claymorphism specific colors
  claymorphism: {
    // Base colors for clay elements
    background: '#F9FAFB',     // Default clay color (off-white)
    shadow: 'rgba(0, 0, 0, 0.2)',  // Shadow color
    highlight: 'rgba(255, 255, 255, 0.9)', // Highlight color
    
    // Vibrant pastel palette for clay elements
    palette: {
      red: '#FCA5A5',      // Soft red
      orange: '#FDBA74',   // Soft orange
      yellow: '#FDE68A',   // Soft yellow
      green: '#A7F3D0',    // Soft green
      teal: '#99F6E4',     // Soft teal
      cyan: '#A5F3FC',     // Soft cyan
      blue: '#BFDBFE',     // Soft blue
      indigo: '#C7D2FE',   // Soft indigo
      purple: '#DDD6FE',   // Soft purple
      pink: '#FBCFE8',     // Soft pink
    },
  },
  
  // Text colors - High contrast for readability on clay elements
  text: {
    primary: '#111827',    // Almost black
    secondary: '#374151',  // Dark gray
    tertiary: '#6B7280',   // Medium gray
    quaternary: '#9CA3AF', // Light gray
    inverted: '#FFFFFF',   // White
  },
  

  
  // Status colors - Soft pastels for status indicators
  status: {
    success: {
      primary: '#10B981',   // Green
      secondary: '#34D399',
      tertiary: '#6EE7B7',
      background: '#ECFDF5',
      border: '#A7F3D0',
    },
    error: {
      primary: '#EF4444',   // Red
      secondary: '#F87171',
      tertiary: '#FCA5A5',
      background: '#FEF2F2',
      border: '#FECACA',
    },
    warning: {
      primary: '#F59E0B',   // Yellow
      secondary: '#FBBF24',
      tertiary: '#FCD34D',
      background: '#FFFBEB',
      border: '#FDE68A',
    },
    info: {
      primary: '#3B82F6',   // Blue
      secondary: '#60A5FA',
      tertiary: '#93C5FD',
      background: '#EFF6FF',
      border: '#BFDBFE',
    },
    neutral: {
      primary: '#6B7280',   // Gray
      secondary: '#9CA3AF',
      tertiary: '#D1D5DB',
      background: '#F9FAFB',
      border: '#E5E7EB',
    },
  },
  
  // Interactive States - Subtle feedback with soft transitions
  interactive: {
    hover: {
      primary: 'rgba(99, 102, 241, 0.1)',
      secondary: 'rgba(99, 102, 241, 0.15)',
      tertiary: 'rgba(99, 102, 241, 0.2)',
    },
    pressed: {
      primary: 'rgba(99, 102, 241, 0.15)',
      secondary: 'rgba(99, 102, 241, 0.2)',
      tertiary: 'rgba(99, 102, 241, 0.25)',
    },
    focus: {
      primary: 'rgba(99, 102, 241, 0.25)',
      secondary: 'rgba(99, 102, 241, 0.2)',
      tertiary: 'rgba(99, 102, 241, 0.15)',
    },
    disabled: {
      primary: 'rgba(156, 163, 175, 0.5)',
      secondary: 'rgba(156, 163, 175, 0.4)',
      tertiary: 'rgba(156, 163, 175, 0.3)',
    },
  },
  
  // Feedback Colors - Soft with subtle transitions
  feedback: {
    loading: {
      primary: '#9CA3AF',
      secondary: '#D1D5DB',
      pulse: 'rgba(156, 163, 175, 0.3)',
    },
    highlight: {
      primary: '#FEF3C7',
      secondary: '#FDE68A',
      tertiary: '#FBBF24',
    },
    selection: {
      primary: 'rgba(99, 102, 241, 0.2)',
      secondary: 'rgba(99, 102, 241, 0.15)',
    },
    overlay: {
      light: 'rgba(17, 24, 39, 0.05)',
      medium: 'rgba(17, 24, 39, 0.1)',
      dark: 'rgba(17, 24, 39, 0.2)',
    },
  },
  
  // Button colors - Clay-like buttons
  button: {
    primary: '#6366F1',     // Indigo
    secondary: '#F9FAFB',   // Off-white
    text: '#FFFFFF',        // White text
    secondaryText: '#111827', // Almost black text
    disabled: '#E5E7EB',    // Light gray
    disabledText: '#9CA3AF', // Medium gray
  },
  
  // Message bubbles - Clay-like message bubbles
  message: {
    user: '#6366F1',        // Indigo
    assistant: '#F9FAFB',   // Off-white
    userText: '#FFFFFF',    // White text
    assistantText: '#111827', // Almost black text
  },



  // Code syntax highlighting colors - Pastel-inspired
  syntax: {
    keyword: '#8B5CF6',      // Purple for keywords
    string: '#EC4899',       // Pink for strings
    comment: '#6B7280',      // Gray for comments
    number: '#10B981',       // Green for numbers
    function: '#F59E0B',     // Yellow for function names
    variable: '#3B82F6',     // Blue for variables
    operator: '#111827',     // Almost black for operators
    background: '#F9FAFB',   // Off-white background
    type: '#0EA5E9',         // Sky blue for types
    builtin: '#8B5CF6',      // Purple for built-in functions
    tag: '#EF4444',          // Red for HTML tags
    attribute: '#F59E0B',    // Yellow for attributes
  },
};

// Light mode shadows - Soft for clay effect
export const lightShadows = {
  light: {
    shadowColor: 'rgba(0, 0, 0, 0.07)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 5,
    elevation: 2,
  },
  medium: {
    shadowColor: 'rgba(0, 0, 0, 0.13)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.13,
    shadowRadius: 8,
    elevation: 4,
  },
  heavy: {
    shadowColor: 'rgba(0, 0, 0, 0.2)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  button: {
    shadowColor: 'rgba(0, 0, 0, 0.15)',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  card: {
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
};
