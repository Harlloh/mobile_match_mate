import { useRouter } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from "react-native";
import { Button, Text, TextInput } from "react-native-paper";

function SignUp() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [formData, setFormData] = useState({
        userName: '',
        email: '',
        password: ''
    })

    const handleSubmit = () => {
        console.log('sign up formdata', formData)
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
            style={styles.keyboardView}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.header}>
                    <Text style={styles.title} variant="headlineMedium">
                        Create Your Account ⚽
                    </Text>
                    <Text style={styles.subtitle} variant="bodyMedium">
                        Join Match Mate and start tracking your favorite teams.
                    </Text>
                </View>

                <View style={styles.formContainer}>
                    <TextInput
                        mode='outlined'
                        label="User Name"
                        left={<TextInput.Icon icon='account' />}
                        outlineColor="#e5e7eb"
                        activeOutlineColor="#10b981"
                        theme={{ colors: { background: '#ffffff' } }}
                        style={styles.input}
                        value={formData.userName}
                        onChangeText={(userName) => setFormData({ ...formData, userName })}
                    />
                    <TextInput
                        mode='outlined'
                        label="Email"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        left={<TextInput.Icon icon='email-outline' />}
                        outlineColor="#e5e7eb"
                        activeOutlineColor="#10b981"
                        theme={{ colors: { background: '#ffffff' } }}
                        style={styles.input}
                        value={formData.email}
                        onChangeText={(email) => setFormData({ ...formData, email })}
                    />
                    <TextInput
                        mode='outlined'
                        label="Password"
                        value={formData.password}
                        onChangeText={(password) => setFormData({ ...formData, password })}
                        secureTextEntry={!showPassword}
                        right={
                            <TextInput.Icon
                                icon={showPassword ? 'eye' : 'eye-off'}
                                onPress={() => setShowPassword(!showPassword)}
                            />
                        }
                        left={<TextInput.Icon icon='lock-outline' />}
                        outlineColor="#e5e7eb"
                        activeOutlineColor="#10b981"
                        theme={{ colors: { background: '#ffffff' } }}
                        style={styles.input}
                    />

                    <Button
                        onPress={handleSubmit}
                        mode='contained'
                        buttonColor="#10b981"
                        loading={isLoading}
                        disabled={isLoading}
                        style={styles.button}
                        contentStyle={styles.buttonContent}
                    >
                        Create Account
                    </Button>

                    <View style={styles.signInContainer}>
                        <Text style={styles.signInPrompt}>Already have an account? </Text>
                        <Text
                            onPress={() => router.replace('/auth/signin')}
                            style={styles.signInText}
                        >
                            Sign In
                        </Text>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

export default SignUp;

const styles = StyleSheet.create({
    keyboardView: {
        flex: 1,
        backgroundColor: '#f9fafb',
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 20,
        paddingTop: 40,
        paddingBottom: 40,
        justifyContent: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: 32,
    },
    title: {
        color: '#111827',
        fontWeight: '700',
        textAlign: 'center',
    },
    subtitle: {
        color: '#6b7280',
        textAlign: 'center',
        marginTop: 8,
    },
    formContainer: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 24,
        gap: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    input: {
        backgroundColor: '#ffffff',
    },
    button: {
        marginTop: 8,
        borderRadius: 12,
    },
    buttonContent: {
        paddingVertical: 10,
    },
    signInContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 8,
    },
    signInPrompt: {
        color: '#6b7280',
        fontSize: 14,
    },
    signInText: {
        color: '#10b981',
        fontWeight: '600',
        fontSize: 14,
    },
});