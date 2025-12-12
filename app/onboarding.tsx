import OnboardingItems from '@/components/onboardingItem';
import { OnboardingItemsType } from '@/types';
import EvilIcons from '@expo/vector-icons/EvilIcons';
import { Stack, useRouter } from "expo-router";
import { useRef } from 'react';
import { Animated, FlatList, StyleSheet, Text, useWindowDimensions, View } from "react-native";

export default function OnboardingScreen() {
    const router = useRouter();
    const flatListRef = useRef<FlatList>(null);
    const scrollX = useRef(new Animated.Value(0)).current;
    const { width } = useWindowDimensions()


    const flatList: OnboardingItemsType[] = [
        {
            header: 'Match Updates',
            icon: <EvilIcons name="calendar" size={44} color="#10b981" />,
            desc: 'Get real-time updates for your favorite teams and competitions.',
        },
        {
            header: 'Custom Alerts',
            icon: <EvilIcons name="bell" size={44} color="#10b981" />,
            desc: 'Choose how and when you want to be notified about matches and events.',
        },
        {
            header: 'Personalized Experience',
            icon: <EvilIcons name="heart" size={44} color="#10b981" />,
            desc: 'Follow teams you love (or love to hate) for a tailored football experience.',
        },
    ]



    return (
        <>
            <Stack.Screen options={{ headerShown: false }} />
            <View style={styles.container}>
                <View style={{ paddingTop: 30 }}>
                    <Text style={styles.title}>Welcome to Match Beacon ⚽</Text>
                    <Text style={styles.text}>
                        Your Football, your way
                    </Text>
                </View>

                {/* PLACE THE CAROUSEL HERE WITH BUTTON */}
                <View style={{
                    width: '100%',
                    // backgroundColor: 'red',
                    alignSelf: 'center',
                }}>
                    <FlatList
                        data={flatList}
                        contentContainerStyle={{ paddingHorizontal: 0 }}
                        snapToAlignment="center"
                        decelerationRate="fast"

                        ref={flatListRef}
                        keyExtractor={(item) => item?.header}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        pagingEnabled
                        bounces={false}
                        onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
                            useNativeDriver: false
                        })}

                        renderItem={({ item, index }) => <OnboardingItems {...item} index={index} totalSlides={flatList.length} scrollToNext={(nextIndex: number) => flatListRef.current?.scrollToIndex({ index: nextIndex })} />}
                    />
                    {/* Pagination Dots */}
                    <View style={styles.pagination}>
                        {flatList.map((_, i) => {
                            const inputRange = [
                                (i - 1) * width,
                                i * width,
                                (i + 1) * width,
                            ];

                            const dotOpacity = scrollX.interpolate({
                                inputRange,
                                outputRange: [0.3, 1, 0.3],
                                extrapolate: "clamp",
                            });

                            const dotScale = scrollX.interpolate({
                                inputRange,
                                outputRange: [0.8, 1.2, 0.8],
                                extrapolate: "clamp",
                            });

                            return (
                                <Animated.View
                                    key={i.toString()}
                                    style={[
                                        styles.dot,
                                        {
                                            opacity: dotOpacity,
                                            transform: [{ scale: dotScale }],
                                        },
                                    ]}
                                />
                            );
                        })}
                    </View>



                </View>
                {/* <Text style={{
                    marginTop: 5, color: '#5a5d63ff'
                }}>Already have an account?
                    <Pressable onPress={() => router.replace("/auth/signin")}>
                        {({ pressed }) => (
                            <Text style={{
                                color: pressed ? '#10b981' : '#10b981',
                                textDecorationLine: 'underline',
                                fontWeight: '600',
                                marginLeft: 5,
                                marginTop: 10
                            }}>
                                Sign in
                            </Text>
                        )}
                    </Pressable>
                </Text> */}
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "flex-start",  // distributes header, carousel, footer
        alignItems: "center",
        paddingVertical: 40,               // top & bottom breathing room
        // paddingHorizontal: 24,
        paddingBottom: 50,
        backgroundColor: 'white',
        gap: 160
    },
    title: { fontSize: 24, fontWeight: "bold", marginBottom: 12 },
    text: { textAlign: "center", marginBottom: 24 },
    pagination: {
        flexDirection: "row",
        alignSelf: "center",
        marginTop: 8,
        gap: 8,
    },

    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: "#10b981",
    },

});
