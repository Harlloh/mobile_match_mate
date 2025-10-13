import { MatchCardType } from "@/types";

export const match: MatchCardType[] = [
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
];