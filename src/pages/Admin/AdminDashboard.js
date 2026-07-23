import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from "react-native";
import {
  Menu,
  Bell,
  Users,
  Activity,
  CheckCircle2,
  ChevronRight,
  LayoutDashboard,
  ShieldCheck,
  CalendarCheck,
  TrendingUp,
} from "lucide-react-native";
import AdminSidebar, { ADMIN_MODULES } from "../../components/Admin/AdminSidebar";
import styles from "../../styles/pages/Admin/AdminDashboard.styles";

export const AdminDashboard = ({
  onNavigateModule,
  onSignOut,
  userCount = 125,
  adminName = "Super Admin",
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeModule, setActiveModule] = useState("dashboard");

  const handleSelectModule = (modId) => {
    setActiveModule(modId);
    if (modId !== "dashboard" && onNavigateModule) {
      onNavigateModule(modId);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#060813" />

      {/* Admin Sidebar Navigation Drawer */}
      <AdminSidebar
        visible={sidebarOpen}
        activeModule={activeModule}
        onSelectModule={handleSelectModule}
        onClose={() => setSidebarOpen(false)}
        onSignOut={onSignOut}
        adminName={adminName}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Top Header Row with Hamburger (≡) Button */}
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.hamburgerBtn}
              onPress={() => setSidebarOpen(true)}
            >
              <Menu size={22} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>ADMIN DASHBOARD</Text>
          </View>

          <TouchableOpacity style={styles.notificationBtn} activeOpacity={0.8}>
            <Bell size={20} color="#FFFFFF" />
            <View style={styles.notificationBadge} />
          </TouchableOpacity>
        </View>

        {/* Overview Banner */}
        <View style={styles.overviewBanner}>
          <View style={{ flex: 1 }}>
            <Text style={styles.bannerTitle}>Slow Burn Method</Text>
            <Text style={styles.bannerSubtitle}>Real-Time Business & System Management</Text>
          </View>
          <View style={styles.bannerIcon}>
            <LayoutDashboard size={24} color="#B085F5" />
          </View>
        </View>

        {/* Real Business Stats Grid */}
        <View style={styles.statsGrid}>
          {/* Total Registered Users */}
          <View style={styles.statCard}>
            <View style={styles.statCardHeader}>
              <Text style={styles.statLabel}>Total Users</Text>
              <View style={styles.statIconBox}>
                <Users size={16} color="#B085F5" />
              </View>
            </View>
            <Text style={styles.statValue}>{userCount}</Text>
          </View>

          {/* Active Cohorts */}
          <View style={styles.statCard}>
            <View style={styles.statCardHeader}>
              <Text style={styles.statLabel}>Active Cohorts</Text>
              <View style={styles.statIconBox}>
                <ShieldCheck size={16} color="#29B6F6" />
              </View>
            </View>
            <Text style={styles.statValue}>16</Text>
          </View>

          {/* Daily Effort Logs */}
          <View style={styles.statCard}>
            <View style={styles.statCardHeader}>
              <Text style={styles.statLabel}>Effort Logs</Text>
              <View style={styles.statIconBox}>
                <Activity size={16} color="#00E676" />
              </View>
            </View>
            <Text style={styles.statValue}>1,240</Text>
          </View>

          {/* Application Status */}
          <View style={[styles.statCard, styles.statusOnlineCard]}>
            <View style={styles.statCardHeader}>
              <Text style={styles.statLabel}>Catalyst Engine</Text>
              <CheckCircle2 size={18} color="#00E676" />
            </View>
            <Text style={styles.statusOnlineText}>Online & Healthy</Text>
          </View>
        </View>

        {/* Business Key Performance Indicators */}
        <Text style={styles.sectionTitle}>Business Metrics</Text>
        <View style={{ gap: 10, marginBottom: 20 }}>
          <View style={styles.activityCard}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                <TrendingUp size={18} color="#B085F5" />
                <Text style={{ color: "#FFFFFF", fontWeight: "700", fontSize: 13 }}>Average Program Compliance</Text>
              </View>
              <Text style={{ color: "#00E676", fontWeight: "800", fontSize: 14 }}>84.5%</Text>
            </View>
          </View>

          <View style={styles.activityCard}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                <CalendarCheck size={18} color="#29B6F6" />
                <Text style={{ color: "#FFFFFF", fontWeight: "700", fontSize: 13 }}>Sunday Check-in Completion</Text>
              </View>
              <Text style={{ color: "#29B6F6", fontWeight: "800", fontSize: 14 }}>91.2%</Text>
            </View>
          </View>
        </View>

        {/* Management Modules Quick Access */}
        <Text style={styles.sectionTitle}>System Management Modules</Text>
        <View style={styles.modulesGrid}>
          {ADMIN_MODULES.filter((m) => m.id !== "dashboard").map((mod) => {
            const IconComp = mod.icon;
            return (
              <TouchableOpacity
                key={mod.id}
                activeOpacity={0.8}
                style={styles.moduleChip}
                onPress={() => handleSelectModule(mod.id)}
              >
                <IconComp size={14} color="#B085F5" />
                <Text style={styles.moduleChipText}>{mod.label}</Text>
                <ChevronRight size={12} color="rgba(255, 255, 255, 0.4)" />
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Recent Activity Logs */}
        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Recent Activity Logs</Text>
        <View style={styles.activityCard}>
          <View style={styles.activityItem}>
            <View style={styles.activityDot} />
            <Text style={styles.activityText}>Resources table updated with latest fitness guides</Text>
            <Text style={styles.activityTime}>Just now</Text>
          </View>
          <View style={styles.activityItem}>
            <View style={styles.activityDot} />
            <Text style={styles.activityText}>User Management table queried by Super Admin</Text>
            <Text style={styles.activityTime}>2m ago</Text>
          </View>
          <View style={styles.activityItem}>
            <View style={styles.activityDot} />
            <Text style={styles.activityText}>daily_logs table synced for 125 active users</Text>
            <Text style={styles.activityTime}>5m ago</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AdminDashboard;
