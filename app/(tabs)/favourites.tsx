import TeamCard from "@/components/teamCard";
import { LeagueType, TeamType } from "@/types";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";

function FavouritesScreen() {
    const tabs = ['Teams', 'Leagues', "Hate Watch"]
    const [list, setList] = useState<(TeamType | LeagueType)[]>([])
    const [activeList, setActiveList] = useState<'Teams' | 'Leagues' | 'Hate Watch'>('Teams')
    const [type, setType] = useState<'favourite' | 'hate'>('favourite')

    const teams: TeamType[] = [
        { name: "Arsenal", icon: "https://media.api-sports.io/football/teams/42.png" },
        { name: "Chelsea", icon: "https://media.api-sports.io/football/teams/49.png" },
        { name: "Liverpool", icon: "https://media.api-sports.io/football/teams/40.png" },
        { name: "Manchester City", icon: "https://media.api-sports.io/football/teams/50.png" },
        { name: "Manchester United", icon: "https://media.api-sports.io/football/teams/33.png" },
        { name: "FC Barcelona", icon: "https://media.api-sports.io/football/teams/529.png" },
        { name: "Real Madrid", icon: "https://media.api-sports.io/football/teams/541.png" },
        { name: "Bayern Munich", icon: "https://media.api-sports.io/football/teams/157.png" },
    ];
    const leagues: LeagueType[] = [
        {
            name: "Premier League",
            country: "England",
            icon: "https://media.api-sports.io/football/leagues/39.png",
        },
        {
            name: "La Liga",
            country: "Spain",
            icon: "https://media.api-sports.io/football/leagues/140.png",
        },
        {
            name: "Serie A",
            country: "Italy",
            icon: "https://media.api-sports.io/football/leagues/135.png",
        },
        {
            name: "Bundesliga",
            country: "Germany",
            icon: "https://media.api-sports.io/football/leagues/78.png",
        },
        {
            name: "Ligue 1",
            country: "France",
            icon: "https://media.api-sports.io/football/leagues/61.png",
        },
        {
            name: "Eredivisie",
            country: "Netherlands",
            icon: "https://media.api-sports.io/football/leagues/88.png",
        },
        {
            name: "Champions League",
            country: "Europe",
            icon: "https://media.api-sports.io/football/leagues/2.png",
        },
        {
            name: "Europa League",
            country: "Europe",
            icon: "https://media.api-sports.io/football/leagues/3.png",
        },
        {
            name: "Major League Soccer",
            country: "USA",
            icon: "https://media.api-sports.io/football/leagues/253.png",
        },
        {
            name: "Saudi Pro League",
            country: "Saudi Arabia",
            icon: "https://media.api-sports.io/football/leagues/307.png",
        },
    ];

    useEffect(() => {
        if (activeList == 'Teams') {
            setList(teams);
            setType('favourite')
        }
        else if (activeList === 'Leagues') {
            setList(leagues);
            setType('favourite')
        }
        else if (activeList === 'Hate Watch') {
            setList(teams)
            setType('hate')
        }
    }, [activeList])

    return (
        <View>
            <View>
                <View style={styles.buttonWrapper}>
                    {tabs.map((item, index) => (
                        <Pressable key={index} onPress={() => setActiveList(item as any)} style={[styles.tabBtn, activeList === item && styles.activeTabBtn]}>
                            <Text style={{ color: activeList === item ? '#10b981' : '#64748b' }}>
                                {item}
                            </Text>
                        </Pressable>
                    ))}
                </View>
                <ScrollView style={{ paddingVertical: 20, paddingHorizontal: 7 }}>
                    {
                        list?.map((item: TeamType | LeagueType, index: number) => (
                            <View key={index}>
                                <TeamCard type={type} team={item} />
                            </View>
                        ))
                    }
                </ScrollView>
            </View>

        </View>
    );
}

export default FavouritesScreen;


const styles = StyleSheet.create({
    buttonWrapper: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 10,
        paddingVertical: 20,
        backgroundColor: 'white',
        marginHorizontal: 10,
        marginTop: 10,


        // 🔥 Shadow (iOS)
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,

        // 🔥 Elevation (Android)
        elevation: 6,

        // 👇 This ensures it renders above scroll content
        zIndex: 5,
    },
    tabBtn: {
        backgroundColor: '#f1f5f9',
        textAlign: 'center',
        padding: 10,
        paddingHorizontal: 20,
        borderRadius: 5
    },
    activeTabBtn: {
        borderBottomColor: '#10b981',
        borderBottomWidth: 1.5
    }
})