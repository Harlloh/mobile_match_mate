import axios from 'axios';

const api = axios.create({
    baseURL: 'https://v3.football.api-sports.io/',
    headers: {
        'x-apisports-key': '31846439a34475ff70e1a7580a02ada6',
        'x-rapidapi-host': 'v3.football.api-sports.io'
    },
});

export default api;