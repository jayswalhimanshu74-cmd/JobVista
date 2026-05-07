import SockJS from 'sockjs-client';
import Stomp from 'stompjs';

class WebSocketService {
    constructor() {
        this.stompClient = null;
        this.subscriptions = new Map();
    }

    connect(onConnected, onError) {
        const WS_URL = import.meta.env.VITE_WS_URL || 'https://jobvista-psro.onrender.com/ws';
        const socket = new SockJS(WS_URL);
        this.stompClient = Stomp.over(socket);
        this.stompClient.debug = null; // Disable logging for production-ready quality

        const headers = {};
        const token = localStorage.getItem('accessToken');
        if (token) {
            headers['Authorization'] = 'Bearer ' + token;
        }

        this.stompClient.connect(headers, () => {
            if (onConnected) onConnected();
        }, (error) => {
            console.error('WebSocket Error:', error);
            if (onError) onError(error);
        });
    }

    subscribe(topic, callback) {
        if (!this.stompClient || !this.stompClient.connected) {
            console.warn('WebSocket not connected. Cannot subscribe to', topic);
            return;
        }

        const subscription = this.stompClient.subscribe(topic, (message) => {
            try {
                // Safely parse JSON or return the raw body if it's just a string
                const body = message.body;
                const parsed = (body && (body.startsWith('{') || body.startsWith('['))) 
                    ? JSON.parse(body) 
                    : body;
                callback(parsed);
            } catch (e) {
                console.warn('WebSocket message parsing error:', e, 'Body:', message.body);
                callback(message.body);
            }
        });

        this.subscriptions.set(topic, subscription);
        return subscription;
    }

    unsubscribe(topic) {
        const subscription = this.subscriptions.get(topic);
        if (subscription) {
            subscription.unsubscribe();
            this.subscriptions.delete(topic);
        }
    }

    disconnect() {
        if (this.stompClient !== null && this.stompClient.connected) {
            try {
                this.stompClient.disconnect();
            } catch (e) {
                console.warn("Error during WebSocket disconnect:", e);
            }
        }
        this.stompClient = null;
        this.subscriptions.clear();
        console.log("Disconnected WebSocket");
    }
}

const webSocketService = new WebSocketService();
export default webSocketService;
