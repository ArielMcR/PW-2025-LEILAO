import { useEffect, useRef } from 'react';
import socketService from '../services/socket';

/**
 * Hook para se inscrever em um leilão específico usando STOMP
 * @param {number|string} auctionId - ID do leilão
 * @param {Function} onNewBid - Callback para novos lances
 * @param {Function} onAuctionUpdate - Callback para atualizações do leilão
 */
export function useAuctionSocket(auctionId, onNewBid, onAuctionUpdate) {
    const subscriptionRef = useRef(null);
    const onNewBidRef = useRef(onNewBid);
    const onAuctionUpdateRef = useRef(onAuctionUpdate);

    // Atualiza as referências dos callbacks
    useEffect(() => {
        onNewBidRef.current = onNewBid;
        onAuctionUpdateRef.current = onAuctionUpdate;
    }, [onNewBid, onAuctionUpdate]);

    useEffect(() => {
        // Valida auctionId
        if (!auctionId || auctionId === 'undefined' || auctionId === 'null') {
            console.warn('⚠️ auctionId inválido:', auctionId);
            return;
        }

        console.log('🔌 Inscrevendo no leilão:', auctionId);

        // Aguarda conexão do STOMP
        const checkConnectionAndSubscribe = () => {
            if (!socketService.isConnected()) {
                setTimeout(checkConnectionAndSubscribe, 500);
                return;
            }

            // Inscreve-se no tópico específico do leilão
            const topic = `/topic/auction/${auctionId}`;

            if (socketService.stompClient && socketService.connected) {
                try {
                    subscriptionRef.current = socketService.stompClient.subscribe(topic, (message) => {
                        try {
                            const data = JSON.parse(message.body);


                            // Chama os callbacks apropriados baseado no tipo de mensagem
                            if (data.type === 'BID' || data.valueBid) {
                                if (onNewBidRef.current) {
                                    onNewBidRef.current(data);
                                }
                            } else {
                                if (onAuctionUpdateRef.current) {
                                    onAuctionUpdateRef.current(data);
                                }
                            }
                        } catch (error) {
                            console.error('❌ Erro ao processar mensagem:', error);
                        }
                    });

                } catch (error) {
                    console.error('❌ Erro ao se inscrever:', error);
                }
            }
        };

        checkConnectionAndSubscribe();

        // Cleanup: cancela inscrição quando desmonta
        return () => {
            if (subscriptionRef.current) {
                try {
                    console.log('🔌 Desinscrevendo do leilão:', auctionId);
                    subscriptionRef.current.unsubscribe();
                    subscriptionRef.current = null;
                } catch (error) {
                    console.error('❌ Erro ao desinscrever:', error);
                }
            }
        };
    }, [auctionId]);
}

export default useAuctionSocket;
