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

export const useGetLeagues = () => {
    const [leagues, setLeagues] = useState<any[] | []>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // useEffect(() => {
    //     let isMounted = true;

    //     const fetchLeagues = async () => {
    //         try {
    //             const res = await getLeagues();
    //             if (isMounted) {
    //                 setLeagues(res.data.response);
    //                 setLoading(false);
    //             }
    //         } catch (error) {
    //             if (isMounted) setError(error instanceof Error ? error?.message : String(error) || 'Failed to load leagues')
    //         } finally {
    //             if (isMounted) setLoading(false)
    //         }
    //     }
    //     fetchLeagues();
    //     return () => { isMounted = false }
    // }, [])
    useEffect(() => {
        setLoading(false);
        setError(null);

        setLeagues([
            {
                league: {
                    id: 39,
                    name: "Premier League",
                    logo: "https://media.api-sports.io/football/leagues/39.png",
                    type: "League",
                },
            },
            {
                league: {
                    id: 140,
                    name: "La Liga",
                    logo: "https://media.api-sports.io/football/leagues/140.png",
                    type: "League",
                },
            },
            {
                league: {
                    id: 135,
                    name: "Serie A",
                    logo: "https://media.api-sports.io/football/leagues/135.png",
                    type: "League",
                },
            },
            {
                league: {
                    id: 78,
                    name: "Bundesliga",
                    logo: "https://media.api-sports.io/football/leagues/78.png",
                    type: "League",
                },
            },
            {
                league: {
                    id: 61,
                    name: "Ligue 1",
                    logo: "https://media.api-sports.io/football/leagues/61.png",
                    type: "League",
                },
            },
            {
                league: {
                    id: 2,
                    name: "UEFA Champions League",
                    logo: "https://media.api-sports.io/football/leagues/2.png",
                    type: "Cup",
                },
            },
            {
                league: {
                    id: 3,
                    name: "UEFA Europa League",
                    logo: "https://media.api-sports.io/football/leagues/3.png",
                    type: "Cup",
                },
            },
            {
                league: {
                    id: 253,
                    name: "Major League Soccer",
                    logo: "https://media.api-sports.io/football/leagues/253.png",
                    type: "League",
                },
            },
            {
                league: {
                    id: 71,
                    name: "Brasileirão Série A",
                    logo: "https://media.api-sports.io/football/leagues/71.png",
                    type: "League",
                },
            },
            {
                league: {
                    id: 128,
                    name: "Argentine Primera División",
                    logo: "https://media.api-sports.io/football/leagues/128.png",
                    type: "League",
                },
            },
            {
                league: {
                    id: 203,
                    name: "Turkish Süper Lig",
                    logo: "https://media.api-sports.io/football/leagues/203.png",
                    type: "League",
                },
            },
            {
                league: {
                    id: 179,
                    name: "Scottish Premiership",
                    logo: "https://media.api-sports.io/football/leagues/179.png",
                    type: "League",
                },
            },
            {
                league: {
                    id: 307,
                    name: "Saudi Pro League",
                    logo: "https://media.api-sports.io/football/leagues/307.png",
                    type: "League",
                },
            },
            {
                league: {
                    id: 98,
                    name: "J1 League",
                    logo: "https://media.api-sports.io/football/leagues/98.png",
                    type: "League",
                },
            },
            {
                league: {
                    id: 144,
                    name: "A-League",
                    logo: "https://media.api-sports.io/football/leagues/144.png",
                    type: "League",
                },
            },
            {
                league: {
                    id: 292,
                    name: "K League 1",
                    logo: "https://media.api-sports.io/football/leagues/292.png",
                    type: "League",
                },
            },
            {
                league: {
                    id: 88,
                    name: "Eredivisie",
                    logo: "https://media.api-sports.io/football/leagues/88.png",
                    type: "League",
                },
            },
            {
                league: {
                    id: 94,
                    name: "Primeira Liga",
                    logo: "https://media.api-sports.io/football/leagues/94.png",
                    type: "League",
                },
            },
            {
                league: {
                    id: 262,
                    name: "Liga MX",
                    logo: "https://media.api-sports.io/football/leagues/262.png",
                    type: "League",
                },
            },
            {
                league: {
                    id: 205,
                    name: "Belgian Pro League",
                    logo: "https://media.api-sports.io/football/leagues/205.png",
                    type: "League",
                },
            },
        ])

    }, [])

    return { leagues, loading, error }
}
