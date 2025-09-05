import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { getLogger } from "@/shared/services/logger";
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
  View,
} from "react-native";

import { useAppTheme } from "@/features/theme";

import { createDropdownStyles } from "./Dropdown.styles";

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
  renderTrigger?: (args: {
    open: () => void;
    selected?: DropdownItem;
  }) => React.ReactNode;
  /** Optional: render each item yourself */
  renderCustomItem?: (args: {
    item: DropdownItem;
    isSelected: boolean;
  }) => React.ReactNode;
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

const SCREEN = Dimensions.get("window");
const SCALE = Dimensions.get("window").scale;

export const Dropdown: React.FC<DropdownProps> = ({
  items,
  value,
  onChange,
  renderTrigger,
  renderCustomItem,
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
  const logger = getLogger("Dropdown");
  const triggerRef = useRef<View>(null);
  const [open, setOpen] = useState(false);
  const [triggerRect, setTriggerRect] = useState<LayoutRectangle | null>(null);
  const [internalValue, setInternalValue] = useState<
    DropdownItem["value"] | undefined
  >(value);
  const selected = useMemo(
    () =>
      items.find((i) =>
        value !== undefined ? i.value === value : i.value === internalValue
      ),
    [items, value, internalValue]
  );

  // Animate menu in/out
  const fade = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.95)).current;
  const chevronRotation = useRef(new Animated.Value(0)).current;

  const runIn = useCallback(() => {
    Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: 140,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: 140,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(chevronRotation, {
        toValue: 1,
        duration: 140,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [fade, scale, chevronRotation]);

  const runOut = useCallback(
    (cb?: () => void) => {
      Animated.parallel([
        Animated.timing(fade, {
          toValue: 0,
          duration: 120,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 0.95,
          duration: 120,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(chevronRotation, {
          toValue: 0,
          duration: 120,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
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
      logger.debug("📏 [Dropdown] measureInWindow raw values:", {
        x,
        y,
        width,
        height,
      });
      logger.debug("📏 [Dropdown] Screen scale:", SCALE);
      logger.debug("📏 [Dropdown] Platform:", Platform.OS);
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
  // ⚠️  IMPORTANT: This component calculates absolute positioning based on trigger measurements.
  //     External menuStyle props should NOT include positioning properties like:
  //     - marginTop/marginBottom (affects Y position)
  //     - marginLeft/marginRight (affects X position)
  //     - top/left/right/bottom (conflicts with computed position)
  //     - transform with translateY/translateX (offsets the menu)
  //
  //     Only use menuStyle for: backgroundColor, borderRadius, padding, shadows, etc.
  //     The component handles all positioning internally via measureInWindow + useMemo.
  const { menuLeft, menuTop, menuWidth } = useMemo(() => {
    if (!triggerRect)
      return { menuLeft: 0, menuTop: 0, menuWidth: dropdownWidth ?? 200 };
    const width = dropdownWidth ?? triggerRect.width;

    // Convert physical pixels to logical pixels for vertical positioning only
    const triggerY = triggerRect.y;
    const triggerHeight = triggerRect.height;

    // Position menu centered below the trigger (horizontal positioning works fine without scale conversion)
    const leftCalc = triggerRect.x + (triggerRect.width - width) / 2;
    const leftMin = Math.min(leftCalc, SCREEN.width - width - 8);
    const left = Math.max(8, leftMin);

    // Determine placement based on available space
    const topCalcBelow = triggerY + triggerHeight + 6;
    const topCalcAbove = triggerY - maxHeight + 6;

    let wantTop = false;
    if (placement === "top") {
      wantTop = true;
    } else if (placement === "auto") {
      // Auto: prefer below, but use above if not enough space below
      const hasSpaceBelow = topCalcBelow + maxHeight <= SCREEN.height - 8;
      const hasSpaceAbove = topCalcAbove >= 8;
      wantTop = !hasSpaceBelow && hasSpaceAbove;
    }
    // For "bottom" placement, always prefer below (default behavior)

    const top = wantTop
      ? Math.max(8, topCalcAbove)
      : Math.min(SCREEN.height - 8, topCalcBelow);

    // Debug logs for positioning
    logger.debug("🔍 [Dropdown] Positioning Debug:");
    logger.debug("  Screen info:", {
      width: SCREEN.width,
      height: SCREEN.height,
      scale: SCALE,
      pixelRatio: Dimensions.get("window").scale,
      platform: Platform.OS,
    });
    logger.debug("  Trigger rect:", triggerRect);
    logger.debug("  Menu width:", width);
    logger.debug("  Placement:", placement);
    logger.debug("  Want top:", wantTop);
    logger.debug("  LEFT calculation:");
    logger.debug("    Raw trigger x:", triggerRect.x, "(physical pixels)");
    logger.debug(
      "    Raw trigger width:",
      triggerRect.width,
      "(physical pixels)"
    );
    logger.debug("    Scale factor:", SCALE);
    logger.debug(
      "    Center calc:",
      leftCalc,
      "=",
      triggerRect.x,
      "+ (",
      triggerRect.width,
      "-",
      width,
      ") / 2"
    );
    logger.debug(
      "    Min with right edge:",
      leftMin,
      "= Math.min(",
      leftCalc,
      ",",
      SCREEN.width - width - 8,
      ")"
    );
    logger.debug("    Final left:", left, "= Math.max(8,", leftMin, ")");
    logger.debug("  TOP calculation:");
    logger.debug("    Raw trigger y:", triggerRect.y, "(physical pixels)");
    logger.debug(
      "    Raw trigger height:",
      triggerRect.height,
      "(physical pixels)"
    );
    logger.debug("    Converted y:", triggerY, "(logical pixels)");
    logger.debug("    Converted height:", triggerHeight, "(logical pixels)");
    if (wantTop) {
      logger.debug(
        "    Above calc:",
        topCalcAbove,
        "=",
        triggerY,
        "-",
        maxHeight,
        "+ 6"
      );
      logger.debug("    Final top:", top, "= Math.max(8,", topCalcAbove, ")");
    } else {
      logger.debug(
        "    Below calc:",
        topCalcBelow,
        "=",
        triggerY,
        "+",
        triggerHeight,
        "+ 6"
      );
      logger.debug(
        "    Final top:",
        top,
        "= Math.min(",
        SCREEN.height - 8,
        ",",
        topCalcBelow,
        ")"
      );
    }
    logger.debug("  Final positions:", {
      menuLeft: left,
      menuTop: top,
      menuWidth: width,
    });

    return { menuLeft: left, menuTop: top, menuWidth: width };
  }, [triggerRect, dropdownWidth, placement, maxHeight]);

  const DefaultTrigger = useMemo(() => {
    return (
      <Pressable
        onPress={openMenu}
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
              transform: [
                {
                  rotate: chevronRotation.interpolate({
                    inputRange: [0, 1],
                    outputRange: ["0deg", "180deg"],
                  }),
                },
              ],
            },
          ]}
        >
          ▾
        </Animated.Text>
      </Pressable>
    );
  }, [
    openMenu,
    placeholder,
    selected?.label,
    disabled,
    accessibilityLabel,
    chevronRotation,
  ]);

  const renderItem = useCallback(
    ({ item }: { item: DropdownItem }) => {
      const isSelected = selected?.value === item.value;

      // Use custom renderItem if provided
      if (renderCustomItem) {
        const customElement = renderCustomItem({ item, isSelected });
        if (customElement) {
          return (
            <Pressable
              onPress={() => handleSelect(item)}
              disabled={item.disabled}
              accessibilityRole="menuitem"
            >
              {customElement}
            </Pressable>
          );
        }
      }

      // Default rendering
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
    [
      handleSelect,
      itemStyle,
      itemTextStyle,
      selected?.value,
      selectedItemStyle,
      selectedItemTextStyle,
      renderCustomItem,
    ]
  );

  const keyExtractor = useCallback((it: DropdownItem) => String(it.value), []);

  // Dismiss if user taps outside
  const onBackdrop = useCallback(
    (_e: GestureResponderEvent) => {
      // No special hit testing needed; full-screen backdrop
      closeMenu();
    },
    [closeMenu]
  );

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
        {renderTrigger
          ? renderTrigger({ open: openMenu, selected })
          : DefaultTrigger}
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
        {/* 
          ⚠️  POSITIONING WARNING: This Animated.View uses computed top/left from measureInWindow.
          The menuStyle prop should NOT override these positioning values or add margins/transforms
          that would offset the carefully calculated position.
        */}
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
