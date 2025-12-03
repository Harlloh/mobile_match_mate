import { Image, StyleSheet, View } from "react-native";
import { ActivityIndicator, Text } from "react-native-paper";

export function LoadingState({ message }: { message?: string }) {
  return (
    <View
      style={style.container}
    >
      <Image
        source={require('../assets/images/match_mate_logo.jpg')}
        style={{ width: 120, height: 120, borderRadius: 12, }}
        resizeMode="contain"
      />
      <View style={{ display: 'flex', flexDirection: 'row', gap: 10 }}>

        <ActivityIndicator size={"small"} />
        <Text>{message ? message : 'Loading please wait..'}</Text>
      </View>
    </View>
  );
}

const style = StyleSheet.create({
  container: {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
    gap: 10
  }
})
