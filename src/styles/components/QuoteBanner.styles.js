import { StyleSheet } from "react-native";
import theme from "../../theme/theme";

export default StyleSheet.create({
  container: {
    marginHorizontal: theme.spacing.lg,
    marginVertical: theme.spacing.sm,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
    padding: theme.spacing.md,
    overflow: "hidden",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  bannerGradient: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
  },
  starContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(123, 31, 162, 0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    borderWidth: 1,
    borderColor: "rgba(176, 133, 245, 0.15)",
  },
  quoteText: {
    flex: 1,
    color: "#ECEFF1",
    fontSize: 13,
    fontWeight: "500",
    lineHeight: 18,
  },
});
