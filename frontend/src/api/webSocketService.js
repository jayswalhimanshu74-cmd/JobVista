import SockJS from 'sockjs-client';
import Stomp from 'stompjs';

class WebSocketService {
    constructor() {
        this.stompClient = null;
        this.subscriptions = new Map();
        this.connected = false;
        this.pendingSubscriptions = [];
    }

    connect(onConnected, onError) {

        // Prevent duplicate connections
        if (this.connected) {
            return;
        }

        const WS_URL =
            import.meta.env.VITE_WS_URL ||
            'https://jobvista-psro.onrender.com/ws';

        const socket = new SockJS(WS_URL);

        this.stompClient = Stomp.over(socket);

        // Disable logs
        this.stompClient.debug = null;

        // Auto reconnect delay
        this.stompClient.reconnect_delay = 5000;

        const headers = {};

        const token = localStorage.getItem('accessToken');

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        this.stompClient.connect(
            headers,

            () => {
                console.log('WebSocket Connected');

                this.connected = true;

                // Subscribe pending topics
                this.pendingSubscriptions.forEach(sub => {
                    this.subscribe(sub.topic, sub.callback);
                });

                this.pendingSubscriptions = [];

                if (onConnected) {
                    onConnected();
                }
            },

            (error) => {

                console.error('WebSocket Error:', error);

                this.connected = false;

                if (onError) {
                    onError(error);
                }
            }
        );
    }

    subscribe(topic, callback) {
        // Queue subscription if socket not ready OR STOMP not connected
        if (!this.stompClient || !this.stompClient.connected) {
            console.warn('WebSocket STOMP not ready. Queuing subscription:', topic);
            this.pendingSubscriptions.push({ topic, callback });
            return;
        }

        // Prevent duplicate subscriptions
        if (this.subscriptions.has(topic)) {
            return;
        }

        const subscription = this.stompClient.subscribe(
            topic,
            (message) => {

                try {

                    const body = message.body;

                    const parsed =
                        body &&
                        (body.startsWith('{') ||
                         body.startsWith('['))
                            ? JSON.parse(body)
                            : body;

                    callback(parsed);

                } catch (e) {

                    console.warn(
                        'WebSocket parsing error:',
                        e
                    );

                    callback(message.body);
                }
            }
        );

        this.subscriptions.set(topic, subscription);
    }

    unsubscribe(topic) {

        const subscription =
            this.subscriptions.get(topic);

        if (subscription) {

            subscription.unsubscribe();

            this.subscriptions.delete(topic);
        }
    }

    disconnect() {

        try {

            this.subscriptions.forEach(sub => {
                sub.unsubscribe();
            });

            this.subscriptions.clear();

            this.pendingSubscriptions = [];

            if (
                this.stompClient &&
                this.connected
            ) {

                this.stompClient.disconnect(() => {
                    console.log('WebSocket Disconnected');
                });
            }

        } catch (e) {

            console.warn(
                'Disconnect Error:',
                e
            );

        } finally {

            this.connected = false;
            this.stompClient = null;
        }
    }
}

const webSocketService = new WebSocketService();

export default webSocketService;