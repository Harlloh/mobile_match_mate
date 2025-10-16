import { LeagueType, TeamType } from "@/types";
import { FontAwesome, MaterialCommunityIcons } from "@expo/vector-icons";
import { useEffect } from "react";
import { Image, Pressable, StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";

interface TeamCardProps {
    type: "favourite" | "hate";
    team?: TeamType | LeagueType;
}

function TeamCard({ type, team }: TeamCardProps) {
    useEffect(() => {
        console.log(team)
    }, [])
    return (
        <>
            <View key={team?.name} style={styles.teamWrapper}>
                <View style={styles.teamCont}>
                    <Image
                        source={{ uri: team?.icon }}
                        style={styles.teamLogo}
                        resizeMode="contain"
                    />
                    <Text style={styles.teamName}>{team?.name}</Text>
                </View>

                {team && <Pressable
                    style={[
                        styles.typeIcon,
                    ]}
                >
                    {type === "favourite" ? (
                        <FontAwesome
                            name={"heart-o"}
                            size={22}
                            color={"#64748b"}
                        />
                    ) : (
                        <MaterialCommunityIcons
                            name={"emoticon-angry-outline"}
                            size={24}
                            color={"#64748b"}
                        />
                    )}
                </Pressable>}
            </View>
        </>
    );
}

export default TeamCard;

const styles = StyleSheet.create({
    teamWrapper: {
        backgroundColor: "#ffffff",
        marginBottom: 10,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 12,
        marginHorizontal: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 1,
    },
    teamCont: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    teamLogo: {
        width: 32,
        height: 32,
        borderRadius: 16,
    },
    teamName: {
        fontSize: 14,
        fontWeight: "600",
        color: "#1e293b",
    },
    typeIcon: {
        backgroundColor: "#f1f5f9",
        alignSelf: "center",
        padding: 10,
        borderRadius: 50,
    },
    clickReaction: {
        backgroundColor: "#cff1e6",
    },
});
