import { StyleSheet, View } from "react-native";
import { ActivityIndicator, Text } from "react-native-paper";

export function LoadingState({ message }: { message?: string }) {
  return (
    <View
      style={style.container}
    >
      <ActivityIndicator size={"small"} />
      <Text>{message ? message : 'Loading please wait..'}</Text>
    </View>
  );
}

const style = StyleSheet.create({
  container: {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10
  }
})
