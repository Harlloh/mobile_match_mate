import { getFixturesByDate } from '@/services/matchService';
import { useEffect, useState } from 'react';

export const useMatchesFixtures = (date: string) => {
    const [matches, setMatches] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;

        const fetchMatches = async () => {
            try {
                setLoading(true);
                const data = await getFixturesByDate(date);
                if (isMounted) setMatches(data);
            } catch (err: any) {
                if (isMounted) setError(err.message || 'Failed to load matches');
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchMatches();
        return () => { isMounted = false; };
    }, [date]);

    return { matches, loading, error };
};
