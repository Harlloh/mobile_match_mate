// app/auth/reset-password.tsx
import { supabase } from "@/lib/supabase";
import { Stack, useLocalSearchParams, useRouter, useSegments } from "expo-router";
import { useEffect, useState } from "react";
import { KeyboardAvoidingView, Platform, View } from "react-native";
import { Button, Text, TextInput } from "react-native-paper";

export default function ResetPassword() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const segments = useSegments();

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleUpdatePassword = async () => {
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
            setTimeout(() => {
                router.replace({ pathname: "/auth/[type]", params: { type: "signin" } });
            }, 2000);
        }
    };




    useEffect(() => {
        // Check if there's an access_token or error in the URL params
        const { access_token, refresh_token, error, error_description } = params;


        if (error) {
            setMessage(`❌ ${error_description || error}`);
            return;
        }

        if (access_token) {
            // Token is automatically set by Supabase, just confirm session
            supabase.auth.getSession().then(({ data: { session } }) => {
                if (!session) {
                    setMessage("❌ Invalid or expired reset link");
                }
            });
        } else {
            setMessage("❌ No reset token found. Please request a new reset link.");
        }
        console.log(access_token, refresh_token, 'HEYYYYYYYYYYYY', segments)
    }, [])

    return (
        <>
            <Stack.Screen options={{ headerShown: false }} />
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
            >
                <View style={{
                    flex: 1,
                    justifyContent: "center",
                    paddingHorizontal: 24,
                    backgroundColor: "#ffffff",
                }}>
                    <Text style={{ fontSize: 24, fontWeight: "700", marginBottom: 8 }}>
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
                        disabled={isLoading}
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
                </View>
            </KeyboardAvoidingView>
        </>
    );
}