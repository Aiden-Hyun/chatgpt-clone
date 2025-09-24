/**
 * Component Presentation Interfaces
 * 
 * All UI component prop interfaces for the presentation layer.
 */

import * as React from 'react';

import { BaseComponentProps, ILogger } from './shared';

// ============================================================================
// BUTTON INTERFACES
// ============================================================================




// ============================================================================
// TEXT INTERFACES
// ============================================================================




// ============================================================================
// LIST INTERFACES
// ============================================================================




/**
 * Loading wrapper props
 */
export interface LoadingWrapperProps extends BaseComponentProps {
  loading: boolean;
  loadingText?: string;
  error?: string;
  onRetry?: () => void;
}

// ============================================================================
// LOGO INTERFACES
// ============================================================================

/**
 * Anthropic logo props
 */
export interface AnthropicLogoProps {
  size?: number;
}

/**
 * Form wrapper props
 */
export interface FormWrapperProps {
  children: React.ReactNode;
  onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void;
  style?: Record<string, unknown>;
}

/**
 * Loading screen props
 */
export interface LoadingScreenProps {
  message?: string;
  size?: 'small' | 'large';
  fullScreen?: boolean;
}

/**
 * OpenAI logo props
 */
export interface OpenAILogoProps {
  size?: number;
  variant?: 'white' | 'black';
}

// ============================================================================
// CONTEXT INTERFACES
// ============================================================================

/**
 * Interface for UI component-specific context
 */
export interface ComponentsContextValue {
  logger: ILogger;
}

/**
 * Props for ComponentsProvider
 */
export interface ComponentsProviderProps {
  children: ReactNode;
}
