import React from "react";
import { Pressable, Text, View } from "react-native";

import { useAppTheme } from "@/features/theme";

import { createListItemStyles } from "./ListItem.styles";
import { ListItemProps } from "./ListItem.types";

/**
 * ListItem component for creating consistent list items with various styles.
 *
 * @example
 * // Basic list item
 * <ListItem
 *   title="Item title"
 *   onPress={() => console.log('Item pressed')}
 * />
 *
 * @example
 * // Settings-style list item with icon
 * <ListItem
 *   variant="settings"
 *   title="Notifications"
 *   subtitle="Manage notification preferences"
 *   leftElement={<Icon name="bell" />}
 *   rightElement={<Icon name="chevron-right" />}
 *   onPress={() => navigation.navigate('NotificationSettings')}
 * />
 *
 * @example
 * // Chat list item
 * <ListItem
 *   variant="chat"
 *   title="John Doe"
 *   subtitle="Hey, how's it going?"
 *   description="2m ago"
 *   leftElement={<Avatar source={userAvatar} />}
 *   onPress={() => navigation.navigate('ChatRoom', { id: roomId })}
 * />
 */
export const ListItem = ({
  variant = "default",
  size = "md",
  title,
  subtitle,
  description,
  leftElement,
  rightElement,
  selected = false,
  showBorder = true,
  disabled = false,
  containerStyle,
  titleStyle,
  subtitleStyle,
  descriptionStyle,
  onPress,
  ...rest
}: ListItemProps) => {
  const theme = useAppTheme();
  const styles = createListItemStyles(theme);

  return (
    <Pressable
      style={({ pressed }) => [
        styles.item,
        styles.sizes[size],
        styles.getVariantStyle(variant),
        showBorder && styles.border,
        selected && styles.selected,
        disabled && styles.disabled,
        pressed && onPress && styles.pressed,
        containerStyle,
      ]}
      disabled={disabled}
      onPress={onPress}
      {...rest}
    >
      {leftElement && (
        <View style={styles.leftElementContainer}>{leftElement}</View>
      )}

      <View style={styles.contentContainer}>
        <Text
          style={[styles.title, selected && styles.selectedTitle, titleStyle]}
          numberOfLines={1}
        >
          {title}
        </Text>

        {subtitle && (
          <Text style={[styles.subtitle, subtitleStyle]} numberOfLines={1}>
            {subtitle}
          </Text>
        )}

        {description && (
          <Text
            style={[styles.description, descriptionStyle]}
            numberOfLines={1}
          >
            {description}
          </Text>
        )}
      </View>

      {rightElement && (
        <View style={styles.rightElementContainer}>{rightElement}</View>
      )}
    </Pressable>
  );
};

export default ListItem;
