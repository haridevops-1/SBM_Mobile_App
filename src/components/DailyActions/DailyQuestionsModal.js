import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, Platform, useWindowDimensions, ActivityIndicator } from 'react-native';
import { X, Check, ChevronDown } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useUser } from '../../context/UserContext';
import theme from '../../theme/theme';
import styles from '../../styles/components/DailyQuestionsModal.styles';

export const DailyQuestionsModal = ({ visible, onClose }) => {
  const { logTodayEffort, userId, fetchDashboardData } = useUser();
  const { width } = useWindowDimensions();

  // Responsive alignment bounds for Web Desktop
  const isWebDesktop = Platform.OS === 'web' && width > 768;

  // Questionnaire States
  const [questionsList, setQuestionsList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [viewMode, setViewMode] = useState('question'); // 'question' | 'review' | 'completed'
  const [pickerOpen, setPickerOpen] = useState(false);

  // Fetch phase questions dynamically from Zoho Catalyst sbm_questionnaire_function
  const fetchQuestions = async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`https://sbm-mobile-app-906714478.development.catalystserverless.com/tracker/questions?userId=${userId}&type=questions`);
      const data = await response.json();
      if (response.ok && data.status === 'success') {
        const formatted = data.data.questions.map((q, idx) => ({
          id: q.questionId,
          index: idx + 1,
          question: q.questionText,
          aspect: q.aspect,
          options: q.options.map(opt => ({
            id: opt.optionId,
            text: opt.optionText,
            points: opt.score
          }))
        }));
        setQuestionsList(formatted);
      } else {
        throw new Error(data.message || "Failed to load questions.");
      }
    } catch (err) {
      console.error(err);
      setError("Unable to load program questions from Zoho Catalyst.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visible && userId) {
      fetchQuestions();
    }
  }, [visible, userId]);

  // Formatted Date matching user screenshots (e.g. "Effort for 13 May")
  const getFormattedDate = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const d = new Date();
    return `${d.getDate()} ${months[d.getMonth()]}`;
  };

  const handleSelectOption = (questionId, optionId) => {
    setAnswers({
      ...answers,
      [questionId]: optionId
    });
  };

  const handleNext = () => {
    const currentQ = questionsList[currentIndex];
    // Block progression if they haven't answered this question yet
    if (!answers[currentQ.id]) {
      alert("Please select an answer to continue.");
      return;
    }

    if (currentIndex < questionsList.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Shift directly to the review board
      setViewMode('review');
    }
  };

  const handleJumpToQuestion = (index) => {
    setCurrentIndex(index);
    setPickerOpen(false);
  };

  const calculateScore = () => {
    let score = 0;
    questionsList.forEach((q) => {
      const selectedOptionId = answers[q.id];
      const option = q.options.find(opt => opt.id === selectedOptionId);
      if (option) {
        score += option.points;
      }
    });
    return score;
  };

  const handleSubmitDailyLog = async () => {
    // Check if all questions are answered
    const unanswered = questionsList.filter(q => !answers[q.id]);
    if (unanswered.length > 0) {
      alert(`Please answer all questions before submitting. Unanswered: ${unanswered.map((_, idx) => idx + 1).join(', ')}`);
      return;
    }

    const finalPercent = calculateScore();

    try {
      const response = await fetch('https://sbm-mobile-app-906714478.development.catalystserverless.com/tracker/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain', // Bypass preflight CORS checks
        },
        body: JSON.stringify({
          userId: userId,
          answers: questionsList.map(q => ({
            questionId: q.id,
            optionId: answers[q.id]
          })),
          score: finalPercent
        })
      });

      const data = await response.json();
      if (response.ok && data.status === 'success') {
        // Sync local context and refresh dashboard stats
        logTodayEffort(data.data.score);
        setViewMode('completed');
        fetchDashboardData();
      } else {
        alert("Error submitting daily log: " + (data.message || "Catalyst database rejected the transaction."));
      }
    } catch (err) {
      console.error(err);
      alert("Network Error: Could not connect to Catalyst to submit daily log.");
    }
  };

  const handleCloseAll = () => {
    // Reset internal state
    setCurrentIndex(0);
    setAnswers({});
    setViewMode('question');
    setPickerOpen(false);
    onClose();
  };

  // -------------------------------------------------------------
  // CAROUSEL VIEW: QUESTION BY QUESTION
  // -------------------------------------------------------------
  const renderQuestionView = () => {
    if (loading) {
      return (
        <View style={{ paddingVertical: 80, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={theme.colors.textPrimary} style={{ marginBottom: 16 }} />
          <Text style={{ color: '#ECEFF1', fontSize: 14, fontWeight: '600', textAlign: 'center', lineHeight: 20 }}>
            Wait, your progress is loading... {"\n"}Every effort brings you closer! 💪
          </Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={{ paddingVertical: 60, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: '#FF5252', fontSize: 14, fontWeight: '600', textAlign: 'center', marginBottom: 20, paddingHorizontal: 16 }}>{error}</Text>
          <View style={{ borderRadius: 12, overflow: 'hidden' }}>
            <LinearGradient
              colors={theme.colors.gradients.purpleButton}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <TouchableOpacity 
                style={{ paddingVertical: 12, paddingHorizontal: 24, alignItems: 'center' }} 
                onPress={fetchQuestions}
              >
                <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>Retry</Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        </View>
      );
    }

    if (questionsList.length === 0) {
      return (
        <View style={{ paddingVertical: 60, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: '#ECEFF1', fontSize: 14, fontWeight: '600', textAlign: 'center', marginBottom: 20 }}>No questions available for this phase.</Text>
          <TouchableOpacity style={{ padding: 12 }} onPress={handleCloseAll}>
            <Text style={{ color: theme.colors.textSecondary, fontWeight: '500' }}>Close</Text>
          </TouchableOpacity>
        </View>
      );
    }

    const currentQ = questionsList[currentIndex];
    const selectedAnswer = answers[currentQ.id];

    return (
      <View>
        {/* Header Row */}
        <View style={styles.modalHeader}>
          <View style={styles.headerLeft}>
            <Text style={styles.modalTitle}>Effort for {getFormattedDate()}</Text>
          </View>
          
          <View style={styles.headerRightActions}>
            {/* Custom Index Picker Dropdown */}
            <View style={styles.indexSelectorWrapper}>
              <TouchableOpacity 
                activeOpacity={0.8}
                style={styles.selectorPill}
                onPress={() => setPickerOpen(!pickerOpen)}
              >
                <Text style={styles.selectorPillText}>{currentIndex + 1}</Text>
                <ChevronDown size={12} color="#FFFFFF" />
              </TouchableOpacity>
              
              {pickerOpen && (
                <View style={styles.selectorDropdownList}>
                  <ScrollView nestedScrollEnabled>
                    {questionsList.map((q, idx) => (
                      <TouchableOpacity 
                        key={q.id}
                        style={styles.selectorOptionItem}
                        onPress={() => handleJumpToQuestion(idx)}
                      >
                        <Text style={styles.selectorOptionText}>{idx + 1}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>

            {/* Close Button */}
            <TouchableOpacity style={styles.closeBtn} onPress={handleCloseAll}>
              <X size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Carousel Content */}
        <View style={styles.questionContainer}>
          <Text style={styles.questionText}>{currentQ.question}</Text>
          
          <View style={styles.optionsStack}>
            {currentQ.options.map((opt) => {
              const isSelected = selectedAnswer === opt.id;
              return (
                <TouchableOpacity
                  key={opt.id}
                  activeOpacity={0.8}
                  style={[
                    styles.optionCard,
                    isSelected && styles.optionCardSelected
                  ]}
                  onPress={() => handleSelectOption(currentQ.id, opt.id)}
                >
                  <Text style={[
                    styles.optionText,
                    isSelected && styles.optionTextSelected
                  ]}>
                    {opt.text}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Progress Pagination Dots */}
        <View style={styles.paginationRow}>
          {questionsList.map((_, idx) => (
            <View 
              key={idx}
              style={[
                styles.paginationDot,
                currentIndex === idx && styles.paginationDotActive
              ]}
            />
          ))}
        </View>

        {/* Controls Layout */}
        <View style={styles.controlsRow}>
          <TouchableOpacity 
            activeOpacity={0.8}
            style={[styles.controlBtn, styles.btnReview]} 
            onPress={() => setViewMode('review')}
          >
            <Text style={styles.btnReviewText}>Review</Text>
          </TouchableOpacity>

          <View style={[styles.controlBtn, styles.btnSubmit]}>
            <LinearGradient
              colors={theme.colors.gradients.purpleButton}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradientBtn}
            >
              <TouchableOpacity 
                activeOpacity={0.8}
                style={styles.gradientBtn}
                onPress={handleNext}
              >
                <Text style={styles.btnSubmitText}>
                  {currentIndex === questionsList.length - 1 ? 'Go to Review' : 'Submit'}
                </Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        </View>
      </View>
    );
  };

  // -------------------------------------------------------------
  // REVIEW VIEW: LIST ALL ANSWERS
  // -------------------------------------------------------------
  const renderReviewView = () => {
    return (
      <View>
        {/* Header Row */}
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Review Today's Effort</Text>
          <TouchableOpacity style={styles.closeBtn} onPress={handleCloseAll}>
            <X size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Scrollable Questions list */}
        <ScrollView style={styles.reviewScrollContainer} showsVerticalScrollIndicator={false}>
          {questionsList.map((q, idx) => {
            const selectedVal = answers[q.id];
            return (
              <View key={q.id} style={styles.reviewCard}>
                <Text style={styles.reviewQuestionText}>{idx + 1}. {q.question}</Text>
                
                <View style={styles.reviewOptionsStack}>
                  {q.options.map((opt) => {
                    const isChecked = selectedVal === opt.id;
                    return (
                      <TouchableOpacity
                        key={opt.id}
                        activeOpacity={0.8}
                        style={styles.reviewOptionRow}
                        onPress={() => handleSelectOption(q.id, opt.id)}
                      >
                        <View style={[
                          styles.reviewCheckbox,
                          isChecked && styles.reviewCheckboxChecked
                        ]}>
                          {isChecked && <View style={styles.reviewCheckboxInner} />}
                        </View>
                        <Text style={[
                          styles.reviewOptionText,
                          isChecked && styles.reviewOptionTextChecked
                        ]}>
                          {opt.text}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            );
          })}
        </ScrollView>

        {/* Action Panel */}
        <View style={styles.controlsRow}>
          <TouchableOpacity 
            activeOpacity={0.8}
            style={[styles.controlBtn, styles.btnReview]} 
            onPress={() => setViewMode('question')}
          >
            <Text style={styles.btnReviewText}>Back</Text>
          </TouchableOpacity>

          <View style={[styles.controlBtn, styles.btnSubmit]}>
            <LinearGradient
              colors={theme.colors.gradients.purpleButton}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradientBtn}
            >
              <TouchableOpacity 
                activeOpacity={0.8}
                style={styles.gradientBtn}
                onPress={handleSubmitDailyLog}
              >
                <Text style={styles.btnSubmitText}>Submit Daily Log</Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        </View>
      </View>
    );
  };

  // -------------------------------------------------------------
  // COMPLETED VIEW: CONGRATULATIONS SPLASH
  // -------------------------------------------------------------
  const renderCompletedView = () => {
    return (
      <View style={styles.completedCard}>
        {/* Success Checkmark Ring */}
        <View style={styles.checkmarkCircle}>
          <Check size={36} color="#FFFFFF" />
        </View>

        <Text style={styles.completedTitle}>Done for Today!!</Text>
        <Text style={styles.completedSubtitle}>Well done! See you tomorrow 💪</Text>

        <View style={styles.closeCompletedBtn}>
          <LinearGradient
            colors={theme.colors.gradients.purpleButton}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradientBtn}
          >
            <TouchableOpacity 
              activeOpacity={0.8}
              style={styles.gradientBtn}
              onPress={handleCloseAll}
            >
              <Text style={styles.closeCompletedText}>Close</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </View>
    );
  };

  return (
    <Modal
      transparent={true}
      visible={visible}
      onRequestClose={handleCloseAll}
      animationType="fade"
    >
      <View style={[styles.modalOverlay, isWebDesktop && styles.webModalOverlay]}>
        <View style={styles.modalCard}>
          {viewMode === 'question' && renderQuestionView()}
          {viewMode === 'review' && renderReviewView()}
          {viewMode === 'completed' && renderCompletedView()}
        </View>
      </View>
    </Modal>
  );
};

export default DailyQuestionsModal;
