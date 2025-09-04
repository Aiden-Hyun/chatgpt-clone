import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  Switch,
  TouchableOpacity,
  View,
} from "react-native";

import { LanguageSelector, useLanguageContext } from "@/features/language";
import { useAppTheme } from "@/features/theme";
import type { DropdownItem } from "@/shared/components/ui";
import { Button, Dropdown, Input, Text } from "@/shared/components/ui";

export default function DesignShowcaseScreen() {
  const { t } = useLanguageContext();
  const theme = useAppTheme();

  // State for interactive elements
  const [inputValue, setInputValue] = useState("");
  const [switchValue, setSwitchValue] = useState(false);

  // State for dropdown examples
  const [dropdownValue, setDropdownValue] = useState<string>("");
  const [dropdownWithIconsValue, setDropdownWithIconsValue] =
    useState<string>("");
  const [searchableDropdownValue, setSearchableDropdownValue] =
    useState<string>("");

  const handleBack = () => {
    try {
      const canGoBack =
        (router as { canGoBack?: () => boolean }).canGoBack?.() ?? false;
      if (canGoBack) {
        router.back();
      } else {
        router.replace("/chat");
      }
    } catch {
      router.replace("/chat");
    }
  };

  const styles = {
    container: {
      flex: 1,
      backgroundColor: theme.colors.background.primary,
    },
    header: {
      flexDirection: "row" as const,
      alignItems: "center" as const,
      padding: theme.spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: theme.borders.colors.light,
      backgroundColor: theme.colors.background.primary,
    },
    backButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: theme.colors.background.secondary,
      justifyContent: "center" as const,
      alignItems: "center" as const,
      marginRight: theme.spacing.md,
      ...theme.shadows.light,
      borderWidth: 1,
      borderColor: theme.borders.colors.light,
    },
    backButtonText: {
      fontSize: theme.typography.fontSizes.lg,
      color: theme.colors.text.primary,
      fontWeight: theme.typography.fontWeights.medium as "500",
    },
    headerTitle: {
      fontSize: theme.typography.fontSizes.xl,
      fontFamily: theme.typography.fontFamily.primary,
      color: theme.colors.text.primary,
      fontWeight: theme.typography.fontWeights.semibold as "600",
    },
    content: {
      flex: 1,
      padding: theme.spacing.xl,
    },
    section: {
      marginBottom: theme.spacing.xxxl,
    },
    sectionTitle: {
      fontSize: theme.typography.fontSizes.lg,
      fontFamily: theme.typography.fontFamily.primary,
      color: theme.colors.text.primary,
      fontWeight: theme.typography.fontWeights.semibold as "600",
      marginBottom: theme.spacing.lg,
    },
    card: {
      backgroundColor: theme.colors.background.secondary,
      borderRadius: theme.borders.radius.lg,
      padding: theme.spacing.xl,
      marginBottom: theme.spacing.lg,
      ...theme.shadows.light,
      borderWidth: theme.borders.widths.thin,
      borderColor: theme.borders.colors.light,
    },
    row: {
      flexDirection: "row" as const,
      alignItems: "center" as const,
      marginBottom: theme.spacing.lg,
      flexWrap: "wrap" as const,
      gap: theme.spacing.sm,
    },
    button: {
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      borderRadius: theme.borders.radius.md,
      marginRight: theme.spacing.sm,
      marginBottom: theme.spacing.sm,
      alignItems: "center" as const,
      justifyContent: "center" as const,
      minWidth: 100,
      ...theme.shadows.light,
    },
    buttonText: {
      fontSize: theme.typography.fontSizes.md,
      fontFamily: theme.typography.fontFamily.primary,
      fontWeight: theme.typography.fontWeights.medium as "500",
    },
    primaryButton: {
      backgroundColor: theme.colors.primary,
    },
    primaryButtonText: {
      color: theme.colors.text.inverted,
    },
    secondaryButton: {
      backgroundColor: theme.colors.background.primary,
      borderWidth: 1,
      borderColor: theme.borders.colors.medium,
    },
    secondaryButtonText: {
      color: theme.colors.text.primary,
    },
    successButton: {
      backgroundColor: theme.colors.status.success.primary,
    },
    successButtonText: {
      color: theme.colors.text.inverted,
    },
    errorButton: {
      backgroundColor: theme.colors.status.error.primary,
    },
    errorButtonText: {
      color: theme.colors.text.inverted,
    },
    infoButton: {
      backgroundColor: theme.colors.status.info.primary,
    },
    infoButtonText: {
      color: theme.colors.text.inverted,
    },
    outlineButton: {
      backgroundColor: "transparent",
      borderWidth: 2,
      borderColor: theme.colors.primary,
    },
    outlineButtonText: {
      color: theme.colors.primary,
    },
    ghostButton: {
      backgroundColor: "transparent",
    },
    ghostButtonText: {
      color: theme.colors.primary,
    },
    smallButton: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      minWidth: 80,
    },
    smallButtonText: {
      fontSize: theme.typography.fontSizes.sm,
    },
    mediumButton: {
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      minWidth: 100,
    },
    mediumButtonText: {
      fontSize: theme.typography.fontSizes.md,
    },
    largeButton: {
      paddingHorizontal: theme.spacing.xl,
      paddingVertical: theme.spacing.lg,
      minWidth: 120,
    },
    largeButtonText: {
      fontSize: theme.typography.fontSizes.lg,
    },
    label: {
      fontSize: theme.typography.fontSizes.md,
      fontFamily: theme.typography.fontFamily.primary,
      color: theme.colors.text.primary,
      fontWeight: theme.typography.fontWeights.medium as "500",
      marginBottom: theme.spacing.sm,
    },
    input: {
      borderWidth: 1,
      borderColor: theme.borders.colors.medium,
      borderRadius: theme.borders.radius.md,
      padding: theme.spacing.md,
      fontSize: theme.typography.fontSizes.md,
      color: theme.colors.text.primary,
      backgroundColor: theme.colors.background.primary,
      marginBottom: theme.spacing.lg,
    },
    chatInputContainer: {
      flexDirection: "row" as const,
      alignItems: "flex-end" as const,
      gap: theme.spacing.sm,
    },
    chatInput: {
      flex: 1,
      borderWidth: 1,
      borderColor: theme.borders.colors.medium,
      borderRadius: theme.borders.radius.md,
      padding: theme.spacing.md,
      fontSize: theme.typography.fontSizes.md,
      color: theme.colors.text.primary,
      backgroundColor: theme.colors.background.primary,
      minHeight: 80,
      textAlignVertical: "top" as const,
    },
    sendButton: {
      backgroundColor: theme.colors.primary,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      borderRadius: theme.borders.radius.md,
      justifyContent: "center" as const,
      alignItems: "center" as const,
    },
    sendButtonText: {
      color: theme.colors.text.inverted,
      fontSize: theme.typography.fontSizes.md,
      fontWeight: theme.typography.fontWeights.medium as "500",
    },
    searchButtonRow: {
      flexDirection: "row" as const,
      alignItems: "center" as const,
      marginBottom: theme.spacing.md,
      gap: theme.spacing.sm,
    },
    searchButtonBase: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: theme.colors.background.secondary,
      justifyContent: "center" as const,
      alignItems: "center" as const,
      shadowColor: theme.colors.text.primary,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 1,
      elevation: 1,
    },
    searchButtonLabel: {
      fontSize: theme.typography.fontSizes.md,
      fontFamily: theme.typography.fontFamily.primary,
      color: theme.colors.text.primary,
      fontWeight: theme.typography.fontWeights.medium as "500",
      flex: 1,
    },
    iconShowcase: {
      alignItems: "center" as const,
      marginBottom: theme.spacing.md,
    },
    iconLabel: {
      fontSize: theme.typography.fontSizes.sm,
      color: theme.colors.text.secondary,
      marginTop: theme.spacing.sm,
    },
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons
            name="arrow-back-outline"
            size={24}
            color={theme.colors.text.primary}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Design Showcase</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Buttons Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Buttons</Text>

          <View style={styles.card}>
            <Text style={styles.label}>Primary Buttons</Text>
            <View style={styles.row}>
              <Button
                label="Primary"
                onPress={() => console.log("Primary button pressed")}
                containerStyle={[styles.button, styles.primaryButton]}
              />
              <Button
                label="Success"
                onPress={() => console.log("Success button pressed")}
                containerStyle={[styles.button, styles.successButton]}
              />
              <Button
                label="Error"
                onPress={() => console.log("Error button pressed")}
                containerStyle={[styles.button, styles.errorButton]}
              />
            </View>

            <Text style={styles.label}>Secondary Buttons</Text>
            <View style={styles.row}>
              <Button
                label="Secondary"
                onPress={() => console.log("Secondary button pressed")}
                containerStyle={[styles.button, styles.secondaryButton]}
              />
              <Button
                label="Outline"
                onPress={() => console.log("Outline button pressed")}
                containerStyle={[styles.button, styles.outlineButton]}
              />
              <Button
                label="Ghost"
                onPress={() => console.log("Ghost button pressed")}
                containerStyle={[styles.button, styles.ghostButton]}
              />
            </View>

            <Text style={styles.label}>Button Sizes</Text>
            <View style={styles.row}>
              <Button
                label="Small"
                onPress={() => console.log("Small button pressed")}
                containerStyle={[styles.button, styles.smallButton]}
              />
              <Button
                label="Medium"
                onPress={() => console.log("Medium button pressed")}
                containerStyle={[styles.button, styles.mediumButton]}
              />
              <Button
                label="Large"
                onPress={() => console.log("Large button pressed")}
                containerStyle={[styles.button, styles.largeButton]}
              />
            </View>
          </View>
        </View>

        {/* Input Fields Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Input Fields</Text>

          <View style={styles.card}>
            <Text style={styles.label}>Text Input</Text>
            <Input
              inputStyle={styles.input}
              placeholder={t("placeholder.enter_text")}
              placeholderTextColor={theme.colors.text.tertiary}
              value={inputValue}
              onChangeText={setInputValue}
            />

            <Text style={styles.label}>Chat Input (Multi-line)</Text>
            <View style={styles.chatInputContainer}>
              <Input
                inputStyle={styles.chatInput}
                placeholder="Type a message..."
                placeholderTextColor={theme.colors.text.tertiary}
                multiline
                numberOfLines={3}
              />
              <TouchableOpacity style={styles.sendButton}>
                <Text style={styles.sendButtonText}>Send</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Switches Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Switches</Text>

          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.label}>Toggle Switch</Text>
              <Switch
                value={switchValue}
                onValueChange={setSwitchValue}
                trackColor={{
                  false: theme.borders.colors.light,
                  true: theme.colors.primary,
                }}
                thumbColor={
                  switchValue
                    ? theme.colors.button.text
                    : theme.colors.text.secondary
                }
              />
            </View>
          </View>
        </View>

        {/* Language Selector Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Language Selector</Text>

          <View style={styles.card}>
            <LanguageSelector />
          </View>
        </View>

        {/* Toast Notifications Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Toast Notifications</Text>

          <View style={styles.card}>
            <Text style={styles.label}>
              Test different types of toast notifications
            </Text>
            <View style={styles.row}>
              <Button
                label="Success"
                onPress={() => console.log("Success toast")}
                containerStyle={[styles.button, styles.successButton]}
              />
              <Button
                label="Error"
                onPress={() => console.log("Error toast")}
                containerStyle={[styles.button, styles.errorButton]}
              />
              <Button
                label="Info"
                onPress={() => console.log("Info toast")}
                containerStyle={[styles.button, styles.infoButton]}
              />
            </View>
          </View>
        </View>

        {/* Alert Dialogs Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Alert Dialogs</Text>

          <View style={styles.card}>
            <Text style={styles.label}>Test different types of alerts</Text>
            <View style={styles.row}>
              <Button
                label="Success Alert"
                onPress={() => console.log("Success alert")}
                containerStyle={[styles.button, styles.successButton]}
              />
              <Button
                label="Error Alert"
                onPress={() => console.log("Error alert")}
                containerStyle={[styles.button, styles.errorButton]}
              />
              <Button
                label="Confirm Alert"
                onPress={() => console.log("Confirm alert")}
                containerStyle={[styles.button, styles.infoButton]}
              />
            </View>
          </View>
        </View>

        {/* Dropdown Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dropdowns</Text>

          <View style={styles.card}>
            <Text style={styles.label}>Basic Dropdown</Text>
            <Dropdown
              items={[
                { value: "option1", label: "Option 1" },
                { value: "option2", label: "Option 2" },
                { value: "option3", label: "Option 3" },
              ]}
              value={dropdownValue}
              onChange={(item: DropdownItem) =>
                setDropdownValue(item.value as string)
              }
              placeholder="Select an option"
            />

            <Text style={styles.label}>Dropdown with Custom Trigger</Text>
            <Dropdown
              items={[
                { value: "apple", label: "Apple" },
                { value: "android", label: "Android" },
                { value: "windows", label: "Windows" },
              ]}
              value={dropdownWithIconsValue}
              onChange={(item: DropdownItem) =>
                setDropdownWithIconsValue(item.value as string)
              }
              renderTrigger={({
                open,
                selected,
              }: {
                open: () => void;
                selected?: DropdownItem;
              }) => (
                <Pressable
                  onPress={open}
                  style={[
                    styles.button,
                    styles.outlineButton,
                    { flexDirection: "row", alignItems: "center" },
                  ]}
                >
                  <Ionicons
                    name="logo-apple"
                    size={16}
                    color={theme.colors.text.primary}
                    style={{ marginRight: theme.spacing.sm }}
                  />
                  <Text style={[styles.buttonText, styles.outlineButtonText]}>
                    {selected?.label || "Select platform"}
                  </Text>
                </Pressable>
              )}
            />

            <Text style={styles.label}>Dropdown with Different Placements</Text>
            <View style={styles.row}>
              <Dropdown
                items={[
                  { value: "top", label: "Top Placement" },
                  { value: "bottom", label: "Bottom Placement" },
                ]}
                value={dropdownValue}
                onChange={(item: DropdownItem) =>
                  setDropdownValue(item.value as string)
                }
                placeholder="Auto placement"
                placement="auto"
                dropdownWidth={150}
              />
              <Dropdown
                items={[
                  { value: "top", label: "Top Placement" },
                  { value: "bottom", label: "Bottom Placement" },
                ]}
                value={dropdownValue}
                onChange={(item: DropdownItem) =>
                  setDropdownValue(item.value as string)
                }
                placeholder="Top placement"
                placement="top"
                dropdownWidth={150}
              />
            </View>

            <Text style={styles.label}>Dropdown with Custom Styling</Text>
            <Dropdown
              items={[
                { value: "react", label: "React Native" },
                { value: "flutter", label: "Flutter" },
                { value: "xamarin", label: "Xamarin" },
                { value: "ionic", label: "Ionic" },
                { value: "cordova", label: "Cordova" },
                { value: "native", label: "Native iOS/Android" },
              ]}
              value={searchableDropdownValue}
              onChange={(item: DropdownItem) =>
                setSearchableDropdownValue(item.value as string)
              }
              placeholder="Select framework..."
              maxHeight={200}
            />

            <Text style={styles.label}>Disabled Dropdown</Text>
            <Dropdown
              items={[
                { value: "enabled", label: "Enabled Option" },
                { value: "disabled", label: "Disabled Option", disabled: true },
              ]}
              value={dropdownValue}
              onChange={(item: DropdownItem) =>
                setDropdownValue(item.value as string)
              }
              placeholder="Disabled dropdown"
              disabled={true}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
