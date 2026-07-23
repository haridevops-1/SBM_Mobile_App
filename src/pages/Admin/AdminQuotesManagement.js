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
import styles from "../../styles/pages/Admin/AdminQuotesManagement.styles";

export const AdminQuotesManagement = ({
  activeModule = "quotes_management",
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

  const QUOTES_API_ENDPOINT = "https://sbm-mobile-app-906714478.development.catalystserverless.com/api/daily-quotes";

  const safeAnimate = () => {
    try {
      if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental && !global.nativeFabricUIManager) {
        UIManager.setLayoutAnimationEnabledExperimental(true);
      }
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    } catch (e) {}
  };

  // ──────────────────────────────────────────────────────────
  // 1. GET METHOD: Fetch all Daily Messages / Quotes from Catalyst DataStore API
  // ──────────────────────────────────────────────────────────
  const fetchData = async () => {
    setLoading(true);
    setSelectedRecord(null);
    try {
      const res = await fetch(QUOTES_API_ENDPOINT, { method: "GET" });
      const json = await res.json();

      if (res.ok && (json.data || json.quotes)) {
        let items = json.data || json.quotes || [];
        if (items.length > 0) {
          const formatted = items.map((item, index) => {
            const rowId = item.ROWID || item.id || `QUOTE_${index + 1}`;
            return {
              id: rowId,
              ROWID: rowId,
              Quotes: item.Quotes || item.quotes || item.quote || "",
              quotes: item.Quotes || item.quotes || item.quote || "",
              createdDate: item.CREATEDTIME ? String(item.CREATEDTIME).split(" ")[0] : item.created_at || "2026-07-16",
              CREATEDTIME: item.CREATEDTIME || "2026-07-16 12:00:00",
              MODIFIEDTIME: item.MODIFIEDTIME || "2026-07-16 12:00:00",
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
      console.warn("Quotes Management GET API notice:", e);
    }

    // Default fallback if network offline
    setDataList([]);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [activeModule]);

  // ──────────────────────────────────────────────────────────
  // 2. PATCH / PUT METHOD: Edit Daily Message / Quote in Catalyst DataStore & UI
  // ──────────────────────────────────────────────────────────
  const handleSaveEdit = async (updatedItem) => {
    safeAnimate();
    const targetId = updatedItem.ROWID || updatedItem.id;
    const updatedQuoteText = updatedItem.Quotes || updatedItem.quotes || "";

    try {
      const res = await fetch(`${QUOTES_API_ENDPOINT}?id=${targetId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ROWID: targetId,
          id: targetId,
          Quotes: updatedQuoteText,
        }),
      });

      const json = await res.json();
      if (res.ok && json.status === "success") {
        setDataList((prev) =>
          prev.map((row) => (row.id === targetId || row.ROWID === targetId ? { ...row, ...updatedItem, Quotes: updatedQuoteText } : row))
        );
        if (selectedRecord && (selectedRecord.id === targetId || selectedRecord.ROWID === targetId)) {
          setSelectedRecord({ ...selectedRecord, ...updatedItem, Quotes: updatedQuoteText });
        }
      } else {
        setDataList((prev) =>
          prev.map((row) => (row.id === targetId || row.ROWID === targetId ? { ...row, ...updatedItem, Quotes: updatedQuoteText } : row))
        );
      }
    } catch (err) {
      console.warn("PATCH Quote API error:", err);
      setDataList((prev) =>
        prev.map((row) => (row.id === targetId || row.ROWID === targetId ? { ...row, ...updatedItem, Quotes: updatedQuoteText } : row))
      );
    } finally {
      setEditItem(null);
    }
  };

  // ──────────────────────────────────────────────────────────
  // 3. DELETE METHOD: Delete Daily Message / Quote from Catalyst DataStore & UI
  // ──────────────────────────────────────────────────────────
  const handleConfirmDelete = async (itemToDelete) => {
    safeAnimate();
    const targetId = itemToDelete.ROWID || itemToDelete.id;
    try {
      const res = await fetch(`${QUOTES_API_ENDPOINT}?id=${targetId}`, {
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
      console.warn("DELETE Quote API error:", err);
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
            {selectedRecord ? "QUOTE DETAILS" : "QUOTES MANAGEMENT"}
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
                QUOTE #{String(selectedRecord.ROWID || selectedRecord.id).slice(-6)}
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
              <Text style={styles.detailFieldValue}>{selectedRecord.ROWID || selectedRecord.id}</Text>
            </View>

            <View style={styles.detailFieldGroup}>
              <Text style={styles.detailFieldLabel}>Quote Content</Text>
              <Text style={styles.detailFieldValue}>
                "{selectedRecord.Quotes || selectedRecord.quotes}"
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
          /* ─── DATA LISTING TABLE VIEW (ID | QUOTES | ACTIONS) ─── */
          <View style={styles.tableCard}>
            {/* Table Header Row */}
            <View style={styles.tableHeaderRow}>
              <Text style={[styles.tableHeaderCell, styles.colId]}>ID</Text>
              <Text style={[styles.tableHeaderCell, styles.colQuotes]}>QUOTES</Text>
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
                <Text style={[styles.cellText, styles.colId]} numberOfLines={1}>
                  {String(row.ROWID || row.id).slice(-4)}
                </Text>
                <Text style={[styles.cellText, styles.colQuotes]} numberOfLines={1}>
                  {row.Quotes || row.quotes}
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

export default AdminQuotesManagement;
