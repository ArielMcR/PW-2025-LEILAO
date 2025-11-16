import { useQuery } from '@tanstack/react-query';
import Api from '../api/api';



const fetchData = async (id) => {
    const response = await Api.get(`/auctions/user/${id}/participations`)
    return response.data.data
}

export function useAllAuctionsUser(id) {
    const query = useQuery({
        queryFn: () => fetchData(id),
        queryKey: ['all_auctions_user', id],
        refetchInterval: 20000,
        staleTime: 1000 * 60 * 5,
    });

    return {
        ...query,
        auctions: query.data,
    };
}