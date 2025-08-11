// src/features/chat/services/implementations/MobileStorageService.ts
import mobileStorage from '../../../../shared/lib/mobileStorage';
import { IStorageService } from '../interfaces/IStorageService';
import { ChatMessage } from '../types';

export class MobileStorageService implements IStorageService {
  async storeMessages(roomId: number, messages: ChatMessage[]): Promise<void> {
    try {
      mobileStorage.setItem(`chat_messages_${roomId}`, JSON.stringify(messages));
      if (__DEV__) { console.log(`[storage] Saved messages for room ${roomId}`); }
    } catch (error) {
      console.error('[storage] Failed to store messages:', error);
      throw error;
    }
  }

  async getMessages(roomId: number): Promise<ChatMessage[] | null> {
    try {
      const stored = await mobileStorage.getItem(`chat_messages_${roomId}`);
      if (!stored) return null;
      
      const messages = JSON.parse(stored) as ChatMessage[];
      if (__DEV__) { console.log(`[storage] Retrieved messages for room ${roomId}`); }
      return messages;
    } catch (error) {
      console.error('[storage] Failed to get messages:', error);
      return null;
    }
  }

  async storeModel(roomId: number, model: string): Promise<void> {
    try {
      mobileStorage.setItem(`chat_model_${roomId}`, model);
      if (__DEV__) { console.log(`[storage] Saved model (${model}) for room ${roomId}`); }
    } catch (error) {
      console.error('[storage] Failed to store model:', error);
      throw error;
    }
  }

  async getModel(roomId: number): Promise<string | null> {
    try {
      const model = await mobileStorage.getItem(`chat_model_${roomId}`);
      return model;
    } catch (error) {
      console.error('[storage] Failed to get model:', error);
      return null;
    }
  }

  async markAsNewRoom(roomId: number): Promise<void> {
    try {
      mobileStorage.setItem(`new_room_created_${roomId}`, 'true');
      if (__DEV__) { console.log(`[storage] Marked room ${roomId} as new`); }
    } catch (error) {
      console.error('[storage] Failed to mark room as new:', error);
      throw error;
    }
  }

  async isNewRoom(roomId: number): Promise<boolean> {
    try {
      const flag = await mobileStorage.getItem(`new_room_created_${roomId}`);
      return flag === 'true';
    } catch (error) {
      console.error('[storage] Failed to check if room is new:', error);
      return false;
    }
  }

  async clearRoomData(roomId: number): Promise<void> {
    try {
      mobileStorage.removeItem(`chat_messages_${roomId}`);
      mobileStorage.removeItem(`chat_model_${roomId}`);
      mobileStorage.removeItem(`new_room_created_${roomId}`);
      if (__DEV__) { console.log(`[storage] Cleared all data for room ${roomId}`); }
    } catch (error) {
      console.error('[storage] Failed to clear room data:', error);
      throw error;
    }
  }
} 