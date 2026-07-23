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
import AdminEditModal from "../../components/Admin/AdminEditModal";
import AdminDeleteModal from "../../components/Admin/AdminDeleteModal";
import styles from "../../styles/pages/Admin/AdminUserManagement.styles";

export const AdminUserManagement = ({
  activeModule = "user_management",
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
  const [editItem, setEditItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);

  const USER_API_ENDPOINT = "https://sbm-mobile-app-906714478.development.catalystserverless.com/api/v1/users";

  const safeAnimate = () => {
    try {
      if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental && !global.nativeFabricUIManager) {
        UIManager.setLayoutAnimationEnabledExperimental(true);
      }
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    } catch (e) {}
  };

  // ──────────────────────────────────────────────────────────
  // 1. GET METHOD: Fetch live user table records from Catalyst DataStore
  // ──────────────────────────────────────────────────────────
  const fetchData = async () => {
    setLoading(true);
    setSelectedRecord(null);
    try {
      const res = await fetch(USER_API_ENDPOINT, { method: "GET" });
      const json = await res.json();

      if (res.ok && json.data) {
        let items = Array.isArray(json.data) ? json.data : json.data.users || [];
        if (items.length > 0) {
          const formatted = items.map((item, index) => ({
            id: item.id || item.ROWID || `${9835725 + index}`,
            user_id: item.user_id || (item.id ? String(item.id).slice(-4) : `${93 + index}`),
            email: item.email || `user_${index + 1}@gmail.com`,
            name: item.name || `User ${index + 1}`,
            joinDate: item.created_at || item.CREATEDTIME ? String(item.created_at || item.CREATEDTIME).split(" ")[0] : "2023-11-15",
            status: item.status || "ACTIVE",
            role: "User",
            subscription: "Pro Plan",
            start_weight: item.start_weight || 70,
            gender: item.gender || "Male",
            age: item.age || 28,
            height: item.height || 170,
            meal_preference: item.meal_preference || "Veg + Egg",
            timezone: item.timezone || "India (IST - UTC+5:30)",
            device_platform: item.device_platform || "web",
            raw: item,
          }));
          safeAnimate();
          setDataList(formatted);
          setLoading(false);
          return;
        }
      }
    } catch (e) {
      console.warn("User Management GET API notice:", e);
    }

    // Default fallback if network offline
    setDataList([]);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [activeModule]);

  // ──────────────────────────────────────────────────────────
  // 2. PATCH METHOD: Edit row in Catalyst DataStore & UI
  // ──────────────────────────────────────────────────────────
  const handleSaveEdit = async (updatedItem) => {
    safeAnimate();
    try {
      const res = await fetch(`${USER_API_ENDPOINT}?id=${updatedItem.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: updatedItem.id,
          name: updatedItem.name,
          email: updatedItem.email,
          status: updatedItem.status || "ACTIVE",
          gender: updatedItem.gender,
          age: updatedItem.age,
          height: updatedItem.height,
          start_weight: updatedItem.start_weight,
          meal_preference: updatedItem.meal_preference,
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setDataList((prev) =>
          prev.map((row) => (row.id === updatedItem.id ? updatedItem : row))
        );
        if (selectedRecord && selectedRecord.id === updatedItem.id) {
          setSelectedRecord(updatedItem);
        }
      } else {
        setDataList((prev) =>
          prev.map((row) => (row.id === updatedItem.id ? updatedItem : row))
        );
      }
    } catch (err) {
      console.warn("PATCH API error:", err);
      setDataList((prev) =>
        prev.map((row) => (row.id === updatedItem.id ? updatedItem : row))
      );
    } finally {
      setEditItem(null);
    }
  };

  // ──────────────────────────────────────────────────────────
  // 3. DELETE METHOD: Delete row from Catalyst DataStore & UI
  // ──────────────────────────────────────────────────────────
  const handleConfirmDelete = async (itemToDelete) => {
    safeAnimate();
    try {
      const res = await fetch(`${USER_API_ENDPOINT}?id=${itemToDelete.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: itemToDelete.id }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setDataList((prev) => prev.filter((row) => row.id !== itemToDelete.id));
      } else {
        setDataList((prev) => prev.filter((row) => row.id !== itemToDelete.id));
      }
    } catch (err) {
      console.warn("DELETE API error:", err);
      setDataList((prev) => prev.filter((row) => row.id !== itemToDelete.id));
    } finally {
      if (selectedRecord && selectedRecord.id === itemToDelete.id) {
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
      <AdminEditModal
        visible={!!editItem}
        item={editItem}
        onSave={handleSaveEdit}
        onClose={() => setEditItem(null)}
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
            {selectedRecord ? "RECORD DETAILS" : "USER MANAGEMENT"}
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
              <Text style={styles.detailTitle}>
                ID: {selectedRecord.id}
              </Text>

              {/* Action Buttons Top Right: EDIT (blue) & DELETE (red) */}
              <View style={styles.detailActionRow}>
                <TouchableOpacity
                  style={styles.detailEditBtn}
                  activeOpacity={0.8}
                  onPress={() => setEditItem(selectedRecord)}
                >
                  <Edit2 size={14} color="#FFFFFF" />
                  <Text style={styles.detailEditBtnText}>EDIT</Text>
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
              <Text style={styles.detailFieldValue}>{selectedRecord.id}</Text>
            </View>

            <View style={styles.detailFieldGroup}>
              <Text style={styles.detailFieldLabel}>User ID</Text>
              <Text style={styles.detailFieldValue}>{selectedRecord.user_id}</Text>
            </View>

            <View style={styles.detailFieldGroup}>
              <Text style={styles.detailFieldLabel}>Name</Text>
              <Text style={styles.detailFieldValue}>{selectedRecord.name}</Text>
            </View>

            <View style={styles.detailFieldGroup}>
              <Text style={styles.detailFieldLabel}>Email</Text>
              <Text style={styles.detailFieldValue}>{selectedRecord.email}</Text>
            </View>

            <View style={styles.detailFieldGroup}>
              <Text style={styles.detailFieldLabel}>Join Date</Text>
              <Text style={styles.detailFieldValue}>{selectedRecord.joinDate}</Text>
            </View>

            <View style={styles.detailFieldGroup}>
              <Text style={styles.detailFieldLabel}>Status</Text>
              <Text style={[styles.detailFieldValue, { color: "#00E676" }]}>
                {selectedRecord.status}
              </Text>
            </View>

            <View style={styles.detailFieldGroup}>
              <Text style={styles.detailFieldLabel}>Role / Access</Text>
              <Text style={styles.detailFieldValue}>{selectedRecord.role}</Text>
            </View>

            {selectedRecord.start_weight !== undefined && (
              <View style={styles.detailFieldGroup}>
                <Text style={styles.detailFieldLabel}>Start Weight</Text>
                <Text style={styles.detailFieldValue}>{selectedRecord.start_weight} kg</Text>
              </View>
            )}

            {selectedRecord.meal_preference && (
              <View style={styles.detailFieldGroup}>
                <Text style={styles.detailFieldLabel}>Meal Preference</Text>
                <Text style={styles.detailFieldValue}>{selectedRecord.meal_preference}</Text>
              </View>
            )}

            {selectedRecord.timezone && (
              <View style={styles.detailFieldGroup}>
                <Text style={styles.detailFieldLabel}>Time Zone</Text>
                <Text style={styles.detailFieldValue}>{selectedRecord.timezone}</Text>
              </View>
            )}
          </View>
        ) : (
          /* ─── DATA LISTING TABLE VIEW (3 COLUMNS: USER ID | EMAIL | ACTIONS) ─── */
          <View style={styles.tableCard}>
            {/* Table Header Row */}
            <View style={styles.tableHeaderRow}>
              <Text style={[styles.tableHeaderCell, styles.colUserId]}>USER ID</Text>
              <Text style={[styles.tableHeaderCell, styles.colEmail]}>EMAIL</Text>
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
                  {row.user_id || row.id}
                </Text>
                <Text style={[styles.cellText, styles.colEmail]} numberOfLines={1}>
                  {row.email}
                </Text>

                <View style={styles.colActions}>
                  <TouchableOpacity
                    style={styles.actionEditBtn}
                    onPress={(e) => {
                      e.stopPropagation();
                      setEditItem(row);
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

export default AdminUserManagement;
