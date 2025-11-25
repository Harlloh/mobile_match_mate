import axios from 'axios';

const api = axios.create({
    baseURL: 'https://api.football-data.org/v4',
    headers: {
        "X-Auth-Token": process.env.EXPO_PUBLIC_FOOTBALL_DATA_KEY,
    },
});

export default api;