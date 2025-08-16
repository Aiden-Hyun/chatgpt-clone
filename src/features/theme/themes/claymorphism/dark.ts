// Claymorphism theme - Dark variant
// Features soft, puffy 3D elements with rich, muted colors

// Design tokens that are specific to the dark variant of the claymorphism theme
export const darkColors = {
  // Primary colors - Rich, vibrant colors for clay elements
  primary: '#818CF8',      // Lighter Indigo
  secondary: '#F472B6',    // Lighter Pink
  
  // Background colors - Deep, rich backgrounds
  background: {
    primary: '#111827',    // Dark gray/blue
    secondary: '#1F2937',  // Medium dark gray
    tertiary: '#374151',   // Medium gray
    avatar: '#4B5563',     // Medium light gray
  },
  
  // Glass panel colors - For compatibility with glassmorphism theme
  glass: {
    primary: '#1F2937',    // Medium dark gray for primary glass panels
    secondary: '#374151',  // Medium gray for secondary glass panels
    tertiary: '#4B5563',   // Medium light gray for tertiary glass panels
    overlay: '#6B7280',    // Light gray for overlay glass panels
  },
  
  // Claymorphism specific colors
  claymorphism: {
    // Base colors for clay elements
    background: '#1F2937',     // Default clay color (dark gray)
    shadow: 'rgba(0, 0, 0, 0.5)',  // Shadow color
    highlight: 'rgba(255, 255, 255, 0.1)', // Highlight color
    
    // Rich, muted palette for clay elements
    palette: {
      red: '#F87171',      // Muted red
      orange: '#FB923C',   // Muted orange
      yellow: '#FBBF24',   // Muted yellow
      green: '#34D399',    // Muted green
      teal: '#2DD4BF',     // Muted teal
      cyan: '#22D3EE',     // Muted cyan
      blue: '#60A5FA',     // Muted blue
      indigo: '#818CF8',   // Muted indigo
      purple: '#A78BFA',   // Muted purple
      pink: '#F472B6',     // Muted pink
    },
  },
  
  // Text colors - High contrast for readability on dark clay elements
  text: {
    primary: '#F9FAFB',    // Almost white
    secondary: '#F3F4F6',  // Light gray
    tertiary: '#E5E7EB',   // Medium light gray
    quaternary: '#D1D5DB', // Medium gray
    inverted: '#111827',   // Almost black
  },
  
  // Border colors - Subtle borders to define clay edges
  border: {
    light: '#374151',      // Medium gray
    medium: '#4B5563',     // Medium light gray
    dark: '#6B7280',       // Light gray
  },
  
  // Status colors - Rich, vibrant colors for status indicators
  status: {
    success: {
      primary: '#34D399',   // Green
      secondary: '#6EE7B7',
      tertiary: '#A7F3D0',
      background: '#064E3B',
      border: '#065F46',
    },
    error: {
      primary: '#F87171',   // Red
      secondary: '#FCA5A5',
      tertiary: '#FECACA',
      background: '#7F1D1D',
      border: '#991B1B',
    },
    warning: {
      primary: '#FBBF24',   // Yellow
      secondary: '#FCD34D',
      tertiary: '#FDE68A',
      background: '#78350F',
      border: '#92400E',
    },
    info: {
      primary: '#60A5FA',   // Blue
      secondary: '#93C5FD',
      tertiary: '#BFDBFE',
      background: '#1E3A8A',
      border: '#2563EB',
    },
    neutral: {
      primary: '#9CA3AF',   // Gray
      secondary: '#D1D5DB',
      tertiary: '#E5E7EB',
      background: '#1F2937',
      border: '#374151',
    },
  },
  
  // Interactive States - Subtle feedback with soft transitions
  interactive: {
    hover: {
      primary: 'rgba(129, 140, 248, 0.15)',
      secondary: 'rgba(129, 140, 248, 0.2)',
      tertiary: 'rgba(129, 140, 248, 0.25)',
    },
    pressed: {
      primary: 'rgba(129, 140, 248, 0.2)',
      secondary: 'rgba(129, 140, 248, 0.25)',
      tertiary: 'rgba(129, 140, 248, 0.3)',
    },
    focus: {
      primary: 'rgba(129, 140, 248, 0.25)',
      secondary: 'rgba(129, 140, 248, 0.2)',
      tertiary: 'rgba(129, 140, 248, 0.15)',
    },
    disabled: {
      primary: 'rgba(75, 85, 99, 0.5)',
      secondary: 'rgba(75, 85, 99, 0.4)',
      tertiary: 'rgba(75, 85, 99, 0.3)',
    },
  },
  
  // Feedback Colors - Rich with subtle transitions
  feedback: {
    loading: {
      primary: '#6B7280',
      secondary: '#9CA3AF',
      pulse: 'rgba(107, 114, 128, 0.3)',
    },
    highlight: {
      primary: '#78350F',
      secondary: '#92400E',
      tertiary: '#B45309',
    },
    selection: {
      primary: 'rgba(129, 140, 248, 0.25)',
      secondary: 'rgba(129, 140, 248, 0.2)',
    },
    overlay: {
      light: 'rgba(0, 0, 0, 0.3)',
      medium: 'rgba(0, 0, 0, 0.5)',
      dark: 'rgba(0, 0, 0, 0.7)',
    },
  },
  
  // Button colors - Clay-like buttons
  button: {
    primary: '#818CF8',     // Lighter Indigo
    secondary: '#1F2937',   // Medium dark gray
    text: '#FFFFFF',        // White text
    secondaryText: '#F9FAFB', // Almost white text
    disabled: '#374151',    // Medium gray
    disabledText: '#6B7280', // Light gray
  },
  
  // Message bubbles - Clay-like message bubbles
  message: {
    user: '#818CF8',        // Lighter Indigo
    assistant: '#1F2937',   // Medium dark gray
    userText: '#FFFFFF',    // White text
    assistantText: '#F9FAFB', // Almost white text
  },

  // Shadow colors - Deep shadows for clay effect
  shadow: {
    light: 'rgba(0, 0, 0, 0.3)',
    medium: 'rgba(0, 0, 0, 0.4)',
    dark: 'rgba(0, 0, 0, 0.5)',
  },

  // Code syntax highlighting colors - Vibrant on dark
  syntax: {
    keyword: '#A78BFA',      // Purple for keywords
    string: '#F472B6',       // Pink for strings
    comment: '#9CA3AF',      // Gray for comments
    number: '#34D399',       // Green for numbers
    function: '#FBBF24',     // Yellow for function names
    variable: '#60A5FA',     // Blue for variables
    operator: '#F9FAFB',     // Almost white for operators
    background: '#1F2937',   // Dark gray background
    type: '#22D3EE',         // Cyan for types
    builtin: '#A78BFA',      // Purple for built-in functions
    tag: '#F87171',          // Red for HTML tags
    attribute: '#FBBF24',    // Yellow for attributes
  },
};

// Dark mode shadows - Deep for clay effect
export const darkShadows = {
  light: {
    shadowColor: 'rgba(0, 0, 0, 0.3)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 2,
  },
  medium: {
    shadowColor: 'rgba(0, 0, 0, 0.4)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  heavy: {
    shadowColor: 'rgba(0, 0, 0, 0.5)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 8,
  },
};
