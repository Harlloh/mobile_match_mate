import LiveToast from '@/components/liveToast';
import MatchCard from '@/components/matchCard';
import { MatchCardType } from '@/types';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

const RAPID_API_KEY = '31846439a34475ff70e1a7580a02ada6';
const BASE_URL = 'https://v3.football.api-sports.io/';

export default function HomeScreen() {
  const match: MatchCardType[] = [
    {
      league: 'Premier League',
      leagueIcon: "https://media.api-sports.io/football/leagues/39.png",
      startDay: 'Today',
      startTime: '9:11pm',
      isLive: false,
      timeCurrentlyAt: 'FT',
      home: {
        clubIcon: "https://media.api-sports.io/football/teams/33.png",
        clubName: 'Chelsea',
        scored: 2
      },
      away: {
        clubIcon: "https://media.api-sports.io/football/teams/34.png",
        clubName: 'PSG',
        scored: 1
      },
      stadium: 'Old Stanford Bridge'
    },
    {
      league: 'Premier League',
      leagueIcon: "https://media.api-sports.io/football/leagues/39.png",
      startDay: 'Tomorrow',
      startTime: '9:11pm',
      isLive: false,
      timeCurrentlyAt: null,
      home: {
        clubIcon: "https://media.api-sports.io/football/teams/33.png",
        clubName: 'Man U',
        scored: null
      },
      away: {
        clubIcon: "https://media.api-sports.io/football/teams/34.png",
        clubName: 'New Castle',
        scored: null
      },
      stadium: 'Emirates Stadium'
    },
    {
      league: 'Premier League',
      leagueIcon: "https://media.api-sports.io/football/leagues/39.png",
      startDay: 'Tomorrow',
      startTime: '9:11pm',
      isLive: false,
      timeCurrentlyAt: null,
      home: {
        clubIcon: "https://media.api-sports.io/football/teams/33.png",
        clubName: 'Man U',
        scored: null
      },
      away: {
        clubIcon: "https://media.api-sports.io/football/teams/34.png",
        clubName: 'New Castle',
        scored: null
      },
      stadium: 'Emirates Stadium'
    },
    {
      league: 'Premier League',
      leagueIcon: "https://media.api-sports.io/football/leagues/39.png",
      startDay: 'Today',
      startTime: '9:11pm',
      isLive: true,
      timeCurrentlyAt: '67',
      home: {
        clubIcon: "https://media.api-sports.io/football/teams/33.png",
        clubName: 'Chelsea',
        scored: 2
      },
      away: {
        clubIcon: "https://media.api-sports.io/football/teams/34.png",
        clubName: 'PSG',
        scored: 1
      },
      stadium: 'Old Stanford Bridge'
    },
    {
      league: 'Premier League',
      leagueIcon: "https://media.api-sports.io/football/leagues/39.png",
      startDay: 'Today',
      startTime: '9:11pm',
      isLive: true,
      timeCurrentlyAt: '67',
      home: {
        clubIcon: "https://media.api-sports.io/football/teams/33.png",
        clubName: 'Chelsea',
        scored: 2
      },
      away: {
        clubIcon: "https://media.api-sports.io/football/teams/34.png",
        clubName: 'PSG',
        scored: 1
      },
      stadium: 'Old Stanford Bridge'
    },

  ];

  const liveMatcheLength = match?.filter((item) => item.isLive).length
  // const fetchMatchDetails = async (): Promise<MatchCardType[]> => {
  //   try {
  //     const res = await axios.get(`${BASE_URL}`, {

  //       headers: {
  //         'X-RapidAPI-Key': RAPID_API_KEY,
  //         'X-RapidAPI-Host': 'api-football-v1.p.rapidapi.com',
  //       },
  //     })
  //     console.log(res, 'Hollaa')
  //     // Map the API response to your MatchCardType
  //     const matches: MatchCardType[] = res.data.response.map((match: any) => ({
  //       id: match.fixture.id.toString(),
  //       homeTeam: match.teams.home.name,
  //       awayTeam: match.teams.away.name,
  //       homeTeamLogo: match.teams.home.logo,
  //       awayTeamLogo: match.teams.away.logo,
  //       date: new Date(match.fixture.date).toLocaleDateString(),
  //       time: new Date(match.fixture.date).toLocaleTimeString('en-US', {
  //         hour: '2-digit',
  //         minute: '2-digit',
  //       }),
  //       competition: match.league.name,
  //       competitionLogo: match.league.logo,
  //       homeScore: match.goals.home ?? 0,
  //       awayScore: match.goals.away ?? 0,
  //       status: match.fixture.status.short, // 'NS', 'LIVE', 'FT', etc.
  //     }));

  //     return matches;
  //   } catch (error) {
  //     console.error('Something went wrong', error)
  //     throw error
  //   }

  // }
  // useEffect(() => {
  //   const matche = fetchMatchDetails()
  //   // console.log(matche, 'HEYYYYYYYYYYYY')
  // }, [])
  return (
    <View>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {liveMatcheLength > 0 && <LiveToast liveMatch={liveMatcheLength} />}

        <View style={styles.filterContainer}>
          <Text variant='titleLarge' style={styles.filterTitle}>Live Now</Text>
          {
            liveMatcheLength ? (
              match?.filter((item) => item.isLive).map((item: MatchCardType, index) => {
                return (
                  <View key={index}>
                    <MatchCard match={item} />
                  </View>
                )
              })
            ) : (
              <Text>No live matches</Text>
            )

          }
        </View>
        <View style={styles.filterContainer}>
          <Text variant='titleLarge' style={styles.filterTitle}>Coming Up</Text>
          {
            match?.filter((item) => !item.isLive && !item.timeCurrentlyAt).map((item: MatchCardType, index) => {
              return (
                <View key={index}>
                  <MatchCard match={item} />
                </View>
              )
            })
          }
        </View>

        <View style={styles.filterContainer}>
          <Text variant='titleLarge' style={styles.filterTitle}>Finished</Text>
          {
            match?.filter((item) => !item.isLive && item.timeCurrentlyAt === 'FT').map((item: MatchCardType, index) => {
              return (
                <View key={index}>
                  <MatchCard match={item} />
                </View>
              )
            })
          }
        </View>
      </ScrollView>

    </View>
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
  }
})
