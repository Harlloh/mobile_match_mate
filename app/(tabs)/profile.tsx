import { useAuth } from '@/context/appContext';
import { useAppStore } from '@/context/useAppStore';
import { appName } from '@/lib/utils';
import { deleteAccount } from '@/services/accountService';
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Slider from '@react-native-community/slider';
import * as Notifications from 'expo-notifications';
import { useState } from "react";
import { Alert, ScrollView, StyleSheet, View } from "react-native";
import { Button, Dialog, Portal, Switch, Text } from "react-native-paper";

function ProfileScreen() {
    const { user, signOut, } = useAuth()
    const { updatePreference, preference } = useAppStore()
    const [isLoading, setIsLoading] = useState(false)
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)





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

    const handleDeleteAccount = async () => {
        try {
            setIsDeleting(true)
            await deleteAccount()
            await Notifications.cancelAllScheduledNotificationsAsync()

            useAppStore.setState({
                subscribedLeagues: [],
                favList: [],
                hateTeamList: [],
                alertedMatches: [],
                preference: {
                    enableReminders: true,
                    reminderTime: 30,
                },
            })

            await AsyncStorage.removeItem('app-storage')
            setShowDeleteDialog(false)
            await signOut()
        } catch (error) {
            const message = error instanceof Error
                ? error.message
                : 'We could not delete your account. Please try again.'

            Alert.alert('Account deletion failed', message)
        } finally {
            setIsDeleting(false)
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

            {/* Match Reminders */}
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

            {/* Danger Zone */}
            <View style={[styles.section, styles.dangerSection]}>
                <View style={styles.dangerHeading}>
                    <View style={styles.dangerIcon}>
                        <Feather name="alert-triangle" size={24} color="#dc2626"/>
                    </View>
                    <View style={styles.dangerHeadingText}>
                        <Text style={styles.dangerTitle}>Danger zone</Text>
                        <Text style={styles.dangerDescription}>
                            Permanently delete your account and app data.
                        </Text>
                    </View>
                </View>

                <Button
                    disabled={isDeleting}
                    mode="outlined"
                    icon="trash-can-outline"
                    textColor="#dc2626"
                    style={styles.deleteButton}
                    contentStyle={styles.deleteButtonContent}
                    onPress={() => setShowDeleteDialog(true)}
                >
                    Delete account
                </Button>
            </View>


            {/* ⚽ Footer */}
            <Text style={styles.footerText}>
                {appName} v1.0.0 — Your Football, Your Way ⚽
            </Text>

            <Portal>
                <Dialog
                    visible={showDeleteDialog}
                    dismissable={!isDeleting}
                    onDismiss={() => !isDeleting && setShowDeleteDialog(false)}
                    style={styles.dialog}
                >
                    <Dialog.Icon icon="alert" color="#dc2626" size={40} />
                    <Dialog.Title style={styles.dialogTitle}>Delete your account?</Dialog.Title>
                    <Dialog.Content>
                        <Text style={styles.dialogText}>
                            This action is permanent. Your account, subscribed leagues, favourite and hate teams, match alerts, and notification preferences will be deleted.
                        </Text>
                        <Text style={styles.dialogWarning}>
                            You will no longer receive match notifications, and this data cannot be recovered.
                        </Text>
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button disabled={isDeleting} textColor="#475569" onPress={() => setShowDeleteDialog(false)}>
                            Keep account
                        </Button>
                        <Button
                            mode="contained"
                            buttonColor="#dc2626"
                            textColor="#ffffff"
                            loading={isDeleting}
                            disabled={isDeleting}
                            onPress={handleDeleteAccount}
                        >
                            {isDeleting ? 'Deleting...' : 'Delete account'}
                        </Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>
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
    dangerSection: {
        borderWidth: 1,
        borderColor: "#fecaca",
        backgroundColor: "#fffafa",
    },
    dangerHeading: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        marginBottom: 18,
    },
    dangerIcon: {
        width: 44,
        height: 44,
        borderRadius: 21,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#fee2e2",
        display: "flex",
    },
    dangerHeadingText: {
        flex: 1,
    },
    dangerTitle: {
        color: "#991b1b",
        fontSize: 16,
        fontWeight: "700",
        marginBottom: 3,
    },
    dangerDescription: {
        color: "#7f1d1d",
        fontSize: 13,
        lineHeight: 18,
    },
    deleteButton: {
        borderColor: "#dc2626",
        borderRadius: 10,
    },
    deleteButtonContent: {
        minHeight: 46,
    },
    dialog: {
        backgroundColor: "#ffffff",
        borderRadius: 20,
    },
    dialogTitle: {
        textAlign: "center",
        color: "#0f172a",
        fontWeight: "700",
    },
    dialogText: {
        color: "#475569",
        fontSize: 14,
        lineHeight: 21,
        textAlign: "center",
    },
    dialogWarning: {
        color: "#991b1b",
        backgroundColor: "#fef2f2",
        borderRadius: 10,
        padding: 12,
        marginTop: 14,
        fontSize: 13,
        lineHeight: 19,
        textAlign: "center",
        overflow: "hidden",
    },

    /* Footer */
    footerText: {
        textAlign: "center",
        color: "#9ca3af",
        marginVertical: 25,
        fontSize: 12,
    },
});

