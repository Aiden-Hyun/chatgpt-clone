import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    Animated,
    Dimensions,
    Easing,
    FlatList,
    GestureResponderEvent,
    LayoutRectangle,
    Modal,
    Platform,
    Pressable,
    Text,
    View
} from "react-native";
import { useAppTheme } from '../../../features/theme/theme';
import createDropdownStyles from './Dropdown.styles';

export type DropdownItem = {
  label: string;
  value: string | number;
  disabled?: boolean;
};

type Placement = "auto" | "bottom" | "top";

export interface DropdownProps {
  /** Items to render in the dropdown */
  items: DropdownItem[];
  /** Current selected value (controlled). If undefined, component manages internal state */
  value?: DropdownItem["value"];
  /** Called when an item is chosen */
  onChange?: (item: DropdownItem) => void;
  /** Optional: render the trigger yourself */
  renderTrigger?: (args: { open: () => void; selected?: DropdownItem }) => React.ReactNode;
  /** Width of dropdown list (defaults to trigger width) */
  dropdownWidth?: number;
  /** Max height before list scrolls */
  maxHeight?: number;
  /** Menu placement */
  placement?: Placement;
  /** Optional style overrides */
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

const SCREEN = Dimensions.get("window");

export const Dropdown: React.FC<DropdownProps> = ({
  items,
  value,
  onChange,
  renderTrigger,
  dropdownWidth,
  maxHeight = 280,
  placement = "auto",
  menuStyle,
  itemStyle,
  itemTextStyle,
  selectedItemStyle,
  selectedItemTextStyle,
  placeholder = "Select…",
  disabled,
  accessibilityLabel,
}) => {
  const theme = useAppTheme();
  const styles = createDropdownStyles(theme);
  const triggerRef = useRef<View>(null);
  const [open, setOpen] = useState(false);
  const [triggerRect, setTriggerRect] = useState<LayoutRectangle | null>(null);
  const [internalValue, setInternalValue] = useState<DropdownItem["value"] | undefined>(value);
  const selected = useMemo(
    () => items.find((i) => (value !== undefined ? i.value === value : i.value === internalValue)),
    [items, value, internalValue]
  );

  // Animate menu in/out
  const fade = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.95)).current;
  const chevronRotation = useRef(new Animated.Value(0)).current;

  const runIn = useCallback(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 140, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1, duration: 140, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(chevronRotation, { toValue: 1, duration: 140, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
  }, [fade, scale, chevronRotation]);

  const runOut = useCallback(
    (cb?: () => void) => {
      Animated.parallel([
        Animated.timing(fade, { toValue: 0, duration: 120, easing: Easing.in(Easing.cubic), useNativeDriver: true }),
        Animated.timing(scale, { toValue: 0.95, duration: 120, easing: Easing.in(Easing.cubic), useNativeDriver: true }),
        Animated.timing(chevronRotation, { toValue: 0, duration: 120, easing: Easing.in(Easing.cubic), useNativeDriver: true }),
      ]).start(() => cb && cb());
    },
    [fade, scale, chevronRotation]
  );

  useEffect(() => {
    if (open) runIn();
  }, [open, runIn]);

  // Keep internal state in sync if controlled
  useEffect(() => {
    if (value !== undefined) setInternalValue(value);
  }, [value]);

  const measureTrigger = useCallback(() => {
    if (!triggerRef.current) return;
    // measureInWindow handles parents with overflow/transform better across platforms
    // (same positioning idea as the Medium article’s measure usage). :contentReference[oaicite:1]{index=1}
    triggerRef.current.measureInWindow((x, y, width, height) => {
      setTriggerRect({ x, y, width, height });
    });
  }, []);

  const openMenu = useCallback(() => {
    if (disabled) return;
    measureTrigger();
    setOpen(true);
  }, [disabled, measureTrigger]);

  const closeMenu = useCallback(() => {
    runOut(() => setOpen(false));
  }, [runOut]);

  const handleSelect = useCallback(
    (item: DropdownItem) => {
      if (item.disabled) return;
      if (value === undefined) {
        setInternalValue(item.value);
      }
      onChange?.(item);
      closeMenu();
    },
    [closeMenu, onChange, value]
  );

  // Compute menu position
  const { menuLeft, menuTop, menuWidth } = useMemo(() => {
    if (!triggerRect) return { menuLeft: 0, menuTop: 0, menuWidth: dropdownWidth ?? 200 };
    const width = dropdownWidth ?? triggerRect.width;
    const left = Math.max(8, Math.min(triggerRect.x + triggerRect.width / 2 - width / 2, SCREEN.width - width - 8));

    const wantTop =
      placement === "top" ||
      (placement === "auto" &&
        triggerRect.y + triggerRect.height + maxHeight > SCREEN.height && // not enough space below
        triggerRect.y - maxHeight > 0); // but enough space above

    const top = wantTop ? Math.max(8, triggerRect.y - maxHeight - 6) : Math.min(SCREEN.height - 8, triggerRect.y + triggerRect.height + 6);

    return { menuLeft: left, menuTop: top, menuWidth: width };
  }, [triggerRect, dropdownWidth, placement, maxHeight]);

  const DefaultTrigger = useMemo(() => {
    return (
      <Pressable
        onPress={openMenu}
        ref={triggerRef}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel ?? "Open dropdown"}
        disabled={disabled}
        style={[styles.trigger, disabled && { opacity: 0.5 }]}
      >
        <Text style={styles.triggerText} numberOfLines={1}>
          {selected?.label ?? placeholder}
        </Text>
        <Animated.Text 
          style={[
            styles.chevron,
            {
              transform: [{
                rotate: chevronRotation.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '180deg']
                })
              }]
            }
          ]}
        >
          ▾
        </Animated.Text>
      </Pressable>
    );
  }, [openMenu, placeholder, selected?.label, disabled, accessibilityLabel, chevronRotation]);

  const renderItem = useCallback(
    ({ item }: { item: DropdownItem }) => {
      const isSelected = selected?.value === item.value;
      return (
        <Pressable
          onPress={() => handleSelect(item)}
          disabled={item.disabled}
          accessibilityRole="menuitem"
          style={[
            styles.item,
            itemStyle,
            isSelected && [styles.itemSelected, selectedItemStyle],
            item.disabled && styles.itemDisabled,
          ]}
        >
          <Text
            style={[
              styles.itemText,
              itemTextStyle,
              isSelected && [styles.itemTextSelected, selectedItemTextStyle],
              item.disabled && styles.itemTextDisabled,
            ]}
            numberOfLines={1}
          >
            {item.label}
          </Text>
        </Pressable>
      );
    },
    [handleSelect, itemStyle, itemTextStyle, selected?.value, selectedItemStyle, selectedItemTextStyle]
  );

  const keyExtractor = useCallback((it: DropdownItem) => String(it.value), []);

  // Dismiss if user taps outside
  const onBackdrop = useCallback((e: GestureResponderEvent) => {
    // No special hit testing needed; full-screen backdrop
    closeMenu();
  }, [closeMenu]);

  // Re-measure on rotation
  useEffect(() => {
    const sub = Dimensions.addEventListener("change", () => {
      if (open) measureTrigger();
    });
    return () => sub.remove();
  }, [open, measureTrigger]);

  return (
    <View>
      {/* Trigger */}
      <View collapsable={false} ref={triggerRef}>
        {renderTrigger ? renderTrigger({ open: openMenu, selected }) : DefaultTrigger}
      </View>

      {/* Menu */}
      <Modal
        visible={open}
        transparent
        animationType="none" // we animate manually for snappier feel
        onRequestClose={closeMenu}
        statusBarTranslucent
      >
        {/* Backdrop */}
        <Pressable
          onPress={onBackdrop}
          style={styles.backdrop}
          accessibilityLabel="Close dropdown"
          accessibilityRole={Platform.OS === "ios" ? "button" : undefined}
        />

        {/* Animated menu */}
        <Animated.View
          style={[
            styles.menu,
            { top: menuTop, left: menuLeft, width: menuWidth, maxHeight },
            menuStyle,
            { opacity: fade, transform: [{ scale }] },
          ]}
        >
          <FlatList
            keyboardShouldPersistTaps="handled"
            data={items}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            initialNumToRender={12}
            style={styles.list}
          />
        </Animated.View>
      </Modal>
    </View>
  );
};


