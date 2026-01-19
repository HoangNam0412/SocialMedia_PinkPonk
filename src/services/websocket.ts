import { Client, IFrame, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import authService from './auth';

const API_URL = 'http://localhost:8080';

export interface WebSocketMessage {
  id?: number;
  senderId: number;
  content: string;
  conversationId?: number;
  receiverId?: number;
  mediaUrls?: string[];
  timestamp?: string;
  messageId?: number; // Thêm vào để hỗ trợ xóa tin nhắn
  type?: string; // Để phân biệt loại message (DELETE, ...)
}

class WebSocketService {
  private client: Client | null = null;
  private subscriptions = new Map<string, { id: string, callback: (message: WebSocketMessage) => void }>();
  private connected = false;
  private connectionCallbacks: (() => void)[] = [];
  private errorCallbacks: ((error: string) => void)[] = [];
  private reconnectCount = 0;
  private maxReconnects = 5;

  constructor() {
   // Không tự động khởi tạo - chờ lệnh kết nối rõ ràng
  // Điều này cung cấp thời gian để polyfill được tải đúng cách
  }

  private initializeClient() {
    try {
      // Create a test SockJS connection first to check compatibility
      try {
        const testSocket = new SockJS(`${API_URL}/ws`);
        testSocket.close();
      } catch (error) {
        console.error('SockJS initialization test failed:', error);
        this.handleConnectionError('WebSocket initialization failed. SockJS compatibility issue.');
        return;
      }

      this.client = new Client({
        webSocketFactory: () => new SockJS(`${API_URL}/ws`),
        connectHeaders: {
          Authorization: `Bearer ${authService.getToken()}`
        },
        debug: function (str) {
          console.log('STOMP: ' + str);
        },
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000
      });

      this.client.onConnect = (frame: IFrame) => {
        console.log('Connected to WebSocket:', frame);
        this.connected = true;
        this.reconnectCount = 0;
        // Resubscribe to all topics
        this.subscriptions.forEach((subscription, topic) => {
          this.subscribeToTopic(topic, subscription.callback);
        });
        // Call connection callbacks
        this.connectionCallbacks.forEach(callback => callback());
      };

      this.client.onStompError = (frame: IFrame) => {
        console.error('STOMP error:', frame);
        this.connected = false;
        this.handleConnectionError('WebSocket connection error');
      };

      this.client.onWebSocketClose = () => {
        console.log('WebSocket closed');
        this.connected = false;
        
        // Try to reconnect with a limit
        if (this.reconnectCount < this.maxReconnects) {
          this.reconnectCount++;
          console.log(`Attempting to reconnect (${this.reconnectCount}/${this.maxReconnects})...`);
          setTimeout(() => this.connect(), 3000 * this.reconnectCount);
        } else {
          this.handleConnectionError('WebSocket disconnected and max reconnection attempts reached');
        }
      };

      this.client.onWebSocketError = (event) => {
        console.error('WebSocket error:', event);
        this.handleConnectionError('WebSocket connection error');
      };

      this.client.activate();
    } catch (error) {
      console.error('Error initializing WebSocket:', error);
      this.handleConnectionError('Failed to initialize WebSocket connection');
    }
  }

  private handleConnectionError(message: string) {
    // Notify all error callbacks
    this.errorCallbacks.forEach(callback => callback(message));
  }

  public connect() {
    try {
      if (!this.client) {
        this.initializeClient();
      } else if (!this.client.active) {
        this.client.activate();
      }
    } catch (error) {
      console.error('Error connecting to WebSocket:', error);
      this.handleConnectionError('Failed to connect to WebSocket');
    }
  }

  public disconnect() {
    try {
      if (this.client && this.client.active) {
        this.client.deactivate();
        this.connected = false;
      }
    } catch (error) {
      console.error('Error disconnecting from WebSocket:', error);
    }
  }

  public subscribeToTopic(topic: string, callback: (message: WebSocketMessage) => void) {
    if (!this.client) {
      console.log('STOMP client not initialized, initializing now');
      this.connect();
      
      // Store subscription to apply when connected
      this.subscriptions.set(topic, { id: '', callback });
      return;
    }

    if (this.subscriptions.has(topic)) {
      // Already subscribed to this topic
      this.subscriptions.get(topic)!.callback = callback;
      return;
    }

    if (this.connected) {
      try {
        const subscription = this.client.subscribe(topic, (message: IMessage) => {
          try {
            const parsedMessage = JSON.parse(message.body) as WebSocketMessage;
            callback(parsedMessage);
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        });

        this.subscriptions.set(topic, { id: subscription.id, callback });
      } catch (error) {
        console.error('Error subscribing to topic:', error);
      }
    } else {
      // Store subscription to resubscribe when connected
      this.subscriptions.set(topic, { id: '', callback });
    }
  }

  public unsubscribe(topic: string) {
    try {
      if (!this.client || !this.subscriptions.has(topic)) return;

      const subscription = this.subscriptions.get(topic);
      if (subscription && this.connected) {
        this.client.unsubscribe(subscription.id);
      }
      this.subscriptions.delete(topic);
    } catch (error) {
      console.error('Error unsubscribing from topic:', error);
    }
  }

  public sendMessage(destination: string, message: WebSocketMessage) {
    if (!this.client || !this.connected) {
      console.error('Cannot send message, no active connection');
      return Promise.reject('No active connection');
    }

    return new Promise<void>((resolve, reject) => {
      try {
        console.log(`Sending message to ${destination}:`, message);
        this.client!.publish({
          destination,
          body: JSON.stringify(message),  
          headers: {
            'content-type': 'application/json'
          }
        });
        resolve();
      } catch (error) {
        console.error('Error sending message:', error);
        reject(error);
      }
    });
  }

  public onConnect(callback: () => void) {
    this.connectionCallbacks.push(callback);
    if (this.connected) {
      callback();
    }
  }

  public onError(callback: (error: string) => void) {
    this.errorCallbacks.push(callback);
  }

  public isConnected() {
    return this.connected;
  }
}

export const webSocketService = new WebSocketService();
export default webSocketService; 