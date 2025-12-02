import { useAuth } from "@/context/appContext";
import { usePathname, useRouter, useSegments } from "expo-router";
import { ReactNode, useEffect } from "react";
import { View } from "react-native";
import { Text } from "react-native-paper";

function RouteGaurd({ children }: { children: ReactNode }) {
    const route = useRouter();
    const segments = useSegments();
    const params = usePathname()
    const { user, session, isLoading, hasOnboarded, setRouteGuardReady, routeGuardReady } = useAuth();


    useEffect(() => {
        const isPasswordResetFlow = params.includes('reset-password') || params.includes('forgot-password');
        const inAuthGroup = segments[0] === "auth";
        const inOnboarding = segments[0] === "onboarding";

        // EARLY RETURN STATE, BUT DO NOT BLOCK FOREVER
        if (isLoading || hasOnboarded === null) {
            return;
        }

        // ONBOARDING FLOW
        if (!hasOnboarded && !inOnboarding) {
            setRouteGuardReady(true);
            route.replace('/onboarding');
            return;
        }

        // NOT LOGGED IN, NOT IN AUTH
        if (hasOnboarded && !user && !session && !inAuthGroup) {
            setRouteGuardReady(true);
            route.replace('/auth/signin');
            return;
        }

        // LOGGED IN BUT TRYING TO ACCESS AUTH PAGES
        if (hasOnboarded && user && session && inAuthGroup && !isPasswordResetFlow) {
            setRouteGuardReady(true);
            route.replace('/');
            return;
        }

        // DEFAULT: ROUTE IS VALID
        setRouteGuardReady(true);

    }, [user, session, isLoading, hasOnboarded, segments, params]);

    // Optional: show a local loading state while guard is checking
    if (!routeGuardReady) {
        return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <Text>Checking routes...</Text>
            </View>
        );
    }

    return <>{children}</>;
}

export default RouteGaurd;

