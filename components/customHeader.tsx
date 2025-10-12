import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

function CustomHeader({ title }: { title: string }) {
    const router = useRouter();

    return (
        <View style={styles.header}>
            <Text variant="titleLarge" style={styles.title}>{title}</Text>

            {/* Notification Bell */}
            <Pressable
                onPress={() => router.push('/notifications')}
                style={({ pressed }) => [
                    styles.bellButton,
                    pressed && styles.bellPressed
                ]}
            >
                <Ionicons name="notifications-outline" size={24} color="#111827" />
                {/* Notification badge */}
                <View style={styles.badge}>
                    <Text style={styles.badgeText}> </Text>
                </View>
            </Pressable>
        </View>
    );
}

export default CustomHeader;

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#ffffff',
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    title: {
        fontWeight: '500',
        color: '#111827',
        fontSize: 18
    },
    bellButton: {
        padding: 4,
        position: 'relative',
    },
    bellPressed: {
        opacity: 0.6,
    },
    badge: {
        position: 'absolute',
        top: 0,
        right: 0,
        backgroundColor: '#ef4444',
        borderRadius: 100,
        minWidth: 10,
        height: 10,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 4,
    },
    badgeText: {
        color: '#ffffff',
        fontSize: 10,
        fontWeight: '700',
    },
});
