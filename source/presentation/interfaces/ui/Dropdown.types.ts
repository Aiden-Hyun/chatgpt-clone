import React from 'react';

export type DropdownItem = {
  label: string;
  value: string | number;
  disabled?: boolean;
};

export type Placement = "auto" | "bottom" | "top";

export interface DropdownProps {
  /** Items to render in the dropdown */
  items: DropdownItem[];
  /** Current selected value (controlled). If undefined, component manages internal state */
  value?: DropdownItem["value"];
  /** Called when an item is chosen */
  onChange?: (item: DropdownItem) => void;
  /** Optional: render the trigger yourself */
  renderTrigger?: (args: { open: () => void; selected?: DropdownItem }) => React.ReactNode;
  /** Optional: render each item yourself */
  renderCustomItem?: (args: { item: DropdownItem; isSelected: boolean }) => React.ReactNode;
  /** Width of dropdown list (defaults to trigger width) */
  dropdownWidth?: number;
  /** Max height before list scrolls */
  maxHeight?: number;
  /** Menu placement */
  placement?: Placement;
  /** 
   * Optional style overrides for the menu container
   * ⚠️  WARNING: Do NOT include positioning properties (marginTop, marginLeft, top, left, transform, etc.)
   *     This component calculates positioning internally. Only use for: backgroundColor, borderRadius, 
   *     padding, shadows, etc.
   */
  menuStyle?: object;
  itemStyle?: object;
  itemTextStyle?: object;
  selectedItemStyle?: object;
  selectedItemTextStyle?: object;
  /** Optional: label text for selected value when using default trigger */
  placeholder?: string;
  /** Disable the entire control */
  disabled?: boolean;
  /** Accessibility label for the trigger */
  accessibilityLabel?: string;
}
