// Default theme - Dark variant
// Based on the original Sharp Corners Design with clean aesthetics

// Design tokens that are specific to the dark variant of the default theme
export const darkColors = {
  // Core colors
  primary: '#F7FAFC',      // Light gray
  secondary: '#E2E8F0',    // Medium light gray
  
  // Background colors
  background: {
    primary: '#1A202C',    // Dark gray
    secondary: '#2D3748',  // Medium dark gray
    tertiary: '#4A5568',   // Medium gray
    avatar: '#718096',     // Light gray
  },
  
  // Text colors
  text: {
    primary: '#F7FAFC',    // Almost white
    secondary: '#E2E8F0',  // Light gray
    tertiary: '#CBD5E0',   // Medium light gray
    quaternary: '#A0AEC0', // Medium gray
    inverted: '#1A202C',   // Dark text
  },
  
  // Status colors
  status: {
    success: {
      primary: '#48BB78',
      secondary: '#68D391',
      tertiary: '#9AE6B4',
      background: '#0F1419',
      border: '#2F3E2B',
    },
    error: {
      primary: '#F56565',
      secondary: '#FC8181',
      tertiary: '#FEB2B2',
      background: '#1A0F0F',
      border: '#3E2B2B',
    },
    warning: {
      primary: '#ECC94B',
      secondary: '#F6E05E',
      tertiary: '#FAF089',
      background: '#1A150F',
      border: '#3E352B',
    },
    info: {
      primary: '#4299E1',
      secondary: '#63B3ED',
      tertiary: '#90CDF4',
      background: '#0F1419',
      border: '#2B3E3E',
    },
    neutral: {
      primary: '#A0AEC0',
      secondary: '#CBD5E0',
      tertiary: '#E2E8F0',
      background: '#2D3748',
      border: '#4A5568',
    },
  },
  
  // Interactive states
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
      primary: 'rgba(66, 153, 225, 0.15)',
      secondary: 'rgba(66, 153, 225, 0.1)',
      tertiary: 'rgba(66, 153, 225, 0.05)',
    },
    disabled: {
      primary: 'rgba(160, 174, 192, 0.4)',
      secondary: 'rgba(160, 174, 192, 0.3)',
      tertiary: 'rgba(160, 174, 192, 0.2)',
    },
  },
  
  // Feedback colors
  feedback: {
    loading: {
      primary: '#A0AEC0',
      secondary: '#CBD5E0',
      pulse: 'rgba(160, 174, 192, 0.2)',
    },
    highlight: {
      primary: '#744210',
      secondary: '#975A16',
      tertiary: '#B7791F',
    },
    selection: {
      primary: 'rgba(66, 153, 225, 0.08)',
      secondary: 'rgba(66, 153, 225, 0.04)',
    },
    overlay: {
      light: 'rgba(26, 32, 44, 0.16)',
      medium: 'rgba(26, 32, 44, 0.32)',
      dark: 'rgba(26, 32, 44, 0.48)',
    },
  },
  
  // Component colors
  button: {
    primary: '#F7FAFC',    // Light button on dark background
    secondary: '#4A5568',  // Dark secondary button
    text: '#1A202C',       // Dark text on light button
    secondaryText: '#F7FAFC', // Light text on dark button
    disabled: '#4A5568',   // Muted disabled state
    disabledText: '#718096', // Muted disabled text
  },
  
  message: {
    user: '#F7FAFC',        // Light gray
    assistant: '#2D3748',   // Dark gray
    userText: '#1A202C',    // Dark text
    assistantText: '#F7FAFC', // Light text
  },

  syntax: {
    keyword: '#569CD6',      // Light blue for keywords (const, let, function, etc.)
    string: '#CE9178',       // Light orange for strings
    comment: '#6A9955',      // Green for comments
    number: '#B5CEA8',       // Light green for numbers
    function: '#DCDCAA',     // Light yellow for function names
    variable: '#9CDCFE',     // Light blue for variables
    operator: '#D4D4D4',     // Light gray for operators
    background: '#1E1E1E',   // Dark background for code
    type: '#4EC9B0',         // Cyan for types (interface, type, etc.)
    builtin: '#569CD6',      // Light blue for built-in functions
    tag: '#92C5F8',          // Light blue for HTML tags
    attribute: '#92C5F8',    // Light blue for attributes
  },
  
  // Theme-specific colors (generic structure)
  glass: {
    primary: '#2D3748',    // Medium dark gray for primary glass panels
    secondary: '#4A5568',  // Medium gray for secondary glass panels
    tertiary: '#718096',   // Light gray for tertiary glass panels
  },
  
  claymorphism: {
    background: '#1A202C',     // Default clay color (dark)
    shadow: 'rgba(0, 0, 0, 0.3)',  // Shadow color
    highlight: 'rgba(255, 255, 255, 0.1)', // Highlight color
    palette: {
      red: '#742A2A',      // Dark red
      orange: '#744210',   // Dark orange
      yellow: '#713F12',   // Dark yellow
      green: '#22543D',    // Dark green
      teal: '#134E4A',     // Dark teal
      cyan: '#1E3A8A',     // Dark cyan
      blue: '#1E3A8A',     // Dark blue
      indigo: '#3730A3',   // Dark indigo
      purple: '#581C87',   // Dark purple
      pink: '#831843',     // Dark pink
    },
  },
};

// Dark mode shadows - Professional and subtle
export const darkShadows = {
  light: {
    shadowColor: 'rgba(0, 0, 0, 0.15)',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 1,
    elevation: 1,
  },
  medium: {
    shadowColor: 'rgba(0, 0, 0, 0.25)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 2,
    elevation: 2,
  },
  heavy: {
    shadowColor: 'rgba(0, 0, 0, 0.4)',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 3,
  },
  button: {
    shadowColor: 'rgba(0, 0, 0, 0.2)',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  card: {
    shadowColor: 'rgba(0, 0, 0, 0.25)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
};
