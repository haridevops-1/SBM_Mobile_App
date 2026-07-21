import { StyleSheet } from "react-native";
import theme from "../../theme/theme";

export default StyleSheet.create({
  headerContainer: {
    width: "100%",
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.md,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.md,
  },
  headerProfileAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
  },
  avatarText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 14,
  },
  notificationBtn: {
    position: "relative",
    padding: 6,
  },
  notificationBadge: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "#FF4081",
    borderRadius: 6,
    width: 12,
    height: 12,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#FF4081",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  badgeText: {
    color: "white",
    fontSize: 7,
    fontWeight: "bold",
  },
  headerGreeting: {
    marginTop: theme.spacing.xs,
  },
  greetingTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  greetingSubtitle: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    fontWeight: "500",
  },
});
