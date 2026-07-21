import { StyleSheet } from "react-native";
import theme from "../../theme/theme";

export default StyleSheet.create({
  container: {
    marginHorizontal: theme.spacing.lg,
    marginVertical: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 12,
    letterSpacing: -0.3,
    textTransform: "uppercase",
  },
  grid: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  card: {
    width: "31%",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
    paddingVertical: 14,
    paddingHorizontal: 8,
    backgroundColor: "rgba(22, 28, 45, 0.7)",
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  iconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  scoreValue: {
    fontSize: 16,
    fontWeight: "855",
    color: "#FFFFFF",
    marginBottom: 2,
    textAlign: "center",
  },
  cardTitle: {
    fontSize: 9,
    color: theme.colors.textSecondary,
    fontWeight: "700",
    textAlign: "center",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
});
