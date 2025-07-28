// Error hooks barrel export
export { useErrorCreators } from './useErrorCreators';
export { useErrorLogging } from './useErrorLogging';
export { useErrorState as useErrorStateCore, type AppError } from './useErrorState';
export { useErrorStateCombined } from './useErrorStateCombined';
export { useErrorUI } from './useErrorUI';

// Backward compatibility - export the combined hook as the default useErrorState
export { useErrorStateCombined as useErrorState } from './useErrorStateCombined';
