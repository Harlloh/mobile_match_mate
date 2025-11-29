import ErrorScreen from '@/components/errorScreen';
import { LoadingState } from '@/components/hello-wave';
import LiveToast from '@/components/liveToast';
import MatchCard from '@/components/matchCard';
import { useAppStore } from '@/context/useAppStore';
import { FILTERS } from '@/lib/utils';
import { useHomeMatchesFixtures } from '@/services/useMatches';
import { MatchCardType } from '@/types';
import { Link } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';



export default function HomeScreen() {
  const { subscribedLeagues } = useAppStore()
  const [activeTab, setActiveTab] = useState<"Live" | "Upcoming" | "Finished">("Live");
  const [upcomingList, setUpcomingList] = useState<MatchCardType[] | []>([]);
  const [finishedList, setFinishedList] = useState<MatchCardType[] | []>([]);
  const [liveList, setLiveList] = useState<MatchCardType[] | []>([])
  const [refreshing, setRefreshing] = useState(false)
  // const [activeList, setActiveList] = useState<MatchCardType[] | []>([])
  const today = new Date().toISOString().split('T')[0];

  const { match, loading, error, refetch } = useHomeMatchesFixtures(today)

  // const match: MatchCardType[] = useMemo<MatchCardType[]>(() =>
  //   [
  //     //finished
  //     {
  //       league: 'Premier League',
  //       leagueIcon: "https://media.api-sports.io/football/leagues/39.png",
  //       startDay: 'Today',
  //       startTime: '9:11pm',
  //       isLive: false,
  //       timeCurrentlyAt: 'FT',
  //       home: {
  //         clubIcon: "https://media.api-sports.io/football/teams/33.png",
  //         clubName: 'Chelsea',
  //         scored: 2
  //       },
  //       away: {
  //         clubIcon: "https://media.api-sports.io/football/teams/34.png",
  //         clubName: 'PSG',
  //         scored: 1
  //       },
  //       stadium: 'Old Stanford Bridge'
  //     },
  //     //upcoming
  //     {
  //       league: 'Premier League',
  //       leagueIcon: "https://media.api-sports.io/football/leagues/39.png",
  //       startDay: 'Tomorrow',
  //       startTime: '9:11pm',
  //       isLive: false,
  //       timeCurrentlyAt: null,
  //       home: {
  //         clubIcon: "https://media.api-sports.io/football/teams/33.png",
  //         clubName: 'Man U',
  //         scored: null
  //       },
  //       away: {
  //         clubIcon: "https://media.api-sports.io/football/teams/34.png",
  //         clubName: 'New Castle',
  //         scored: null
  //       },
  //       stadium: 'Emirates Stadium'
  //     },
  //     {
  //       league: 'Premier League',
  //       leagueIcon: "https://media.api-sports.io/football/leagues/39.png",
  //       startDay: 'Tomorrow',
  //       startTime: '9:11pm',
  //       isLive: true,
  //       timeCurrentlyAt: '67',
  //       home: {
  //         clubIcon: "https://media.api-sports.io/football/teams/33.png",
  //         clubName: 'Man U',
  //         scored: null
  //       },
  //       away: {
  //         clubIcon: "https://media.api-sports.io/football/teams/34.png",
  //         clubName: 'New Castle',
  //         scored: null
  //       },
  //       stadium: 'Emirates Stadium'
  //     },
  //     {
  //       league: 'Premier League',
  //       leagueIcon: "https://media.api-sports.io/football/leagues/39.png",
  //       startDay: 'Today',
  //       startTime: '9:11pm',
  //       isLive: true,
  //       timeCurrentlyAt: '67',
  //       home: {
  //         clubIcon: "https://media.api-sports.io/football/teams/33.png",
  //         clubName: 'Chelsea',
  //         scored: 2
  //       },
  //       away: {
  //         clubIcon: "https://media.api-sports.io/football/teams/34.png",
  //         clubName: 'PSG',
  //         scored: 1
  //       },
  //       stadium: 'Old Stanford Bridge'
  //     },
  //     {
  //       league: 'Premier League',
  //       leagueIcon: "https://media.api-sports.io/football/leagues/39.png",
  //       startDay: 'Today',
  //       startTime: '9:11pm',
  //       isLive: true,
  //       timeCurrentlyAt: '67',
  //       home: {
  //         clubIcon: "https://media.api-sports.io/football/teams/33.png",
  //         clubName: 'Chelsea',
  //         scored: 2
  //       },
  //       away: {
  //         clubIcon: "https://media.api-sports.io/football/teams/34.png",
  //         clubName: 'PSG',
  //         scored: 1
  //       },
  //       stadium: 'Old Stanford Bridge'
  //     },

  //   ], []
  // )

  const activeList = activeTab === 'Live' ? liveList : activeTab === 'Upcoming' ? upcomingList : finishedList



  // GET, SORT AND SET THE RESPECTIVE LISTS
  useEffect(() => {
    setLiveList(match?.filter((item) => item.isLive))
    setUpcomingList(match?.filter((item) => !item.isLive && !item.timeCurrentlyAt))
    setFinishedList(match?.filter((item) => !item.isLive && item.timeCurrentlyAt === 'FT'))
  }, [match])


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

  if (subscribedLeagues.length < 0) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Please subscribe to leagues to see matches.</Text>
      </View>
    )
  }

  if (loading || refreshing) {
    return (
      <LoadingState message='fetching matches for today...' />
    )
  }
  if (error) {
    return (
      <>
        <ScrollView
          contentContainerStyle={styles.errorContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#10b981']} // Android
              tintColor="#10b981"  // iOS
            />
          }
        >
          <ErrorScreen error={error} />
        </ScrollView>
      </>

    )
  }

  return (
    <>
      {subscribedLeagues.length > 0 ? <View>
        <View style={styles.buttonWrapper}>
          {FILTERS.map((tab, index) => (
            <Pressable
              key={index}
              onPress={() => setActiveTab(tab as any)}
              style={[styles.tabBtn, activeTab === tab && styles.activeTabBtn]}
            >
              <Text style={{ color: activeTab === tab ? "#10b981" : "#64748b" }}>
                {tab}
              </Text>
              <Text style={activeTab === tab ? styles.activeTabText : styles.deActiveTabText}>{tab === 'Live' ? liveList.length : tab === 'Upcoming' ? upcomingList.length : finishedList.length}</Text>

            </Pressable>
          ))}
        </View>


        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#10b981']} // Android
              tintColor="#10b981"  // iOS
            />
          }
        >
          {activeList.length > 0 && activeTab === 'Live' && <LiveToast liveMatch={activeList.length} />}

          <View style={styles.filterContainer}>
            {/* <Text variant='titleLarge' style={styles.filterTitle}>{activeTab === 'Live' ? 'Live Now' : activeTab === 'Upcoming' ? 'Coming Up' : 'Finished'}</Text> */}
            {
              activeList.length > 0 ? (
                activeList.map((item: MatchCardType, index) => {
                  return (
                    <View key={index}>
                      <MatchCard match={item} />
                    </View>
                  )
                })
              ) : (
                <Text>No {activeTab.toLowerCase()} matches</Text>
              )

            }
          </View>
        </ScrollView>

      </View> : (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>Please <Link style={{ color: '#10b981' }} href="/leagues">subscribe</Link> to leagues to see matches update.</Text>
        </View>
      )}
    </>
  );
};


const styles = StyleSheet.create({
  scrollContent: {
    padding: 16,
  },
  filterContainer: {
    marginBottom: 20
  },
  filterTitle: {
    fontWeight: 600,
    marginVertical: 10
  },
  buttonWrapper: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 10,
    paddingVertical: 20,
    backgroundColor: "white",
    marginHorizontal: 10,
    marginTop: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 6,
    zIndex: 5,
  },
  tabBtn: {
    backgroundColor: "#f1f5f9",
    textAlign: "center",
    padding: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 3
  },
  activeTabBtn: {
    borderBottomColor: "#10b981",
    borderBottomWidth: 1.5,
  },
  activeTabText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#047857',
    backgroundColor: '#d1fae5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    overflow: 'hidden',
  },
  deActiveTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
    backgroundColor: '#e2e8f0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    overflow: 'hidden',
  },
  errorContainer: {
    flexGrow: 1, // Changed from flex: 1
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: 'rgb(254 226 226)',
    minHeight: '100%', // Ensures full height for scrolling
  },
})
