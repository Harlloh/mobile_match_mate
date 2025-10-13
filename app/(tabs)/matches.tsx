import MatchCard from '@/components/matchCard';
import { match } from '@/lib/utils';
import { MatchCardType } from '@/types';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";

function MatchesScreen() {
    const [activeFilter, setActiveFilter] = useState<'all' | 'live' | 'upcoming' | 'Finished'>('all');
    const [date, setDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(true);

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

    const onDateChange = (event: any, selectedDate?: Date) => {
        // setShowDatePicker(Platform.OS === 'ios');
        if (selectedDate) {
            setDate(selectedDate)
        }
    }
    return (
        <ScrollView>

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
                <View style={styles.calendarWrapper}>
                    {/* <FontAwesome5 name="calendar-alt" size={24} color="black" /> */}
                    <DateTimePicker value={date} mode="date" onChange={onDateChange} style={styles.calendar} ></DateTimePicker>
                </View>


                {
                    match?.map((item: MatchCardType, index) => {
                        return (
                            <View key={index}>
                                <MatchCard match={item} />
                            </View>
                        )
                    })
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
        marginBottom: 20
    },
    calendar: {
        backgroundColor: '#0e3e2eff',
        borderRadius: 10,
    }
});

