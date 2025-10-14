import { useQuery } from '@tanstack/react-query';
import carros from '../data/fakeCars.json';
import Api from '../api/api';



const fetchData = async (id) => {
    const response = await Api.get(`/auctions/${id}`);
    return response.data.data
}

export function useAuctions(id) {
    const query = useQuery({
        queryFn: () => fetchData(id),
        queryKey: ['auction', id],
    });

    return {
        ...query,
        auction: query.data ? query.data[0] || {} : {},
    };
}