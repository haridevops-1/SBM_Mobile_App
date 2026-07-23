import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
} from "react-native";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Quote,
  Activity,
  LogOut,
  X,
} from "lucide-react-native";
import styles from "../../styles/pages/Admin/AdminSidebar.styles";

export const ADMIN_MODULES = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "user_management", label: "User Management", icon: Users },
  { id: "resources", label: "Resource Management", icon: BookOpen },
  { id: "quotes_management", label: "Quotes Management", icon: Quote },
  { id: "daily_logs_management", label: "Daily Logs Management", icon: Activity },
];

export const AdminSidebar = ({
  visible,
  activeModule,
  onSelectModule,
  onClose,
  onSignOut,
  adminName = "Super Admin",
}) => {
  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={onClose} />
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.avatarRing}>
              <Text style={styles.avatarText}>{adminName.charAt(0).toUpperCase()}</Text>
            </View>
            <View style={styles.adminInfo}>
              <Text style={styles.adminName}>{adminName}</Text>
              <Text style={styles.adminRole}>Super Admin Portal</Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <X size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Module Links */}
          <ScrollView style={styles.moduleList} showsVerticalScrollIndicator={false}>
            <Text style={styles.sectionHeader}>CORE MODULES</Text>
            {ADMIN_MODULES.map((item) => {
              const IconComp = item.icon;
              const isActive =
                activeModule === item.id ||
                (item.id === "user_management" && (activeModule === "users" || activeModule === "user_management")) ||
                (item.id === "quotes_management" && (activeModule === "quotes" || activeModule === "quotes_management" || activeModule === "DailyMessages")) ||
                (item.id === "daily_logs_management" && (activeModule === "daily_logs" || activeModule === "daily_logs_management"));

              return (
                <TouchableOpacity
                  key={item.id}
                  activeOpacity={0.7}
                  style={[styles.moduleItem, isActive && styles.moduleItemActive]}
                  onPress={() => {
                    onSelectModule(item.id);
                    onClose();
                  }}
                >
                  <IconComp
                    size={16}
                    color={isActive ? "#FFFFFF" : "rgba(255, 255, 255, 0.5)"}
                  />
                  <Text style={[styles.moduleLabel, isActive && styles.moduleLabelActive]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Sign Out Button */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.signOutBtn} activeOpacity={0.8} onPress={onSignOut}>
              <LogOut size={16} color="#FF5252" />
              <Text style={styles.signOutText}>Sign Out Super Admin</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default AdminSidebar;
