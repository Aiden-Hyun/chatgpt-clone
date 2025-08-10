export const generateMessageId = (): string => {
  return `msg_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
};

export const generateRequestId = (): string => {
  return `req_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}; 