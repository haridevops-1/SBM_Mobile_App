import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
} from "react-native";
import { X, Check } from "lucide-react-native";
import styles from "../../styles/pages/Admin/AdminModals.styles";

export const AdminEditModal = ({ visible, item, onSave, onClose }) => {
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (item) {
      setFormData({ ...item });
    }
  }, [item]);

  if (!visible || !item) return null;

  const handleChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    onSave(formData);
  };

  // Filter out internal metadata keys
  const editableKeys = Object.keys(formData).filter(
    (k) => k !== "ROWID" && k !== "CREATORID" && k !== "MODIFIEDTIME"
  );

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Edit Record #{item.id || item.user_id || item.ROWID}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Form Scroll */}
          <ScrollView style={styles.formScroll} showsVerticalScrollIndicator={false}>
            {editableKeys.map((key) => (
              <View key={key} style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>{key.replace(/_/g, " ")}</Text>
                <TextInput
                  style={styles.input}
                  value={String(formData[key] ?? "")}
                  onChangeText={(val) => handleChange(key, val)}
                  placeholder={`Enter ${key}`}
                  placeholderTextColor="#546E7A"
                />
              </View>
            ))}
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.btnRow}>
            <TouchableOpacity style={styles.cancelBtn} activeOpacity={0.8} onPress={onClose}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveBtn} activeOpacity={0.8} onPress={handleSave}>
              <Text style={styles.saveBtnText}>Save Changes</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default AdminEditModal;
