import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import {
  Menu,
  Bell,
  Users,
  Shield,
  Activity,
  CalendarCheck,
  LayoutGrid,
  UserPlus,
  FileText,
  Send,
  RefreshCw,
} from "lucide-react-native";
import Svg, { Path, Defs, LinearGradient, Stop } from "react-native-svg";
import AdminSidebar from "../../components/Admin/AdminSidebar";
import { useUser } from "../../context/UserContext";
import styles from "../../styles/pages/Admin/AdminDashboard.styles";

// Mini Sparkline Graph Helper Component
const Sparkline = ({ color, id }) => (
  <Svg width={65} height={26} viewBox="0 0 65 26">
    <Defs>
      <LinearGradient id={`grad-${id}`} x1="0" y1="0" x2="0" y2="1">
        <Stop offset="0%" stopColor={color} stopOpacity={0.4} />
        <Stop offset="100%" stopColor={color} stopOpacity={0.0} />
      </LinearGradient>
    </Defs>
    <Path
      d="M 2 22 Q 15 18, 25 12 T 45 10 T 63 3 V 26 H 2 Z"
      fill={`url(#grad-${id})`}
    />
    <Path
      d="M 2 22 Q 15 18, 25 12 T 45 10 T 63 3"
      fill="none"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
    />
  </Svg>
);

