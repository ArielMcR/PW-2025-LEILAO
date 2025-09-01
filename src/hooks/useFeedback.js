import { useQuery } from '@tanstack/react-query';
import Api from '../api/api';

const fetchData = async () => {
    const response = await Api.get('/feedbacks');
    return response.data.data || [];
}

export function useAllFeedback() {
    const query = useQuery({
        queryFn: () => fetchData(),
        queryKey: ['all_feedback'],
        refetchInterval: 20000,
        staleTime: 1000 * 60 * 5,
    });

    return {
        ...query,
        feedback: query.data,
    };
}
