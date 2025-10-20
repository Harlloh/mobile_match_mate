import SignIn from "@/components/signIn";
import SignUp from "@/components/signup";
import { Stack, useLocalSearchParams } from "expo-router";
import { View } from "react-native";
import ConfirmMail from "./confirm";



export default function AuthScreen() {
    const { type } = useLocalSearchParams();

    return (
        <>
            <Stack.Screen options={{ headerShown: true, title: 'Matchmate ⚽' }} />
            <View style={{ flex: 1, }}>
                {type === "signup" && <SignUp />}
                {type === "signin" && <SignIn />}
                {type === "confirm" && <ConfirmMail />}
            </View>
        </>
    );
}
