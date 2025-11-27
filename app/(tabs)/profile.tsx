import { useAuth } from '@/context/appContext';
import { useAppStore } from '@/context/useAppStore';
import Slider from '@react-native-community/slider';
import { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Button, Switch, Text } from "react-native-paper";

function ProfileScreen() {
    const { user, signOut, } = useAuth()
    const { updatePreference, preference } = useAppStore()
    const [isLoading, setIsLoading] = useState(false)





    // useEffect(() => {
    //     console.log(settings)
    //     updatePreference(settings)
    // }, [settings])

    const handleSignOut = async () => {
        try {
            setIsLoading(true)
            await signOut()
        } catch (error) {
            console.error("Error during sign out:", error);

        } finally {
            setIsLoading(false)
        }
    }


    const formatDate = (dateString: string | undefined) => {
        if (!dateString) return 'Unknown';

        const date = new Date(dateString)
        return date.toLocaleDateString('en-GB', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        })
    }

    return (
        <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 50 }}>
            {/* 🧍 Profile Header */}
            <View style={styles.profileHeader}>
                <View style={styles.avatarPlaceholder}>
                    <Text style={styles.avatarText}>{user?.user_metadata.display_name.charAt(0)}</Text>
                </View>
                <Text style={styles.name}>{user?.user_metadata.display_name}</Text>
                <Text style={[styles.subText, { marginBottom: 6 }]}> {user?.email}</Text>
                <Text style={styles.subText}>Joined since {formatDate(user?.confirmed_at)}</Text>
                <Button disabled={isLoading} onPress={() => handleSignOut()} mode="text" textColor="#ef4444" style={{ marginTop: 10 }}>
                    {isLoading ? 'Signing out..' : 'Sign Out'}
                </Button>
            </View>

            {/* 🔔 Match Reminders */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Match Reminders</Text>

                <View style={styles.settingRow}>
                    <Text style={styles.settingLabel}>Enable Push Notification</Text>
                    <Switch
                        value={preference.enableReminders}
                        onValueChange={() => updatePreference({ enableReminders: !preference.enableReminders })}
                        color="#10b981"
                    />
                </View>
                <Text style={styles.subText}>Get reminded before matches start</Text>

                {/* Reminder Time Slider */}
                <Text style={[styles.subText, { marginTop: 12 }]}>
                    Reminder time:{" "}
                    <Text style={{ color: "#10b981", fontWeight: "500" }}>
                        {preference.reminderTime} minutes before kickoff
                    </Text>
                </Text>

                <Slider
                    style={{ width: "100%", height: 40, marginTop: 6 }}
                    minimumValue={5}
                    maximumValue={60}
                    step={5}
                    value={preference.reminderTime}
                    onValueChange={(value) =>
                        updatePreference({ reminderTime: value })
                    }
                    minimumTrackTintColor="#10b981"
                    maximumTrackTintColor="#1f2937"
                    thumbTintColor="#10b981"
                />
            </View>

            {/* 📣 Notification Settings */}


            {/* ⚽ Footer */}
            <Text style={styles.footerText}>
                MatchMate v1.0.0 — Your Football, Your Way ⚽
            </Text>
        </ScrollView>
    );
}

export default ProfileScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f9fafb",
    },

    /* Header */
    profileHeader: {
        alignItems: "center",
        paddingVertical: 35,
        backgroundColor: "#ffffff",
        marginBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: "#e5e7eb",
    },
    avatarPlaceholder: {
        width: 85,
        height: 85,
        borderRadius: 42.5,
        backgroundColor: "#10b98120",
        alignItems: "center",
        justifyContent: "center",
    },
    avatarText: {
        fontSize: 32,
        color: "#10b981",
        fontWeight: "bold",
    },
    name: {
        fontSize: 20,
        fontWeight: "600",
        marginTop: 10,
        color: "#111827",
    },
    subText: {
        fontSize: 13,
        color: "#6b7280",
    },

    /* Sections */
    section: {
        backgroundColor: "#ffffff",
        marginHorizontal: 15,
        marginBottom: 15,
        borderRadius: 12,
        padding: 18,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 2,
        elevation: 2,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: "#111827",
        marginBottom: 12,
    },
    settingRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 6,
    },
    settingLabel: {
        fontSize: 14,
        color: "#1f2937",
    },
    divider: {
        height: 1,
        backgroundColor: "#e5e7eb",
        marginVertical: 12,
    },

    /* Footer */
    footerText: {
        textAlign: "center",
        color: "#9ca3af",
        marginVertical: 25,
        fontSize: 12,
    },
});



