import { useAuth } from "@/context/appContext";
import { supabase } from "@/lib/supabase";
import { useRouter } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView } from "react-native";
import { Button, Text, TextInput } from "react-native-paper";

export default function ConfirmMail() {
    const router = useRouter();
    const [otp, setOtp] = useState('');
    const [isResending, setIsResending] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [statusMessage, setStatusMessage] = useState("");
    const { user, setUser } = useAuth()



    // 📩 Resend confirmation link
    const handleResend = async () => {
        console.log(user)
        setIsResending(true);
        const { data, error } = await supabase.auth.resend({
            type: "signup",
            email: user?.email ?? "",
        });
        setIsResending(false);

        if (error) setStatusMessage(error.message || "Error resending email. Try again later.");
        else setStatusMessage("✅ Confirmation email resent!");
    };


    const submitOTP = async () => {
        if (!otp.trim()) {
            setStatusMessage("❌ Please enter the OTP");
            return;
        }

        setIsVerifying(true);
        setStatusMessage("");

        const { data, error } = await supabase.auth.verifyOtp({
            email: user?.email ?? "",
            token: otp,
            type: "email",
        });

        setIsVerifying(false);

        if (error) {
            setStatusMessage(`❌ ${error.message}`);
        } else {
            setStatusMessage("✅ Email verified successfully!");
            router.replace("/"); // or wherever you want to redirect
        }

    }

    return (
        <KeyboardAvoidingView
            style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                paddingHorizontal: 24,
                backgroundColor: "#ffffff",
            }}
        >
            <Text style={{ fontSize: 22, fontWeight: "700", marginBottom: 8 }}>
                Check your inbox 📬
            </Text>
            <Text
                style={{
                    textAlign: "center",
                    color: "#6b7280",
                    fontSize: 15,
                    lineHeight: 22,
                    marginBottom: 24,
                }}
            >
                We’ve sent a confirmation link to your email. Please verify your account
                to continue.
            </Text>

            <TextInput
                mode='outlined'
                label="OTP"
                left={<TextInput.Icon icon='key' />}
                outlineColor="#e5e7eb"
                activeOutlineColor="#10b981"
                theme={{ colors: { background: '#ffffff' } }}
                style={{ backgroundColor: 'white', width: '100%', marginBottom: 16 }}
                value={otp}
                onChangeText={setOtp}
                placeholder="Enter OTP..."
                keyboardType="number-pad"
                maxLength={6}
                onSubmitEditing={submitOTP}
                returnKeyType="done"
            />

            <Button
                mode="contained"
                buttonColor="#10b981"
                onPress={submitOTP}
                loading={isVerifying}
                disabled={isVerifying || !otp.trim()}
                style={{ width: "100%", borderRadius: 30, marginBottom: 12 }}
            >
                Verify OTP
            </Button>


            <Button
                mode="outlined"
                textColor="#10b981"
                onPress={handleResend}
                loading={isResending}
                disabled={isResending}
                style={{ width: "100%", borderRadius: 30, marginBottom: 12 }}
            >
                Resend Email
            </Button>

            <Button
                mode="text"
                textColor="#6b7280"
                onPress={() => router.replace("/auth/signin")}
            >
                Back to Sign In
            </Button>

            {statusMessage ? (
                <Text style={{ color: "#6b7280", marginTop: 16, textAlign: "center" }}>
                    {statusMessage}
                </Text>
            ) : null}
        </KeyboardAvoidingView>
    );
}

