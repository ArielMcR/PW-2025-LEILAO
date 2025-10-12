import { useQuery } from '@tanstack/react-query';
import carros from '../data/fakeCars.json';
import Api from '../api/api';



const fetchData = async () => {
    const response = await Api.get('/auctions');
    return response.data.data
}

export function useAuctions() {
    const query = useQuery({
        queryFn: fetchData,
        queryKey: ['all_auctions'],
    });

    return {
        ...query,
        auctions: query.data,
    };
}