export const AdminDashboard = ({
  onNavigateModule,
  onSignOut,
  adminName = "Super Admin",
}) => {
  const { userToken } = useUser();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeModule, setActiveModule] = useState("dashboard");
  const [loading, setLoading] = useState(false);

  // Live Metrics State
  const [metrics, setMetrics] = useState({
    totalUsers: 125,
    usersThisWeek: 12,
    activeCohorts: 16,
    cohortsThisWeek: 2,
    effortLogs: "1,240",
    logsThisWeek: 156,
    sundayCompletion: "91.2%",
    sundayImprovement: "8.5%",
  });

  const DASHBOARD_API_ENDPOINT = "https://sbm-mobile-app-906714478.development.catalystserverless.com/api/admin/dashboard";

  // ──────────────────────────────────────────────────────────
  // GET METHOD: Fetch real Admin Dashboard Metrics from Backend API
  // ──────────────────────────────────────────────────────────
  const fetchDashboardMetrics = async () => {
    setLoading(true);
    try {
      const headers = { "Content-Type": "application/json" };
      if (userToken) {
        headers["Authorization"] = `Bearer ${userToken}`;
      }

      const res = await fetch(DASHBOARD_API_ENDPOINT, {
        method: "GET",
        headers: headers,
      });

      const json = await res.json();
      if (res.ok && json.data) {
        const d = json.data;
        setMetrics((prev) => ({
          ...prev,
          totalUsers: d.totalUsers ?? d.totalUsers?.value ?? prev.totalUsers,
          usersThisWeek: d.usersThisWeek ?? prev.usersThisWeek,
          activeCohorts: d.activeCohorts ?? d.activeCohorts?.value ?? prev.activeCohorts,
          cohortsThisWeek: d.cohortsThisWeek ?? prev.cohortsThisWeek,
          effortLogs: d.effortLogs ?? d.effortLogs?.value ?? prev.effortLogs,
          logsThisWeek: d.logsThisWeek ?? prev.logsThisWeek,
          sundayCompletion: d.sundayCompletion ?? d.sundayCheckIn?.value ?? prev.sundayCompletion,
          sundayImprovement: d.sundayImprovement ?? prev.sundayImprovement,
        }));
      }
    } catch (e) {
      console.warn("Admin Dashboard GET API notice:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardMetrics();
  }, []);

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

          <View style={{ flexDirection: "row", gap: 10 }}>
            <TouchableOpacity style={styles.hamburgerBtn} onPress={fetchDashboardMetrics} activeOpacity={0.8}>
              {loading ? (
                <ActivityIndicator size="small" color="#B085F5" />
              ) : (
                <RefreshCw size={18} color="#B085F5" />
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.notificationBtn} activeOpacity={0.8}>
              <Bell size={20} color="#FFFFFF" />
              <View style={styles.notificationBadge} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Hero Banner: Slow Burn Method */}
        <View style={styles.overviewBanner}>
          <View style={{ flex: 1 }}>
            <Text style={styles.bannerTitle}>Slow Burn Method</Text>
            <Text style={styles.bannerSubtitle}>Real-Time Business & System Management</Text>
          </View>
          <View style={styles.bannerIconBox}>
            <LayoutGrid size={22} color="#B085F5" />
          </View>
        </View>

        {/* 4 Core Module Metric Cards (2x2 Grid) */}
        <View style={styles.statsGrid}>
          {/* Card 1: TOTAL USERS */}
          <TouchableOpacity
            style={styles.statCard}
            activeOpacity={0.8}
            onPress={() => handleSelectModule("user_management")}
          >
            <View style={[styles.circleIconBox, { backgroundColor: "rgba(147, 51, 234, 0.2)" }]}>
              <Users size={18} color="#B085F5" />
            </View>
            <Text style={styles.statLabel}>TOTAL USERS</Text>
            <Text style={styles.statValue}>{metrics.totalUsers}</Text>
            <View style={styles.statBottomRow}>
              <View style={styles.trendContainer}>
                <Text style={styles.trendBold}>↑ {metrics.usersThisWeek}</Text>
                <Text style={styles.trendMuted}>this week</Text>
              </View>
              <Sparkline color="#B085F5" id="users" />
            </View>
          </TouchableOpacity>

          {/* Card 2: ACTIVE COHORTS */}
          <TouchableOpacity
            style={styles.statCard}
            activeOpacity={0.8}
            onPress={() => handleSelectModule("group_code_management")}
          >
            <View style={[styles.circleIconBox, { backgroundColor: "rgba(59, 130, 246, 0.2)" }]}>
              <Shield size={18} color="#29B6F6" />
            </View>
            <Text style={styles.statLabel}>ACTIVE COHORTS</Text>
            <Text style={styles.statValue}>{metrics.activeCohorts}</Text>
            <View style={styles.statBottomRow}>
              <View style={styles.trendContainer}>
                <Text style={styles.trendBold}>↑ {metrics.cohortsThisWeek}</Text>
                <Text style={styles.trendMuted}>this week</Text>
              </View>
              <Sparkline color="#29B6F6" id="cohorts" />
            </View>
          </TouchableOpacity>

          {/* Card 3: EFFORT LOGS */}
          <TouchableOpacity
            style={styles.statCard}
            activeOpacity={0.8}
            onPress={() => handleSelectModule("daily_logs_management")}
          >
            <View style={[styles.circleIconBox, { backgroundColor: "rgba(34, 197, 94, 0.2)" }]}>
              <Activity size={18} color="#00E676" />
            </View>
            <Text style={styles.statLabel}>EFFORT LOGS</Text>
            <Text style={styles.statValue}>{metrics.effortLogs}</Text>
            <View style={styles.statBottomRow}>
              <View style={styles.trendContainer}>
                <Text style={styles.trendBold}>↑ {metrics.logsThisWeek}</Text>
                <Text style={styles.trendMuted}>this week</Text>
              </View>
              <Sparkline color="#00E676" id="logs" />
            </View>
          </TouchableOpacity>

          {/* Card 4: SUNDAY CHECK-IN */}
          <TouchableOpacity
            style={styles.statCard}
            activeOpacity={0.8}
            onPress={() => handleSelectModule("sunday_questions_management")}
          >
            <View style={[styles.circleIconBox, { backgroundColor: "rgba(249, 115, 22, 0.2)" }]}>
              <CalendarCheck size={18} color="#FF9800" />
            </View>
            <Text style={styles.statLabel} numberOfLines={1}>SUNDAY CHECK-IN</Text>
            <Text style={styles.statValue}>{metrics.sundayCompletion}</Text>
            <View style={styles.statBottomRow}>
              <View style={styles.trendContainer}>
                <Text style={styles.trendBold}>↑ {metrics.sundayImprovement}</Text>
                <Text style={styles.trendMuted}>improvement</Text>
              </View>
              <Sparkline color="#FF9800" id="sunday" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Quick Actions Row */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActionsGrid}>
          {/* Action 1: Add User */}
          <TouchableOpacity
            style={styles.actionCard}
            activeOpacity={0.8}
            onPress={() => handleSelectModule("user_management")}
          >
            <View style={[styles.actionIconBox, { backgroundColor: "rgba(147, 51, 234, 0.2)" }]}>
              <UserPlus size={18} color="#B085F5" />
            </View>
            <Text style={styles.actionLabel}>Add User</Text>
          </TouchableOpacity>

          {/* Action 2: Manage Cohorts */}
          <TouchableOpacity
            style={styles.actionCard}
            activeOpacity={0.8}
            onPress={() => handleSelectModule("group_code_management")}
          >
            <View style={[styles.actionIconBox, { backgroundColor: "rgba(59, 130, 246, 0.2)" }]}>
              <Shield size={18} color="#29B6F6" />
            </View>
            <Text style={styles.actionLabel}>Manage Cohorts</Text>
          </TouchableOpacity>

          {/* Action 3: View Logs */}
          <TouchableOpacity
            style={styles.actionCard}
            activeOpacity={0.8}
            onPress={() => handleSelectModule("daily_logs_management")}
          >
            <View style={[styles.actionIconBox, { backgroundColor: "rgba(34, 197, 94, 0.2)" }]}>
              <FileText size={18} color="#00E676" />
            </View>
            <Text style={styles.actionLabel}>View Logs</Text>
          </TouchableOpacity>

          {/* Action 4: Send Message */}
          <TouchableOpacity
            style={styles.actionCard}
            activeOpacity={0.8}
            onPress={() => handleSelectModule("quotes_management")}
          >
            <View style={[styles.actionIconBox, { backgroundColor: "rgba(249, 115, 22, 0.2)" }]}>
              <Send size={18} color="#FF9800" />
            </View>
            <Text style={styles.actionLabel}>Send Message</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AdminDashboard;
