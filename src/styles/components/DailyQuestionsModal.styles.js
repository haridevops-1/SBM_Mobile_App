import { StyleSheet } from "react-native";
import theme from "../../theme/theme";

export default StyleSheet.create({
  // Overlay & Modal Container
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  webModalOverlay: {
    width: "100%",
    maxWidth: 440,
    alignSelf: "center",
  },
  modalCard: {
    width: "100%",
    backgroundColor: "#0F121E",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 10,
    maxHeight: "85%",
  },

  // Header Row
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
    zIndex: 50,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#FFFFFF",
    marginRight: 10,
  },
  headerRightActions: {
    flexDirection: "row",
    alignItems: "center",
  },

  // Dropdown selector styles
  indexSelectorWrapper: {
    position: "relative",
    marginRight: 12,
    zIndex: 50,
  },
  selectorPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 14,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  selectorPillText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#FFFFFF",
    marginRight: 4,
  },
  selectorDropdownList: {
    position: "absolute",
    top: 30,
    right: 0,
    backgroundColor: "#1E243D",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
    borderRadius: 12,
    width: 60,
    maxHeight: 180,
    zIndex: 100,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  selectorOptionItem: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.05)",
  },
  selectorOptionText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#B085F5",
  },

  // Close Button
  closeBtn: {
    padding: 4,
  },

  // Question Carousel Content
  questionContainer: {
    minHeight: 180,
    justifyContent: "center",
  },
  questionText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#ECEFF1",
    lineHeight: 24,
    marginBottom: 20,
  },
  optionsStack: {
    marginBottom: 24,
  },
  optionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 2,
    borderColor: "transparent",
  },
  optionCardSelected: {
    borderColor: "#7B1FA2",
    backgroundColor: "#F3E5F5",
  },
  optionText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#263238",
    textAlign: "center",
  },
  optionTextSelected: {
    color: "#4A148C",
  },

  // Pagination Progress Dots
  paginationRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 20,
  },
  paginationDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    marginHorizontal: 3,
  },
  paginationDotActive: {
    backgroundColor: "#FFFFFF",
    width: 14,
  },

  // Navigation Control Buttons
  controlsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  controlBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 6,
  },
  btnReview: {
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  btnReviewText: {
    color: "#ECEFF1",
    fontSize: 13,
    fontWeight: "700",
  },
  btnSubmit: {
    overflow: "hidden",
  },
  gradientBtn: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  btnSubmitText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },

  // ==========================================
  // REVIEW VIEW PANEL STYLES
  // ==========================================
  reviewScrollContainer: {
    maxHeight: "58%",
    marginBottom: 20,
  },
  reviewCard: {
    backgroundColor: "rgba(123, 31, 162, 0.08)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(176, 133, 245, 0.15)",
    padding: 16,
    marginBottom: 12,
  },
  reviewQuestionText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#ECEFF1",
    lineHeight: 18,
    marginBottom: 12,
  },
  reviewOptionsStack: {
    flexDirection: "column",
  },
  reviewOptionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
  },
  reviewCheckbox: {
    width: 14,
    height: 14,
    borderRadius: 3,
    borderWidth: 1.5,
    borderColor: "#ECEFF1",
    marginRight: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  reviewCheckboxChecked: {
    borderColor: "#B085F5",
    backgroundColor: "#7B1FA2",
  },
  reviewCheckboxInner: {
    width: 6,
    height: 6,
    borderRadius: 1,
    backgroundColor: "#FFFFFF",
  },
  reviewOptionText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: "500",
    flex: 1,
  },
  reviewOptionTextChecked: {
    color: "#B085F5",
    fontWeight: "700",
  },

  // ==========================================
  // COMPLETED VIEW SPLASH STYLES
  // ==========================================
  completedCard: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 30,
  },
  checkmarkCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#4CAF50",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    shadowColor: "#4CAF50",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  completedTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  completedSubtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: "center",
    marginBottom: 24,
  },
  closeCompletedBtn: {
    width: 120,
    height: 44,
    borderRadius: 12,
    overflow: "hidden",
  },
  closeCompletedText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
});
