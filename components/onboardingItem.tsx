import { useAuth } from "@/context/appContext";
import { OnboardingItemsType } from "@/types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { JSX } from "react";
import { StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { Button } from "react-native-paper";

type PropsType = OnboardingItemsType & {
    index: number;
    totalSlides: number;
    scrollToNext: (nextIndex: number) => void;
};

function OnboardingItems({
    header,
    desc,
    icon,
    index,
    totalSlides,
    scrollToNext,
}: PropsType): JSX.Element {
    const { width } = useWindowDimensions();
    const router = useRouter();
    const { setHasOnboarded } = useAuth()

    const handleNext = async () => {
        if (index === totalSlides - 1) {
            try {
                await AsyncStorage.setItem("hasOnboarded", 'true');
                setHasOnboarded(true);
                router.replace({ pathname: "/auth/[type]", params: { type: 'signup' } });
            } catch (error) {
                console.error('Error completing onboarding:', error);
                // Handle error - maybe show a toast notification
            }
        } else {
            scrollToNext(index + 1);
        }
    };

    return (
        // 💡 Added a card-like container for better visuals
        <View style={[styles.wrapper, { width }]}>
            <View style={styles.card}>
                <View style={styles.iconWrapper}>{icon}</View>

                <Text style={styles.header}>{header}</Text>
                <Text style={styles.desc}>{desc}</Text>

                <Button
                    style={styles.btn}
                    mode="contained"
                    buttonColor="#10b981"
                    textColor="white"
                    onPress={handleNext}
                >
                    {index === totalSlides - 1 ? "Get Started" : "Next"}
                </Button>
            </View>
        </View >
    );
}

export default OnboardingItems;

const styles = StyleSheet.create({
    // 💡 New outer wrapper to center content within screen
    wrapper: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },

    // 💡 Card design for content area
    card: {
        width: "85%",
        backgroundColor: "#ffffff", // changed from blue
        borderRadius: 20, // smooth corners
        paddingVertical: 40,
        paddingHorizontal: 24,
        alignItems: "center",
        justifyContent: "center",
        elevation: 5, // Android shadow
        // shadowColor: "#000", // iOS shadow
        // shadowOffset: { width: 0, height: 3 },
        // shadowOpacity: 0.15,
        // shadowRadius: 6,
    },

    // 💡 Icon centered in a soft circle
    iconWrapper: {
        backgroundColor: "#ecfdf5", // light green tint
        borderRadius: 50,
        padding: 16,
        marginBottom: 20,
    },

    header: {
        fontWeight: "700", // fixed from 600
        fontSize: 22,
        marginBottom: 8,
        color: "#111827", // dark neutral
        textAlign: "center",
    },

    desc: {
        textAlign: "center",
        color: "#6b7280", // softer gray for readability
        marginBottom: 24,
        fontSize: 15,
        lineHeight: 22,
    },

    btn: {
        width: "100%",
        borderRadius: 30,
        paddingVertical: 6,
    },
});




