import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

class WebSocketService {
    constructor() {
        this.client = null;
        this.subscriptions = new Map();
        this.onConnectedCallbacks = new Set();
        this.isConnected = false;
    }

    connect(onConnected) {
        if (this.client && this.client.active) {
            if (onConnected) onConnected();
            return;
        }

        if (onConnected) {
            this.onConnectedCallbacks.add(onConnected);
        }

        const WS_URL =
            import.meta.env.VITE_WS_URL ||
            'https://jobvista-psro.onrender.com/ws';

        this.client = new Client({
            brokerURL: WS_URL.startsWith('https') 
                ? WS_URL.replace('https', 'wss') 
                : WS_URL.replace('http', 'ws'),
            
            // Fallback to SockJS if WebSocket is not available
            webSocketFactory: () => new SockJS(WS_URL),
            
            connectHeaders: {
                Authorization: `Bearer ${localStorage.getItem('accessToken')}`
            },
            
            debug: (str) => {
                // Enable this for troubleshooting in development
                // console.log('STOMP: ' + str);
            },
            
            reconnectDelay: 5000,
            heartbeatIncoming: 10000,
            heartbeatOutgoing: 10000,
        });

        this.client.onConnect = (frame) => {
            console.log('WebSocket Connected');
            this.isConnected = true;
            
            // Execute all pending connection callbacks
            this.onConnectedCallbacks.forEach(cb => cb());
            this.onConnectedCallbacks.clear();

            // Re-subscribe to all topics in case of reconnect
            this.subscriptions.forEach((sub, topic) => {
                // The old subscription object is invalid, we need to re-subscribe
                this._subscribeToTopic(topic, sub.callback);
            });
        };

        this.client.onStompError = (frame) => {
            console.error('STOMP Error:', frame.headers['message']);
            console.error('Details:', frame.body);
        };

        this.client.onWebSocketClose = () => {
            this.isConnected = false;
            console.warn('WebSocket Connection Closed');
        };

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