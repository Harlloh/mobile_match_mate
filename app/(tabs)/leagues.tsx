import { useGetLeagues } from "@/services/useMatches";
import { LeagueType } from "@/types";
import { useEffect, useRef, useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { ActivityIndicator, Text, TextInput } from "react-native-paper";

function LeaguesScreen() {
    const { leagues, loading, error } = useGetLeagues()

    const [formattedLeagues, setFormattedLeagues] = useState<LeagueType[] | []>([])
    const [filteredLeagues, setFilteredLeagues] = useState<LeagueType[] | []>([])

    const searchTextTimeoutRef = useRef<NodeJS.Timeout | number | null>(null)


    useEffect(() => {
        if (leagues && leagues.length > 0) {
            const formatted = leagues
                .map((item: any) => item.league as LeagueType);
            setFormattedLeagues(formatted);
            setFilteredLeagues(formatted);
        }
    }, [leagues]);


    // This ensures no timer runs after screen unmounts
    useEffect(() => {
        return () => {
            if (searchTextTimeoutRef.current) {
                clearTimeout(searchTextTimeoutRef.current);
            }
        };
    }, []);



    const handleLeagueFilter = (text: string) => {
        if (searchTextTimeoutRef.current) {
            clearTimeout(searchTextTimeoutRef.current)
        }

        searchTextTimeoutRef.current = setTimeout(() => {
            const leagueList = formattedLeagues
            const filtered = leagueList.filter((item: LeagueType) => item.name.toLowerCase().includes(text.toLowerCase().trim()));
            setFilteredLeagues(filtered)
        }, 250)
    }

    const handleLeagues = (league: LeagueType) => {
        console.log(league, 'League: ')
    }

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.header}>
                Subscribe or Unsubscribe from leagues you want to get match updates for
            </Text>

            <TextInput
                placeholder="Search leagues..."
                onChangeText={handleLeagueFilter}
                mode="outlined"
                outlineStyle={{ borderRadius: 12 }}
                style={styles.searchInput}
                left={<TextInput.Icon icon="magnify" />}
            />

            {loading && (
                <View style={styles.center}>
                    <ActivityIndicator animating size="large" color="#10b981" />
                    <Text>Fetching Leagues...</Text>
                </View>
            )}

            {error && (
                <View style={styles.center}>
                    <Text style={{ color: "red" }}>Error loading leagues: {error}</Text>
                </View>
            )}

            {!loading && !error && (
                <View style={styles.list}>
                    {filteredLeagues.length > 0 ? (
                        filteredLeagues.map((league) => (
                            <Pressable
                                key={league.id}
                                onPress={() => handleLeagues(league)}
                                style={({ pressed }) => [
                                    styles.card,
                                    pressed && { opacity: 0.8, transform: [{ scale: 0.98 }] },
                                ]}
                            >
                                <View style={styles.leagueRow}>
                                    <Image
                                        source={{ uri: league.logo }}
                                        style={styles.logo}
                                        resizeMode="contain"
                                    />
                                    <Text style={styles.leagueName}>{league.name}</Text>
                                </View>
                            </Pressable>
                        ))
                    ) : (
                        <Text style={styles.noResults}>No leagues found.</Text>
                    )}
                </View>
            )}
        </ScrollView>
    );
}

export default LeaguesScreen;

const styles = StyleSheet.create({
    container: {
        padding: 16,
        backgroundColor: "#f8fafc",
    },
    header: {
        fontSize: 15,
        marginBottom: 10,
        color: "#475569",
        textAlign: "center",
    },
    searchInput: {
        marginBottom: 20,
        backgroundColor: "#fff",
    },
    list: {
        gap: 12,
    },
    card: {
        backgroundColor: "#fff",
        borderRadius: 14,
        padding: 14,
        flexDirection: "row",
        alignItems: "center",
        elevation: 3,
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 3,
        shadowOffset: { width: 0, height: 1 },
    },
    leagueRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    leagueName: {
        fontSize: 16,
        fontWeight: "600",
        color: "#1e293b",
    },
    logo: {
        width: 36,
        height: 36,
        borderRadius: 18,
    },
    noResults: {
        textAlign: "center",
        color: "#64748b",
        marginTop: 20,
    },
    center: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 40,
    },
});