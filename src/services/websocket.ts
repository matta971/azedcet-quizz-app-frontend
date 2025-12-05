import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { config } from '../config';
import { syncStorage } from '../utils/storage';
import { WsMessage, WsEventType } from '../types';

type MessageHandler = (message: WsMessage) => void;

class WebSocketService {
  private client: Client | null = null;
  private handlers: Map<WsEventType, Set<MessageHandler>> = new Map();
  private matchSubscription: { unsubscribe: () => void } | null = null;
  private userSubscription: { unsubscribe: () => void } | null = null;
  private currentMatchId: string | null = null;

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      const token = syncStorage.getString(config.storage.accessTokenKey);

      console.log('[WebSocket] Attempting to connect to:', config.api.wsUrl);
      console.log('[WebSocket] Token present:', !!token);

      this.client = new Client({
        webSocketFactory: () => {
          console.log('[WebSocket] Creating SockJS connection...');
          const sock = new SockJS(config.api.wsUrl);
          return sock;
        },
        connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
        debug: (str) => {
          console.log('[STOMP]', str);
        },
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
        onConnect: () => {
          console.log('[WebSocket] STOMP Connected successfully!');
          this.subscribeToUserQueue();
          resolve();
        },
        onStompError: (frame) => {
          console.error('[WebSocket] STOMP error:', frame.headers['message']);
          reject(new Error(frame.headers['message']));
        },
        onDisconnect: () => {
          console.log('[WebSocket] Disconnected');
        },
        onWebSocketClose: (event) => {
          console.log('[WebSocket] WebSocket closed:', event);
        },
        onWebSocketError: (event) => {
          console.error('[WebSocket] WebSocket error:', event);
        },
      });

      this.client.activate();
    });
  }

  disconnect(): void {
    this.unsubscribeFromMatch();
    this.userSubscription?.unsubscribe();
    this.userSubscription = null;
    this.client?.deactivate();
    this.client = null;
  }

  private subscribeToUserQueue(): void {
    if (!this.client?.connected) return;

    this.userSubscription = this.client.subscribe('/user/queue/events', (message: IMessage) => {
      this.handleMessage(message);
    });
  }

  subscribeToMatch(matchId: string): void {
    if (!this.client?.connected) {
      console.warn('[WebSocket] Not connected, cannot subscribe to match');
      return;
    }

    // Unsubscribe from previous match if any
    this.unsubscribeFromMatch();

    this.currentMatchId = matchId;
    this.matchSubscription = this.client.subscribe(`/topic/match/${matchId}`, (message: IMessage) => {
      this.handleMessage(message);
    });

    console.log(`[WebSocket] Subscribed to match ${matchId}`);
  }

  unsubscribeFromMatch(): void {
    if (this.matchSubscription) {
      this.matchSubscription.unsubscribe();
      this.matchSubscription = null;
      console.log(`[WebSocket] Unsubscribed from match ${this.currentMatchId}`);
      this.currentMatchId = null;
    }
  }

  private handleMessage(message: IMessage): void {
    try {
      const wsMessage: WsMessage = JSON.parse(message.body);
      console.log('[WebSocket] Received:', wsMessage.type, wsMessage.payload);

      const handlers = this.handlers.get(wsMessage.type);

      if (handlers) {
        handlers.forEach((handler) => handler(wsMessage));
      } else {
        console.log('[WebSocket] No handlers registered for:', wsMessage.type);
      }

      // Also call global handlers
      const globalHandlers = this.handlers.get('*' as WsEventType);
      if (globalHandlers) {
        globalHandlers.forEach((handler) => handler(wsMessage));
      }
    } catch (error) {
      console.error('[WebSocket] Error parsing message:', error);
    }
  }

  on(eventType: WsEventType | '*', handler: MessageHandler): () => void {
    const type = eventType as WsEventType;
    if (!this.handlers.has(type)) {
      this.handlers.set(type, new Set());
    }
    this.handlers.get(type)!.add(handler);

    // Return unsubscribe function
    return () => {
      this.handlers.get(type)?.delete(handler);
    };
  }

  off(eventType: WsEventType, handler: MessageHandler): void {
    this.handlers.get(eventType)?.delete(handler);
  }

  // Send messages to server
  sendBuzzer(matchId: string): void {
    this.send(`/app/match/${matchId}/buzzer`, {});
  }

  sendAnswer(matchId: string, questionId: string, answer: string): void {
    this.send(`/app/match/${matchId}/answer`, { questionId, answer });
  }

  // === SMASH-specific methods ===

  /**
   * Send TOP button press (SMASH A only).
   */
  sendSmashTop(matchId: string): void {
    this.send(`/app/match/${matchId}/smash/top`, {});
  }

  /**
   * Send a SMASH question (attacker submits their question).
   */
  sendSmashQuestion(matchId: string, questionText: string): void {
    this.send(`/app/match/${matchId}/smash/question`, { questionText });
  }

  /**
   * Validate or invalidate a SMASH question (defender).
   */
  sendSmashValidate(matchId: string, valid: boolean, reason?: string): void {
    this.send(`/app/match/${matchId}/smash/validate`, { valid, reason });
  }

  /**
   * Send a SMASH answer (defender answers the question).
   */
  sendSmashAnswer(matchId: string, answer: string): void {
    this.send(`/app/match/${matchId}/smash/answer`, { answer });
  }

  /**
   * Validate the SMASH answer result (attacker confirms correct/incorrect).
   */
  sendSmashResult(matchId: string, correct: boolean): void {
    this.send(`/app/match/${matchId}/smash/result`, { correct });
  }

  private send(destination: string, body: object): void {
    if (!this.client?.connected) {
      console.warn('[WebSocket] Not connected, cannot send message');
      return;
    }

    this.client.publish({
      destination,
      body: JSON.stringify(body),
    });
  }

  get isConnected(): boolean {
    return this.client?.connected ?? false;
  }
}

export const wsService = new WebSocketService();
