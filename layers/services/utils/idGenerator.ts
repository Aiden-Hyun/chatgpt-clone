// Pure ID generation utilities - no external dependencies

export const generateMessageId = (): string => {
  // Generate an RFC4122-like UUID v4 without external dependencies
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
    const randomNibble = (Math.random() * 16) | 0;
    const value = char === 'x' ? randomNibble : (randomNibble & 0x3) | 0x8;
    return value.toString(16);
  });
};

export const generateRequestId = (): string => {
  return `req_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
};

export const generateRoomId = (): string => {
  return `room_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};

export const generateClientId = (): string => {
  return `client_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
};
