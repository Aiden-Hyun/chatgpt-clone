import { Ionicons } from "@expo/vector-icons";
import { router, usePathname } from "expo-router";
import React, { useEffect, useState } from "react";
import { ScrollView, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useUserInfo } from "@/entities/user";
import { useToast } from "@/features/alert";
import { useChatRooms } from "@/features/chat";
import { useLanguageContext } from "@/features/language";
import { useAppTheme } from "@/features/theme";
import { Button, ListItem, Text } from "@/shared/components";

import mobileStorage from "../../../../shared/lib/mobileStorage";
import { navigationTracker } from "../../../../shared/lib/navigationTracker";
import { SIDEBAR_SNIPPET_MAX_LENGTH } from "../../constants";

import { createSidebarStyles } from "./Sidebar.styles";

interface SidebarProps {
  onNewChat?: () => void;
  onChatSelect?: (roomId: string) => void;
  onSettings?: () => void;
  onLogout?: () => void;
  selectedChatId?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  onNewChat,
  onChatSelect,
  onSettings,
  onLogout,
  selectedChatId,
}) => {
  const theme = useAppTheme();
  const { t } = useLanguageContext();
  const { showSuccess } = useToast();
  const { userName } = useUserInfo();
  const { rooms, deleteRoom, fetchRooms } = useChatRooms();
  const pathname = usePathname(); // ← Add this line
  const styles = createSidebarStyles(theme);

  // Local state for room drafts loaded from storage
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  // Load drafts for visible rooms when drawer opens or rooms change
  useEffect(() => {
    const loadDrafts = async () => {
      try {
        const entries = await Promise.all(
          rooms.map(async (r) => {
            const key = `chat_draft_${r.id}`;
            const value = await mobileStorage.getItem(key);
            return [r.id.toString(), value ?? ""] as const;
          })
        );
        const next: Record<string, string> = {};
        for (const [id, val] of entries) {
          if (val && val.trim().length > 0) next[id] = val;
        }
        setDrafts(next);
      } catch {
        // noop
      }
    };
    loadDrafts();
  }, [rooms]);

  const handleChatSelect = (roomId: string) => {
    console.log("🎯 [DRAWER] Chat selected", { roomId });
    if (onChatSelect) {
      onChatSelect(roomId);
    } else {
      router.push(`/chat/${roomId}`);
    }
  };

  const handleNewChat = async () => {
    console.log("🔍 [DRAWER] New chat button pressed");
    console.log("🔍 [DRAWER] onNewChat prop:", !!onNewChat);

    // Always clear search mode from storage to ensure new chat starts fresh
    try {
      console.log("🔍 [DRAWER] Clearing search mode from storage...");
      const beforeClear = await mobileStorage.getItem("chat_search_mode");
      console.log("🔍 [DRAWER] Search mode before clear:", beforeClear);

      await mobileStorage.removeItem("chat_search_mode");
      console.log("🔍 [DRAWER] Cleared search mode for new chat");

      const afterClear = await mobileStorage.getItem("chat_search_mode");
      console.log("🔍 [DRAWER] Search mode after clear:", afterClear);
    } catch (error) {
      console.warn("[DRAWER] Failed to clear search mode:", error);
    }

    if (onNewChat) {
      console.log("🔍 [DRAWER] Calling onNewChat prop");
      onNewChat();
    } else {
      console.log("🔍 [DRAWER] No onNewChat prop, navigating to /chat");
      router.push("/chat");
    }
  };

  const handleSettings = () => {
    // Store the current pathname before navigating to settings
    const currentPath = pathname;
    navigationTracker.setPreviousRoute(currentPath);

    if (onSettings) {
      onSettings();
    } else {
      router.push("/settings");
    }
  };

  const handleDelete = async (roomId: number) => {
    console.log("[DRAWER] delete icon pressed", { roomId });
    try {
      await deleteRoom(roomId);
      showSuccess(t("chat.room_deleted"), 2500);
      fetchRooms?.();
    } catch (e) {
      console.log("[DRAWER] delete failed", e);
    }
  };

  // Render the draft badge and snippet if a draft exists
  const renderDraftContent = (roomId: string) => {
    const draft = drafts[roomId];
    if (draft && draft.trim().length > 0) {
      const compact = draft.replace(/\s+/g, " ").trim();
      const snippet =
        compact.length > SIDEBAR_SNIPPET_MAX_LENGTH
          ? `${compact.slice(0, SIDEBAR_SNIPPET_MAX_LENGTH)}…`
          : compact;

      return (
        <View style={styles.subtitleRow}>
          <View style={styles.draftBadge}>
            <Text
              variant="caption"
              size="xs"
              weight="semibold"
              color={theme.colors.status.info.primary}
            >
              Draft
            </Text>
          </View>
          <Text variant="caption" numberOfLines={1}>
            {snippet}
          </Text>
        </View>
      );
    }

    return null;
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Button
            variant="secondary"
            size="sm"
            leftIcon={
              <Ionicons
                name="add-outline"
                size={20}
                color={theme.colors.text.primary}
              />
            }
            label={t("sidebar.new_chat")}
            onPress={handleNewChat}
            containerStyle={styles.newChatButton}
          />

          {/* Test Button for New Source Implementation */}
          <TouchableOpacity
            style={styles.testButton}
            onPress={() => router.push("/source-test")}
          >
            <Ionicons name="flask-outline" size={16} color="#FF6B35" />
            <Text style={styles.testButtonText}>🧪 Test New Features</Text>
          </TouchableOpacity>
        </View>

        {/* Chat History */}
        <ScrollView
          style={styles.chatHistory}
          showsVerticalScrollIndicator={false}
        >
          {rooms.map((room) => {
            const isSelected = pathname?.includes(`/chat/${room.id}`); // ← Use pathname instead of router.pathname
            const draft = drafts[room.id.toString()];
            const hasDraft = draft && draft.trim().length > 0;

            // Prepare subtitle content
            let subtitle = room.last_message || t("sidebar.no_messages");

            // Prepare right element (delete button)
            const rightElement = (
              <TouchableOpacity
                style={styles.chatItemDelete}
                onPress={() => handleDelete(room.id)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons
                  name="trash-outline"
                  size={18}
                  color={theme.colors.status.error.primary}
                />
              </TouchableOpacity>
            );

            // Prepare left element (chat icon)
            const leftElement = (
              <Ionicons
                name="chatbubbles-outline"
                size={16}
                color={
                  isSelected
                    ? theme.colors.primary
                    : theme.colors.text.secondary
                }
              />
            );

            return (
              <ListItem
                key={room.id}
                variant="chat"
                title={room.name}
                subtitle={hasDraft ? undefined : subtitle}
                description={undefined}
                leftElement={leftElement}
                rightElement={rightElement}
                selected={isSelected}
                showBorder={false}
                onPress={() => handleChatSelect(room.id.toString())}
                containerStyle={styles.chatItem}
              >
                {hasDraft && renderDraftContent(room.id.toString())}
              </ListItem>
            );
          })}
        </ScrollView>

        {/* User Profile */}
        <View style={styles.userProfile}>
          <View style={styles.userInfo}>
            <Ionicons
              name="person-outline"
              size={20}
              color={theme.colors.text.secondary}
            />
            <Text variant="body" weight="medium" style={styles.userName}>
              {userName || t("sidebar.user")}
            </Text>
          </View>
          <Button
            variant="ghost"
            size="sm"
            onPress={handleSettings}
            leftIcon={
              <Ionicons
                name="settings-outline"
                size={20}
                color={theme.colors.text.secondary}
              />
            }
            containerStyle={styles.settingsButton}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};
