import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";

function ErrorScreen({ error }: { error: String }) {
    return (
        <>

            <View style={styles.errorContent}>
                <Text style={styles.errorText}>Something went wrong</Text>
                <Text style={styles.errorDetails}>{error}</Text>
                <Text style={styles.pullToRefresh}>Pull down to refresh</Text>
            </View>
        </>
    );
}

export default ErrorScreen;

const styles = StyleSheet.create({

    errorContent: {
        alignItems: 'center',
        gap: 8,
    },
    errorText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#991b1b',
    },
    errorDetails: {
        fontSize: 14,
        color: '#7f1d1d',
        textAlign: 'center',
    },

    pullToRefresh: {
        fontSize: 12,
        color: '#9ca3af',
        marginTop: 12,
    },
})