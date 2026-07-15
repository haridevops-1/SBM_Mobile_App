import React, { useState, useRef, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Modal, SafeAreaView, Linking } from 'react-native';
import { Bell, MessageSquare, HelpCircle, Clock, Mail, Phone, ChevronRight, X, Send, Heart } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useUser } from '../../context/UserContext';
import ProfileDrawer from '../../components/ProfileDrawer/ProfileDrawer';
import theme from '../../theme/theme';
import styles from '../../styles/pages/Support.styles';

export const Support = () => {
  const { username, setIsProfileOpen } = useUser();

  // Modal states
  const [chatOpen, setChatOpen] = useState(false);
  const [faqOpen, setFaqOpen] = useState(false);
  
  // Chat messaging states
  const [messages, setMessages] = useState([
    { id: 1, text: `Hi ${username}! 👋 How can I help you today on your fitness journey?`, isBot: true }
  ]);
  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // FAQ accordion state
  const [expandedFaq, setExpandedFaq] = useState(null);

  const chatScrollRef = useRef(null);

  // Auto-scroll chat modal
  useEffect(() => {
    if (chatOpen && chatScrollRef.current) {
      setTimeout(() => {
        chatScrollRef.current.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages, isTyping, chatOpen]);

  const faqs = [
    {
      q: "What is the Slow Burn Method?",
      a: "The Slow Burn Method is a science-based approach to sustainable fat loss, habit building, and strength retention through progressive resistance workouts, mindful nutrition, and consistent tracking."
    },
    {
      q: "How do I log my daily actions?",
      a: "Navigate to the Tracker (Home) tab and click the green buttons to record today's effort logs and input your current body weight."
    },
    {
      q: "When can I see my weight progress chart?",
      a: "Go to the Results tab (the chart icon) to view your body weight curve, current statistics, and fat loss progress overview charts."
    },
    {
      q: "What do the different score cards mean?",
      a: "Pre-SBM Score measures baseline scores, Effort Score represents daily actions completed, and Consistency measures your tracking compliance over the last 7 days."
    }
  ];

  const handleSendMessage = () => {
    if (inputVal.trim() === '') return;

    const userMessage = { id: Date.now(), text: inputVal, isBot: false };
    setMessages((prev) => [...prev, userMessage]);
    const typedQuery = inputVal.toLowerCase();
    setInputVal('');
    
    // Simulate bot typing
    setIsTyping(true);

    setTimeout(() => {
      let replyText = "Thanks for reaching out! A coach will review your query and respond within 1 business day.";

      if (typedQuery.includes('hi') || typedQuery.includes('hello')) {
        replyText = "Hello! How can I assist you with your SBM plan today?";
      } else if (typedQuery.includes('workout') || typedQuery.includes('exercise')) {
        replyText = "Our Strength Workouts are scheduled 3 days a week. You can check details under the Resources tab!";
      } else if (typedQuery.includes('diet') || typedQuery.includes('nutrition') || typedQuery.includes('food')) {
        replyText = "Mindful eating is key! Check out the Nutrition Plan document in the Resources tab for full guidelines.";
      } else if (typedQuery.includes('weight') || typedQuery.includes('log')) {
        replyText = "You can log your weight under the Tracker (Home) tab, and view progress graphs in the Results tab.";
      }

      setMessages((prev) => [...prev, { id: Date.now() + 1, text: replyText, isBot: true }]);
      setIsTyping(false);
    }, 1200);
  };

  const toggleFaq = (index) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  const handleEmailPress = () => {
    Linking.openURL('mailto:support@slowburnmethod.com').catch(() => {
      // Fail-safe if no email client is configured
    });
  };

  const handleCallPress = () => {
    Linking.openURL('tel:+911234567890').catch(() => {
      // Fail-safe if no dialer
    });
  };

  const initialLetter = username ? username.charAt(0).toUpperCase() : 'H';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Top Header */}
        <View style={styles.supportHeader}>
          <View style={styles.headerActionsRow}>
            <TouchableOpacity 
              activeOpacity={0.8} 
              onPress={() => setIsProfileOpen(true)}
            >
              <LinearGradient
                colors={theme.colors.gradients.avatar}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.headerProfileAvatar}
              >
                <Text style={styles.avatarText}>{initialLetter}</Text>
              </LinearGradient>
            </TouchableOpacity>
            <Text style={styles.headerTitleText}>Support</Text>
            <TouchableOpacity style={styles.bellBtn}>
              <Bell size={20} color={theme.colors.textPrimary} />
              <View style={styles.bellBadge}>
                <Text style={styles.badgeText}>1</Text>
              </View>
            </TouchableOpacity>
          </View>
          <Text style={styles.headerSubtitleText}>We're here to help you on your journey. 💜</Text>
        </View>

        {/* Main Support Cards */}
        <View style={styles.mainSupportLinks}>
          {/* Live Chat Link */}
          <TouchableOpacity 
            activeOpacity={0.8} 
            style={styles.supportLinkCard} 
            onPress={() => setChatOpen(true)}
          >
            <View style={styles.cardLeftInfo}>
              <View style={styles.supportIconWrapper}>
                <MessageSquare size={18} color="#B085F5" fill="none" />
              </View>
              <View style={styles.supportTextDetails}>
                <Text style={styles.supportCardTitle}>Live Chat</Text>
                <Text style={styles.supportCardDesc}>Chat with our support team in real-time</Text>
              </View>
            </View>
            <ChevronRight size={18} color={theme.colors.textSecondary} />
          </TouchableOpacity>

          {/* FAQ Accordion Link */}
          <TouchableOpacity 
            activeOpacity={0.8} 
            style={styles.supportLinkCard} 
            onPress={() => setFaqOpen(true)}
          >
            <View style={styles.cardLeftInfo}>
              <View style={styles.supportIconWrapper}>
                <HelpCircle size={18} color="#B085F5" />
              </View>
              <View style={styles.supportTextDetails}>
                <Text style={styles.supportCardTitle}>FAQ</Text>
                <Text style={styles.supportCardDesc}>Find answers to common questions about the program</Text>
              </View>
            </View>
            <ChevronRight size={18} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Support Hours Card */}
        <View style={styles.supportHoursCard}>
          <View style={styles.hoursCardHeader}>
            <Clock size={18} color="#B085F5" style={styles.hoursIcon} />
            <Text style={styles.hoursTitle}>Support Hours</Text>
          </View>

          <View style={styles.hoursTable}>
            <View style={styles.hoursRow}>
              <Text style={styles.hoursDay}>Monday - Friday</Text>
              <Text style={styles.hoursTime}>9:00 AM - 8:00 PM IST</Text>
            </View>
            <View style={styles.hoursRow}>
              <Text style={styles.hoursDay}>Saturday</Text>
              <Text style={styles.hoursTime}>10:00 AM - 6:00 PM IST</Text>
            </View>
            <View style={styles.hoursRow}>
              <Text style={styles.hoursDay}>Sunday</Text>
              <Text style={[styles.hoursTime, styles.statusClosed]}>Closed</Text>
            </View>
          </View>

          <Text style={styles.hoursDisclaimer}>
            Please give us 1 business day to respond to your queries. 
            If you don't hear back within that time, please inform your coach.
          </Text>
        </View>

        {/* Other Ways to Reach Us Section */}
        <View style={styles.reachUsSection}>
          <Text style={styles.sectionTitle}>Other Ways to Reach Us</Text>
          <View style={styles.reachUsGrid}>
            {/* Email Us */}
            <TouchableOpacity 
              activeOpacity={0.8} 
              style={styles.reachCard} 
              onPress={handleEmailPress}
            >
              <View style={styles.cardLeftInfo}>
                <View style={[styles.reachIconBox, styles.emailBg]}>
                  <Mail size={16} color="#B085F5" />
                </View>
                <View style={styles.reachDetails}>
                  <Text style={styles.reachHeading}>Email Us</Text>
                  <Text style={styles.reachSubtext}>support@slowburnmethod.com</Text>
                </View>
              </View>
              <ChevronRight size={16} color={theme.colors.textSecondary} />
            </TouchableOpacity>

            {/* Call Us */}
            <TouchableOpacity 
              activeOpacity={0.8} 
              style={styles.reachCard} 
              onPress={handleCallPress}
            >
              <View style={styles.cardLeftInfo}>
                <View style={[styles.reachIconBox, styles.callBg]}>
                  <Phone size={16} color="#29B6F6" fill="#29B6F6" />
                </View>
                <View style={styles.reachDetails}>
                  <Text style={styles.reachHeading}>Call Us</Text>
                  <Text style={styles.reachSubtext}>+91 12345 67890</Text>
                </View>
              </View>
              <ChevronRight size={16} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* We Care About You Card */}
        <View style={styles.weCareCard}>
          <View style={styles.careLeft}>
            <View style={styles.careIconBox}>
              <Heart size={16} color="#B085F5" fill="#B085F5" />
            </View>
            <View style={styles.careText}>
              <Text style={styles.careTitle}>We Care About You</Text>
              <Text style={styles.careDesc}>Your success is our priority. We're here to support you every step of the way.</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Live Chat Modal */}
      <Modal
        visible={chatOpen}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setChatOpen(false)}
      >
        <View style={styles.modalOverlay}>
          {/* Backdrop Touch Zone */}
          <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={() => setChatOpen(false)} />
          
          <View style={styles.chatModalContent}>
            <View style={styles.chatModalHeader}>
              <View style={styles.chatHeaderProfile}>
                <View style={styles.botAvatar}>
                  <MessageSquare size={14} color="#FFFFFF" fill="#FFFFFF" />
                </View>
                <View>
                  <Text style={styles.chatBotName}>SBM Assistant</Text>
                  <Text style={styles.botStatusIndicator}>Online</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.chatCloseBtn} onPress={() => setChatOpen(false)}>
                <X size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            {/* Scrollable messages log */}
            <ScrollView 
              ref={chatScrollRef}
              style={styles.chatMessagesLog}
              contentContainerStyle={{ paddingBottom: 20 }}
            >
              {messages.map((msg) => {
                const bubbleStyle = msg.isBot ? styles.botBubble : styles.userBubble;
                const alignmentStyle = msg.isBot ? styles.botRow : styles.userRow;
                return (
                  <View key={msg.id} style={[styles.chatBubbleRow, alignmentStyle]}>
                    <View style={[styles.chatBubble, bubbleStyle]}>
                      <Text style={styles.chatBubbleText}>{msg.text}</Text>
                    </View>
                  </View>
                );
              })}
              {isTyping && (
                <View style={[styles.chatBubbleRow, styles.botRow]}>
                  <View style={[styles.chatBubble, styles.botBubble, styles.typingBubble]}>
                    <View style={styles.dot} />
                    <View style={styles.dot} />
                    <View style={styles.dot} />
                  </View>
                </View>
              )}
            </ScrollView>

            {/* Input Footer */}
            <View style={styles.chatInputForm}>
              <TextInput
                style={styles.chatInputField}
                placeholder="Ask SBM Assistant..."
                placeholderTextColor="#90A4AE"
                value={inputVal}
                onChangeText={setInputVal}
                onSubmitEditing={handleSendMessage}
              />
              <TouchableOpacity 
                activeOpacity={0.8} 
                style={styles.chatSendBtn}
                onPress={handleSendMessage}
              >
                <Send size={16} color="#FFFFFF" fill="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* FAQ Accordion Modal */}
      <Modal
        visible={faqOpen}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setFaqOpen(false)}
      >
        <View style={styles.modalOverlay}>
          {/* Backdrop Touch Zone */}
          <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={() => setFaqOpen(false)} />
          
          <View style={styles.faqModalContent}>
            <View style={styles.faqModalHeader}>
              <Text style={styles.faqModalTitle}>Frequently Asked Questions</Text>
              <TouchableOpacity style={styles.faqCloseBtn} onPress={() => setFaqOpen(false)}>
                <X size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.faqAccordionList}>
              {faqs.map((faq, idx) => {
                const isOpen = expandedFaq === idx;
                return (
                  <View key={idx} style={styles.faqAccordionItem}>
                    <TouchableOpacity 
                      activeOpacity={0.7}
                      style={styles.faqQuestionRow}
                      onPress={() => toggleFaq(idx)}
                    >
                      <Text style={styles.faqQuestionText}>{faq.q}</Text>
                      <ChevronRight 
                        size={16} 
                        color={theme.colors.textSecondary}
                        style={[
                          styles.faqArrowIcon,
                          { transform: [{ rotate: isOpen ? '90deg' : '0deg' }] }
                        ]}
                      />
                    </TouchableOpacity>
                    
                    {isOpen && (
                      <View style={styles.faqAnswerRow}>
                        <Text style={styles.faqAnswerText}>{faq.a}</Text>
                      </View>
                    )}
                  </View>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Profile menu drawer overlay */}
      <ProfileDrawer />
    </SafeAreaView>
  );
};

export default Support;
