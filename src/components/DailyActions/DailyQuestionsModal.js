/**
 * ============================================================================
 * FILE: DailyQuestionsModal.js
 * PATH: C:\SBM_Mobile_App\src\components\DailyActions\DailyQuestionsModal.js
 * 
 * PURPOSE:
 * Interactive Modal for answering daily program questions (Nutrition, Movement, Recovery)
 * and Sunday Mindset Check-in 5 questions (Learning, Relationship with food, Self-kindness, 
 * Feeling in control, Confidence). Submits score results to Catalyst backend endpoints
 * (/aspect-effort and /api/sunday_tracker/submit).
 * ============================================================================
 */

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, Platform, useWindowDimensions, ActivityIndicator } from 'react-native';
import { X, Check, ChevronDown, Sparkles, ArrowRight } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUser } from '../../context/UserContext';
import theme from '../../theme/theme';
import styles from '../../styles/components/DailyQuestionsModal.styles';

const SUNDAY_QUESTIONS = [
  {
    key: 'learning',
    title: 'Learning',
    question: 'How well did you engage in learning new habits this week?',
    options: [
      { pts: 0, text: 'Needs Work' },
      { pts: 1, text: 'Fair' },
      { pts: 2, text: 'Good' },
      { pts: 3, text: 'Excellent' }
    ]
  },
  {
    key: 'food',
    title: 'Relationship with food',
    question: 'How would you rate your relationship with food this week?',
    options: [
      { pts: 0, text: 'Struggling' },
      { pts: 1, text: 'Average' },
      { pts: 2, text: 'Good' },
      { pts: 3, text: 'Great' }
    ]
  },
  {
    key: 'selfKindness',
    title: 'Self-kindness',
    question: 'How kind were you to yourself when facing challenges?',
    options: [
      { pts: 0, text: 'Hard on myself' },
      { pts: 1, text: 'Moderate' },
      { pts: 2, text: 'Kind' },
      { pts: 3, text: 'Very Kind' }
    ]
  },
  {
    key: 'control',
    title: 'Feeling in control',
    question: 'How in control did you feel over your daily routine & choices?',
    options: [
      { pts: 0, text: 'Out of control' },
      { pts: 1, text: 'Somewhat' },
      { pts: 2, text: 'Mostly' },
      { pts: 3, text: 'Fully' }
    ]
  },
  {
    key: 'confidence',
    title: 'Confidence',
    question: 'How confident do you feel about continuing your progress?',
    options: [
      { pts: 0, text: 'Low' },
      { pts: 1, text: 'Moderate' },
      { pts: 2, text: 'High' },
      { pts: 3, text: 'Very High' }
    ]
  }
];

