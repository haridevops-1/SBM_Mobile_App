import { StyleSheet, Platform, Dimensions } from "react-native";

const { width } = Dimensions.get("window");
const isWebDesktop = Platform.OS === "web" && width > 768;

export default StyleSheet.create({
  appContainer: {
    flex: 1,
    backgroundColor: "#060813",
    alignSelf: isWebDesktop ? "center" : "auto",
    width: isWebDesktop ? 440 : "100%",
    maxWidth: isWebDesktop ? 440 : "100%",
    minHeight: "100%",
    borderLeftWidth: isWebDesktop ? 1 : 0,
    borderRightWidth: isWebDesktop ? 1 : 0,
    borderColor: "rgba(255, 255, 255, 0.05)",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: isWebDesktop ? 0.6 : 0,
    shadowRadius: 40,
    elevation: isWebDesktop ? 20 : 0,
  },
});
