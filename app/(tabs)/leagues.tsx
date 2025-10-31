import { useAppStore } from "@/context/useAppStore";
import { popularLeaguesList } from "@/lib/utils";
import { useGetLeagues } from "@/services/useMatches";
import { LeagueType } from "@/types";
import { useEffect, useRef, useState } from "react";
import { FlatList, Image, Pressable, StyleSheet, View } from "react-native";
import { ActivityIndicator, Text, TextInput } from "react-native-paper";

function LeaguesScreen() {
    const popularLeagues = popularLeaguesList
    const { leagues, loading, error } = useGetLeagues()
    const { subscribedLeagues, setSubscribedLeagues } = useAppStore();


    const [formattedLeagues, setFormattedLeagues] = useState<LeagueType[] | []>([])
    const [filteredLeagues, setFilteredLeagues] = useState<LeagueType[] | []>([])
    const [selectedLeagues, setSelectedLeagues] = useState<LeagueType[] | []>([])
    const [visibleCount, setVisibleCount] = useState<number>(5)


    const handleLoadMore = () => {
        visibleCount < filteredLeagues.length && setVisibleCount((prev) => prev + 5)
    }

    const searchTextTimeoutRef = useRef<NodeJS.Timeout | number | null>(null)
    const susbscribeChangeRef = useRef<boolean>(false)



    // SET, FORMAT AND SET THE DEFAULT LEAGUES
    useEffect(() => {
        if (leagues && leagues.length > 0) {
            const formatted = leagues
                .map((item: any) => item.league as LeagueType);

            // const sorted = formatted.sort((a, b) => {
            //     const aPopular = popularLeaguesList.includes(a.id)
            //     const bPopular = popularLeaguesList.includes(b.id)

            //     if (aPopular && !bPopular) return -1;
            //     if (!aPopular && bPopular) return 1;


            //     // if both popular, sort by their order in popularLeaguesList
            //     if (aPopular && bPopular)
            //         return popularLeaguesList.indexOf(a.id) - popularLeaguesList.indexOf(b.id);


            //     // // otherwise alphabetically
            //     return 0;
            // })
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
        }, 200)
    }

    const handleLeagues = (league: LeagueType) => {
        setSelectedLeagues((prev: LeagueType[]) => {
            const exists = prev.some((item) => item.id === league.id)
            if (exists) {
                return prev.filter((item) => item.id !== league.id)
            } else {
                return [...prev, league]
            }
        })
        susbscribeChangeRef.current = true
    }




    const saveChanges = () => {

        setSubscribedLeagues(selectedLeagues);
        setSelectedLeagues([])
        susbscribeChangeRef.current = false;
    }

    return (
        <View style={styles.container}>
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
                        <View style={{ position: 'relative' }}>
                            <FlatList
                                data={filteredLeagues.slice(0, visibleCount)}
                                keyExtractor={(item) => item.id.toString()}
                                showsVerticalScrollIndicator={true}
                                scrollEnabled={true}
                                renderItem={({ item: league }) => {
                                    const isSubscribed = subscribedLeagues.some((l) => l.id === league.id);
                                    const isSelected = selectedLeagues?.some((l) => l.id === league.id)

                                    return <Pressable
                                        key={league.id}
                                        onPress={() => handleLeagues(league)}
                                        style={({ pressed }) => [
                                            styles.card,
                                            isSubscribed && styles.subscribedCard,
                                            league && isSelected ? { borderColor: '#10b981', borderWidth: 2, backgroundColor: '#e6ffed' } : {},
                                            isSelected && isSubscribed && styles.unSubscribedCard,
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
                                            {isSelected && <Text variant="bodySmall"> {isSubscribed ? "(Unsubscribing)" : "(Subscribing)"}</Text>}
                                            {(isSubscribed && !isSelected) && <Text variant="bodySmall">  Subscribed</Text>}
                                        </View>
                                    </Pressable>
                                }
                                }
                                onEndReached={handleLoadMore}
                                onEndReachedThreshold={0.5}
                                contentContainerStyle={{ paddingBottom: 250 }}
                            />


                        </View>
                    ) : (
                        <Text style={styles.noResults}>No leagues found.</Text>
                    )}

                </View>
            )}
            {(susbscribeChangeRef.current && selectedLeagues.length > 0) && (
                <Pressable
                    onPress={saveChanges}
                    style={styles.fab}
                >
                    <Text style={styles.fabText}>Update</Text>
                </Pressable>
            )}
        </View>
    );
}

export default LeaguesScreen;

const styles = StyleSheet.create({
    container: {
        padding: 16,
        backgroundColor: "#f8fafc",
        flex: 1
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
        shadowOpacity: 0.10,
        shadowRadius: 3,
        shadowOffset: { width: 0, height: 1 },
        marginBottom: 20
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
    fab: {
        position: 'absolute',
        bottom: 10,         // just above your bottom nav bar
        right: '6%',
        // transform: [{ translateX: 50 }],
        backgroundColor: '#10b981',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 25,
        elevation: 5,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    fabText: {
        color: '#fff',
        fontWeight: '600',
    },
    subscribedCard: {
        borderColor: '#3b82f6',
        borderWidth: 1.5,
        backgroundColor: '#e0f2fe',
    },
    unSubscribedCard: {
        borderColor: '#f63b3bff',
        borderWidth: 1.5,
        backgroundColor: '#fee7e0ff',
    },

});