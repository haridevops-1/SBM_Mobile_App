import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
} from "react-native";
import { X } from "lucide-react-native";
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

  // Filter out internal metadata, raw objects, and duplicate field aliases
  const getCleanEditableKeys = () => {
    const rawKeys = Object.keys(formData);
    const ignoredKeys = new Set([
      "raw",
      "ROWID",
      "id",
      "CREATORID",
      "MODIFIEDTIME",
      "CREATEDTIME",
      "createdDate",
      "options",
      "aspects",
      "questions",
      "isOption",
    ]);

    // Map of lowercase variants to canonical keys to prevent showing duplicate fields
    const canonicalMap = new Map();

    rawKeys.forEach((key) => {
      if (ignoredKeys.has(key)) return;

      const lower = key.toLowerCase().replace(/_/g, "");

      // If we already saw a key with the same normalized name, prefer PascalCase / snake_case over camelCase
      if (canonicalMap.has(lower)) {
        const existing = canonicalMap.get(lower);
        // Prefer key with uppercase or underscore
        if ((key.includes("_") || key[0] === key[0].toUpperCase()) && !existing.includes("_")) {
          canonicalMap.set(lower, key);
        }
      } else {
        canonicalMap.set(lower, key);
      }
    });

    return Array.from(canonicalMap.values());
  };

  const editableKeys = getCleanEditableKeys();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>
              Edit Record #{item.ROWID || item.id || item.user_id || ""}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Form Scroll */}
          <ScrollView style={styles.formScroll} showsVerticalScrollIndicator={false}>
            {editableKeys.map((key) => {
              const label = key
                .replace(/_/g, " ")
                .replace(/([A-Z])/g, " $1")
                .trim()
                .toUpperCase();

              return (
                <View key={key} style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>{label}</Text>
                  <TextInput
                    style={styles.input}
                    value={String(formData[key] ?? "")}
                    onChangeText={(val) => handleChange(key, val)}
                    placeholder={`Enter ${label}`}
                    placeholderTextColor="#546E7A"
                    multiline={key.toLowerCase().includes("desc") || key.toLowerCase().includes("quote") || key.toLowerCase().includes("text")}
                  />
                </View>
              );
            })}
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
