import { MatchCardType, TeamType } from "@/types";

export const match: MatchCardType[] = [
    {
        league: 'Premier League',
        leagueIcon: "https://media.api-sports.io/football/leagues/39.png",
        startDay: 'Today',
        startTime: '9:11pm',
        isLive: false,
        timeCurrentlyAt: 'FT',
        home: {
            clubIcon: "https://media.api-sports.io/football/teams/33.png",
            clubName: 'Chelsea',
            scored: 2
        },
        away: {
            clubIcon: "https://media.api-sports.io/football/teams/34.png",
            clubName: 'PSG',
            scored: 1
        },
        stadium: 'Old Stanford Bridge'
    },
    {
        league: 'Premier League',
        leagueIcon: "https://media.api-sports.io/football/leagues/39.png",
        startDay: 'Tomorrow',
        startTime: '9:11pm',
        isLive: false,
        timeCurrentlyAt: null,
        home: {
            clubIcon: "https://media.api-sports.io/football/teams/33.png",
            clubName: 'Man U',
            scored: null
        },
        away: {
            clubIcon: "https://media.api-sports.io/football/teams/34.png",
            clubName: 'New Castle',
            scored: null
        },
        stadium: 'Emirates Stadium'
    },
    {
        league: 'Premier League',
        leagueIcon: "https://media.api-sports.io/football/leagues/39.png",
        startDay: 'Tomorrow',
        startTime: '9:11pm',
        isLive: false,
        timeCurrentlyAt: null,
        home: {
            clubIcon: "https://media.api-sports.io/football/teams/33.png",
            clubName: 'Man U',
            scored: null
        },
        away: {
            clubIcon: "https://media.api-sports.io/football/teams/34.png",
            clubName: 'New Castle',
            scored: null
        },
        stadium: 'Emirates Stadium'
    },
    {
        league: 'Premier League',
        leagueIcon: "https://media.api-sports.io/football/leagues/39.png",
        startDay: 'Today',
        startTime: '9:11pm',
        isLive: true,
        timeCurrentlyAt: '67',
        home: {
            clubIcon: "https://media.api-sports.io/football/teams/33.png",
            clubName: 'Chelsea',
            scored: 2
        },
        away: {
            clubIcon: "https://media.api-sports.io/football/teams/34.png",
            clubName: 'PSG',
            scored: 1
        },
        stadium: 'Old Stanford Bridge'
    },
    {
        league: 'Premier League',
        leagueIcon: "https://media.api-sports.io/football/leagues/39.png",
        startDay: 'Today',
        startTime: '9:11pm',
        isLive: true,
        timeCurrentlyAt: '67',
        home: {
            clubIcon: "https://media.api-sports.io/football/teams/33.png",
            clubName: 'Chelsea',
            scored: 2
        },
        away: {
            clubIcon: "https://media.api-sports.io/football/teams/34.png",
            clubName: 'PSG',
            scored: 1
        },
        stadium: 'Old Stanford Bridge'
    },

];

export const teams: TeamType[] = [
    { id: "1", name: "Arsenal", icon: "https://media.api-sports.io/football/teams/42.png" },
    { id: "2", name: "Chelsea", icon: "https://media.api-sports.io/football/teams/49.png" },
    { id: "3", name: "Liverpool", icon: "https://media.api-sports.io/football/teams/40.png" },
    { id: "4", name: "Manchester City", icon: "https://media.api-sports.io/football/teams/50.png" },
    { id: "5", name: "Manchester United", icon: "https://media.api-sports.io/football/teams/33.png" },
    { id: "6", name: "FC Barcelona", icon: "https://media.api-sports.io/football/teams/529.png" },
    { id: "7", name: "Real Madrid", icon: "https://media.api-sports.io/football/teams/541.png" },
    { id: "8", name: "Bayern Munich", icon: "https://media.api-sports.io/football/teams/157.png" },
];



export const FILTERS: string[] = [
    'Live',
    'Upcoming',
    'Finished',
];

export const popularLeaguesList = [
    39,  // Premier League (England)
    2,   // UEFA Champions League,
    3, // UEFA EUROPA LEAGUE
    307,
    46, // UEFA EUROPA LEAGUE
    140, // La Liga (Spain)
    135, // Serie A (Italy)
    78,  // Bundesliga (Germany)
    61,  // Ligue 1 (France)
    88, // Eredivisie (Netherlands),
    848, // UEFA EUROPA LEAGUE
    1186,
    15,
    598,


];




export const formatDate = (dateInput: string | Date) => {
    const date = new Date(dateInput);

    // Convert to YYYY-MM-DD (format API expects)
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
};


export const matchTransformer = (match: any): MatchCardType => {
    const { fixture, league, teams, goals } = match;

    const date = new Date(fixture.date);
    const today = new Date();

    // Check if same day
    const isSameDay =
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear();

    // Format startDay - only show "Today" if it's today, otherwise show full date
    const startDay = isSameDay ? 'Today' : date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });

    // Format time (e.g., "9:11pm")
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12 || 12;
    const startTime = `${hours}:${minutes}${ampm}`;

    // Determine if live
    const shortStatus = fixture.status.short;
    const isLive = ['1H', '2H', 'ET', 'BT', 'P', 'SUSP', 'INT', 'LIVE'].includes(shortStatus);

    // Determine timeCurrentlyAt
    let timeCurrentlyAt: string | null = null;
    if (shortStatus === 'FT' || shortStatus === 'AET' || shortStatus === 'PEN') {
        timeCurrentlyAt = 'FT';
    } else if (shortStatus === 'HT') {
        timeCurrentlyAt = 'HT';
    } else if (isLive && fixture.status.elapsed) {
        timeCurrentlyAt = fixture.status.elapsed.toString();
    }

    return {
        id: fixture.id,
        league: league.name,
        leagueIcon: league.logo,
        startDay,
        startTime,
        isLive,
        timeCurrentlyAt,
        home: {
            clubIcon: teams.home.logo,
            clubName: teams.home.name,
            scored: goals.home,
        },
        away: {
            clubIcon: teams.away.logo,
            clubName: teams.away.name,
            scored: goals.away,
        },
        stadium: fixture.venue.name || 'Stadium TBD',
    };
};
