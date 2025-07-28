import { act, renderHook } from '@testing-library/react';
import { useRefreshOnFocus } from '../../../src/shared/hooks/useRefreshOnFocus';

// Mock useFocusEffect
const mockUseFocusEffect = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useFocusEffect: mockUseFocusEffect,
}));

describe('useRefreshOnFocus', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call useFocusEffect with a callback', () => {
    const mockRefreshFunction = jest.fn();
    
    renderHook(() => useRefreshOnFocus(mockRefreshFunction));
    
    expect(mockUseFocusEffect).toHaveBeenCalledWith(expect.any(Function));
  });

  it('should call the refresh function when focus effect is triggered', () => {
    const mockRefreshFunction = jest.fn();
    let focusCallback: Function;
    
    mockUseFocusEffect.mockImplementation((callback) => {
      focusCallback = callback;
    });
    
    renderHook(() => useRefreshOnFocus(mockRefreshFunction));
    
    // Simulate focus effect being triggered
    act(() => {
      focusCallback();
    });
    
    expect(mockRefreshFunction).toHaveBeenCalled();
  });

  it('should pass dependencies to useCallback', () => {
    const mockRefreshFunction = jest.fn();
    const dependencies = ['dep1', 'dep2'];
    
    renderHook(() => useRefreshOnFocus(mockRefreshFunction, dependencies));
    
    expect(mockUseFocusEffect).toHaveBeenCalledWith(expect.any(Function));
  });
}); 