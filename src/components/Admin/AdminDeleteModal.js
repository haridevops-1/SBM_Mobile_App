import React from "react";
import { View, Text, TouchableOpacity, Modal } from "react-native";
import { Trash2 } from "lucide-react-native";
import styles from "../../styles/pages/Admin/AdminModals.styles";

export const AdminDeleteModal = ({ visible, item, onConfirm, onClose }) => {
  if (!visible || !item) return null;

  const displayId = item.id || item.user_id || item.ROWID || "this record";

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.deleteConfirmCard}>
          <View style={styles.deleteIconBadge}>
            <Trash2 size={24} color="#FF5252" />
          </View>
          <Text style={styles.deleteTitle}>Delete Confirmation</Text>
          <Text style={styles.deleteSubtext}>
            Are you sure you want to permanently delete record #{displayId}? This action cannot be undone.
          </Text>

          <View style={styles.btnRow}>
            <TouchableOpacity style={styles.cancelBtn} activeOpacity={0.8} onPress={onClose}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.deleteBtn} activeOpacity={0.8} onPress={() => onConfirm(item)}>
              <Text style={styles.deleteBtnText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default AdminDeleteModal;
