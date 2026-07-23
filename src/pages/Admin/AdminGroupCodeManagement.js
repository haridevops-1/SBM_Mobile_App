import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  LayoutAnimation,
  Platform,
  UIManager,
  Modal,
} from "react-native";
import {
  Menu,
  ArrowLeft,
  Edit2,
  Trash2,
  RefreshCw,
  Plus,
  X,
  QrCode,
} from "lucide-react-native";
import AdminSidebar from "../../components/Admin/AdminSidebar";
import AdminEditModal from "../../components/Admin/AdminEditModal";
import AdminDeleteModal from "../../components/Admin/AdminDeleteModal";
import styles from "../../styles/pages/Admin/AdminGroupCodeManagement.styles";
import modalStyles from "../../styles/pages/Admin/AdminModals.styles";

export const AdminGroupCodeManagement = ({
  activeModule = "group_code_management",
  onNavigateBack,
  onNavigateModule,
  onSignOut,
  adminName = "Super Admin",
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dataList, setDataList] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);

  // Modals
  const [editItem, setEditItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);

  // Add Group Code Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newGroupCode, setNewGroupCode] = useState("");
  const [newAgeCohort, setNewAgeCohort] = useState("Under 55");

  const GROUP_CODE_API_ENDPOINT = "https://sbm-mobile-app-906714478.development.catalystserverless.com/user-group-mapping";

  const safeAnimate = () => {
    try {
      if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental && !global.nativeFabricUIManager) {
        UIManager.setLayoutAnimationEnabledExperimental(true);
      }
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    } catch (e) {}
  };

  // ──────────────────────────────────────────────────────────
  // 1. GET METHOD: Fetch all Group Code mappings from Catalyst DataStore API
  // ──────────────────────────────────────────────────────────
  const fetchData = async () => {
    setLoading(true);
    setSelectedRecord(null);
    try {
      const res = await fetch(GROUP_CODE_API_ENDPOINT, { method: "GET" });
      const json = await res.json();

      if (res.ok && (json.data || json.mappings)) {
        let items = json.data || json.mappings || [];
        if (items.length > 0) {
          const formatted = items.map((item, index) => {
            const rowId = item.ROWID || item.id || `GRP_${index + 1}`;
            return {
              ROWID: rowId,
              group_code: item.group_code || item.Group_Code || "VG1U55",
              age_cohort: item.age_cohort || item.Age_Cohort || "Under 55",
              user_id: item.user_id || "Unassigned",
              coach_id: item.coach_id || "56022000000032002",
              CREATEDTIME: item.CREATEDTIME || "2026-07-23 12:00:00",
            };
          });
          safeAnimate();
          setDataList(formatted);
          setLoading(false);
          return;
        }
      }
    } catch (e) {
      console.warn("Group Code Management GET API notice:", e);
    }

    setDataList([]);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [activeModule]);

  // ──────────────────────────────────────────────────────────
  // 2. PUT / PATCH METHOD: Edit Group Code row in Catalyst DataStore & UI
  // ──────────────────────────────────────────────────────────
  const handleSaveEdit = async (updatedItem) => {
    safeAnimate();
    const targetId = updatedItem.ROWID || updatedItem.id;
    try {
      await fetch(`${GROUP_CODE_API_ENDPOINT}?id=${targetId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ROWID: targetId,
          row_id: targetId,
          group_code: updatedItem.group_code,
          age_cohort: updatedItem.age_cohort,
          user_id: updatedItem.user_id,
          coach_id: updatedItem.coach_id,
        }),
      });

      setDataList((prev) =>
        prev.map((row) => (row.ROWID === targetId ? { ...row, ...updatedItem } : row))
      );
      if (selectedRecord && selectedRecord.ROWID === targetId) {
        setSelectedRecord({ ...selectedRecord, ...updatedItem });
      }
    } catch (err) {
      console.warn("PATCH Group Code API error:", err);
      setDataList((prev) =>
        prev.map((row) => (row.ROWID === targetId ? { ...row, ...updatedItem } : row))
      );
    } finally {
      setEditItem(null);
    }
  };

  // ──────────────────────────────────────────────────────────
  // 3. DELETE METHOD: Delete Group Code row from Catalyst DataStore & UI
  // ──────────────────────────────────────────────────────────
  const handleConfirmDelete = async (itemToDelete) => {
    safeAnimate();
    const targetId = itemToDelete.ROWID || itemToDelete.id;
    try {
      await fetch(`${GROUP_CODE_API_ENDPOINT}?id=${targetId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ROWID: targetId, row_id: targetId }),
      });

      setDataList((prev) => prev.filter((row) => row.ROWID !== targetId));
    } catch (err) {
      console.warn("DELETE Group Code API error:", err);
      setDataList((prev) => prev.filter((row) => row.ROWID !== targetId));
    } finally {
      if (selectedRecord && selectedRecord.ROWID === targetId) {
        setSelectedRecord(null);
      }
      setDeleteItem(null);
    }
  };

  // ──────────────────────────────────────────────────────────
  // 4. POST METHOD: Create New Group Code Mapping
  // ──────────────────────────────────────────────────────────
  const handleCreateMapping = async () => {
    if (!newGroupCode.trim()) return;
    safeAnimate();
    const tempId = `5602200000004${Date.now().toString().slice(-4)}`;
    const newRecordObj = {
      ROWID: tempId,
      group_code: newGroupCode.trim().toUpperCase(),
      age_cohort: newAgeCohort.trim() || "Under 55",
      user_id: "Unassigned",
      coach_id: "56022000000032002",
      CREATEDTIME: new Date().toISOString().replace("T", " ").substring(0, 19),
    };

    setDataList((prev) => [newRecordObj, ...prev]);
    setShowAddModal(false);
    setNewGroupCode("");

    try {
      await fetch(GROUP_CODE_API_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          group_code: newGroupCode.trim().toUpperCase(),
          age_cohort: newAgeCohort.trim() || "Under 55",
          coach_id: "56022000000032002",
        }),
      });
    } catch (e) {
      console.warn("Create Group Code API notice:", e);
    }
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

      {/* Add New Group Code Modal */}
      <Modal visible={showAddModal} transparent animationType="fade" onRequestClose={() => setShowAddModal(false)}>
        <View style={modalStyles.overlay}>
          <View style={modalStyles.modalCard}>
            <View style={modalStyles.header}>
              <Text style={modalStyles.headerTitle}>Add New Group Code Mapping</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)} style={modalStyles.closeBtn}>
                <X size={18} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            <View style={modalStyles.formScroll}>
              <View style={modalStyles.fieldGroup}>
                <Text style={modalStyles.fieldLabel}>Group Code</Text>
                <TextInput
                  style={modalStyles.input}
                  value={newGroupCode}
                  onChangeText={setNewGroupCode}
                  placeholder="e.g. VG1U55"
                  placeholderTextColor="#546E7A"
                  autoCapitalize="characters"
                />
              </View>
              <View style={modalStyles.fieldGroup}>
                <Text style={modalStyles.fieldLabel}>Age Cohort / Range</Text>
                <TextInput
                  style={modalStyles.input}
                  value={newAgeCohort}
                  onChangeText={setNewAgeCohort}
                  placeholder="e.g. Under 55 or Above 55"
                  placeholderTextColor="#546E7A"
                />
              </View>
            </View>
            <View style={modalStyles.btnRow}>
              <TouchableOpacity style={modalStyles.cancelBtn} onPress={() => setShowAddModal(false)}>
                <Text style={modalStyles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={modalStyles.saveBtn} onPress={handleCreateMapping}>
                <Text style={modalStyles.saveBtnText}>Save Mapping</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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
            {selectedRecord ? "MAPPING DETAILS" : "GROUP CODE MANAGEMENT"}
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
              <Text style={styles.detailTitle} numberOfLines={1}>
                GROUP #{String(selectedRecord.ROWID).slice(-5)} ({selectedRecord.group_code})
              </Text>

              {/* Action Buttons Top Right: EDIT & DELETE */}
              <View style={styles.colActions}>
                <TouchableOpacity
                  style={styles.actionEditBtn}
                  activeOpacity={0.8}
                  onPress={() => setEditItem(selectedRecord)}
                >
                  <Edit2 size={13} color="#29B6F6" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionDeleteBtn}
                  activeOpacity={0.8}
                  onPress={() => setDeleteItem(selectedRecord)}
                >
                  <Trash2 size={13} color="#FF5252" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Vertical Field Breakdown */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Row ID</Text>
              <Text style={styles.fieldValue}>{selectedRecord.ROWID}</Text>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Group Code</Text>
              <Text style={[styles.fieldValue, { color: "#29B6F6", fontWeight: "700" }]}>
                {selectedRecord.group_code}
              </Text>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Age Cohort / Category</Text>
              <Text style={[styles.fieldValue, { color: "#00E676", fontWeight: "700" }]}>
                {selectedRecord.age_cohort}
              </Text>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>User ID</Text>
              <Text style={styles.fieldValue}>{selectedRecord.user_id || "Unassigned"}</Text>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Coach ID</Text>
              <Text style={styles.fieldValue}>{selectedRecord.coach_id || "Unassigned"}</Text>
            </View>

            {!!selectedRecord.CREATEDTIME && (
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Created Time</Text>
                <Text style={styles.fieldValue}>{selectedRecord.CREATEDTIME}</Text>
              </View>
            )}
          </View>
        ) : (
          /* ─── MAIN TABLE VIEW (ID | GROUP CODE | AGE | ACTIONS) ─── */
          <View>
            <TouchableOpacity
              style={styles.addBtnTop}
              activeOpacity={0.8}
              onPress={() => setShowAddModal(true)}
            >
              <Plus size={16} color="#FFFFFF" />
              <Text style={styles.addBtnTopText}>Add New Group Code</Text>
            </TouchableOpacity>

            <View style={styles.tableCard}>
              <View style={styles.tableHeaderRow}>
                <Text style={[styles.tableHeaderCell, styles.colId]}>ID</Text>
                <Text style={[styles.tableHeaderCell, styles.colGroupCode]}>GROUP CODE</Text>
                <Text style={[styles.tableHeaderCell, styles.colAge]}>AGE</Text>
                <Text style={[styles.tableHeaderCell, styles.colActionsHeader]}>ACTIONS</Text>
              </View>

              {dataList.map((item, index) => {
                const shortId = `#${String(item.ROWID).slice(-5)}`;
                const isEven = index % 2 === 1;

                return (
                  <TouchableOpacity
                    key={item.ROWID || item.id || `grp_${index}`}
                    activeOpacity={0.7}
                    style={[styles.tableRow, isEven && styles.tableRowEven]}
                    onPress={() => {
                      safeAnimate();
                      setSelectedRecord(item);
                    }}
                  >
                    <Text style={[styles.cellText, styles.colId]} numberOfLines={1}>
                      {shortId}
                    </Text>

                    <Text style={[styles.cellText, styles.colGroupCode, { color: "#29B6F6", fontWeight: "700" }]} numberOfLines={1}>
                      {item.group_code}
                    </Text>

                    <Text style={[styles.cellText, styles.colAge, { color: "#00E676" }]} numberOfLines={1}>
                      {item.age_cohort}
                    </Text>

                    <View style={styles.colActions}>
                      <TouchableOpacity
                        style={styles.actionEditBtn}
                        activeOpacity={0.8}
                        onPress={(e) => {
                          e.stopPropagation();
                          setEditItem(item);
                        }}
                      >
                        <Edit2 size={13} color="#29B6F6" />
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.actionDeleteBtn}
                        activeOpacity={0.8}
                        onPress={(e) => {
                          e.stopPropagation();
                          setDeleteItem(item);
                        }}
                      >
                        <Trash2 size={13} color="#FF5252" />
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default AdminGroupCodeManagement;
