import { useAppStore } from '@/context/useAppStore';
import { getFixturesByLeagues } from '@/services/matchService';
import { useEffect, useState } from 'react';

export const useHomeMatchesFixtures = (date: string) => {
    const [match, setMatches] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { subscribedLeagues } = useAppStore()

    useEffect(() => {
        let isMounted = true;
        const fetchMatches = async () => {
            try {
                setLoading(true);
                const data = subscribedLeagues.length > 0 && await getFixturesByLeagues(date, subscribedLeagues);
                if (isMounted && data) setMatches(data);
            } catch (err: any) {
                if (isMounted) setError(err.message || 'Failed to load matches');
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchMatches();
        return () => { isMounted = false; };
    }, [date, subscribedLeagues]);

    return { match, loading, error };
};
