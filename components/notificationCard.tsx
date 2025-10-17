import { Feather, FontAwesome, MaterialCommunityIcons } from "@expo/vector-icons";
import { useEffect } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";

function NotificationCard({ item, onRead }: { item: any, onRead: (item: any, type: string) => void }) {
    const read = false
    useEffect(() => {
        console.log(item)
    }, [item])
    return (
        <View style={[styles.cardWrapper, !item?.isRead && { borderLeftWidth: 4, borderLeftColor: "#62d58d" }, item?.isRead && { opacity: 0.5 }]}>
            <View style={styles.iconWrapper}>
                <MaterialCommunityIcons name="alert-circle-outline" size={30} color="#62d58d" />
            </View>
            <View style={styles.contentWrapper}>
                <View style={styles.headDiv}>
                    <Text variant="bodyLarge" style={styles.title}>{item.title}</Text>
                    <Text variant="bodySmall" style={styles.dateTime}>Oct 17, 09:05</Text>
                </View>
                <Text style={styles.details} >{item.home} vs. {item.away} match starts in {item.startIn} minutes</Text>
                <View style={styles.buttonWrapper}>
                    {!item.isRead && <Pressable android_ripple={{ color: "#e5e7eb" }} style={styles.btn} onPress={() => onRead(item, 'read')}>
                        <Feather name="check-circle" size={15} color="#62d58d" />
                        <Text>Mark as read</Text>
                    </Pressable>}
                    <Pressable style={styles.btn} onPress={() => onRead(item, 'delete')}>
                        <FontAwesome name="trash-o" size={24} color="red" />
                    </Pressable>
                </View>
            </View>
        </View>
    );
}

export default NotificationCard;


const styles = StyleSheet.create({
    cardWrapper: {
        backgroundColor: 'white',
        shadowColor: 'black',
        borderRadius: 10,
        display: 'flex',
        flexDirection: 'row',
        gap: 10,
        padding: 15,
        margin: 10,
        overflow: 'hidden',
        shadowOpacity: 0.08,
        shadowOffset: { width: 0, height: 2 },
    },
    iconWrapper: {
        backgroundColor: '#f3f6fa',
        alignSelf: 'flex-start',
        padding: 10,
        borderRadius: 100,
    },
    contentWrapper: {
        flex: 1,
        display: 'flex',
        // backgroundColor: 'red'
    },
    headDiv: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        flex: 1,
        alignItems: 'center',
        marginBottom: 15
    },
    title: {
        fontWeight: 600
    },
    dateTime: {
        color: '#647692',
        flexShrink: 1
    },
    details: {
        color: '#647692',
        textAlign: 'left',
        fontSize: 13,
        flexWrap: 'wrap',
        flexShrink: 1
    },
    buttonWrapper: {
        display: 'flex',
        flexDirection: 'row',
        alignSelf: 'flex-end',
        marginTop: 15,
        gap: 10
    },
    btn: { display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 5, padding: 10, backgroundColor: '#f8fafc', borderColor: '#e2e8f0', borderWidth: 1, borderRadius: 10 }
})


