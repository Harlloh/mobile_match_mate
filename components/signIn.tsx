import { useRouter } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from "react-native";
import { Button, Text, TextInput } from "react-native-paper";

function SignIn() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    })

    const handleSubmit = () => {
        console.log(formData)
        router.replace('/')
    }

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
                    <Text style={styles.title} variant="headlineMedium">Welcome Back</Text>
                    <Text style={styles.subtitle} variant="bodyMedium">Sign in to your account</Text>
                </View>

                <View style={styles.formContainer}>
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
                                icon={showPassword ? 'eye-off' : 'eye'}
                                onPress={() => setShowPassword(!showPassword)}
                            />
                        }
                        left={<TextInput.Icon icon='lock-outline' />}
                        outlineColor="#e5e7eb"
                        activeOutlineColor="#10b981"
                        theme={{ colors: { background: '#ffffff' } }}
                        style={styles.input}
                    />

                    {/* Forgot Password */}
                    <Text
                        style={styles.forgotText}
                        onPress={() => console.log('Forgot password')}
                    >
                        Forgot Password?
                    </Text>

                    <Button
                        onPress={handleSubmit}
                        mode='contained'
                        buttonColor="#10b981"
                        loading={isLoading}
                        disabled={isLoading}
                        style={styles.button}
                        contentStyle={styles.buttonContent}
                    >
                        Sign In
                    </Button>

                    <View style={styles.signUpContainer}>
                        <Text style={styles.signUpPrompt}>Don't have an account? </Text>
                        <Text
                            onPress={() => router.replace('/auth/signup')}
                            style={styles.signUpText}
                        >
                            Sign Up
                        </Text>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

export default SignIn;

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
    },
    subtitle: {
        color: '#6b7280',
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
    forgotText: {
        alignSelf: 'flex-end',
        color: '#374151',
        fontSize: 14,
        fontWeight: '500',
    },
    button: {
        marginTop: 8,
        borderRadius: 12,
    },
    buttonContent: {
        paddingVertical: 10,
    },
    signUpContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 8,
    },
    signUpPrompt: {
        color: '#6b7280',
        fontSize: 14,
    },
    signUpText: {
        color: '#10b981',
        fontWeight: '600',
        fontSize: 14,
    },
});