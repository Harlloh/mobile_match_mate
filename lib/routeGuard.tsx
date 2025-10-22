import { useAuth } from "@/context/appContext";
import { usePathname, useRouter, useSegments } from "expo-router";
import { ReactNode, useEffect, useState } from "react";
import { View } from "react-native";
import { Text } from "react-native-paper";

function RouteGaurd({ children }: { children: ReactNode }) {
    const route = useRouter();
    const segments = useSegments();
    const params = usePathname()
    const { user, session, isLoading, hasOnboarded } = useAuth();
    const [isReady, setIsReady] = useState(false);


    useEffect(() => {
        const isPasswordResetFlow = params.includes('reset-password') || params.includes('forgot-password');

        // Wait for both auth and onboarding to be loaded
        if (isLoading || hasOnboarded === null || !segments[0]) return;

        const inAuthGroup = segments[0] === "auth";
        const inOnboarding = segments[0] === "onboarding";

        // If onboarding not done, redirect to onboarding
        if (!hasOnboarded && !inOnboarding) {
            route.replace("/onboarding");
            return;
        }

        // If onboarded but no user, redirect to auth
        if (hasOnboarded && !user && !session && !inAuthGroup) {
            route.replace("/auth/signin");
            return;
        }

        // If authenticated and in auth group, redirect to home
        if (hasOnboarded && user && session && inAuthGroup && !isPasswordResetFlow) {
            route.replace("/");
            return;
        }

        setIsReady(true)
    }, [user, session, isLoading, hasOnboarded, segments]);

    // Show loading only while auth is initializing or hasOnboarded is null
    if (isLoading || hasOnboarded === null || !segments[0] || !isReady) {
        return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <Text>Loading...</Text>
            </View>
        );
    }

    return <>{children}</>;
}

export default RouteGaurd;