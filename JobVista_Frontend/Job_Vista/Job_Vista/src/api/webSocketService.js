import SockJS from 'sockjs-client';
import Stomp from 'stompjs';

class WebSocketService {
    constructor() {
        this.stompClient = null;
        this.subscriptions = new Map();
    }

    connect(onConnected, onError) {
        const socket = new SockJS('http://localhost:8080/ws');
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
            callback(JSON.parse(message.body));
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
        if (this.stompClient !== null) {
            this.stompClient.disconnect();
        }
        this.subscriptions.clear();
        console.log("Disconnected WebSocket");
    }
}

const webSocketService = new WebSocketService();
export default webSocketService;
