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
  HelpCircle,
  X,
} from "lucide-react-native";
import AdminSidebar from "../../components/Admin/AdminSidebar";
import AdminEditModal from "../../components/Admin/AdminEditModal";
import AdminDeleteModal from "../../components/Admin/AdminDeleteModal";
import styles from "../../styles/pages/Admin/AdminSundayQuestionsManagement.styles";
import modalStyles from "../../styles/pages/Admin/AdminModals.styles";

export const AdminSundayQuestionsManagement = ({
  activeModule = "sunday_questions_management",
  onNavigateBack,
  onNavigateModule,
  onSignOut,
  adminName = "Super Admin",
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [questionList, setQuestionList] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);

  // Modals
  const [editItem, setEditItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);

  // Add Question Modal
  const [showAddQuestionModal, setShowAddQuestionModal] = useState(false);
  const [newQuestionText, setNewQuestionText] = useState("");
  const [newQuestionCategory, setNewQuestionCategory] = useState("Weekly Review");

  // Add Option Modal
  const [showAddOptionModal, setShowAddOptionModal] = useState(false);
  const [newOptionText, setNewOptionText] = useState("");
  const [newOptionScore, setNewOptionScore] = useState("1");

  const SUNDAY_API_ENDPOINT = "https://sbm-mobile-app-906714478.development.catalystserverless.com/api/sunday-questions";

  const safeAnimate = () => {
    try {
      if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental && !global.nativeFabricUIManager) {
        UIManager.setLayoutAnimationEnabledExperimental(true);
      }
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    } catch (e) {}
  };

  // ──────────────────────────────────────────────────────────
  // 1. GET METHOD: Fetch real Sunday Questions & Options from Catalyst DataStore
  // ──────────────────────────────────────────────────────────
  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(SUNDAY_API_ENDPOINT, { method: "GET" });
      const json = await res.json();

      if (res.ok && json.data) {
        safeAnimate();
        setQuestionList(json.data);
        if (selectedRecord) {
          const freshSelected = json.data.find(
            (q) => (q.id || q.ROWID) === (selectedRecord.id || selectedRecord.ROWID)
          );
          if (freshSelected) setSelectedRecord(freshSelected);
        }
      }
    } catch (e) {
      console.warn("Sunday Questions GET API notice:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeModule]);

  // ──────────────────────────────────────────────────────────
  // 2. PUT / PATCH METHOD: Update Question in UI & DataStore
  // ──────────────────────────────────────────────────────────
  const handleSaveEdit = async (updatedItem) => {
    safeAnimate();
    const targetId = updatedItem.ROWID || updatedItem.id;
    try {
      await fetch(SUNDAY_API_ENDPOINT, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ROWID: targetId,
          Question_Text: updatedItem.Question_Text || updatedItem.text,
          Category: updatedItem.Category || updatedItem.category,
        }),
      });

      setQuestionList((prev) =>
        prev.map((q) =>
          q.id === targetId || q.ROWID === targetId
            ? {
                ...q,
                ...updatedItem,
                Question_Text: updatedItem.Question_Text || updatedItem.text,
                text: updatedItem.Question_Text || updatedItem.text,
                Category: updatedItem.Category || updatedItem.category,
                category: updatedItem.Category || updatedItem.category,
              }
            : q
        )
      );

      if (selectedRecord && (selectedRecord.id === targetId || selectedRecord.ROWID === targetId)) {
        setSelectedRecord((prev) => ({
          ...prev,
          ...updatedItem,
          Question_Text: updatedItem.Question_Text || updatedItem.text,
          Category: updatedItem.Category || updatedItem.category,
        }));
      }
    } catch (err) {
      console.warn("Update Question API error:", err);
    } finally {
      setEditItem(null);
    }
  };

  // ──────────────────────────────────────────────────────────
  // 3. DELETE METHOD: Delete Question from Catalyst DataStore & UI
  // ──────────────────────────────────────────────────────────
  const handleConfirmDelete = async (itemToDelete) => {
    safeAnimate();
    const targetId = itemToDelete.ROWID || itemToDelete.id;

    // Check if deleting an option or a question
    if (itemToDelete.isOption) {
      try {
        await fetch(`${SUNDAY_API_ENDPOINT}/options?rowid=${targetId}`, {
          method: "DELETE",
        });

        if (selectedRecord) {
          const updatedOptions = (selectedRecord.options || []).filter(
            (opt) => (opt.id || opt.ROWID) !== targetId
          );
          const updatedRecord = { ...selectedRecord, options: updatedOptions };
          setSelectedRecord(updatedRecord);
          setQuestionList((prev) =>
            prev.map((q) =>
              (q.id || q.ROWID) === (selectedRecord.id || selectedRecord.ROWID)
                ? updatedRecord
                : q
            )
          );
        }
      } catch (err) {
        console.warn("Delete Option error:", err);
      } finally {
        setDeleteItem(null);
      }
      return;
    }

    try {
      await fetch(`${SUNDAY_API_ENDPOINT}?rowid=${targetId}`, {
        method: "DELETE",
      });

      setQuestionList((prev) =>
        prev.filter((q) => q.id !== targetId && q.ROWID !== targetId)
      );
    } catch (err) {
      console.warn("Delete Question API error:", err);
      setQuestionList((prev) =>
        prev.filter((q) => q.id !== targetId && q.ROWID !== targetId)
      );
    } finally {
      if (selectedRecord && (selectedRecord.id === targetId || selectedRecord.ROWID === targetId)) {
        setSelectedRecord(null);
      }
      setDeleteItem(null);
    }
  };

  // ──────────────────────────────────────────────────────────
  // 4. POST METHOD: Create New Sunday Question
  // ──────────────────────────────────────────────────────────
  const handleCreateQuestion = async () => {
    if (!newQuestionText.trim()) return;
    safeAnimate();
    const tempId = `56022000000038${Date.now().toString().slice(-3)}`;
    const newQuestionObj = {
      id: tempId,
      ROWID: tempId,
      Question_Text: newQuestionText.trim(),
      text: newQuestionText.trim(),
      Category: newQuestionCategory.trim() || "Weekly Review",
      category: newQuestionCategory.trim() || "Weekly Review",
      Display_Order: questionList.length + 1,
      Is_Active: true,
      options: [
        { id: `opt_${Date.now()}_1`, Option_Text: "Yes!", Score: 3 },
        { id: `opt_${Date.now()}_2`, Option_Text: "No", Score: 0 },
      ],
    };

    setQuestionList((prev) => [newQuestionObj, ...prev]);
    setShowAddQuestionModal(false);
    setNewQuestionText("");

    try {
      await fetch(SUNDAY_API_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          Question_Text: newQuestionText.trim(),
          Category: newQuestionCategory.trim() || "Weekly Review",
          Display_Order: questionList.length + 1,
          Is_Active: true,
        }),
      });
    } catch (e) {
      console.warn("Create Question API notice:", e);
    }
  };

  // ──────────────────────────────────────────────────────────
  // 5. POST METHOD: Add Option to Selected Question
  // ──────────────────────────────────────────────────────────
  const handleCreateOption = async () => {
    if (!selectedRecord || !newOptionText.trim()) return;
    safeAnimate();
    const parentQId = selectedRecord.id || selectedRecord.ROWID;
    const tempOptId = `opt_${Date.now()}`;
    const newOptObj = {
      id: tempOptId,
      ROWID: tempOptId,
      Option_Text: newOptionText.trim(),
      OptionText: newOptionText.trim(),
      Score: parseInt(newOptionScore, 10) || 0,
      score: parseInt(newOptionScore, 10) || 0,
    };

    const updatedOptions = [...(selectedRecord.options || []), newOptObj];
    const updatedRecord = { ...selectedRecord, options: updatedOptions };
    setSelectedRecord(updatedRecord);

    setQuestionList((prev) =>
      prev.map((q) =>
        (q.id || q.ROWID) === parentQId ? updatedRecord : q
      )
    );

    setShowAddOptionModal(false);
    setNewOptionText("");
    setNewOptionScore("1");

    try {
      await fetch(`${SUNDAY_API_ENDPOINT}/options`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          Sunday_Question_ID: parentQId,
          Option_Text: newOptionText.trim(),
          Score: parseInt(newOptionScore, 10) || 0,
        }),
      });
    } catch (e) {
      console.warn("Create Option API notice:", e);
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

      {/* Add New Question Modal */}
      <Modal visible={showAddQuestionModal} transparent animationType="fade" onRequestClose={() => setShowAddQuestionModal(false)}>
        <View style={modalStyles.overlay}>
          <View style={modalStyles.modalCard}>
            <View style={modalStyles.header}>
              <Text style={modalStyles.headerTitle}>Add New Sunday Question</Text>
              <TouchableOpacity onPress={() => setShowAddQuestionModal(false)} style={modalStyles.closeBtn}>
                <X size={18} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            <View style={modalStyles.formScroll}>
              <View style={modalStyles.fieldGroup}>
                <Text style={modalStyles.fieldLabel}>Question Text</Text>
                <TextInput
                  style={modalStyles.input}
                  value={newQuestionText}
                  onChangeText={setNewQuestionText}
                  placeholder="e.g. How well did you manage stress levels this week?"
                  placeholderTextColor="#546E7A"
                  multiline
                />
              </View>
              <View style={modalStyles.fieldGroup}>
                <Text style={modalStyles.fieldLabel}>Category</Text>
                <TextInput
                  style={modalStyles.input}
                  value={newQuestionCategory}
                  onChangeText={setNewQuestionCategory}
                  placeholder="e.g. Stress Management"
                  placeholderTextColor="#546E7A"
                />
              </View>
            </View>
            <View style={modalStyles.btnRow}>
              <TouchableOpacity style={modalStyles.cancelBtn} onPress={() => setShowAddQuestionModal(false)}>
                <Text style={modalStyles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={modalStyles.saveBtn} onPress={handleCreateQuestion}>
                <Text style={modalStyles.saveBtnText}>Save Question</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Option Modal */}
      <Modal visible={showAddOptionModal} transparent animationType="fade" onRequestClose={() => setShowAddOptionModal(false)}>
        <View style={modalStyles.overlay}>
          <View style={modalStyles.modalCard}>
            <View style={modalStyles.header}>
              <Text style={modalStyles.headerTitle}>Add Option Choice</Text>
              <TouchableOpacity onPress={() => setShowAddOptionModal(false)} style={modalStyles.closeBtn}>
                <X size={18} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            <View style={modalStyles.formScroll}>
              <View style={modalStyles.fieldGroup}>
                <Text style={modalStyles.fieldLabel}>Option Text Label</Text>
                <TextInput
                  style={modalStyles.input}
                  value={newOptionText}
                  onChangeText={setNewOptionText}
                  placeholder="e.g. Very Well"
                  placeholderTextColor="#546E7A"
                />
              </View>
              <View style={modalStyles.fieldGroup}>
                <Text style={modalStyles.fieldLabel}>Score Points Value</Text>
                <TextInput
                  style={modalStyles.input}
                  value={newOptionScore}
                  onChangeText={setNewOptionScore}
                  keyboardType="numeric"
                  placeholder="e.g. 3"
                  placeholderTextColor="#546E7A"
                />
              </View>
            </View>
            <View style={modalStyles.btnRow}>
              <TouchableOpacity style={modalStyles.cancelBtn} onPress={() => setShowAddOptionModal(false)}>
                <Text style={modalStyles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={modalStyles.saveBtn} onPress={handleCreateOption}>
                <Text style={modalStyles.saveBtnText}>Save Option</Text>
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
            {selectedRecord ? "QUESTION DETAILS" : "SUNDAY QUESTION MANAGEMENT"}
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
          /* VERTICAL DETAILED RECORD VIEW */
          <View style={styles.detailCard}>
            <View style={styles.detailHeader}>
              <Text style={styles.detailTitle} numberOfLines={1}>
                QUESTION #{String(selectedRecord.id || selectedRecord.ROWID).slice(-5)}
              </Text>
              <View style={styles.colActions}>
                <TouchableOpacity
                  style={styles.actionEditBtn}
                  onPress={() => setEditItem(selectedRecord)}
                >
                  <Edit2 size={13} color="#29B6F6" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionDeleteBtn}
                  onPress={() => setDeleteItem(selectedRecord)}
                >
                  <Trash2 size={13} color="#FF5252" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Question ID</Text>
              <Text style={styles.fieldValue}>{selectedRecord.id || selectedRecord.ROWID}</Text>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Category</Text>
              <Text style={styles.fieldValue}>{selectedRecord.Category || selectedRecord.category || "Weekly Review"}</Text>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Question Prompt Text</Text>
              <Text style={styles.fieldValue}>{selectedRecord.Question_Text || selectedRecord.text}</Text>
            </View>

            {/* OPTIONS & SCORES SECTION */}
            <View style={styles.optionsSection}>
              <Text style={styles.optionsSectionTitle}>OPTIONS & SCORES</Text>
              {(selectedRecord.options || []).map((opt, idx) => (
                <View key={opt.id || idx} style={styles.optionCardRow}>
                  <Text style={styles.optionTextLabel}>
                    • {opt.Option_Text || opt.OptionText || opt.text}
                  </Text>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <Text style={styles.optionScoreBadge}>
                      Score: {opt.Score !== undefined ? opt.Score : opt.score}
                    </Text>
                    <TouchableOpacity
                      onPress={() => setDeleteItem({ ...opt, isOption: true })}
                      style={{ padding: 4 }}
                    >
                      <Trash2 size={12} color="#FF5252" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}

              <TouchableOpacity
                style={styles.addOptionBtn}
                onPress={() => setShowAddOptionModal(true)}
              >
                <Plus size={14} color="#B085F5" />
                <Text style={styles.addOptionBtnText}>Add Option Choice</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          /* MAIN TABLE VIEW */
          <View>
            <TouchableOpacity
              style={styles.addBtnTop}
              activeOpacity={0.8}
              onPress={() => setShowAddQuestionModal(true)}
            >
              <Plus size={16} color="#FFFFFF" />
              <Text style={styles.addBtnTopText}>Add New Sunday Question</Text>
            </TouchableOpacity>

            <View style={styles.tableCard}>
              <View style={styles.tableHeaderRow}>
                <Text style={[styles.tableHeaderCell, styles.colId]}>ID</Text>
                <Text style={[styles.tableHeaderCell, styles.colCategory]}>CATEGORY</Text>
                <Text style={[styles.tableHeaderCell, styles.colQuestionText]}>QUESTION TEXT</Text>
                <Text style={[styles.tableHeaderCell, { textAlign: "right", width: 65 }]}>ACTIONS</Text>
              </View>

              {questionList.map((item, idx) => {
                const qId = item.id || item.ROWID;
                const shortId = `#${String(qId).slice(-5)}`;

                return (
                  <TouchableOpacity
                    key={qId || idx}
                    style={[styles.tableRow, idx % 2 === 1 && styles.tableRowEven]}
                    activeOpacity={0.7}
                    onPress={() => {
                      safeAnimate();
                      setSelectedRecord(item);
                    }}
                  >
                    <Text style={[styles.cellText, styles.colId]} numberOfLines={1}>
                      {shortId}
                    </Text>

                    <Text style={[styles.cellText, styles.colCategory, { color: "#81D4FA", fontWeight: "700" }]} numberOfLines={1}>
                      {item.Category || item.category || "Weekly"}
                    </Text>

                    <Text style={[styles.cellText, styles.colQuestionText]} numberOfLines={2} ellipsizeMode="tail">
                      {item.Question_Text || item.text}
                    </Text>

                    <View style={styles.colActions}>
                      <TouchableOpacity
                        style={styles.actionEditBtn}
                        onPress={(e) => {
                          e.stopPropagation();
                          setEditItem(item);
                        }}
                      >
                        <Edit2 size={13} color="#29B6F6" />
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.actionDeleteBtn}
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

export default AdminSundayQuestionsManagement;
