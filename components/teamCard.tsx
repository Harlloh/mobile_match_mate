import { LeagueType, TeamType } from "@/types";
import { FontAwesome, MaterialCommunityIcons } from "@expo/vector-icons";
import { Image, Pressable, StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";

interface TeamCardProps {
    type: "favourite" | "hate";
    team: TeamType | LeagueType;
    isSelected: boolean;
    isBlurred?: boolean;
    onToggle: (team: TeamType | LeagueType, type: "favourite" | "hate") => void;
    onFavList: boolean;
    onHateList: boolean;
}

function TeamCard({
    type,
    team,
    isSelected,
    isBlurred,
    onToggle,
    onHateList,
    onFavList,
}: TeamCardProps) {
    return (
        <View style={[styles.teamWrapper, isBlurred && { opacity: 0.4 }]}>
            <View style={styles.teamCont}>
                <Image source={{ uri: team.icon }} style={styles.teamLogo} resizeMode="contain" />
                <Text style={styles.teamName}>{team.name}</Text>
            </View>

            <View style={styles.statusContainer}>
                {onFavList && <Text variant="bodySmall" style={styles.statusText}>On Hate List</Text>}
                {onHateList && <Text variant="bodySmall" style={styles.statusText}>On Fav List</Text>}
            </View>

            <Pressable
                disabled={isBlurred}
                onPress={() => onToggle(team, type)}
                style={[styles.typeIcon, isSelected && styles.clickReaction]}
            >
                {type === "favourite" ? (
                    <FontAwesome
                        name={isSelected ? "heart" : "heart-o"}
                        size={22}
                        color={isSelected ? "#10b981" : "#64748b"}
                    />
                ) : (
                    <MaterialCommunityIcons
                        name={isSelected ? "emoticon-angry" : "emoticon-angry-outline"}
                        size={24}
                        color={isSelected ? "#10b981" : "#64748b"}
                    />
                )}
            </Pressable>
        </View>
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
        flex: 1,
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
    statusContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    statusText: {
        fontSize: 11,
        color: "#f97316",
        fontWeight: "500",
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
