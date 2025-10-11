import { ClubsType, MatchCardType } from "@/types";
import { StyleSheet, View } from "react-native";
import { Button, Text } from "react-native-paper";

function MatchCard({ match }: { match: MatchCardType }) {

    return (
        <>
            <View style={styles.cardContainer}>
                {/* Header: League & Time/Live */}
                <View style={styles.headerRow}>
                    <View style={{ display: 'flex', flexDirection: 'row', gap: 5 }}>
                        <Text>{match.leagueIcon}</Text>
                        <Text variant="labelSmall">{match.league}</Text>
                    </View>
                    <View>
                        {match.isLive ? (
                            <View style={styles.livebadge}>
                                <Text style={styles.liveText}>LIVE {match.timeCurrentlyAt}'</Text>
                            </View>
                        ) : (
                            <View>
                                <Text variant="labelSmall" style={{ color: '#64748b' }}>{match.startDay} - {match.startTime}</Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* Clubs & Scores */}
                <View style={{ marginVertical: 20, }}>
                    {match?.clubs?.map((clubItem: ClubsType, index: number) => {
                        return (
                            <View key={index} style={{ display: 'flex', flexDirection: 'row', gap: 5, marginBottom: 5, justifyContent: 'space-between' }}>
                                <View style={{ display: 'flex', flexDirection: 'row' }}>
                                    <Text>{clubItem.clubIcon}</Text>
                                    {/* <Text variant="bodySmall">vs</Text> */}
                                    <Text variant="headlineMedium">{clubItem.clubName}</Text>
                                </View>
                                {clubItem.scored && <Text variant="titleLarge">{clubItem.scored}</Text>}
                            </View>
                        )
                    })}
                </View>


                {/* Footer: Stadium & Alert */}
                <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>

                    <Text variant="labelSmall">{match.stadium}</Text>
                    {!match.isLive && <Button textColor="#10b981" onPress={() => console.log('Set Reminder')}>Set Alert</Button>}
                </View>
            </View>
        </>
    );
}

export default MatchCard;

const styles = StyleSheet.create({
    cardContainer: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        // iOS shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        // Android shadow
        elevation: 4,
    },
    headerRow: { display: 'flex', flexDirection: 'row', justifyContent: 'space-between' },
    desc: {
        color: '#64748b'
    },
    livebadge: {
        backgroundColor: '#ef4444', // or '#dc2626' for darker red
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 12,
        alignSelf: 'flex-start', // Makes it fit content width
    },
    liveText: {
        color: '#ffffff',
        fontSize: 12,
        fontWeight: '600',
        letterSpacing: 0.5,
    },
    rowContainer: {
        display: 'flex',
        flexDirection: 'row',
        gap: 5,
    },
})