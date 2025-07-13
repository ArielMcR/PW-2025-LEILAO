import { useQuery } from '@tanstack/react-query';
import carros from '../data/fakeCars.json';

const fetchData = async () => {
    const response = await new Promise((resolve) => {
        setTimeout(() => {
            resolve({ data: carros });
        }, 100);
    });
    return response.data;
};

// const fetchData = async () => {
//     const response = await Api.get('/buscar_carros')
//     return response.data
// }

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