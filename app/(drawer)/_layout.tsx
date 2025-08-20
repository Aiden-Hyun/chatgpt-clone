import { router, usePathname } from 'expo-router';
import { Drawer } from 'expo-router/drawer';
import { useLogout } from '../../src/features/auth';
import { CustomDrawer } from '../../src/features/chat/components/CustomDrawer';
import { useChatRooms } from '../../src/features/chat/hooks';
import { navigationTracker } from '../../src/shared/lib/navigationTracker';

export default function DrawerLayout() {
  const { logout } = useLogout();
  const { rooms } = useChatRooms();
  const pathname = usePathname();

  const handleNewChat = () => {
    router.push('/chat/temp_new');
  };

  const handleChatSelect = (roomId: string) => {
    router.push(`/chat/${roomId}`);
  };

  const handleSettings = () => {
    // Store the current pathname before navigating to settings
    const currentPath = pathname || '/chat';
    console.log('[DRAWER-LAYOUT] Current path before settings:', currentPath);
    navigationTracker.setPreviousRoute(currentPath);
    router.push('/settings');
  };

  return (
    <Drawer
      drawerContent={() => (
        <CustomDrawer
          onNewChat={handleNewChat}
          onChatSelect={handleChatSelect}
          onSettings={handleSettings}
          onLogout={logout}
          selectedChatId={rooms.find(r => r.id.toString() === pathname?.split('/').pop())?.id.toString()}
        />
      )}
      screenOptions={{
        headerShown: false,
        drawerStyle: {
          backgroundColor: '#fff',
          width: 320,
        },
        drawerType: 'front',
      }}
    >
      <Drawer.Screen name="index" />
      <Drawer.Screen name="(auth)" />
      <Drawer.Screen name="settings/index" />
      <Drawer.Screen name="settings/theme-settings" />
      <Drawer.Screen name="theme-showcase" />
      <Drawer.Screen name="chat/index" />
      <Drawer.Screen name="chat/[roomId]" />
      <Drawer.Screen name="design-showcase" />
    </Drawer>
  );
}