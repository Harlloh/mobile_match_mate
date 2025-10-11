import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";

function LiveToast() {
    const liveMatch = 2
    return (
        <View style={styles.wrapper}
        >
            <Text style={styles.toastText}>{liveMatch} {liveMatch > 1 ? 'Matches' : 'Match'} happening right now</Text>
        </View>);
}

export default LiveToast;


const styles = StyleSheet.create({
    wrapper: {
        backgroundColor: '#e1f4ef',
        padding: 10,
        paddingVertical: 15,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: 'rgb(16 185 129)',
        flex: 1,
        marginVertical: 20
    },
    toastText: {
        color: 'rgb(16 185 129)'
    }
})