import { useState } from "react";
import { View } from "react-native";
import { Text } from "react-native-paper";

function LeaguesScreen() {
    const [leagues, setLeagues] = useState([])
    return (
        <View>
            <Text>Subscribe or Unsubscribe from leagues you want to get match update from</Text>

        </View>
    );
}

export default LeaguesScreen;