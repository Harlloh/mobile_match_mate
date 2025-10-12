import LiveToast from '@/components/liveToast';
import MatchCard from '@/components/matchCard';
import { MatchCardType } from '@/types';
import { ScrollView, StyleSheet, View } from 'react-native';


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
    <View>
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

    </View>
  );
};


const styles = StyleSheet.create({
  scrollContent: {
    padding: 16,
  },
})
