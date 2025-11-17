import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const API_URL = process.env.REACT_APP_URL_BACK_END;
class SocketService {
    constructor() {
        this.stompClient = null;
        this.connected = false;
        this.listeners = new Map();
        this.subscriptions = new Map();
        this.token = null;
    }

    /**
     * Conecta ao servidor WebSocket usando SockJS e STOMP
     * @param {string} token - JWT token para autenticação
     */
    connect(token) {
        if (this.stompClient && this.connected) {
            console.log('Socket já está conectado');
            return;
        }

        this.token = token;

        try {
            // Cria o cliente STOMP com token na URL
            this.stompClient = new Client({
                webSocketFactory: () => {
                    // Envia o token como query parameter na URL
                    const socket = new SockJS(`${API_URL}/ws-auction?token=${token}`);
                    return socket;
                },
                connectHeaders: {
                    Authorization: `Bearer ${token}`
                },
                debug: (str) => {
                    console.log('STOMP Debug:', str);
                },
                reconnectDelay: 5000,
                heartbeatIncoming: 4000,
                heartbeatOutgoing: 4000,
            });

            this.setupEventListeners();
            this.stompClient.activate();
        } catch (error) {
            console.error('Erro ao conectar socket:', error);
        }
    }

    /**
     * Configura os event listeners básicos do STOMP
     */
    setupEventListeners() {
        this.stompClient.onConnect = (frame) => {
            this.connected = true;
            console.log('✅ STOMP conectado:', frame);

            // Inscreve-se em tópicos gerais
            this.subscribeToTopic('/topic/auctions', 'auction_update');
            this.subscribeToTopic('/topic/bids', 'new_bid');
            this.subscribeToTopic('/topic/auction-started', 'auction_started');
            this.subscribeToTopic('/topic/auction-ended', 'auction_ended');

            // Inscreve-se em mensagens de usuário específico (se necessário)
            if (this.token) {
                this.subscribeToTopic('/user/queue/notifications', 'user_notification');
            }
        };

        this.stompClient.onDisconnect = (frame) => {
            this.connected = false;
            console.log('❌ STOMP desconectado:', frame);
        };

        this.stompClient.onStompError = (frame) => {
            console.error('❌ Erro STOMP:', frame.headers['message']);
            console.error('Detalhes:', frame.body);
        };

        this.stompClient.onWebSocketError = (error) => {
            console.error('❌ Erro WebSocket:', error);
        };
    }

    /**
     * Inscreve-se em um tópico STOMP
     * @param {string} topic - Tópico para se inscrever
     * @param {string} eventName - Nome do evento para notificar listeners
     */
    subscribeToTopic(topic, eventName) {
        if (!this.stompClient || !this.connected) {
            console.warn('Cliente STOMP não está conectado');
            return;
        }

        const subscription = this.stompClient.subscribe(topic, (message) => {
            try {
                const data = JSON.parse(message.body);
                this.notifyListeners(eventName, data);
            } catch (error) {
                console.error('Erro ao processar mensagem:', error);
            }
        });

        this.subscriptions.set(topic, subscription);
    }

    /**
     * Cancela inscrição em um tópico
     * @param {string} topic - Tópico para cancelar inscrição
     */
    unsubscribeFromTopic(topic) {
        const subscription = this.subscriptions.get(topic);
        if (subscription) {
            subscription.unsubscribe();
            this.subscriptions.delete(topic);
            console.log(`📺 Cancelada inscrição no tópico: ${topic}`);
        }
    }

    /**
     * Adiciona um listener para eventos personalizados
     * @param {string} event - Nome do evento
     * @param {Function} callback - Função callback
     */
    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);

        // Retorna função para remover o listener
        return () => {
            const callbacks = this.listeners.get(event);
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        };
    }

    /**
     * Notifica todos os listeners de um evento
     * @param {string} event - Nome do evento
     * @param {any} data - Dados do evento
     */
    notifyListeners(event, data) {
        const callbacks = this.listeners.get(event);
        if (callbacks) {
            callbacks.forEach(callback => callback(data));
        }
    }

    /**
     * Envia uma mensagem para um destino STOMP
     * @param {string} destination - Destino da mensagem (ex: /app/bid)
     * @param {any} data - Dados a enviar
     */
    send(destination, data) {
        if (this.stompClient && this.connected) {
            this.stompClient.publish({
                destination: destination,
                body: JSON.stringify(data),
                headers: {
                    Authorization: `Bearer ${this.token}`
                }
            });
            console.log(`📤 Mensagem enviada para ${destination}:`, data);
        } else {
            console.warn('Cliente STOMP não está conectado. Mensagem não enviada:', destination);
        }
    }

    /**
     * Emite um evento (alias para send, para compatibilidade)
     * @param {string} event - Nome do evento
     * @param {any} data - Dados a enviar
     */
    emit(event, data) {
        // Mapeia eventos para destinos STOMP
        const eventToDestination = {
            'place_bid': '/app/bid',
            'subscribe_auction': '/app/subscribe',
            'unsubscribe_auction': '/app/unsubscribe'
        };

        const destination = eventToDestination[event] || `/app/${event}`;
        this.send(destination, data);
    }

    /**
     * Se inscreve em um leilão específico
     * @param {number} auctionId - ID do leilão
     */
    subscribeToAuction(auctionId) {
        if (this.stompClient && this.connected) {
            console.log(`📺 Inscrevendo-se no leilão ${auctionId}`);

            // Inscreve-se no tópico específico do leilão
            const topic = `/topic/auction/${auctionId}`;
            this.subscribeToTopic(topic, 'auction_specific');

            // Envia mensagem para o servidor informando a inscrição
            this.send('/app/subscribe', { auctionId });
        }
    }

    /**
     * Cancela inscrição em um leilão
     * @param {number} auctionId - ID do leilão
     */
    unsubscribeFromAuction(auctionId) {
        if (!auctionId || typeof auctionId === 'undefined') {
            console.warn('⚠️ auctionId inválido para cancelar inscrição');
            return;
        }

        if (this.stompClient && this.connected) {
            console.log(`📺 Cancelando inscrição no leilão ${auctionId}`);

            // Cancela inscrição no tópico específico
            const topic = `/topic/auction/${auctionId}`;
            this.unsubscribeFromTopic(topic);

            // Envia mensagem para o servidor informando o cancelamento
            this.send('/app/unsubscribe', { auctionId });
        }
    }

    /**
     * Envia um lance
     * @param {number} auctionId - ID do leilão
     * @param {number} bidAmount - Valor do lance
     */
    placeBid(auctionId, bidAmount) {
        if (this.stompClient && this.connected) {
            console.log(`🔨 Enviando lance de R$ ${bidAmount} para leilão ${auctionId}`);
            this.send('/app/bid', { auctionId, bidAmount });
        } else {
            console.warn('Cliente STOMP não está conectado. Lance não enviado.');
        }
    }

    /**
     * Desconecta o cliente STOMP
     */
    disconnect() {
        if (this.stompClient) {
            console.log('🔌 Desconectando STOMP...');
            this.stompClient.deactivate();
            this.stompClient = null;
            this.connected = false;
            this.subscriptions.clear();
            this.listeners.clear();
        }
    }

    /**
     * Verifica se o cliente está conectado
     * @returns {boolean}
     */
    isConnected() {
        return this.connected && this.stompClient?.connected;
    }

    /**
     * Obtém o ID da sessão STOMP
     * @returns {string|null}
     */
    getSocketId() {
        return this.stompClient?.connected ? 'STOMP-Connected' : null;
    }
}

// Exporta uma instância única (Singleton)
const socketService = new SocketService();
export default socketService;
