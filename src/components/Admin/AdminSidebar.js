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
  UserCheck,
  ShieldCheck,
  Scale,
  Activity,
  FileCheck,
  HelpCircle,
  ListCheck,
  Layers,
  CalendarCheck,
  MessageSquareQuote,
  Quote,
  Bell,
  BookOpen,
  LogOut,
  X,
} from "lucide-react-native";
import styles from "../../styles/pages/Admin/AdminSidebar.styles";

export const ADMIN_MODULES = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "user_management", label: "User Management", icon: Users },
  { id: "user_profiles", label: "user_profiles", icon: UserCheck },
  { id: "user_group_mapping", label: "user_group_mapping", icon: ShieldCheck },
  { id: "coaches", label: "coaches", icon: Users },
  { id: "weight_history", label: "weight_history", icon: Scale },
  { id: "daily_logs", label: "daily_logs", icon: Activity },
  { id: "user_daily_answers", label: "user_daily_answers", icon: FileCheck },
  { id: "Questions", label: "Questions", icon: HelpCircle },
  { id: "question_options", label: "question_options", icon: ListCheck },
  { id: "Phases", label: "Phases", icon: Layers },
  { id: "Sunday_Question", label: "Sunday_Question", icon: HelpCircle },
  { id: "Sunday_Question_Options", label: "Sunday_Question_Options", icon: ListCheck },
  { id: "Sunday_Answers", label: "Sunday_Answers", icon: CalendarCheck },
  { id: "DailyMessages", label: "DailyMessages", icon: Quote },
  { id: "user_message_tracking", label: "user_message_tracking", icon: MessageSquareQuote },
  { id: "support_notifications", label: "support_notifications", icon: Bell },
  { id: "Resources", label: "Resources", icon: BookOpen },
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
              const isActive = activeModule === item.id || (item.id === "user_management" && (activeModule === "users" || activeModule === "user_management"));
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
