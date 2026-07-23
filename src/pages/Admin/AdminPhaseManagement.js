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
  ChevronDown,
  ChevronRight,
  Layers,
  X,
  Check,
} from "lucide-react-native";
import AdminSidebar from "../../components/Admin/AdminSidebar";
import AdminEditModal from "../../components/Admin/AdminEditModal";
import AdminDeleteModal from "../../components/Admin/AdminDeleteModal";
import styles from "../../styles/pages/Admin/AdminPhaseManagement.styles";
import modalStyles from "../../styles/pages/Admin/AdminModals.styles";

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

  // Add Modals
  const [showAddPhaseModal, setShowAddPhaseModal] = useState(false);
  const [newPhaseName, setNewPhaseName] = useState("");
  const [newPhaseWeeks, setNewPhaseWeeks] = useState("3");

  const [addQuestionContext, setAddQuestionContext] = useState(null); // { phaseId, aspectName }
  const [newQuestionText, setNewQuestionText] = useState("");

  const [addOptionQuestionId, setAddOptionQuestionId] = useState(null);
  const [newOptionText, setNewOptionText] = useState("");
  const [newOptionScore, setNewOptionScore] = useState("1");

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
  // 2. PATCH / PUT METHOD: Edit Phase Name & Weeks in UI & DataStore
  // ──────────────────────────────────────────────────────────
  const handleSaveEdit = async (updatedItem) => {
    safeAnimate();
    const targetId = updatedItem.ROWID || updatedItem.id;
    try {
      const res = await fetch(`${PHASE_API_ENDPOINT}?id=${targetId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ROWID: targetId,
          id: targetId,
          Phase_Name: updatedItem.Phase_Name || updatedItem.name,
          Total_Weeks: updatedItem.Total_Weeks || updatedItem.weeks,
        }),
      });

      setPhaseList((prev) =>
        prev.map((p) =>
          p.id === targetId || p.ROWID === targetId
            ? { ...p, ...updatedItem, name: updatedItem.Phase_Name || updatedItem.name, weeks: updatedItem.Total_Weeks || updatedItem.weeks }
            : p
        )
      );
    } catch (err) {
      console.warn("PATCH Phase error:", err);
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

  // ──────────────────────────────────────────────────────────
  // 4. POST METHOD: Add New Phase
  // ──────────────────────────────────────────────────────────
  const handleCreatePhase = async () => {
    if (!newPhaseName.trim()) return;
    safeAnimate();
    const tempId = `560220000000100${Date.now().toString().slice(-4)}`;
    const newPhaseObj = {
      id: tempId,
      ROWID: tempId,
      name: newPhaseName.trim(),
      Phase_Name: newPhaseName.trim(),
      weeks: parseInt(newPhaseWeeks, 10) || 3,
      Total_Weeks: parseInt(newPhaseWeeks, 10) || 3,
      aspects: [
        {
          name: "Nutrition",
          questions: [
            {
              id: `q_${Date.now()}`,
              text: "Did you follow your recommended protein intake today?",
              aspect: "Nutrition",
              options: [
                { id: `opt_${Date.now()}_1`, text: "Yes!", score: 2 },
                { id: `opt_${Date.now()}_2`, text: "No", score: 0 },
              ],
            },
          ],
        },
      ],
    };

    setPhaseList((prev) => [...prev, newPhaseObj]);
    setExpandedPhases((prev) => ({ ...prev, [tempId]: true }));
    setShowAddPhaseModal(false);
    setNewPhaseName("");

    try {
      await fetch(PHASE_API_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "phase",
          Phase_Name: newPhaseName.trim(),
          Total_Weeks: parseInt(newPhaseWeeks, 10) || 3,
        }),
      });
    } catch (e) {
      console.warn("Create Phase API notice:", e);
    }
  };

  // ──────────────────────────────────────────────────────────
  // 5. POST METHOD: Add Question to Aspect
  // ──────────────────────────────────────────────────────────
  const handleCreateQuestion = async () => {
    if (!addQuestionContext || !newQuestionText.trim()) return;
    safeAnimate();
    const { phaseId, aspectName } = addQuestionContext;
    const tempQId = `q_${Date.now()}`;

    const newQuestionObj = {
      id: tempQId,
      ROWID: tempQId,
      text: newQuestionText.trim(),
      Question_Text: newQuestionText.trim(),
      aspect: aspectName,
      options: [
        { id: `opt_${Date.now()}_1`, text: "Yes!", score: 2 },
        { id: `opt_${Date.now()}_2`, text: "No", score: 0 },
      ],
    };

    setPhaseList((prev) =>
      prev.map((phase) => {
        if (phase.id === phaseId || phase.ROWID === phaseId) {
          const updatedAspects = (phase.aspects || []).map((asp) => {
            if (asp.name === aspectName) {
              return { ...asp, questions: [...(asp.questions || []), newQuestionObj] };
            }
            return asp;
          });

          const hasAspect = (phase.aspects || []).some((asp) => asp.name === aspectName);
          if (!hasAspect) {
            updatedAspects.push({ name: aspectName, questions: [newQuestionObj] });
          }

          return { ...phase, aspects: updatedAspects };
        }
        return phase;
      })
    );

    setExpandedQuestions((prev) => ({ ...prev, [tempQId]: true }));
    setAddQuestionContext(null);
    setNewQuestionText("");

    try {
      await fetch(PHASE_API_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "question",
          Phase_ID: phaseId,
          Aspect: aspectName,
          Question_Text: newQuestionText.trim(),
        }),
      });
    } catch (e) {
      console.warn("Create Question API notice:", e);
    }
  };

  // ──────────────────────────────────────────────────────────
  // 6. POST METHOD: Add Option to Question
  // ──────────────────────────────────────────────────────────
  const handleCreateOption = async () => {
    if (!addOptionQuestionId || !newOptionText.trim()) return;
    safeAnimate();
    const tempOptId = `opt_${Date.now()}`;
    const newOptObj = {
      id: tempOptId,
      ROWID: tempOptId,
      text: newOptionText.trim(),
      Option_Text: newOptionText.trim(),
      score: parseInt(newOptionScore, 10) || 0,
      Score: parseInt(newOptionScore, 10) || 0,
    };

    setPhaseList((prev) =>
      prev.map((phase) => ({
        ...phase,
        aspects: (phase.aspects || []).map((asp) => ({
          ...asp,
          questions: (asp.questions || []).map((q) => {
            if (q.id === addOptionQuestionId || q.ROWID === addOptionQuestionId) {
              return { ...q, options: [...(q.options || []), newOptObj] };
            }
            return q;
          }),
        })),
      }))
    );

    setAddOptionQuestionId(null);
    setNewOptionText("");
    setNewOptionScore("1");

    try {
      await fetch(PHASE_API_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "option",
          Question_ID: addOptionQuestionId,
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

      {/* Existing Modals */}
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

      {/* Add New Phase Modal */}
      <Modal visible={showAddPhaseModal} transparent animationType="fade" onRequestClose={() => setShowAddPhaseModal(false)}>
        <View style={modalStyles.overlay}>
          <View style={modalStyles.modalCard}>
            <View style={modalStyles.header}>
              <Text style={modalStyles.headerTitle}>Add New Program Phase</Text>
              <TouchableOpacity onPress={() => setShowAddPhaseModal(false)} style={modalStyles.closeBtn}>
                <X size={18} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            <View style={modalStyles.formScroll}>
              <View style={modalStyles.fieldGroup}>
                <Text style={modalStyles.fieldLabel}>Phase Name</Text>
                <TextInput
                  style={modalStyles.input}
                  value={newPhaseName}
                  onChangeText={setNewPhaseName}
                  placeholder="e.g. ADVANCED STRENGTH PHASE"
                  placeholderTextColor="#546E7A"
                />
              </View>
              <View style={modalStyles.fieldGroup}>
                <Text style={modalStyles.fieldLabel}>Total Duration (Weeks)</Text>
                <TextInput
                  style={modalStyles.input}
                  value={newPhaseWeeks}
                  onChangeText={setNewPhaseWeeks}
                  keyboardType="numeric"
                  placeholder="e.g. 3"
                  placeholderTextColor="#546E7A"
                />
              </View>
            </View>
            <View style={modalStyles.btnRow}>
              <TouchableOpacity style={modalStyles.cancelBtn} onPress={() => setShowAddPhaseModal(false)}>
                <Text style={modalStyles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={modalStyles.saveBtn} onPress={handleCreatePhase}>
                <Text style={modalStyles.saveBtnText}>Save Phase</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Question Modal */}
      <Modal visible={!!addQuestionContext} transparent animationType="fade" onRequestClose={() => setAddQuestionContext(null)}>
        <View style={modalStyles.overlay}>
          <View style={modalStyles.modalCard}>
            <View style={modalStyles.header}>
              <Text style={modalStyles.headerTitle}>Add Question to {addQuestionContext?.aspectName}</Text>
              <TouchableOpacity onPress={() => setAddQuestionContext(null)} style={modalStyles.closeBtn}>
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
                  placeholder="e.g. Did you complete your mobility routine?"
                  placeholderTextColor="#546E7A"
                  multiline
                />
              </View>
            </View>
            <View style={modalStyles.btnRow}>
              <TouchableOpacity style={modalStyles.cancelBtn} onPress={() => setAddQuestionContext(null)}>
                <Text style={modalStyles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={modalStyles.saveBtn} onPress={handleCreateQuestion}>
                <Text style={modalStyles.saveBtnText}>Add Question</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Option Modal */}
      <Modal visible={!!addOptionQuestionId} transparent animationType="fade" onRequestClose={() => setAddOptionQuestionId(null)}>
        <View style={modalStyles.overlay}>
          <View style={modalStyles.modalCard}>
            <View style={modalStyles.header}>
              <Text style={modalStyles.headerTitle}>Add Question Option</Text>
              <TouchableOpacity onPress={() => setAddOptionQuestionId(null)} style={modalStyles.closeBtn}>
                <X size={18} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            <View style={modalStyles.formScroll}>
              <View style={modalStyles.fieldGroup}>
                <Text style={modalStyles.fieldLabel}>Option Choice Label</Text>
                <TextInput
                  style={modalStyles.input}
                  value={newOptionText}
                  onChangeText={setNewOptionText}
                  placeholder="e.g. Exceeded Target"
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
                  placeholder="e.g. 2"
                  placeholderTextColor="#546E7A"
                />
              </View>
            </View>
            <View style={modalStyles.btnRow}>
              <TouchableOpacity style={modalStyles.cancelBtn} onPress={() => setAddOptionQuestionId(null)}>
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
            <TouchableOpacity
              style={styles.addPhaseBtn}
              activeOpacity={0.8}
              onPress={() => setShowAddPhaseModal(true)}
            >
              <Plus size={16} color="#FFFFFF" />
              <Text style={styles.addPhaseBtnText}>Add New Phase</Text>
            </TouchableOpacity>

            {/* Main Phase Table / Hierarchy Cards */}
            {phaseList.map((phase) => {
              const phaseId = phase.id || phase.ROWID;
              const isPhaseExpanded = !!expandedPhases[phaseId];

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
                      <View style={styles.phaseTitleWrapper}>
                        <Text style={styles.phaseTitle} numberOfLines={1} ellipsizeMode="tail">
                          {phase.name || phase.Phase_Name}
                        </Text>
                        <Text style={styles.phaseBadge}>
                          Weeks: {phase.weeks || phase.Total_Weeks || 3}
                        </Text>
                      </View>
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
                              ASPECT: {aspectGroup.name}
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
                                          • {opt.text || opt.Option_Text}
                                        </Text>
                                        <Text style={styles.optionScore}>
                                          (Score: {opt.score !== undefined ? opt.score : opt.Score})
                                        </Text>
                                      </View>
                                    ))}

                                    {/* Add Option Button */}
                                    <TouchableOpacity
                                      style={styles.addSmallBtn}
                                      onPress={() => setAddOptionQuestionId(qId)}
                                    >
                                      <Plus size={12} color="#B085F5" />
                                      <Text style={styles.addSmallBtnText}>Add Option</Text>
                                    </TouchableOpacity>
                                  </View>
                                )}
                              </View>
                            );
                          })}

                          {/* Add Question Button */}
                          <TouchableOpacity
                            style={styles.addSmallBtn}
                            onPress={() => setAddQuestionContext({ phaseId, aspectName: aspectGroup.name })}
                          >
                            <Plus size={12} color="#29B6F6" />
                            <Text style={[styles.addSmallBtnText, { color: "#29B6F6" }]}>
                              Add Question to {aspectGroup.name}
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
