import { useQuery } from '@tanstack/react-query';
import carros from '../data/fakeCars.json';
import Api from '../api/api';



const fetchData = async () => {
    const response = await Api.get('/auctions')
    return response.data.data
}

export function useAllCars() {
    const query = useQuery({
        queryFn: fetchData,
        queryKey: ['all_vehicles'],
        refetchInterval: 20000,
        staleTime: 1000 * 60 * 5,
    });

    return {
        ...query,
        vehicles: query.data,
    };
}