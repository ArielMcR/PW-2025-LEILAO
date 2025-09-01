import { useQuery } from '@tanstack/react-query';
import carros from '../data/fakeCars.json';
import Api from '../api/api';

const fetchData = async (name = null) => {
    const url = name ? `/categories?name=${encodeURIComponent(name)}` : '/categories';
    const response = await Api.get(url);
    return response.data.data;
}

export function useAllCategories(searchName = null) {
    const query = useQuery({
        queryFn: () => fetchData(searchName),
        queryKey: ['all_categories', searchName],
        refetchInterval: 20000,
        staleTime: 1000 * 60 * 5,
    });

    return {
        ...query,
        categories: query.data,
    };
}