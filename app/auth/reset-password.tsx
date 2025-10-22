import { useAuth } from "@/context/appContext";
import { supabase } from "@/lib/supabase";
import * as Linking from 'expo-linking';
import { Stack, useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";
import { Button, Text, TextInput } from "react-native-paper";

export default function ResetPassword() {
    const { signOut } = useAuth()
    const router = useRouter();
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const [deepLinkValues, setDeepLinkValues] = useState({
        access_token: '',
        refresh_token: '',
        token_type: '',
        type: '',
    });

    // Prevent duplicate processing
    const hasProcessedRef = useRef(false);
    const hasResetPasswordRef = useRef(false);



    const handleUpdatePassword = async () => {
        // Check if session is ready
        if (!deepLinkValues.access_token || !deepLinkValues.refresh_token) {
            setMessage("❌ Session not ready. Please wait or request a new reset link.");
            return;
        }

        if (!newPassword || !confirmPassword) {
            setMessage("❌ Please fill in all fields");
            return;
        }

        if (newPassword !== confirmPassword) {
            setMessage("❌ Passwords don't match");
            return;
        }

        if (newPassword.length < 6) {
            setMessage("❌ Password must be at least 6 characters");
            return;
        }

        setIsLoading(true);
        setMessage('');

        const { error } = await supabase.auth.updateUser({
            password: newPassword
        });

        setIsLoading(false);

        if (error) {
            setMessage(`❌ ${error.message}`);
        } else {
            setMessage("✅ Password updated successfully!");
            hasResetPasswordRef.current = true
            setTimeout(() => {
                router.replace("/");
            }, 2000);
        }
    };

    useEffect(() => {
        const handleDeepLink = async () => {
            try {
                // Check for initial URL (when app opens from closed state)
                const initialUrl = await Linking.getInitialURL();
                if (initialUrl) {
                    // console.log('Initial URL:', initialUrl);
                    const parsed = parseParams(initialUrl);
                    if (parsed && parsed.access_token && !hasProcessedRef.current) {
                        hasProcessedRef.current = true;
                        setDeepLinkValues(parsed);
                        await setSessionWithTokens(parsed);
                    }
                }

                // Listen for deep links while the app is running
                const subscription = Linking.addEventListener('url', async ({ url }) => {
                    // console.log('Deep link received:', url);

                    // Prevent duplicate processing
                    if (hasProcessedRef.current) {
                        // console.log('Already processed, skipping...');
                        return;
                    }

                    const parsed = parseParams(url);
                    if (parsed && parsed.access_token) {
                        hasProcessedRef.current = true;
                        setDeepLinkValues(parsed);
                        await setSessionWithTokens(parsed);
                    }
                });

                return () => {
                    subscription.remove();
                };
            } catch (error) {
                console.error('Error handling deep link:', error);
                setMessage("❌ Error processing reset link");
            }
        };

        handleDeepLink();
    }, []);
    const parseParams = (url: string) => {
        const hashIndex = url.indexOf('#');
        if (hashIndex === -1) return null;

        const hash = url.substring(hashIndex + 1);
        const params = new URLSearchParams(hash);

        return {
            access_token: params.get('access_token') || '',
            refresh_token: params.get('refresh_token') || '',
            token_type: params.get('token_type') || '',
            type: params.get('type') || '',
        };
    };
    // Function to set the session with tokens
    const setSessionWithTokens = async (tokens: typeof deepLinkValues) => {
        if (!tokens.access_token || !tokens.refresh_token) {
            setMessage("❌ Invalid reset link");
            return;
        }

        console.log('Setting session with tokens...');

        const { error } = await supabase.auth.setSession({
            access_token: tokens.access_token,
            refresh_token: tokens.refresh_token,
        });

        if (error) {
            console.error('Session error:', error);
            setMessage(`❌ Failed to restore session: ${error.message}`);
            hasProcessedRef.current = false; // Allow retry
        } else {
            console.log('✅ Session set successfully');
            setMessage("✅ Ready to set new password");
        }
    };


    useFocusEffect(
        useCallback(() => {
            hasProcessedRef.current = false;
            hasResetPasswordRef.current = false;
            return () => {
                if (!hasResetPasswordRef.current) {
                    supabase.auth.signOut();
                    signOut()
                }
            }
        }, [])
    )




    return (
        <>
            <Stack.Screen options={{ headerShown: false }} />
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
            >
                <ScrollView
                    contentContainerStyle={{
                        flexGrow: 1,
                        paddingHorizontal: 20,
                        paddingTop: 40,
                        paddingBottom: 40,
                        justifyContent: 'center',
                    }}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <View style={{
                        flex: 1,
                        justifyContent: "center",
                        paddingHorizontal: 24,
                        backgroundColor: "#ffffff",
                    }}>
                        <Text style={{ fontSize: 24, fontWeight: "700", marginBottom: 8, textAlign: 'center' }}>
                            Set New Password 🔑
                        </Text>

                        <TextInput
                            mode='outlined'
                            label="New Password"
                            left={<TextInput.Icon icon='lock' />}
                            right={<TextInput.Icon
                                icon={showPassword ? 'eye-off' : 'eye'}
                                onPress={() => setShowPassword(!showPassword)}
                            />}
                            outlineColor="#e5e7eb"
                            activeOutlineColor="#10b981"
                            theme={{ colors: { background: '#ffffff' } }}
                            style={{ backgroundColor: 'white', marginBottom: 16 }}
                            value={newPassword}
                            onChangeText={setNewPassword}
                            secureTextEntry={!showPassword}
                        />

                        <TextInput
                            mode='outlined'
                            label="Confirm Password"
                            left={<TextInput.Icon icon='lock-check' />}
                            outlineColor="#e5e7eb"
                            activeOutlineColor="#10b981"
                            theme={{ colors: { background: '#ffffff' } }}
                            style={{ backgroundColor: 'white', marginBottom: 16 }}
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            secureTextEntry={!showPassword}
                            onSubmitEditing={handleUpdatePassword}
                            returnKeyType="done"
                        />

                        <Button
                            mode="contained"
                            buttonColor="#10b981"
                            onPress={handleUpdatePassword}
                            loading={isLoading}
                            disabled={isLoading || !deepLinkValues.access_token}
                            style={{ borderRadius: 30 }}
                        >
                            Update Password
                        </Button>

                        {message ? (
                            <Text style={{
                                color: message.includes('✅') ? "#10b981" : "#ef4444",
                                marginTop: 16,
                                textAlign: "center"
                            }}>
                                {message}
                            </Text>
                        ) : null}

                        {/* Optional: Show session status for debugging */}
                        {__DEV__ && (
                            <Text style={{ marginTop: 8, fontSize: 12, color: "#6b7280", textAlign: "center" }}>
                                Session: {deepLinkValues.access_token ? '✅ Ready' : '⏳ Waiting...'}
                            </Text>
                        )}
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </>
    );
}