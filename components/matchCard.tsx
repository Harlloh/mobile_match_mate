import { useAppStore } from "@/context/useAppStore";
import { removeMatchAlerts, setMatchAlert } from "@/services/matchService";
import { MatchCardType } from "@/types";
import { Image, StyleSheet, View } from "react-native";
import { Button, Text } from "react-native-paper";

function MatchCard({ match }: { match: MatchCardType }) {
    const { preference, alertedMatches } = useAppStore()

    const setAlarmForMatch = async (match: MatchCardType) => {
        if (preference && preference.reminderTime !== undefined) await setMatchAlert(match, preference.reminderTime);
    }

    const isAlerted = alertedMatches.includes(match.id || -1)
    return (
        <View style={styles.cardContainer}>
            {/* Header: League & Time/Live */}
            <View style={[styles.headerRow, { gap: 10, flex: 1, }]}>
                <View style={{ display: 'flex', flexDirection: 'row', gap: 2, alignItems: 'center', }}>
                    <Image
                        source={{ uri: match.leagueIcon }}
                        style={{ width: 24, height: 24, borderRadius: 12, }}
                        resizeMode="contain"
                    />
                    <Text variant="labelSmall">{match.league}</Text>
                </View>
                <View style={{
                    flexShrink: 1,
                    flexWrap: 'wrap',
                    maxWidth: '40%',
                }}>
                    {match?.timeCurrentlyAt === 'FT' || match?.timeCurrentlyAt === 'HT' ? (
                        <Text variant="labelSmall" style={{ color: '#64748b' }}>
                            {match.timeCurrentlyAt}
                        </Text>
                    ) : match.isLive ? (
                        <View style={styles.livebadge}>
                            <Text style={styles.liveText}>LIVE {match.timeCurrentlyAt}</Text>
                        </View>
                    ) : (
                        <View>
                            <Text variant="labelSmall" style={{ color: '#64748b', textAlign: 'right' }}>
                                {match.startDay} - {match.startTime}
                            </Text>
                        </View>
                    )}

                </View>
            </View>

            {/* Home Team */}
            <View style={{ marginTop: 20 }}>
                <View style={styles.teamRow}>
                    <View style={styles.teamInfo}>
                        <Image
                            source={{ uri: match.home.clubIcon }}
                            style={styles.teamLogo}
                            resizeMode="contain"
                        />
                        <Text style={styles.teamName}>{match.home.clubName}</Text>
                    </View>
                    <Text style={styles.home}>Home</Text>
                    {match.home.scored !== null && (
                        <Text variant="titleLarge" style={styles.score}>
                            {match.home.scored}
                        </Text>
                    )}
                </View>

                {/* Away Team */}
                <View style={[styles.teamRow, { marginTop: 20 }]}>
                    <View style={styles.teamInfo}>
                        <Image
                            source={{ uri: match.away.clubIcon }}
                            style={styles.teamLogo}
                            resizeMode="contain"
                        />
                        <Text style={styles.teamName}>{match.away.clubName}</Text>
                    </View>
                    <Text style={styles.away}>Away</Text>
                    {match.away.scored !== null && (
                        <Text variant="titleLarge" style={styles.score}>
                            {match.away.scored}
                        </Text>
                    )}
                </View>
            </View>

            {/* Footer: Stadium & Alert */}
            <View style={styles.footer}>
                <Text variant="labelSmall" style={{ color: '#64748b', opacity: 0 }}>
                    {match.stadium}
                </Text>
                {(!match.isLive && !match.timeCurrentlyAt) && (
                    <Button
                        textColor={isAlerted ? "#e13302ff" : "#10b981"}
                        // onPress={() => setAlarmForMatch(match)}
                        onPress={() =>
                            isAlerted
                                ? removeMatchAlerts(match.id as any)
                                : setMatchAlert(match, preference.reminderTime as any)
                        }
                    >
                        {isAlerted ? 'Cancel Alert' : 'Set Alert'}
                    </Button>
                )}
            </View>
        </View>
    );
}

export default MatchCard;

const styles = StyleSheet.create({
    cardContainer: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 4,
    },
    headerRow: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    teamRow: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 5,
    },
    teamName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1e293b',
        letterSpacing: -0.2,
    },
    teamInfo: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    teamLogo: {
        width: 28,
        height: 28,
    },
    score: {
        fontWeight: '700',
        color: '#1e293b',
    },
    footer: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 16,
    },
    livebadge: {
        backgroundColor: '#ef4444',
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 12,
        alignSelf: 'flex-start',
    },
    liveText: {
        color: '#ffffff',
        fontSize: 12,
        fontWeight: '600',
        letterSpacing: 0.5,
    },
    home: {
        fontSize: 8,
        fontWeight: '600',
        color: '#10b981', // Green for home
        backgroundColor: '#d1fae5',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        overflow: 'hidden',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginRight: 8,
    },
    away: {
        fontSize: 8,
        fontWeight: '600',
        color: '#3b82f6', // Blue for away
        backgroundColor: '#dbeafe',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        overflow: 'hidden',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginRight: 8,
    },
});