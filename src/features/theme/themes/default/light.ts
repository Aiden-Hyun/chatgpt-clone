// Default theme - Light variant
// Based on the original Sharp Corners Design with clean aesthetics

// Design tokens that are specific to the light variant of the default theme
export const lightColors = {
  // Primary colors - Minimal palette
  primary: '#2D3748',      // Dark gray-blue
  secondary: '#4A5568',    // Medium gray
  
  // Background colors - Clean whites and grays
  background: {
    primary: '#FFFFFF',    // Pure white
    secondary: '#F7FAFC',  // Very light gray
    tertiary: '#EDF2F7',   // Light gray
    avatar: '#E2E8F0',     // Subtle gray
  },
  
  // Glass panel colors - For compatibility with glassmorphism theme
  glass: {
    primary: '#FFFFFF',    // White for primary glass panels
    secondary: '#F7FAFC',  // Very light gray for secondary glass panels
    tertiary: '#EDF2F7',   // Light gray for tertiary glass panels
    overlay: '#E2E8F0',    // Subtle gray for overlay glass panels
  },
  
  // Claymorphism specific colors - For compatibility with claymorphism theme
  claymorphism: {
    // Base colors for clay elements
    background: '#FFFFFF',     // Default clay color (white)
    shadow: 'rgba(0, 0, 0, 0.1)',  // Shadow color
    highlight: 'rgba(255, 255, 255, 0.8)', // Highlight color
    
    // Neutral palette for clay elements
    palette: {
      red: '#FED7D7',      // Soft red
      orange: '#FEEBC8',   // Soft orange
      yellow: '#FEF5E7',   // Soft yellow
      green: '#C6F6D5',    // Soft green
      teal: '#B2F5EA',     // Soft teal
      cyan: '#BEE3F8',     // Soft cyan
      blue: '#BEE3F8',     // Soft blue
      indigo: '#C6F6D5',   // Soft indigo
      purple: '#E9D8FD',   // Soft purple
      pink: '#FED7E2',     // Soft pink
    },
  },
  
  // Text colors - High contrast for readability
  text: {
    primary: '#1A202C',    // Almost black
    secondary: '#4A5568',  // Dark gray
    tertiary: '#718096',   // Medium gray
    quaternary: '#A0AEC0', // Light gray
    inverted: '#FFFFFF',   // White
  },
  
  // Border colors - Subtle and minimal
  border: {
    light: '#E2E8F0',      // Very light gray
    medium: '#CBD5E0',     // Light gray
    dark: '#A0AEC0',       // Medium gray
  },
  
  // Status colors - Muted and professional
  status: {
    success: {
      primary: '#38A169',   // Muted green
      secondary: '#48BB78',
      tertiary: '#68D391',
      background: '#F0FFF4',
      border: '#C6F6D5',
    },
    error: {
      primary: '#E53E3E',   // Muted red
      secondary: '#F56565',
      tertiary: '#FC8181',
      background: '#FFF5F5',
      border: '#FED7D7',
    },
    warning: {
      primary: '#D69E2E',   // Muted yellow
      secondary: '#ECC94B',
      tertiary: '#F6E05E',
      background: '#FFFBEB',
      border: '#FEEBC8',
    },
    info: {
      primary: '#3182CE',   // Muted blue
      secondary: '#4299E1',
      tertiary: '#63B3ED',
      background: '#EBF8FF',
      border: '#BEE3F8',
    },
    neutral: {
      primary: '#718096',   // Gray
      secondary: '#A0AEC0',
      tertiary: '#CBD5E0',
      background: '#F7FAFC',
      border: '#E2E8F0',
    },
  },
  
  // Interactive States - Subtle feedback
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
      primary: 'rgba(49, 130, 206, 0.15)',
      secondary: 'rgba(49, 130, 206, 0.1)',
      tertiary: 'rgba(49, 130, 206, 0.05)',
    },
    disabled: {
      primary: 'rgba(160, 174, 192, 0.4)',
      secondary: 'rgba(160, 174, 192, 0.3)',
      tertiary: 'rgba(160, 174, 192, 0.2)',
    },
  },
  
  // Feedback Colors - Minimal and clean
  feedback: {
    loading: {
      primary: '#A0AEC0',
      secondary: '#CBD5E0',
      pulse: 'rgba(160, 174, 192, 0.2)',
    },
    highlight: {
      primary: '#FEF5E7',
      secondary: '#FED7AA',
      tertiary: '#F6AD55',
    },
    selection: {
      primary: 'rgba(49, 130, 206, 0.08)',
      secondary: 'rgba(49, 130, 206, 0.04)',
    },
    overlay: {
      light: 'rgba(26, 32, 44, 0.08)',
      medium: 'rgba(26, 32, 44, 0.16)',
      dark: 'rgba(26, 32, 44, 0.32)',
    },
  },
  
  // Button colors - Clean and minimal
  button: {
    primary: '#2D3748',     // Dark gray-blue
    secondary: '#F7FAFC',   // Light gray
    text: '#FFFFFF',        // White text
    secondaryText: '#2D3748', // Dark text
    disabled: '#E2E8F0',    // Light gray
    disabledText: '#A0AEC0', // Medium gray
  },
  
  // Message bubbles - Clean and minimal
  message: {
    user: '#2D3748',        // Dark gray-blue
    assistant: '#FFFFFF',   // White
    userText: '#FFFFFF',    // White text
    assistantText: '#1A202C', // Dark text
  },

  // Shadow colors - Subtle shadows for depth
  shadow: {
    light: 'rgba(0, 0, 0, 0.05)',
    medium: 'rgba(0, 0, 0, 0.1)',
    dark: 'rgba(0, 0, 0, 0.15)',
  },

  // Code syntax highlighting colors - VS Code Light+ inspired
  syntax: {
    keyword: '#0000FF',      // Blue for keywords (const, let, function, etc.)
    string: '#A31515',       // Red for strings
    comment: '#008000',      // Green for comments
    number: '#098658',       // Teal for numbers
    function: '#795E26',     // Brown for function names
    variable: '#001080',     // Dark blue for variables
    operator: '#000000',     // Black for operators
    background: '#F8F8F8',   // Very light gray background for code
    type: '#267F99',         // Teal for types (interface, type, etc.)
    builtin: '#0000FF',      // Blue for built-in functions
    tag: '#800000',          // Dark red for HTML tags
    attribute: '#FF0000',    // Red for attributes
  },
};

// Light mode shadows - Professional and subtle
export const lightShadows = {
  light: {
    shadowColor: 'rgba(26, 32, 44, 0.08)',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 1,
    elevation: 1,
  },
  medium: {
    shadowColor: 'rgba(26, 32, 44, 0.12)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 2,
    elevation: 2,
  },
  heavy: {
    shadowColor: 'rgba(26, 32, 44, 0.2)',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
};
