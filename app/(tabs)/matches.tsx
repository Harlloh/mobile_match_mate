import { LoadingState } from '@/components/hello-wave';
import MatchCard from '@/components/matchCard';
import { useHomeMatchesFixtures } from '@/services/useMatches';
import { MatchCardType } from '@/types';
import { FontAwesome5 } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useEffect, useState } from "react";
import { Modal, Platform, Pressable, RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";

function MatchesScreen() {
    const [date, setDate] = useState(new Date());
    const { match, loading, error, refetch } = useHomeMatchesFixtures(
        date.toISOString().split("T")[0]
    );
    const [activeFilter, setActiveFilter] = useState<'all' | 'live' | 'upcoming' | 'finished'>('all');
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [filteredMatch, setFilteredMatch] = useState<MatchCardType[] | []>([])
    const filter = [
        { label: 'All', key: 'all' },
        { label: 'Live', key: 'live' },
        { label: 'Upcoming', key: 'upcoming' },
        { label: 'Finished', key: 'finished' },
    ]
    const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-GB', {
            month: 'numeric',
            day: 'numeric',
            year: 'numeric'
        })
    }
    const [refreshing, setRefreshing] = useState(false)










    const onDateChange = (event: any, selectedDate?: Date) => {
        if (selectedDate) {
            setDate(selectedDate);
            console.log(selectedDate)
        }
        if (Platform.OS === 'android') {
            setShowDatePicker(false);
        }
    };

    const handleCalendarPress = () => {
        setShowDatePicker(true);
    };

    const getFilteredMatches = () => {
        if (!Array.isArray(match) || match.length === 0) return [];

        switch (activeFilter) {
            case "live":
                return match.filter(m => m.isLive);

            case "upcoming":
                return match.filter(m => !m.isLive && !m.timeCurrentlyAt);

            case "finished":
                return match.filter(m => m.timeCurrentlyAt === "FT");

            default:
                return match; // ALL
        }


    }

    useEffect(() => {
        // console.log('Current filters', { activeFilter, date })
        if (loading) return

        const filtered = getFilteredMatches();
        setFilteredMatch(filtered);

    }, [activeFilter, date, loading, match])



    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <LoadingState message='Please wait while loading matches...'></LoadingState>
            </View>
        )
    }
    if (error) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text>Error loading matches: {error}</Text>
            </View>
        );
    }


    const onRefresh = async () => {
        setRefreshing(true);
        try {
            await refetch(); // You'll need to expose refetch from your hook
        } catch (error) {
            console.error('Refresh failed:', error);
        } finally {
            setRefreshing(false);
        }
    };

    return (
        <ScrollView
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    colors={['#10b981']} // Android
                    tintColor="#10b981"  // iOS
                />
            }
        >


            <View style={styles.container}>
                <View style={styles.buttonWrapper} >
                    {filter?.map((filter: any) => {
                        return (
                            <Pressable
                                key={filter.key}
                                onPress={() => setActiveFilter(filter.key as any)}
                                style={[
                                    styles.segment,
                                    activeFilter === filter.key && styles.activeSegment
                                ]}
                            >
                                <Text style={[
                                    styles.segmentText,
                                    activeFilter === filter.key && styles.activeSegmentText
                                ]}>
                                    {filter.label}
                                </Text>
                            </Pressable>
                        )
                    })}
                </View>

                <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', flex: 1, }}>
                    <Pressable style={styles.calendarWrapper} onPress={handleCalendarPress}>
                        <FontAwesome5 name="calendar-alt" size={24} color="black" />
                        <Text>{formatDate(date)}</Text>
                    </Pressable>
                </View>

                {showDatePicker && (
                    Platform.OS === 'ios' ? (
                        <Modal transparent={true} animationType="slide">
                            <View style={styles.modalOverlay}>
                                <View style={styles.modalContent}>
                                    <DateTimePicker
                                        value={date}
                                        mode="date"
                                        display="spinner"
                                        onChange={onDateChange}
                                    />
                                    <Pressable
                                        style={styles.doneButton}
                                        onPress={() => setShowDatePicker(false)}
                                    >
                                        <Text style={{ color: '#10b981', fontWeight: '600' }}>Done</Text>
                                    </Pressable>
                                </View>
                            </View>
                        </Modal>
                    ) : (
                        <DateTimePicker
                            value={date}
                            mode="date"
                            display="default"
                            onChange={onDateChange}
                        />
                    )
                )}


                {filteredMatch.length > 0 ?
                    filteredMatch?.map((item: MatchCardType, index: number) => {
                        return (
                            <View key={index}>
                                <MatchCard match={item} />
                            </View>
                        )
                    }) :
                    <View style={{ alignItems: 'center', marginTop: 50 }}>
                        <Text>No {activeFilter} matches</Text>
                    </View>
                }

            </View>
        </ScrollView>
    );
}

export default MatchesScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9fafb',
        padding: 10,
        paddingHorizontal: 20
    },
    buttonWrapper: {
        display: 'flex',
        flexDirection: 'row',
        marginBottom: 10,
        // backgroundColor: 'red'
    },
    segmentedControl: {
        flexDirection: 'row',
        backgroundColor: '#f3f4f6',
        borderRadius: 25,
        padding: 4,
        gap: 4,
    },
    segment: {
        flex: 1,
        paddingVertical: 13,
        paddingHorizontal: 7,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    activeSegment: {
        backgroundColor: '#10b981',
        shadowColor: '#10b981',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    segmentText: {
        fontSize: 13,
        fontWeight: '500',
        color: '#6b7280',
    },
    activeSegmentText: {
        color: '#ffffff',
        fontWeight: '600',
    },
    calendarWrapper: {
        alignItems: 'center',
        justifyContent: 'center',
        display: 'flex',
        flexDirection: 'row',
        marginVertical: 10,
        marginBottom: 20,
        gap: 5,
        borderWidth: 1,
        borderRadius: 10,
        alignSelf: 'flex-start',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderColor: '#e2e8f0',
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        backgroundColor: 'white',
        borderTopLeftRadius: 15,
        borderTopRightRadius: 15,
        paddingBottom: 50,
    },
    doneButton: {
        alignSelf: 'center',
        marginTop: 10,
    },
});

