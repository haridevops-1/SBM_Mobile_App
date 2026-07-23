import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";
import {
  Menu,
  ArrowLeft,
  Edit2,
  Trash2,
  RefreshCw,
} from "lucide-react-native";
import AdminSidebar from "../../components/Admin/AdminSidebar";
import AdminReadOnlyModal from "../../components/Admin/AdminReadOnlyModal";
import AdminDeleteModal from "../../components/Admin/AdminDeleteModal";
import styles from "../../styles/pages/Admin/AdminDailyLogsManagement.styles";

export const AdminDailyLogsManagement = ({
  activeModule = "daily_logs_management",
  onNavigateBack,
  onNavigateModule,
  onSignOut,
  adminName = "Super Admin",
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dataList, setDataList] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);

  // Modal States
  const [readOnlyItem, setReadOnlyItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);

  const DAILY_LOGS_API_ENDPOINT = "https://sbm-mobile-app-906714478.development.catalystserverless.com/daily-logs";

  const safeAnimate = () => {
    try {
      if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental && !global.nativeFabricUIManager) {
        UIManager.setLayoutAnimationEnabledExperimental(true);
      }
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    } catch (e) {}
  };

  // ──────────────────────────────────────────────────────────
  // 1. GET METHOD: Fetch all Daily Logs from Catalyst DataStore API
  // ──────────────────────────────────────────────────────────
  const fetchData = async () => {
    setLoading(true);
    setSelectedRecord(null);
    try {
      const res = await fetch(DAILY_LOGS_API_ENDPOINT, { method: "GET" });
      const json = await res.json();

      if (res.ok && (json.data || json.logs)) {
        let items = json.data || json.logs || [];
        if (items.length > 0) {
          const formatted = items.map((item, index) => {
            const rowId = item.ROWID || item.id || `LOG_${index + 1}`;
            const userId = item.User_ID || item.user_id || "56022000000030005";
            return {
              id: rowId,
              ROWID: rowId,
              User_ID: userId,
              user_id: userId,
              log_date: item.log_date || "2026-07-23",
              effort_score: item.effort_score !== null && item.effort_score !== undefined ? String(item.effort_score) : "N/A",
              nutrition_score: item.nutrition_score !== null && item.nutrition_score !== undefined ? String(item.nutrition_score) : "N/A",
              movement_score: item.movement_score !== null && item.movement_score !== undefined ? String(item.movement_score) : "N/A",
              recovery_score: item.recovery_score !== null && item.recovery_score !== undefined ? String(item.recovery_score) : "N/A",
              streak_count: item.streak_count !== null && item.streak_count !== undefined ? String(item.streak_count) : "0",
              CREATEDTIME: item.CREATEDTIME || "2026-07-23 12:00:00",
              MODIFIEDTIME: item.MODIFIEDTIME || "2026-07-23 12:00:00",
              raw: item,
            };
          });
          safeAnimate();
          setDataList(formatted);
          setLoading(false);
          return;
        }
      }
    } catch (e) {
      console.warn("Daily Logs GET API notice:", e);
    }

    // Default fallback if network offline
    setDataList([]);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [activeModule]);

  // ──────────────────────────────────────────────────────────
  // 2. DELETE METHOD: Delete Daily Log row from Catalyst DataStore & UI
  // ──────────────────────────────────────────────────────────
  const handleConfirmDelete = async (itemToDelete) => {
    safeAnimate();
    const targetId = itemToDelete.ROWID || itemToDelete.id;
    try {
      const res = await fetch(`${DAILY_LOGS_API_ENDPOINT}?id=${targetId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ROWID: targetId, id: targetId }),
      });

      const json = await res.json();
      if (res.ok && json.status === "success") {
        setDataList((prev) => prev.filter((row) => row.id !== targetId && row.ROWID !== targetId));
      } else {
        setDataList((prev) => prev.filter((row) => row.id !== targetId && row.ROWID !== targetId));
      }
    } catch (err) {
      console.warn("DELETE Daily Log API error:", err);
      setDataList((prev) => prev.filter((row) => row.id !== targetId && row.ROWID !== targetId));
    } finally {
      if (selectedRecord && (selectedRecord.id === targetId || selectedRecord.ROWID === targetId)) {
        setSelectedRecord(null);
      }
      setDeleteItem(null);
    }
  };

  const handleSelectRecord = (record) => {
    safeAnimate();
    setSelectedRecord(record);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#060813" />

      {/* Admin Sidebar Navigation Drawer */}
      <AdminSidebar
        visible={sidebarOpen}
        activeModule={activeModule}
        onSelectModule={onNavigateModule}
        onClose={() => setSidebarOpen(false)}
        onSignOut={onSignOut}
        adminName={adminName}
      />

      {/* Modals */}
      <AdminReadOnlyModal
        visible={!!readOnlyItem}
        item={readOnlyItem}
        onClose={() => setReadOnlyItem(null)}
        title="View Log Details (Read Only)"
      />
      <AdminDeleteModal
        visible={!!deleteItem}
        item={deleteItem}
        onConfirm={handleConfirmDelete}
        onClose={() => setDeleteItem(null)}
      />

      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => {
              safeAnimate();
              if (selectedRecord) setSelectedRecord(null);
              else setSidebarOpen(true);
            }}
          >
            {selectedRecord ? (
              <ArrowLeft size={20} color="#FFFFFF" />
            ) : (
              <Menu size={20} color="#FFFFFF" />
            )}
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {selectedRecord ? "LOG DETAILS" : "DAILY LOGS MANAGEMENT"}
          </Text>
        </View>

        <TouchableOpacity style={styles.iconBtn} onPress={fetchData}>
          <RefreshCw size={16} color="#B085F5" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={{ padding: 40, alignItems: "center" }}>
            <ActivityIndicator size="large" color="#B085F5" />
          </View>
        ) : selectedRecord ? (
          /* ─── VERTICAL DETAILED VIEW ─── */
          <View style={styles.detailCard}>
            <View style={styles.detailHeader}>
              <Text style={styles.detailTitle} numberOfLines={1} ellipsizeMode="tail">
                USER ID: #{String(selectedRecord.User_ID || selectedRecord.id).slice(-6)}
              </Text>

              {/* Action Buttons Top Right: EDIT (blue/read-only view) & DELETE (red) */}
              <View style={styles.detailActionRow}>
                <TouchableOpacity
                  style={styles.detailEditBtn}
                  activeOpacity={0.8}
                  onPress={() => setReadOnlyItem(selectedRecord)}
                >
                  <Edit2 size={14} color="#FFFFFF" />
                  <Text style={styles.detailEditBtnText}>VIEW</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.detailDeleteBtn}
                  activeOpacity={0.8}
                  onPress={() => setDeleteItem(selectedRecord)}
                >
                  <Trash2 size={14} color="#FFFFFF" />
                  <Text style={styles.detailDeleteBtnText}>DELETE</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Vertical Field Breakdown */}
            <View style={styles.detailFieldGroup}>
              <Text style={styles.detailFieldLabel}>Row ID</Text>
              <Text style={styles.detailFieldValue}>{selectedRecord.ROWID || selectedRecord.id}</Text>
            </View>

            <View style={styles.detailFieldGroup}>
              <Text style={styles.detailFieldLabel}>User ID</Text>
              <Text style={styles.detailFieldValue}>{selectedRecord.User_ID}</Text>
            </View>

            <View style={styles.detailFieldGroup}>
              <Text style={styles.detailFieldLabel}>Log Date</Text>
              <Text style={styles.detailFieldValue}>{selectedRecord.log_date}</Text>
            </View>

            <View style={styles.detailFieldGroup}>
              <Text style={styles.detailFieldLabel}>Effort Score</Text>
              <Text style={[styles.detailFieldValue, { color: "#00E676" }]}>
                {selectedRecord.effort_score}
              </Text>
            </View>

            <View style={styles.detailFieldGroup}>
              <Text style={styles.detailFieldLabel}>Nutrition Score</Text>
              <Text style={styles.detailFieldValue}>{selectedRecord.nutrition_score}</Text>
            </View>

            <View style={styles.detailFieldGroup}>
              <Text style={styles.detailFieldLabel}>Movement Score</Text>
              <Text style={styles.detailFieldValue}>{selectedRecord.movement_score}</Text>
            </View>

            <View style={styles.detailFieldGroup}>
              <Text style={styles.detailFieldLabel}>Recovery Score</Text>
              <Text style={styles.detailFieldValue}>{selectedRecord.recovery_score}</Text>
            </View>

            <View style={styles.detailFieldGroup}>
              <Text style={styles.detailFieldLabel}>Streak Count</Text>
              <Text style={[styles.detailFieldValue, { color: "#29B6F6" }]}>
                {selectedRecord.streak_count} Days
              </Text>
            </View>

            {selectedRecord.CREATEDTIME && (
              <View style={styles.detailFieldGroup}>
                <Text style={styles.detailFieldLabel}>Created Time</Text>
                <Text style={styles.detailFieldValue}>{selectedRecord.CREATEDTIME}</Text>
              </View>
            )}

            {selectedRecord.MODIFIEDTIME && (
              <View style={styles.detailFieldGroup}>
                <Text style={styles.detailFieldLabel}>Last Modified Time</Text>
                <Text style={styles.detailFieldValue}>{selectedRecord.MODIFIEDTIME}</Text>
              </View>
            )}
          </View>
        ) : (
          /* ─── DATA LISTING TABLE VIEW (USER ID | LOG DATE | ACTIONS) ─── */
          <View style={styles.tableCard}>
            {/* Table Header Row */}
            <View style={styles.tableHeaderRow}>
              <Text style={[styles.tableHeaderCell, styles.colUserId]}>USER ID</Text>
              <Text style={[styles.tableHeaderCell, styles.colLogDate]}>LOG DATE</Text>
              <Text style={[styles.tableHeaderCell, styles.colActions, { textAlign: "right" }]}>
                ACTIONS
              </Text>
            </View>

            {/* Table Rows */}
            {dataList.map((row, idx) => (
              <TouchableOpacity
                key={row.id}
                activeOpacity={0.7}
                style={[styles.tableRow, idx % 2 === 1 && styles.tableRowEven]}
                onPress={() => handleSelectRecord(row)}
              >
                <Text style={[styles.cellText, styles.colUserId]} numberOfLines={1}>
                  {String(row.User_ID || row.id).slice(-6)}
                </Text>
                <Text style={[styles.cellText, styles.colLogDate]} numberOfLines={1}>
                  {row.log_date}
                </Text>

                <View style={styles.colActions}>
                  <TouchableOpacity
                    style={styles.actionEditBtn}
                    onPress={(e) => {
                      e.stopPropagation();
                      setReadOnlyItem(row);
                    }}
                  >
                    <Edit2 size={14} color="#29B6F6" />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.actionDeleteBtn}
                    onPress={(e) => {
                      e.stopPropagation();
                      setDeleteItem(row);
                    }}
                  >
                    <Trash2 size={14} color="#FF5252" />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default AdminDailyLogsManagement;
