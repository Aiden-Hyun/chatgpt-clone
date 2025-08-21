import { Button, ListItem } from '@/components/ui';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { View } from 'react-native';
import { useAppTheme } from '../../../theme/theme';
import { createRoomListItemStyles } from './RoomListItem.styles';

interface ChatRoom {
  id: number;
  name: string;
}

interface Props {
  room: ChatRoom;
  onDelete: () => void;
  onPress: () => void;
}

const RoomListItem: React.FC<Props> = ({ room, onDelete, onPress }) => {
  // Get styles from dedicated style file - memoized to prevent re-renders
  const theme = useAppTheme();
  const styles = React.useMemo(() => createRoomListItemStyles(theme), [theme]);
  
  return (
    <View style={styles.roomContainer}>
      <ListItem
        title={room.name}
        onPress={onPress}
        containerStyle={styles.room}
      />
      <Button
        variant="ghost"
        size="sm"
        status="error"
        leftIcon={<Ionicons name="trash-outline" size={20} color={theme.colors.status.error.primary} />}
        onPress={onDelete}
        containerStyle={styles.deleteButton}
      />
    </View>
  );
};

export default RoomListItem;
