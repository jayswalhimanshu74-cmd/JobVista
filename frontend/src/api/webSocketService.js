import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { getAccessToken } from '../utills/tokenStore';


class WebSocketService {
    constructor() {
        this.client = null;
        this.subscriptions = new Map();
        this.onConnectedCallbacks = new Set();
        this.isConnected = false;
    }

 connect(onConnected) {
  const token = getAccessToken();
  const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:8080';

  const socket = new SockJS(WS_URL.endsWith('/ws') ? WS_URL : `${WS_URL}/ws`);
  this.client = new Client({
    webSocketFactory: () => socket,
    connectHeaders: token ? {
      Authorization: `Bearer ${token}`  // ✅ send JWT on connect
    } : {},
    heartbeatIncoming: 10000,
    heartbeatOutgoing: 10000,
    onConnect: () => {
      this.connected = true;
      if (onConnected) onConnected();
    },
    onDisconnect: () => {
      this.connected = false;
    },
    onStompError: (frame) => {
      console.error("STOMP error:", frame);
    }
  });

  this.client.activate();
}

    subscribe(topic, callback) {
        // Store the intent to subscribe
        this.subscriptions.set(topic, { callback, stompSubscription: null });

        if (this.isConnected) {
            this._subscribeToTopic(topic, callback);
        }
    }

    _subscribeToTopic(topic, callback) {
        const entry = this.subscriptions.get(topic);
        if (entry && entry.stompSubscription) {
            entry.stompSubscription.unsubscribe();
        }

        const stompSubscription = this.client.subscribe(topic, (message) => {
            try {
                const parsed = JSON.parse(message.body);
                callback(parsed);
            } catch (e) {
                callback(message.body);
            }
        });

        this.subscriptions.set(topic, { callback, stompSubscription });
    }

    unsubscribe(topic) {
        const entry = this.subscriptions.get(topic);
        if (entry && entry.stompSubscription) {
            entry.stompSubscription.unsubscribe();
        }
        this.subscriptions.delete(topic);
    }

    disconnect() {
        if (this.client) {
            this.client.deactivate();
            this.client = null;
            this.isConnected = false;
            this.subscriptions.clear();
            this.onConnectedCallbacks.clear();
            console.log('WebSocket Disconnected');
        }
    }
}

const webSocketService = new WebSocketService();
export default webSocketService;