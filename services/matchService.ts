import { matchTransformer } from "@/lib/utils";
import api from "./api";

export const getFixturesByDate = async (date: string) => {
    try {
        const res = await api.get('/fixtures', {
            params: { date }
        })
        const matches = res.data.response.map(matchTransformer)
        return matches
    } catch (error: any) {
        console.error('Error fetching fixtures: ', error)
        throw error
    }
}

export const getLeagues = async () => {
    try {
        const res = await api.get('/leagues')
        return res
    } catch (error) {
        console.error('Error fetching leagues: ', error)
        throw error
    }
}