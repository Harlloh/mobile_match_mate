import SignIn from "@/components/signIn";
import SignUp from "@/components/signup";
import { Stack, useLocalSearchParams } from "expo-router";
import { View } from "react-native";



export default function AuthScreen() {
    const { type } = useLocalSearchParams(); // 👈 reads "signin", "signup", etc.

    return (
        <>
            <Stack.Screen options={{ headerShown: true, title: 'Matchmate ⚽' }} />
            <View style={{ flex: 1, }}>
                {type === "signup" ? (
                    <SignUp />
                ) : (
                    <SignIn />
                )}
            </View>
        </>
    );
}
