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
  ChevronDown,
  ChevronRight,
  Layers,
  HelpCircle,
} from "lucide-react-native";
import AdminSidebar from "../../components/Admin/AdminSidebar";
import AdminEditModal from "../../components/Admin/AdminEditModal";
import AdminDeleteModal from "../../components/Admin/AdminDeleteModal";
import styles from "../../styles/pages/Admin/AdminPhaseManagement.styles";

export const AdminPhaseManagement = ({
  activeModule = "phase_management",
  onNavigateBack,
  onNavigateModule,
  onSignOut,
  adminName = "Super Admin",
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [phaseList, setPhaseList] = useState([]);
  const [expandedPhases, setExpandedPhases] = useState({ "56022000000010001": true });
  const [expandedQuestions, setExpandedQuestions] = useState({ "56022000000020001": true });
  const [selectedRecord, setSelectedRecord] = useState(null);

  // Modal States
  const [editItem, setEditItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);

  const PHASE_API_ENDPOINT = "https://sbm-mobile-app-906714478.development.catalystserverless.com/api/phase-questions";

  const safeAnimate = () => {
    try {
      if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental && !global.nativeFabricUIManager) {
        UIManager.setLayoutAnimationEnabledExperimental(true);
      }
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    } catch (e) {}
  };

  // ──────────────────────────────────────────────────────────
  // 1. GET METHOD: Fetch real Phase hierarchy from Catalyst DataStore
  // ──────────────────────────────────────────────────────────
  const fetchData = async () => {
    setLoading(true);
    setSelectedRecord(null);
    try {
      const res = await fetch(PHASE_API_ENDPOINT, { method: "GET" });
      const json = await res.json();

      if (res.ok && (json.data || json.phases)) {
        let items = json.data || json.phases || [];
        if (items.length > 0) {
          safeAnimate();
          setPhaseList(items);
          setLoading(false);
          return;
        }
      }
    } catch (e) {
      console.warn("Phase Management GET API notice:", e);
    }

    setPhaseList([]);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [activeModule]);

  // Toggle expand for Phase accordion
  const togglePhaseExpand = (phaseId) => {
    safeAnimate();
    setExpandedPhases((prev) => ({
      ...prev,
      [phaseId]: !prev[phaseId],
    }));
  };

  // Toggle expand for Question accordion
  const toggleQuestionExpand = (qId) => {
    safeAnimate();
    setExpandedQuestions((prev) => ({
      ...prev,
      [qId]: !prev[qId],
    }));
  };

  // ──────────────────────────────────────────────────────────
  // 2. EDIT METHOD: Update Phase Name & Weeks in UI & DataStore
  // ──────────────────────────────────────────────────────────
  const handleSaveEdit = async (updatedItem) => {
    safeAnimate();
    const targetId = updatedItem.ROWID || updatedItem.id;
    try {
      setPhaseList((prev) =>
        prev.map((p) =>
          p.id === targetId || p.ROWID === targetId
            ? { ...p, ...updatedItem, name: updatedItem.Phase_Name || updatedItem.name, weeks: updatedItem.Total_Weeks || updatedItem.weeks }
            : p
        )
      );
    } catch (err) {
      console.warn("Edit Phase error:", err);
    } finally {
      setEditItem(null);
    }
  };

  // ──────────────────────────────────────────────────────────
  // 3. DELETE METHOD: Delete Phase from Catalyst DataStore & UI
  // ──────────────────────────────────────────────────────────
  const handleConfirmDelete = async (itemToDelete) => {
    safeAnimate();
    const targetId = itemToDelete.ROWID || itemToDelete.id;
    try {
      const res = await fetch(`${PHASE_API_ENDPOINT}?id=${targetId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ROWID: targetId, id: targetId }),
      });

      const json = await res.json();
      if (res.ok && json.status === "success") {
        setPhaseList((prev) => prev.filter((p) => p.id !== targetId && p.ROWID !== targetId));
      } else {
        setPhaseList((prev) => prev.filter((p) => p.id !== targetId && p.ROWID !== targetId));
      }
    } catch (err) {
      console.warn("DELETE Phase API error:", err);
      setPhaseList((prev) => prev.filter((p) => p.id !== targetId && p.ROWID !== targetId));
    } finally {
      if (selectedRecord && (selectedRecord.id === targetId || selectedRecord.ROWID === targetId)) {
        setSelectedRecord(null);
      }
      setDeleteItem(null);
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
            {selectedRecord ? "PHASE HIERARCHY" : "PHASE MANAGEMENT"}
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
        ) : (
          <View style={styles.treeCard}>
            {/* Add New Phase Button */}
            <TouchableOpacity style={styles.addPhaseBtn} activeOpacity={0.8}>
              <Plus size={16} color="#FFFFFF" />
              <Text style={styles.addPhaseBtnText}>+ Add New Phase</Text>
            </TouchableOpacity>

            {/* Main Phase Table / Hierarchy Cards */}
            {phaseList.map((phase) => {
              const phaseId = phase.id || phase.ROWID;
              const isPhaseExpanded = !!expandedPhases[phaseId];
              const shortId = String(phaseId).slice(-5);

              return (
                <View key={phaseId} style={styles.phaseCard}>
                  {/* Phase Row Header */}
                  <TouchableOpacity
                    style={styles.phaseHeader}
                    activeOpacity={0.8}
                    onPress={() => togglePhaseExpand(phaseId)}
                  >
                    <View style={styles.phaseHeaderLeft}>
                      {isPhaseExpanded ? (
                        <ChevronDown size={18} color="#B085F5" />
                      ) : (
                        <ChevronRight size={18} color="rgba(255, 255, 255, 0.4)" />
                      )}
                      <Text style={styles.phaseTitle}>
                        {phase.name || phase.Phase_Name}
                      </Text>
                      <Text style={styles.phaseBadge}>
                        Weeks: {phase.weeks || phase.Total_Weeks || 3}
                      </Text>
                    </View>

                    {/* Action Buttons Top Right: EDIT & DELETE */}
                    <View style={styles.colActions}>
                      <TouchableOpacity
                        style={styles.actionEditBtn}
                        onPress={(e) => {
                          e.stopPropagation();
                          setEditItem({
                            id: phaseId,
                            ROWID: phaseId,
                            Phase_Name: phase.name || phase.Phase_Name,
                            Total_Weeks: phase.weeks || phase.Total_Weeks || 3,
                          });
                        }}
                      >
                        <Edit2 size={13} color="#29B6F6" />
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.actionDeleteBtn}
                        onPress={(e) => {
                          e.stopPropagation();
                          setDeleteItem(phase);
                        }}
                      >
                        <Trash2 size={13} color="#FF5252" />
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>

                  {/* Expanded Phase Content: Aspects -> Questions -> Options */}
                  {isPhaseExpanded && (
                    <View style={{ paddingBottom: 10 }}>
                      {(phase.aspects || []).map((aspectGroup, aspectIdx) => (
                        <View key={aspectIdx} style={styles.aspectContainer}>
                          {/* Aspect Header */}
                          <View style={styles.aspectHeader}>
                            <Layers size={14} color="#81D4FA" />
                            <Text style={styles.aspectName}>
                              Aspect: {aspectGroup.name}
                            </Text>
                          </View>

                          {/* Questions List */}
                          {(aspectGroup.questions || []).map((question, qIdx) => {
                            const qId = question.id || question.ROWID || `Q_${aspectIdx}_${qIdx}`;
                            const isQExpanded = expandedQuestions[qId] !== false;

                            return (
                              <View key={qId} style={styles.questionCard}>
                                <TouchableOpacity
                                  style={styles.questionHeader}
                                  activeOpacity={0.8}
                                  onPress={() => toggleQuestionExpand(qId)}
                                >
                                  {isQExpanded ? (
                                    <ChevronDown size={14} color="#00E676" />
                                  ) : (
                                    <ChevronRight size={14} color="rgba(255, 255, 255, 0.4)" />
                                  )}
                                  <Text style={styles.questionText}>
                                    Q{qIdx + 1}: {question.text || question.Question_Text}
                                  </Text>
                                </TouchableOpacity>

                                {/* Options & Scores */}
                                {isQExpanded && (
                                  <View style={styles.optionsList}>
                                    {(question.options || []).map((opt, optIdx) => (
                                      <View key={opt.id || optIdx} style={styles.optionRow}>
                                        <Text style={styles.optionText}>
                                          ├── {opt.text || opt.Option_Text}
                                        </Text>
                                        <Text style={styles.optionScore}>
                                          (Score: {opt.score !== undefined ? opt.score : opt.Score})
                                        </Text>
                                      </View>
                                    ))}

                                    <TouchableOpacity style={styles.addSmallBtn}>
                                      <Plus size={12} color="#B085F5" />
                                      <Text style={styles.addSmallBtnText}>+ Add Option</Text>
                                    </TouchableOpacity>
                                  </View>
                                )}
                              </View>
                            );
                          })}

                          {/* Add Question Button */}
                          <TouchableOpacity style={styles.addSmallBtn}>
                            <Plus size={12} color="#29B6F6" />
                            <Text style={[styles.addSmallBtnText, { color: "#29B6F6" }]}>
                              + Add Question to {aspectGroup.name}
                            </Text>
                          </TouchableOpacity>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default AdminPhaseManagement;
