// app/auth/forgot-password.tsx
import { supabase } from "@/lib/supabase";
import { useRouter } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, View } from "react-native";
import { Button, Text, TextInput } from "react-native-paper";

export default function ForgotPasswordScreen() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleResetPassword = async () => {
        if (!email.trim()) {
            setMessage("❌ Please enter your email");
            return;
        }

        setIsLoading(true);
        setMessage('');

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: 'exp://172.20.10.2:8081/--/auth/reset-password',
        });

        setIsLoading(false);

        if (error) {
            setMessage(`❌ ${error.message}`);
        } else {
            setMessage("✅ Password reset link sent! Check your email.");
        }
    };

    return (
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
                    Reset Password 🔒
                </Text>
                <Text style={{
                    color: "#6b7280",
                    fontSize: 15,
                    marginBottom: 24,
                }}>
                    Enter your email and we'll send you a link to reset your password.
                </Text>

                <TextInput
                    mode='outlined'
                    label="Email"
                    left={<TextInput.Icon icon='email' />}
                    outlineColor="#e5e7eb"
                    activeOutlineColor="#10b981"
                    theme={{ colors: { background: '#ffffff' } }}
                    style={{ backgroundColor: 'white', marginBottom: 16 }}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    onSubmitEditing={handleResetPassword}
                    returnKeyType="send"
                />

                <Button
                    mode="contained"
                    buttonColor="#10b981"
                    onPress={handleResetPassword}
                    loading={isLoading}
                    disabled={isLoading}
                    style={{ borderRadius: 30, marginBottom: 12 }}
                >
                    Send Reset Link
                </Button>

                <Button
                    mode="text"
                    textColor="#6b7280"
                    onPress={() => router.back()}
                >
                    Back to Sign In
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
    );
}