export const DailyQuestionsModal = ({ visible, onClose }) => {
  const { logTodayEffort, userId, username, currentWeek, fetchDashboardData } = useUser();
  const { width } = useWindowDimensions();

  // Responsive alignment bounds for Web Desktop
  const isWebDesktop = Platform.OS === 'web' && width > 768;

  // Questionnaire States
  const [questionsList, setQuestionsList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [viewMode, setViewMode] = useState('question'); // 'question' | 'review' | 'sunday_intro' | 'sunday_question' | 'completed'
  const [pickerOpen, setPickerOpen] = useState(false);

  // Sunday Mindset Questionnaire States
  const [sundayIndex, setSundayIndex] = useState(0);
  const [sundayAnswers, setSundayAnswers] = useState({});
  const [isSunday, setIsSunday] = useState(new Date().getDay() === 0);

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
      setIsSunday(new Date().getDay() === 0);
      fetchQuestions();
    }
  }, [visible, userId]);

  // Formatted Date
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

  const handleSelectSundayOption = (key, pts) => {
    setSundayAnswers({
      ...sundayAnswers,
      [key]: pts
    });
  };

  const handleNext = () => {
    const currentQ = questionsList[currentIndex];
    if (!answers[currentQ.id]) {
      alert("Please select an answer to continue.");
      return;
    }

    if (currentIndex < questionsList.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setViewMode('review');
    }
  };

  const handleSundayNext = () => {
    const currentSQ = SUNDAY_QUESTIONS[sundayIndex];
    if (sundayAnswers[currentSQ.key] === undefined) {
      alert("Please select an option for this mindset question.");
      return;
    }

    if (sundayIndex < SUNDAY_QUESTIONS.length - 1) {
      setSundayIndex(sundayIndex + 1);
    } else {
      handleSubmitSundayLog();
    }
  };

  const handleEditQuestion = (idx) => {
    setCurrentIndex(idx);
    setViewMode('question');
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
    const unanswered = questionsList.filter(q => !answers[q.id]);
    if (unanswered.length > 0) {
      alert(`Please answer all questions before submitting. Unanswered: ${unanswered.map((_, idx) => idx + 1).join(', ')}`);
      return;
    }

    try {
      const response = await fetch('https://sbm-mobile-app-906714478.development.catalystserverless.com/aspect-effort', {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain',
        },
        body: JSON.stringify({
          user_id: userId,
          log_date: new Date().toISOString().split('T')[0],
          selected_options: questionsList.map(q => answers[q.id])
        })
      });

      const data = await response.json();
      if (response.ok && data.status === 'success') {
        // Backend returns 'score' (percentage 0-100). Fallback to total_effort for compatibility.
        const effortScore = data.data.score ?? data.data.total_effort ?? data.data.effort_score ?? 0;
        logTodayEffort(effortScore, userId);
        fetchDashboardData();

        // If today is Sunday, transition to Sunday 5 Mindset Questions!
        if (new Date().getDay() === 0 || isSunday) {
          setViewMode('sunday_intro');
        } else {
          setViewMode('completed');
        }
      } else {
        alert("Error submitting daily log: " + (data.message || "Catalyst database rejected the transaction."));
      }
    } catch (err) {
      console.error(err);
      alert("Network Error: Could not connect to Catalyst to submit daily log.");
    }
  };

  const handleSubmitSundayLog = async () => {
    const weekKey = `W${currentWeek || 1}`;
    const payload = {
      userId: userId,
      user_id: userId,
      date: new Date().toISOString(),
      week_number: currentWeek || 1,
      week: weekKey,
      learning: sundayAnswers.learning ?? 0,
      food: sundayAnswers.food ?? 0,
      self_kindness: sundayAnswers.selfKindness ?? 0,
      control: sundayAnswers.control ?? 0,
      confidence: sundayAnswers.confidence ?? 0
    };

    try {
      // 1. Post to sunday_tracker Catalyst function / DB
      try {
        await fetch('https://sbm-mobile-app-906714478.development.catalystserverless.com/api/sunday_tracker/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } catch (e) {
        console.warn('Sunday tracker submit offline notice (saving locally):', e);
      }

      // 2. Persist locally to AsyncStorage for instant Results page display
      try {
        const stored = await AsyncStorage.getItem('sbm_sunday_scores');
        const parsed = stored ? JSON.parse(stored) : {};
        parsed[weekKey] = {
          learning: sundayAnswers.learning ?? 0,
          food: sundayAnswers.food ?? 0,
          selfKindness: sundayAnswers.selfKindness ?? 0,
          control: sundayAnswers.control ?? 0,
          confidence: sundayAnswers.confidence ?? 0
        };
        await AsyncStorage.setItem('sbm_sunday_scores', JSON.stringify(parsed));
      } catch (e) {
        console.error("Failed to save sunday scores locally", e);
      }

      setViewMode('completed');
    } catch (err) {
      console.error(err);
      setViewMode('completed');
    }
  };

  const handleCloseAll = () => {
    setCurrentIndex(0);
    setAnswers({});
    setSundayIndex(0);
    setSundayAnswers({});
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

        {/* Pagination Dots */}
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
  // REVIEW VIEW
  // -------------------------------------------------------------
  const renderReviewView = () => {
    return (
      <View>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Review Today's Effort</Text>
          <TouchableOpacity style={styles.closeBtn} onPress={handleCloseAll}>
            <X size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.reviewScrollContainer} showsVerticalScrollIndicator={false}>
          {questionsList.map((q, idx) => {
            const selectedOptId = answers[q.id];
            const selectedOption = q.options.find(opt => opt.id === selectedOptId);
            return (
              <TouchableOpacity 
                key={q.id} 
                activeOpacity={0.8} 
                style={styles.reviewCard}
                onPress={() => handleEditQuestion(idx)}
              >
                <Text style={styles.reviewQuestionText}>{idx + 1}. {q.question}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                  <View style={[styles.reviewCheckbox, styles.reviewCheckboxChecked]}>
                    <View style={styles.reviewCheckboxInner} />
                  </View>
                  <Text style={[styles.reviewOptionText, styles.reviewOptionTextChecked, { flex: 1, textAlign: 'left', marginLeft: 8, fontSize: 13, fontWeight: '600' }]}>
                    {selectedOption ? selectedOption.text : "Not answered yet"}
                  </Text>
                  <Text style={{ fontSize: 11, color: '#B085F5', fontWeight: 'bold', marginLeft: 8 }}>Tap to Edit</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

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
  // SUNDAY INTRO TRANSITION SCREEN
  // -------------------------------------------------------------
  const renderSundayIntroView = () => {
    return (
      <View style={{ alignItems: 'center', paddingVertical: 20 }}>
        <View style={{ width: 54, height: 54, borderRadius: 27, backgroundColor: 'rgba(176,133,245,0.18)', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
          <Sparkles size={28} color="#B085F5" />
        </View>

        <Text style={{ fontSize: 19, fontWeight: '800', color: '#FFFFFF', textAlign: 'center', marginBottom: 8 }}>
          Sunday Mindset Check-in 🌟
        </Text>

        <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', textAlign: 'center', lineHeight: 20, marginBottom: 24, paddingHorizontal: 10 }}>
          Great job logging your daily effort! Since today is <Text style={{ color: '#B085F5', fontWeight: '700' }}>Sunday</Text>, take 1 minute to answer 5 quick questions about your weekly mindset.
        </Text>

        <View style={{ width: '100%', borderRadius: 14, overflow: 'hidden' }}>
          <LinearGradient
            colors={theme.colors.gradients.purpleButton}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ width: '100%' }}
          >
            <TouchableOpacity
              activeOpacity={0.85}
              style={{ flexDirection: 'row', height: 50, alignItems: 'center', justifyContent: 'center' }}
              onPress={() => {
                setSundayIndex(0);
                setViewMode('sunday_question');
              }}
            >
              <Text style={{ fontSize: 15, fontWeight: '800', color: '#FFFFFF', marginRight: 8 }}>
                Continue to Sunday Questions
              </Text>
              <ArrowRight size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </View>
    );
  };

  // -------------------------------------------------------------
  // SUNDAY QUESTIONNAIRE (5 QUESTIONS)
  // -------------------------------------------------------------
  const renderSundayQuestionView = () => {
    const sq = SUNDAY_QUESTIONS[sundayIndex];
    const selectedPts = sundayAnswers[sq.key];

    return (
      <View>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Sunday Mindset ({sundayIndex + 1}/5)</Text>
          <TouchableOpacity style={styles.closeBtn} onPress={handleCloseAll}>
            <X size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.questionContainer}>
          <Text style={{ fontSize: 12, fontWeight: '700', color: '#B085F5', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6 }}>
            {sq.title}
          </Text>
          <Text style={styles.questionText}>{sq.question}</Text>

          <View style={styles.optionsStack}>
            {sq.options.map((opt) => {
              const isSelected = selectedPts === opt.pts;
              return (
                <TouchableOpacity
                  key={opt.pts}
                  activeOpacity={0.8}
                  style={[
                    styles.optionCard,
                    isSelected && styles.optionCardSelected
                  ]}
                  onPress={() => handleSelectSundayOption(sq.key, opt.pts)}
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

        {/* Pagination Dots for 5 Sunday questions */}
        <View style={styles.paginationRow}>
          {SUNDAY_QUESTIONS.map((_, idx) => (
            <View 
              key={idx}
              style={[
                styles.paginationDot,
                sundayIndex === idx && styles.paginationDotActive
              ]}
            />
          ))}
        </View>

        {/* Action Button */}
        <View style={{ marginTop: 16 }}>
          <LinearGradient
            colors={theme.colors.gradients.purpleButton}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ borderRadius: 14 }}
          >
            <TouchableOpacity 
              activeOpacity={0.85}
              style={{ height: 48, alignItems: 'center', justifyContent: 'center' }}
              onPress={handleSundayNext}
            >
              <Text style={{ fontSize: 14, fontWeight: '800', color: '#FFFFFF' }}>
                {sundayIndex === SUNDAY_QUESTIONS.length - 1 ? 'Complete & Save Sunday Check-in' : 'Next Mindset Question →'}
              </Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </View>
    );
  };

  // -------------------------------------------------------------
  // COMPLETED VIEW
  // -------------------------------------------------------------
  const renderCompletedView = () => {
    return (
      <View style={styles.completedCard}>
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
          {viewMode === 'sunday_intro' && renderSundayIntroView()}
          {viewMode === 'sunday_question' && renderSundayQuestionView()}
          {viewMode === 'completed' && renderCompletedView()}
        </View>
      </View>
    </Modal>
  );
};

export default DailyQuestionsModal;
