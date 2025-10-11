import LiveToast from '@/components/liveToast';
import MatchCard from '@/components/matchCard';
import { MatchCardType } from '@/types';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';


export default function HomeScreen() {
  const match: MatchCardType[] = [
    {
      league: 'Premier League',
      leagueIcon: 'icnImg',
      startDay: 'Tomorrow',
      startTime: '9:11pm',
      isLive: false,
      timeCurrentlyAt: null,
      clubs: [
        {
          clubIcon: 'clubIcon',
          clubName: 'Liverpool',
          scored: null
        },
        {
          clubIcon: 'clubIcon',
          clubName: 'Arsenal',
          scored: null
        },
      ],
      stadium: 'Emirates Stadium'
    },
    {
      league: 'Premier League',
      leagueIcon: 'icnImg',
      startDay: 'Today',
      startTime: '9:11pm',
      isLive: true,
      timeCurrentlyAt: '67',
      clubs: [
        {
          clubIcon: 'clubIcon',
          clubName: 'Chelsea',
          scored: 2
        },
        {
          clubIcon: 'clubIcon',
          clubName: 'PSG',
          scored: 1
        },
      ],
      stadium: 'Old Stanford Bridge'
    },
  ]
  return (
    <SafeAreaView>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <LiveToast />
        {
          match?.map((item: MatchCardType, index) => {
            return (
              <View key={index}>
                <MatchCard match={item} />
              </View>
            )
          })
        }
      </ScrollView>

    </SafeAreaView>
  );
};


const styles = StyleSheet.create({
  scrollContent: {
    padding: 16,
  },
})
