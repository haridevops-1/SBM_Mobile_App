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
  Plus,
} from "lucide-react-native";
import AdminSidebar from "../../components/Admin/AdminSidebar";
import AdminEditModal from "../../components/Admin/AdminEditModal";
import AdminDeleteModal from "../../components/Admin/AdminDeleteModal";
import styles from "../../styles/pages/Admin/AdminResourceManagement.styles";

export const AdminResourceManagement = ({
  activeModule = "resources",
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

  const RESOURCE_API_ENDPOINT = "https://sbm-mobile-app-906714478.development.catalystserverless.com/api/resources";

  const safeAnimate = () => {
    try {
      if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental && !global.nativeFabricUIManager) {
        UIManager.setLayoutAnimationEnabledExperimental(true);
      }
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    } catch (e) {}
  };

  // ──────────────────────────────────────────────────────────
  // 1. GET METHOD: Fetch all Resources from Catalyst DataStore API
  // ──────────────────────────────────────────────────────────
  const fetchData = async () => {
    setLoading(true);
    setSelectedRecord(null);
    try {
      const res = await fetch(RESOURCE_API_ENDPOINT, { method: "GET" });
      const json = await res.json();

      if (res.ok && (json.data || json.resources)) {
        let items = json.data || json.resources || [];
        if (items.length > 0) {
          const formatted = items.map((item, index) => {
            const rowId = item.ROWID || item.id || `RES_${index + 1}`;
            return {
              ROWID: rowId,
              Title: item.Title || item.title || `Resource ${index + 1}`,
              Resource_Type: item.Resource_Type || item.resource_type || item.type || "Guides",
              Description: item.Description || item.description || "",
              Resource_URL: item.Resource_URL || item.resource_url || item.videoUrl || "",
              Thumbnail_URL: item.Thumbnail_URL || item.thumbnail || "",
              Is_Active: item.Is_Active ?? true,
              Published_Date: item.Published_Date || item.date || "",
              Display_Order: item.Display_Order || item.displayOrder || 1,
            };
          });
          safeAnimate();
          setDataList(formatted);
          setLoading(false);
          return;
        }
      }
    } catch (e) {
      console.warn("Resource Management GET API notice:", e);
    }

    setDataList([]);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [activeModule]);

  // ──────────────────────────────────────────────────────────
  // 2. PATCH / PUT METHOD: Edit Resource row in Catalyst DataStore & UI
  // ──────────────────────────────────────────────────────────
  const handleSaveEdit = async (updatedItem) => {
    safeAnimate();
    const targetId = updatedItem.ROWID || updatedItem.id;
    try {
      const res = await fetch(`${RESOURCE_API_ENDPOINT}?id=${targetId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ROWID: targetId,
          Title: updatedItem.Title,
          Resource_Type: updatedItem.Resource_Type,
          Description: updatedItem.Description,
          Resource_URL: updatedItem.Resource_URL,
          Thumbnail_URL: updatedItem.Thumbnail_URL,
          Display_Order: updatedItem.Display_Order,
          Is_Active: updatedItem.Is_Active,
        }),
      });

      setDataList((prev) =>
        prev.map((row) => (row.ROWID === targetId ? { ...row, ...updatedItem } : row))
      );
      if (selectedRecord && selectedRecord.ROWID === targetId) {
        setSelectedRecord({ ...selectedRecord, ...updatedItem });
      }
    } catch (err) {
      console.warn("PATCH Resource API error:", err);
      setDataList((prev) =>
        prev.map((row) => (row.ROWID === targetId ? { ...row, ...updatedItem } : row))
      );
    } finally {
      setEditItem(null);
    }
  };

  // ──────────────────────────────────────────────────────────
  // 3. DELETE METHOD: Delete Resource row from Catalyst DataStore & UI
  // ──────────────────────────────────────────────────────────
  const handleConfirmDelete = async (itemToDelete) => {
    safeAnimate();
    const targetId = itemToDelete.ROWID || itemToDelete.id;
    try {
      await fetch(`${RESOURCE_API_ENDPOINT}?id=${targetId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ROWID: targetId }),
      });

      setDataList((prev) => prev.filter((row) => row.ROWID !== targetId));
    } catch (err) {
      console.warn("DELETE Resource API error:", err);
      setDataList((prev) => prev.filter((row) => row.ROWID !== targetId));
    } finally {
      if (selectedRecord && selectedRecord.ROWID === targetId) {
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
            {selectedRecord ? "RESOURCE DETAILS" : "RESOURCE MANAGEMENT"}
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
                {selectedRecord.Title}
              </Text>

              {/* Action Buttons Top Right: EDIT & DELETE */}
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
              <Text style={styles.detailFieldValue}>{selectedRecord.ROWID}</Text>
            </View>

            <View style={styles.detailFieldGroup}>
              <Text style={styles.detailFieldLabel}>Resource Title</Text>
              <Text style={styles.detailFieldValue}>{selectedRecord.Title}</Text>
            </View>

            <View style={styles.detailFieldGroup}>
              <Text style={styles.detailFieldLabel}>Resource Type</Text>
              <Text style={styles.detailFieldValue}>{selectedRecord.Resource_Type}</Text>
            </View>

            <View style={styles.detailFieldGroup}>
              <Text style={styles.detailFieldLabel}>Description</Text>
              <Text style={styles.detailFieldValue}>{selectedRecord.Description || "N/A"}</Text>
            </View>

            {!!selectedRecord.Resource_URL && (
              <View style={styles.detailFieldGroup}>
                <Text style={styles.detailFieldLabel}>Resource URL</Text>
                <Text style={[styles.detailFieldValue, { color: "#29B6F6" }]}>
                  {selectedRecord.Resource_URL}
                </Text>
              </View>
            )}

            {!!selectedRecord.Thumbnail_URL && (
              <View style={styles.detailFieldGroup}>
                <Text style={styles.detailFieldLabel}>Thumbnail URL</Text>
                <Text style={[styles.detailFieldValue, { color: "#B085F5" }]}>
                  {selectedRecord.Thumbnail_URL}
                </Text>
              </View>
            )}

            <View style={styles.detailFieldGroup}>
              <Text style={styles.detailFieldLabel}>Status</Text>
              <Text style={[styles.detailFieldValue, { color: selectedRecord.Is_Active ? "#00E676" : "#FF5252" }]}>
                {selectedRecord.Is_Active ? "ACTIVE" : "INACTIVE"}
              </Text>
            </View>

            {!!selectedRecord.Published_Date && (
              <View style={styles.detailFieldGroup}>
                <Text style={styles.detailFieldLabel}>Published Date</Text>
                <Text style={styles.detailFieldValue}>{selectedRecord.Published_Date}</Text>
              </View>
            )}

            <View style={styles.detailFieldGroup}>
              <Text style={styles.detailFieldLabel}>Display Order</Text>
              <Text style={styles.detailFieldValue}>{selectedRecord.Display_Order}</Text>
            </View>
          </View>
        ) : (
          /* ─── DATA LISTING TABLE VIEW (ID | TITLE | TYPE | ACTIONS) ─── */
          <View style={styles.tableCard}>
            {/* Table Header Row */}
            <View style={styles.tableHeaderRow}>
              <Text style={[styles.tableHeaderCell, styles.colId]}>ID</Text>
              <Text style={[styles.tableHeaderCell, styles.colTitle]}>TITLE</Text>
              <Text style={[styles.tableHeaderCell, styles.colType]}>TYPE</Text>
              <Text style={[styles.tableHeaderCell, styles.colActions, { textAlign: "right" }]}>
                ACTIONS
              </Text>
            </View>

            {/* Table Rows */}
            {dataList.map((item, index) => {
              const shortId = `#${String(item.ROWID).slice(-4)}`;
              const isEven = index % 2 === 1;

              return (
                <TouchableOpacity
                  key={item.ROWID || index}
                  activeOpacity={0.7}
                  style={[styles.tableRow, isEven && styles.tableRowEven]}
                  onPress={() => handleSelectRecord(item)}
                >
                  <Text style={[styles.cellText, styles.colId]} numberOfLines={1}>
                    {shortId}
                  </Text>

                  <Text style={[styles.cellText, styles.colTitle, { fontWeight: "700" }]} numberOfLines={1}>
                    {item.Title}
                  </Text>

                  <Text style={[styles.cellText, styles.colType, { color: "#81D4FA" }]} numberOfLines={1}>
                    {item.Resource_Type}
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
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default AdminResourceManagement;
