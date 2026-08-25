import { MaterialCommunityIcons } from "@expo/vector-icons";
import { ComponentProps } from "react";
import { Pressable, StyleSheet, View, ViewStyle } from "react-native";
import { Text } from "react-native-paper";

type EmptyStateProps = {
  icon: ComponentProps<typeof MaterialCommunityIcons>["name"];
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  style?: ViewStyle;
};

export default function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  style,
}: EmptyStateProps) {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.iconRing}>
        <View style={styles.iconBackground}>
          <MaterialCommunityIcons name={icon} size={34} color="#059669" />
        </View>
      </View>

      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>

      {actionLabel && onAction && (
        <Pressable
          accessibilityRole="button"
          onPress={onAction}
          style={({ pressed }) => [
            styles.action,
            pressed && styles.actionPressed,
          ]}
        >
          <Text style={styles.actionText}>{actionLabel}</Text>
          <MaterialCommunityIcons name="arrow-right" size={18} color="#fff" />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
    paddingVertical: 42,
  },
  iconRing: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#d1fae5",
    marginBottom: 22,
  },
  iconBackground: {
    width: 66,
    height: 66,
    borderRadius: 33,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ecfdf5",
    borderWidth: 1,
    borderColor: "#a7f3d0",
  },
  title: {
    color: "#0f172a",
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 8,
  },
  description: {
    color: "#64748b",
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
    maxWidth: 320,
  },
  action: {
    marginTop: 24,
    minHeight: 46,
    paddingHorizontal: 20,
    borderRadius: 14,
    backgroundColor: "#10b981",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: "#059669",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  actionPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  actionText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
});
