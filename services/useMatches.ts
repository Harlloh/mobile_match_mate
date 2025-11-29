import { useAppStore } from '@/context/useAppStore';
import { getFixturesByLeagues } from '@/services/matchService';
import { useEffect, useRef, useState } from 'react';

export const useHomeMatchesFixtures = (date: string) => {
    const [match, setMatches] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { subscribedLeagues } = useAppStore();
    const isMountedRef = useRef(true); // Use ref instead

    const fetchMatches = async () => {
        try {
            setLoading(true);
            setError(null); // IMPORTANT: Reset error on refetch
            const data = subscribedLeagues.length > 0 && await getFixturesByLeagues(date, subscribedLeagues);
            if (isMountedRef.current && data) setMatches(data);
        } catch (err: any) {
            if (isMountedRef.current) {
                if (err.message === 'Request failed with status code 429') {
                    setError('API rate limit exceeded. Please try again later.');
                } else {
                    setError(err.message || 'Failed to load matches');
                }
            }
        } finally {
            if (isMountedRef.current) setLoading(false);
        }
    };

    useEffect(() => {
        isMountedRef.current = true;
        fetchMatches();
        return () => {
            isMountedRef.current = false;
        };
    }, [date, subscribedLeagues]);

    return { match, loading, error, refetch: fetchMatches };
};