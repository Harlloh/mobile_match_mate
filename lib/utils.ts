import { LeagueType, MatchCardType, TeamType } from "@/types";

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

export const leagues: LeagueType[] = [
    { id: "39", name: "Premier League", country: "England", icon: "https://media.api-sports.io/football/leagues/39.png" },
    { id: "140", name: "La Liga", country: "Spain", icon: "https://media.api-sports.io/football/leagues/140.png" },
    { id: "135", name: "Serie A", country: "Italy", icon: "https://media.api-sports.io/football/leagues/135.png" },
    { id: "78", name: "Bundesliga", country: "Germany", icon: "https://media.api-sports.io/football/leagues/78.png" },
    { id: "61", name: "Ligue 1", country: "France", icon: "https://media.api-sports.io/football/leagues/61.png" },
    { id: "88", name: "Eredivisie", country: "Netherlands", icon: "https://media.api-sports.io/football/leagues/88.png" },
    { id: "2909", name: "Champions League", country: "Europe", icon: "https://media.api-sports.io/football/leagues/2.png" },
    { id: "8983", name: "Europa League", country: "Europe", icon: "https://media.api-sports.io/football/leagues/3.png" },
    { id: "253", name: "Major League Soccer", country: "USA", icon: "https://media.api-sports.io/football/leagues/253.png" },
    { id: "307", name: "Saudi Pro League", country: "Saudi Arabia", icon: "https://media.api-sports.io/football/leagues/307.png" },
];
