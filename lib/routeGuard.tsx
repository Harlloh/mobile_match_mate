import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter, useSegments } from "expo-router";
import { ReactNode, useEffect, useState } from "react";
import { View } from "react-native";
import { Text } from "react-native-paper";


function RouteGaurd({ children }: { children: ReactNode }) {
    const route = useRouter();
    const segments = useSegments();

    // temp placeholders for now
    const user = false;
    const session = false;
    const isLoading = false;

    const [mounted, setMounted] = useState(false);
    const [hasOnboarded, setHasOnboarded] = useState<boolean | null>(null);

    useEffect(() => {
        const loadOnboarding = async () => {
            const flag = await AsyncStorage.getItem("hasOnboarded") || localStorage.getItem('hasOnboarded');
            setHasOnboarded(false);
            setHasOnboarded(flag === "true");
            setMounted(true);
        };
        loadOnboarding();
    }, []);


    useEffect(() => {
        if (!mounted || !segments[0]) return;

        const inAuthGroup = segments[0] === "auth";
        const inOnboarding = segments[0] === "onboarding";


        // 🚧 If onboarding not done, always show onboarding first
        if (!hasOnboarded && !inOnboarding) {
            route.replace("/onboarding");
            return;
        }

        // 🚧 Then auth routing logic
        if (hasOnboarded && !user && !inAuthGroup && !session) {
            route.replace({ pathname: "/auth/[type]", params: { type: 'signin' } });
        }
        else if (user && inAuthGroup && !isLoading) {
            route.replace("/");
        }
    }, [user, session, isLoading, mounted, hasOnboarded, segments]);



    if (isLoading || hasOnboarded === null || !mounted) {
        return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <Text>Loading...</Text>
            </View>
        );
    }

    return <>{children}</>;
}
export default RouteGaurd;

