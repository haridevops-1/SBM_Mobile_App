import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
} from "react-native";
import { X, Lock } from "lucide-react-native";
import styles from "../../styles/pages/Admin/AdminModals.styles";

export const AdminReadOnlyModal = ({ visible, item, onClose, title = "View Log Details (Read Only)" }) => {
  if (!visible || !item) return null;

  // Filter out internal metadata keys or format keys
  const displayKeys = Object.keys(item).filter(
    (k) => k !== "raw" && k !== "id" && k !== "ROWID" && k !== "CREATORID" && k !== "MODIFIEDTIME"
  );

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.header}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, flex: 1 }}>
              <Lock size={18} color="#29B6F6" />
              <Text style={styles.headerTitle}>{title}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Read Only Notice */}
          <View style={{ backgroundColor: "rgba(41, 182, 246, 0.12)", borderWidth: 1, borderColor: "rgba(41, 182, 246, 0.3)", borderRadius: 10, padding: 12, marginBottom: 14 }}>
            <Text style={{ fontSize: 11, color: "#81D4FA", lineHeight: 16, fontWeight: "600" }}>
              Notice: Daily logs are submitted directly by users and are locked from administrative editing. All fields below are read-only.
            </Text>
          </View>

          {/* Form Scroll (Disabled Fields) */}
          <ScrollView style={styles.formScroll} showsVerticalScrollIndicator={false}>
            {displayKeys.map((key) => (
              <View key={key} style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>{key.replace(/_/g, " ").toUpperCase()}</Text>
                <TextInput
                  style={[styles.input, { opacity: 0.6, backgroundColor: "rgba(255, 255, 255, 0.04)", color: "#B0BEC5" }]}
                  value={String(item[key] ?? "N/A")}
                  editable={false}
                />
              </View>
            ))}
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.btnRow}>
            <TouchableOpacity style={[styles.cancelBtn, { flex: 1, alignItems: "center" }]} activeOpacity={0.8} onPress={onClose}>
              <Text style={styles.cancelBtnText}>Close View</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default AdminReadOnlyModal;
