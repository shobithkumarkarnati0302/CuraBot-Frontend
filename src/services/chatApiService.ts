import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api/chat`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Types
export interface ChatPreferences {
  theme: 'light' | 'dark' | 'high-contrast';
  fontSize: 'small' | 'medium' | 'large';
  bubbleStyle: 'rounded' | 'square' | 'bubble';
  userAvatar: string;
  botAvatar: string;
  viewMode: 'normal' | 'mini' | 'split';
  showQuickToolbar: boolean;
  showActionSuggestions: boolean;
  soundEnabled: boolean;
  currentLanguage: string;
  position: { x: number; y: number };
}

export interface ChatMessage {
  messageId: string;
  sessionId: string;
  type: 'user' | 'bot';
  content: string;
  language?: string;
  liked?: boolean;
  disliked?: boolean;
  confidence?: number;
  source?: 'ai' | 'knowledge_base' | 'fallback';
  suggestions?: string[];
  imageDataUrl?: string;
  aiResponse?: {
    model: string;
    tokens: number;
    processingTime: number;
  };
  createdAt: Date;
}

export interface ChatSession {
  sessionId: string;
  title: string;
  messageCount: number;
  lastActivity: Date;
  isActive: boolean;
}

// Chat Preferences API
export const chatPreferencesApi = {
  // Get user preferences
  getPreferences: async (): Promise<ChatPreferences> => {
    const response = await apiClient.get('/preferences');
    return response.data.preferences;
  },

  // Update preferences
  updatePreferences: async (preferences: Partial<ChatPreferences>): Promise<ChatPreferences> => {
    const response = await apiClient.put('/preferences', preferences);
    return response.data.preferences;
  },

  // Update chatbot position
  updatePosition: async (x: number, y: number): Promise<void> => {
    await apiClient.patch('/preferences/position', { x, y });
  },

  // Reset to defaults
  resetPreferences: async (): Promise<ChatPreferences> => {
    const response = await apiClient.post('/preferences/reset');
    return response.data.preferences;
  },
};

// Chat Session API
export const chatSessionApi = {
  // Get or create session
  getOrCreateSession: async (sessionId?: string): Promise<ChatSession> => {
    const response = await apiClient.post('/session', { sessionId });
    return response.data.session;
  },

  // Get user sessions
  getUserSessions: async (page = 1, limit = 20): Promise<{ sessions: ChatSession[]; pagination: any }> => {
    const response = await apiClient.get(`/sessions?page=${page}&limit=${limit}`);
    return response.data;
  },

  // Delete session
  deleteSession: async (sessionId: string): Promise<void> => {
    await apiClient.delete(`/session/${sessionId}`);
  },

  // Clear all history
  clearAllHistory: async (): Promise<void> => {
    await apiClient.delete('/history/clear');
  },
};

// Chat Message API
export const chatMessageApi = {
  // Save message
  saveMessage: async (message: Omit<ChatMessage, 'createdAt'>): Promise<string> => {
    const response = await apiClient.post('/message', message);
    return response.data.messageId;
  },

  // Get chat history
  getChatHistory: async (sessionId: string, page = 1, limit = 50): Promise<{ messages: ChatMessage[]; pagination: any }> => {
    const response = await apiClient.get(`/history/${sessionId}?page=${page}&limit=${limit}`);
    return response.data;
  },

  // Update message reaction
  updateMessageReaction: async (messageId: string, liked?: boolean, disliked?: boolean): Promise<void> => {
    await apiClient.patch(`/message/${messageId}/reaction`, { liked, disliked });
  },
};

// Combined service class
export class ChatApiService {
  preferences = chatPreferencesApi;
  sessions = chatSessionApi;
  messages = chatMessageApi;

  // Initialize user preferences on first load
  async initializeUserPreferences(): Promise<ChatPreferences> {
    try {
      return await this.preferences.getPreferences();
    } catch (error) {
      console.error('Failed to load user preferences:', error);
      // Return default preferences if API fails
      return {
        theme: 'light',
        fontSize: 'medium',
        bubbleStyle: 'rounded',
        userAvatar: 'U',
        botAvatar: '🤖',
        viewMode: 'normal',
        showQuickToolbar: true,
        showActionSuggestions: true,
        soundEnabled: true,
        currentLanguage: 'en',
        position: { x: 0, y: 0 }
      };
    }
  }

  // Save preferences with debouncing
  private savePreferencesTimeout: NodeJS.Timeout | null = null;
  
  async savePreferencesDebounced(preferences: Partial<ChatPreferences>, delay = 500): Promise<void> {
    if (this.savePreferencesTimeout) {
      clearTimeout(this.savePreferencesTimeout);
    }

    this.savePreferencesTimeout = setTimeout(async () => {
      try {
        await this.preferences.updatePreferences(preferences);
      } catch (error) {
        console.error('Failed to save preferences:', error);
      }
    }, delay);
  }

  // Auto-save chat messages
  async autoSaveMessage(message: Omit<ChatMessage, 'createdAt'>): Promise<void> {
    try {
      await this.messages.saveMessage(message);
    } catch (error) {
      console.error('Failed to auto-save message:', error);
      // Could implement local storage fallback here
    }
  }
}

export default new ChatApiService();
