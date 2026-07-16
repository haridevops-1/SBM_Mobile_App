import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, Platform, useWindowDimensions } from 'react-native';
import { X, Check, ChevronDown } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useUser } from '../../context/UserContext';
import theme from '../../theme/theme';
import styles from '../../styles/components/DailyQuestionsModal.styles';
import { DAILY_QUESTIONS } from '../../data/questions';

export const DailyQuestionsModal = ({ visible, onClose }) => {
  const { logTodayEffort } = useUser();
  const { width } = useWindowDimensions();

  // Responsive alignment bounds for Web Desktop
  const isWebDesktop = Platform.OS === 'web' && width > 768;

  // Questionnaire States
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [viewMode, setViewMode] = useState('question'); // 'question' | 'review' | 'completed'
  const [pickerOpen, setPickerOpen] = useState(false);

  // Formatted Date matching user screenshots (e.g. "Effort for 13 May")
  const getFormattedDate = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const d = new Date();
    return `${d.getDate()} ${months[d.getMonth()]}`;
  };

  const handleSelectOption = (questionId, optionText) => {
    setAnswers({
      ...answers,
      [questionId]: optionText
    });
  };

  const handleNext = () => {
    const currentQ = DAILY_QUESTIONS[currentIndex];
    // Block progression if they haven't answered this question yet
    if (!answers[currentQ.id]) {
      alert("Please select an answer to continue.");
      return;
    }

    if (currentIndex < DAILY_QUESTIONS.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // If we are on Question 10, shift directly to the review board
      setViewMode('review');
    }
  };

  const handleJumpToQuestion = (index) => {
    setCurrentIndex(index);
    setPickerOpen(false);
  };

  const calculateScore = () => {
    let score = 0;
    DAILY_QUESTIONS.forEach((q) => {
      const selected = answers[q.id];
      const option = q.options.find(opt => opt.text === selected);
      if (option) {
        score += option.points;
      }
    });
    return score;
  };

  const handleSubmitDailyLog = () => {
    // Check if all 10 questions are answered
    const unanswered = DAILY_QUESTIONS.filter(q => !answers[q.id]);
    if (unanswered.length > 0) {
      alert(`Please answer all questions before submitting. Unanswered: ${unanswered.map(q => q.id).join(', ')}`);
      return;
    }

    const finalPercent = calculateScore();
    logTodayEffort(finalPercent);
    setViewMode('completed');
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
    const currentQ = DAILY_QUESTIONS[currentIndex];
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
                <Text style={styles.selectorPillText}>{currentQ.id}</Text>
                <ChevronDown size={12} color="#FFFFFF" />
              </TouchableOpacity>
              
              {pickerOpen && (
                <View style={styles.selectorDropdownList}>
                  <ScrollView nestedScrollEnabled>
                    {DAILY_QUESTIONS.map((q, idx) => (
                      <TouchableOpacity 
                        key={q.id}
                        style={styles.selectorOptionItem}
                        onPress={() => handleJumpToQuestion(idx)}
                      >
                        <Text style={styles.selectorOptionText}>{q.id}</Text>
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
              const isSelected = selectedAnswer === opt.text;
              return (
                <TouchableOpacity
                  key={opt.text}
                  activeOpacity={0.8}
                  style={[
                    styles.optionCard,
                    isSelected && styles.optionCardSelected
                  ]}
                  onPress={() => handleSelectOption(currentQ.id, opt.text)}
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
          {DAILY_QUESTIONS.map((_, idx) => (
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
                  {currentIndex === DAILY_QUESTIONS.length - 1 ? 'Go to Review' : 'Submit'}
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
          {DAILY_QUESTIONS.map((q) => {
            const selectedVal = answers[q.id];
            return (
              <View key={q.id} style={styles.reviewCard}>
                <Text style={styles.reviewQuestionText}>{q.id}. {q.question}</Text>
                
                <View style={styles.reviewOptionsStack}>
                  {q.options.map((opt) => {
                    const isChecked = selectedVal === opt.text;
                    return (
                      <TouchableOpacity
                        key={opt.text}
                        activeOpacity={0.8}
                        style={styles.reviewOptionRow}
                        onPress={() => handleSelectOption(q.id, opt.text)}
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
