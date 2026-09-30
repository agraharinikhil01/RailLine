import { apiClient } from './api';
import { ChatResponse } from '@railline/types';

export interface ChatHistoryItem {
  role: 'user' | 'assistant';
  content: string;
}

export const aiService = {
  async askRailAI(
    message: string,
    trainNumber?: string,
    history?: ChatHistoryItem[]
  ): Promise<ChatResponse> {
    const endpoint = trainNumber ? `/trains/${trainNumber}/chat` : `/trains/chat`;
    return apiClient<ChatResponse>(endpoint, {
      method: 'POST',
      body: JSON.stringify({ message, trainNumber, history }),
    });
  },
};
