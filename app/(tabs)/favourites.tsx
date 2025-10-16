import TeamCard from "@/components/teamCard";
import { leagues, teams } from "@/lib/utils";
import { LeagueType, TeamType } from "@/types";
import { useEffect, useState } from "react";
import { FlatList, Platform, Pressable, StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";

function FavouritesScreen() {
    const tabs = ["Teams", "Leagues", "Hate Watch"];
    const [list, setList] = useState<(TeamType | LeagueType)[]>([]);
    const [activeList, setActiveList] = useState<"Teams" | "Leagues" | "Hate Watch">("Teams");
    const [type, setType] = useState<"favourite" | "hate">("favourite");

    // Store full objects instead of just IDs
    const [favourites, setFavourites] = useState<(TeamType | LeagueType)[]>([]);
    const [hateList, setHateList] = useState<(TeamType | LeagueType)[]>([]);



    useEffect(() => {
        if (activeList === "Teams") {
            setList(teams);
            setType("favourite");
        } else if (activeList === "Leagues") {
            setList(leagues);
            setType("favourite");
        } else if (activeList === "Hate Watch") {
            setList(teams);
            setType("hate");
        }
    }, [activeList]);


    const handleToggle = (item: TeamType | LeagueType, toggleType: "favourite" | "hate") => {
        if (toggleType === "favourite") {
            setFavourites((prev) => {
                const exists = prev.some((fav) => fav.id === item.id);
                return exists ? prev.filter((fav) => fav.id !== item.id) : [...prev, item];
            });
        } else {
            setHateList((prev) => {
                const exists = prev.some((hate) => hate.id === item.id);
                return exists ? prev.filter((hate) => hate.id !== item.id) : [...prev, item];
            });
        }

    };

    const isItemInList = (list: (TeamType | LeagueType)[], id: string | number) =>
        list.some((item) => item.id === id);

    return (
        <View style={styles.container}>
            {/* Tabs */}
            <View style={styles.buttonWrapper}>
                {tabs.map((tab, index) => (
                    <Pressable
                        key={index}
                        onPress={() => setActiveList(tab as any)}
                        style={[styles.tabBtn, activeList === tab && styles.activeTabBtn]}
                    >
                        <Text style={{ color: activeList === tab ? "#10b981" : "#64748b" }}>
                            {tab}
                        </Text>
                    </Pressable>
                ))}
            </View>

            {/* List */}
            <FlatList
                data={list}
                // ✅ force string type (prevents TS error)
                keyExtractor={(item) => String(item.id)}
                renderItem={({ item }) => (
                    <TeamCard
                        type={type}
                        team={item}
                        isSelected={
                            type === "favourite"
                                ? isItemInList(favourites, item.id)
                                : isItemInList(hateList, item.id)
                        }
                        isBlurred={
                            (type === "hate" && isItemInList(favourites, item.id)) ||
                            (type === "favourite" && isItemInList(hateList, item.id))
                        }
                        onToggle={handleToggle}
                        onHateList={type === "hate" && isItemInList(favourites, item.id)}
                        onFavList={type === "favourite" && isItemInList(hateList, item.id)}
                    />
                )}
                contentContainerStyle={{
                    paddingVertical: 20,
                    paddingHorizontal: 7,
                    paddingBottom: Platform.OS === 'ios' ? 100 : 0,
                }}
            />
        </View>
    );
}

export default FavouritesScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f9fafb",
    },
    buttonWrapper: {
        flexDirection: "row",
        justifyContent: "space-between",
        padding: 10,
        paddingVertical: 20,
        backgroundColor: "white",
        marginHorizontal: 10,
        marginTop: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 6,
        zIndex: 5,
    },
    tabBtn: {
        backgroundColor: "#f1f5f9",
        textAlign: "center",
        padding: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
    },
    activeTabBtn: {
        borderBottomColor: "#10b981",
        borderBottomWidth: 1.5,
    },
});
