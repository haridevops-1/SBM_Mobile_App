/**
 * ============================================================================
 * FILE: ProfileDrawer.js
 * PATH: C:\SBM_Mobile_App\src\components\ProfileDrawer\ProfileDrawer.js
 * 
 * PURPOSE:
 * Slide-out Navigation Drawer and Profile Editor Modal.
 * Provides user profile overview, app navigation links, profile detail editing
 * (name, goal, gender, age, height, meal preference, timezone with 2x/month limit),
 * and syncs profile updates to Catalyst user_profile_update table via PUT / GET methods.
 * ============================================================================
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  Modal, View, Text, TouchableOpacity, Animated,
  TouchableWithoutFeedback, useWindowDimensions, ScrollView,
  Platform, TextInput, Alert, ActivityIndicator, StyleSheet,
  KeyboardAvoidingView, Dimensions, StatusBar,
} from 'react-native';
import { useNavigation, useNavigationState } from '@react-navigation/native';
import {
  X, LogOut, Home, Flame, BarChart2, BookOpen, MessageSquare,
  Mail, Scale, User, Globe, Activity, Pencil, ChevronDown, Check,
  AlertTriangle,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUser } from '../../context/UserContext';
import theme from '../../theme/theme';
import drawerStyles from '../../styles/components/ProfileDrawer.styles';

// ─── Constants ─────────────────────────────────────────────────────────────────
const GENDER_OPTIONS   = ['Male', 'Female', 'Other'];
const MEAL_OPTIONS     = ['Veg', 'Non-Veg', 'Veg + Egg'];
const GOAL_OPTIONS     = ['Weight Loss', 'Weight Gain', 'Maintenance', 'Habit Building'];
const TIMEZONE_OPTIONS = [
  'India (IST - UTC+5:30)',
  'United States (EST - UTC-5)',
  'United States (PST - UTC-8)',
  'United Kingdom (GMT - UTC+0)',
  'Australia (AEST - UTC+10)',
  'Singapore (SGT - UTC+8)',
  'Canada (EST - UTC-5)',
  'Germany (CET - UTC+1)',
  'France (CET - UTC+1)',
  'Japan (JST - UTC+9)',
  'South Korea (KST - UTC+9)',
  'New Zealand (NZST - UTC+12)',
  'South Africa (SAST - UTC+2)',
  'Brazil (BRT - UTC-3)',
  'United Arab Emirates (GST - UTC+4)',
  'Saudi Arabia (AST - UTC+3)',
  'Hong Kong (HKT - UTC+8)',
  'Russia (MSK - UTC+3)',
  'Switzerland (CET - UTC+1)',
  'Netherlands (CET - UTC+1)',
];
const MAX_TZ_CHANGES = 2;

// ─── Bottom Sheet Picker ────────────────────────────────────────────────────────
const BottomPicker = ({ visible, title, options, selectedValue, onSelect, onClose }) => (
  <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
    <View style={ps.overlay}>
      <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={onClose} />
      <View style={ps.sheet}>
        <View style={ps.header}>
          <Text style={ps.title}>{title}</Text>
          <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <X size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        <ScrollView showsVerticalScrollIndicator={false}>
          {options.map((opt) => {
            const sel = selectedValue === opt;
            return (
              <TouchableOpacity
                key={opt}
                style={[ps.option, sel && ps.optionActive]}
                activeOpacity={0.75}
                onPress={() => { onSelect(opt); onClose(); }}
              >
                <Text style={[ps.optionText, sel && ps.optionTextActive]} numberOfLines={1}>{opt}</Text>
                {sel && <Check size={14} color="#B085F5" />}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    </View>
  </Modal>
);

const ps = StyleSheet.create({
  overlay:         { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'flex-end' },
  sheet:           { backgroundColor: '#141829', borderTopLeftRadius: 22, borderTopRightRadius: 22, paddingHorizontal: 20, paddingBottom: 36, maxHeight: Dimensions.get('window').height * 0.6 },
  header:          { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.07)' },
  title:           { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },
  option:          { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 4, borderRadius: 8 },
  optionActive:    { backgroundColor: 'rgba(176,133,245,0.12)' },
  optionText:      { fontSize: 13, color: 'rgba(255,255,255,0.6)', fontWeight: '500', flex: 1 },
  optionTextActive:{ color: '#B085F5', fontWeight: '700' },
});

// ─── Main Component ─────────────────────────────────────────────────────────────
export const ProfileDrawer = () => {
  const {
    isProfileOpen, setIsProfileOpen,
    username, userId, userEmail,
    loggedWeight, userGoal, gender,
    age, height, mealPreference, timezone,
    logoutUser, setUserGoal, updateUserProfile,
  } = useUser();


  const navigation   = useNavigation();
  const { width }    = useWindowDimensions();
  const isWebDesktop = Platform.OS === 'web' && width > 768;
  const DRAWER_WIDTH = isWebDesktop ? 440 * 0.8 : width * 0.8;


  const state       = useNavigationState(s => s);
  const activeRoute = state ? state.routes[state.index]?.name : 'Tracker';
  const slideAnim   = useRef(new Animated.Value(-DRAWER_WIDTH)).current;

  // Edit modal
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [saving,     setSaving]     = useState(false);

  // Editable field states
  const [editName,   setEditName]   = useState('');
  const [editGoal,   setEditGoal]   = useState('');
  const [editGender, setEditGender] = useState('');
  const [editAge,    setEditAge]    = useState('');
  const [editHeight, setEditHeight] = useState('');
  const [editMeal,   setEditMeal]   = useState('');
  const [editTz,     setEditTz]     = useState('');

  // Picker visibility
  const [goalOpen,   setGoalOpen]   = useState(false);
  const [genderOpen, setGenderOpen] = useState(false);
  const [mealOpen,   setMealOpen]   = useState(false);
  const [tzOpen,     setTzOpen]     = useState(false);

  // Timezone change tracking
  const [tzCount, setTzCount] = useState(0);

  // Drawer animation
  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue:         isProfileOpen ? 0 : -DRAWER_WIDTH,
      duration:        isProfileOpen ? 250 : 200,
      useNativeDriver: true,
    }).start();
  }, [isProfileOpen, DRAWER_WIDTH]);

  if (!isProfileOpen) return null;

  const initial = username ? username.charAt(0).toUpperCase() : 'H';

  const menuItems = [
    { label: 'Tracker (Home)',    route: 'Tracker',   icon: c => <Home          size={18} color={c} /> },
    { label: 'Efforts Log',       route: 'Efforts',   icon: c => <Flame         size={18} color={c} /> },
    { label: 'Results & Trends',  route: 'Results',   icon: c => <BarChart2     size={18} color={c} /> },
    { label: 'Resources Library', route: 'Resources', icon: c => <BookOpen      size={18} color={c} /> },
    { label: 'Support & Help',    route: 'Support',   icon: c => <MessageSquare size={18} color={c} /> },
  ];

  const animClose = (cb) =>
    Animated.timing(slideAnim, { toValue: -DRAWER_WIDTH, duration: 200, useNativeDriver: true }).start(cb);

  const handleNavClick = (route) => animClose(() => { setIsProfileOpen(false); navigation.navigate(route); });
  const handleClose    = ()      => animClose(() => setIsProfileOpen(false));

  // ── Open edit modal and populate all fields (with backend GET sync) ───────────
  const openEdit = async () => {
    let currName   = username       || '';
    let currGoal   = userGoal       || '';
    let currGender = gender         || '';
    let currAge    = age ? String(age) : '';
    let currHeight = height ? String(height) : '';
    let currMeal   = mealPreference || '';
    let currTz     = timezone       || '';

    // Fetch latest stored profile from Catalyst user_profile_update function (GET method)
    if (userId) {
      try {
        const getUrl = `https://sbm-mobile-app-906714478.development.catalystserverless.com/server/user_profile_update?user_id=${userId}`;
        const res = await fetch(getUrl, { method: 'GET' });
        const json = await res.json();
        if (res.ok && json.status === 'success' && json.data) {
          const d = json.data;
          if (d.name || d.username) currName = d.name || d.username;
          if (d.Weight_Goal || d.weight_goal || d.weightGoal || d.user_goal || d.userGoal || d.goal) {
            currGoal = d.Weight_Goal || d.weight_goal || d.weightGoal || d.user_goal || d.userGoal || d.goal;
          }
          if (d.gender) currGender = d.gender;
          if (d.age) currAge = String(d.age);
          if (d.height) currHeight = String(d.height);
          if (d.meal_preference || d.mealPreference || d.diet) currMeal = d.meal_preference || d.mealPreference || d.diet;
          if (d.timezone || d.time_zone) currTz = d.timezone || d.time_zone;
        }
      } catch (err) {
        console.warn('GET user_profile_update notice:', err);
      }
    }

    setEditName(currName);
    setEditGoal(currGoal);
    setEditGender(currGender);
    setEditAge(currAge);
    setEditHeight(currHeight);
    setEditMeal(currMeal);
    setEditTz(currTz);

    try {
      const key     = `tz_changes_${new Date().toISOString().slice(0, 7)}`;
      const stored  = await AsyncStorage.getItem(key);
      setTzCount(stored ? parseInt(stored, 10) : 0);
    } catch (_) { setTzCount(0); }

    setIsEditOpen(true);
  };

  // ── Timezone selection with limit guard ──────────────────────────────────────
  const handleTzSelect = (newTz) => {
    if (newTz === editTz) { setTzOpen(false); return; }

    const remaining = MAX_TZ_CHANGES - tzCount;

    if (remaining <= 0) {
      Alert.alert(
        '⏳ Timezone Change Limit Reached',
        'You have already changed your timezone 2 times this month.\nYou can change it again next month.',
        [{ text: 'OK', style: 'default' }]
      );
      setTzOpen(false);
      return;
    }

    const warnMsg = remaining === 1
      ? 'This is your LAST allowed timezone change this month.\nAfter this you cannot change it until next month.'
      : `You have ${remaining} timezone changes remaining this month.`;

    Alert.alert(
      '🌏 Change Timezone?',
      `${warnMsg}\n\nNew timezone:\n${newTz}`,
      [
        { text: 'Cancel', style: 'cancel', onPress: () => setTzOpen(false) },
        {
          text: 'Confirm', style: 'default',
          onPress: async () => {
            const newCount = tzCount + 1;
            setEditTz(newTz);
            setTzCount(newCount);
            setTzOpen(false);
            try {
              const key = `tz_changes_${new Date().toISOString().slice(0, 7)}`;
              await AsyncStorage.setItem(key, String(newCount));
            } catch (_) {}
          },
        },
      ]
    );
  };

  // ── Save changes & sync to Catalyst backend user_profile_update function (PUT method)
  const handleSave = async () => {
    if (!editName.trim()) { Alert.alert('Validation', 'Name cannot be empty.'); return; }
    if (editAge && isNaN(parseInt(editAge, 10))) { Alert.alert('Validation', 'Age must be a number.'); return; }
    if (editHeight && isNaN(parseFloat(editHeight))) { Alert.alert('Validation', 'Height must be a number.'); return; }

    setSaving(true);

    // Identify which specific fields were changed
    const changedFields = [];
    if (editName.trim() !== username) changedFields.push('username');
    if (editGoal !== userGoal) changedFields.push('userGoal');
    if (editGender !== gender) changedFields.push('gender');
    if (editAge !== (age ? String(age) : '')) changedFields.push('age');
    if (editHeight !== (height ? String(height) : '')) changedFields.push('height');
    if (editMeal !== mealPreference) changedFields.push('mealPreference');
    if (editTz !== timezone) changedFields.push('timezone');

    // Build fully merged profile payload containing ALL fields
    // (Ensures single/partial field updates don't overwrite unpassed fields in Data Store)
    const profilePayload = {
      user_id: userId,
      name: editName.trim(),
      email: userEmail,
      Weight_Goal: editGoal,
      gender: editGender,
      age: editAge ? parseInt(editAge, 10) : '',
      height: editHeight ? parseFloat(editHeight) : '',
      meal_preference: editMeal,
      timezone: editTz,
      timezone_changes: tzCount,
      changed_fields: changedFields,
      updated_at: new Date().toISOString()
    };



    try {
      // 1. Send HTTP PUT to Catalyst user_profile_update serverless endpoint
      let success = false;
      const updateUrl = 'https://sbm-mobile-app-906714478.development.catalystserverless.com/server/user_profile_update';
      const res = await fetch(updateUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profilePayload)
      });
      if (res.ok) {
        success = true;
      }

      // 2. Update local context state & AsyncStorage session
      await updateUserProfile({
        username: editName.trim(),
        userGoal: editGoal,
        gender: editGender,
        age: editAge ? parseInt(editAge, 10) : '',
        height: editHeight ? parseFloat(editHeight) : '',
        mealPreference: editMeal,
        timezone: editTz
      });

      Alert.alert('✅ Profile Updated', 'Your profile details have been updated in the Data Store.', [
        { text: 'OK', onPress: () => setIsEditOpen(false) }
      ]);
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Could not save profile changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };



  const tzRemaining = MAX_TZ_CHANGES - tzCount;

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <>
      {/* ══ Navigation Drawer ════════════════════════════════════════════════════ */}
      <Modal
        transparent
        visible={isProfileOpen}
        onRequestClose={handleClose}
        animationType="none"
        statusBarTranslucent
      >
        <View style={[drawerStyles.overlay, isWebDesktop && drawerStyles.webOverlay]}>
          <Animated.View
            style={[
              drawerStyles.drawerContainer,
              {
                width: DRAWER_WIDTH,
                transform: [{ translateX: slideAnim }],
                // statusBarTranslucent=true means Modal starts at physical top of screen
                // So we add status bar height as padding to push content below it
                paddingTop: Platform.OS === 'android'
                  ? (StatusBar.currentHeight || 24) + 4
                  : 54,
              }
            ]}
          >

            {/* Header */}
            <View style={drawerStyles.drawerHeader}>
              <Text style={drawerStyles.drawerTitle}>Navigation Menu</Text>
              <TouchableOpacity style={drawerStyles.drawerCloseBtn} onPress={handleClose}>
                <X size={20} color={theme.colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={{ flex: 1 }}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 0 }}
            >

              {/* Avatar row + Edit pencil */}
              <View style={drawerStyles.drawerAvatarSection}>
                <LinearGradient
                  colors={theme.colors.gradients.avatar}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                  style={drawerStyles.drawerAvatarCircle}
                >
                  <Text style={drawerStyles.avatarText}>{initial}</Text>
                </LinearGradient>

                <View style={{ flex: 1, marginRight: 10 }}>
                  <Text style={drawerStyles.drawerUsername}>{username}</Text>
                  <Text style={drawerStyles.drawerUseridBadge}>{userId}</Text>
                </View>

                {/* ✏️ Pencil Edit button */}
                <TouchableOpacity style={ms.editBtn} activeOpacity={0.8} onPress={openEdit}>
                  <Pencil size={14} color="#B085F5" />
                </TouchableOpacity>
              </View>

              <View style={drawerStyles.drawerSectionDivider} />

              {/* Navigation links */}
              <View style={drawerStyles.drawerNavSection}>
                <Text style={drawerStyles.drawerSectionLabel}>Main Pages</Text>
                <View style={drawerStyles.drawerNavList}>
                  {menuItems.map(item => {
                    const isActive  = activeRoute === item.route;
                    const iconColor = isActive ? '#B085F5' : theme.colors.textSecondary;
                    return (
                      <TouchableOpacity
                        key={item.route} activeOpacity={0.7}
                        style={[drawerStyles.drawerNavItem, isActive && drawerStyles.activeNavItem]}
                        onPress={() => handleNavClick(item.route)}
                      >
                        <View style={drawerStyles.navItemIcon}>{item.icon(iconColor)}</View>
                        <Text style={[drawerStyles.navItemLabel, isActive && drawerStyles.activeNavLabel]}>{item.label}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              <View style={drawerStyles.drawerSectionDivider} />

              {/* Account Details */}
              <View style={drawerStyles.drawerDetailsSection}>
                <Text style={drawerStyles.drawerSectionLabel}>Account Details</Text>
                <View style={drawerStyles.drawerDetailsCard}>
                  {[
                    { icon: <Mail     size={14} color={theme.colors.textMuted} />, label: 'Email',                 val: userEmail },
                    { icon: <Scale    size={14} color={theme.colors.textMuted} />, label: 'Weight / Goal',         val: `${loggedWeight} kg (${userGoal})` },
                    { icon: <User     size={14} color={theme.colors.textMuted} />, label: 'Gender / Age / Height', val: `${gender} / ${age} yrs / ${height} cm` },
                    { icon: <Activity size={14} color={theme.colors.textMuted} />, label: 'Dietary Preference',    val: mealPreference },
                    { icon: <Globe    size={14} color={theme.colors.textMuted} />, label: 'Time Zone',             val: timezone },
                  ].map((row, i, arr) => (
                    <View key={row.label} style={[drawerStyles.drawerMetaRow, i < arr.length - 1 && ms.rowBorder]}>
                      <View style={drawerStyles.metaIcon}>{row.icon}</View>
                      <View style={drawerStyles.metaTexts}>
                        <Text style={drawerStyles.metaLabel}>{row.label}</Text>
                        <Text style={drawerStyles.metaValue} numberOfLines={1}>{row.val}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>

              {/* Logout button — placed INSIDE ScrollView so it is always reachable */}
              <View style={drawerStyles.drawerLogoutWrapper}>
                <TouchableOpacity activeOpacity={0.8} style={drawerStyles.drawerLogoutBtn} onPress={logoutUser}>
                  <LogOut size={16} color="#FF5252" />
                  <Text style={drawerStyles.logoutText}>Log Out Session</Text>
                </TouchableOpacity>
              </View>

            </ScrollView>
          </Animated.View>

          <TouchableWithoutFeedback onPress={handleClose}>
            <View style={{ flex: 1 }} />
          </TouchableWithoutFeedback>
        </View>
      </Modal>

      {/* ══ Edit Profile Modal ════════════════════════════════════════════════════ */}
      <Modal
        visible={isEditOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsEditOpen(false)}
      >
        <KeyboardAvoidingView
          style={ms.kaView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={() => setIsEditOpen(false)} />

          <View style={ms.editSheet}>
            {/* Modal Header */}
            <View style={ms.editHeader}>
              <View>
                <Text style={ms.editTitle}>Edit Profile</Text>
                <Text style={ms.editSubtitle}>Update your personal details</Text>
              </View>
              <TouchableOpacity onPress={() => setIsEditOpen(false)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <X size={20} color="rgba(255,255,255,0.5)" />
              </TouchableOpacity>
            </View>

            {/* Thin divider */}
            <View style={ms.divider} />

            {/* Scrollable fields */}
            <ScrollView
              style={ms.fieldsScroll}
              contentContainerStyle={ms.fieldsContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >

              {/* ── Full Name ─────────────────────────────── */}
              <View style={ms.fieldBlock}>
                <View style={ms.fieldLabelRow}>
                  <User size={13} color="#B085F5" />
                  <Text style={ms.fieldLabel}>Full Name</Text>
                </View>
                <TextInput
                  style={ms.textInput}
                  value={editName}
                  onChangeText={setEditName}
                  placeholder="Your full name"
                  placeholderTextColor="rgba(255,255,255,0.22)"
                  autoCapitalize="words"
                />
              </View>

              {/* ── Goal ─────────────────────────────────── */}
              <View style={ms.fieldBlock}>
                <View style={ms.fieldLabelRow}>
                  <Activity size={13} color="#B085F5" />
                  <Text style={ms.fieldLabel}>Goal</Text>
                </View>
                <TouchableOpacity
                  style={ms.pickerBtn}
                  activeOpacity={0.8}
                  onPress={() => setGoalOpen(true)}
                >
                  <Text style={ms.pickerBtnText} numberOfLines={1}>{editGoal || 'Select goal'}</Text>
                  <ChevronDown size={14} color="rgba(255,255,255,0.4)" />
                </TouchableOpacity>
              </View>

              {/* ── Gender ───────────────────────────────── */}
              <View style={ms.fieldBlock}>
                <View style={ms.fieldLabelRow}>
                  <User size={13} color="#B085F5" />
                  <Text style={ms.fieldLabel}>Gender</Text>
                </View>
                <TouchableOpacity
                  style={ms.pickerBtn}
                  activeOpacity={0.8}
                  onPress={() => setGenderOpen(true)}
                >
                  <Text style={ms.pickerBtnText}>{editGender || 'Select gender'}</Text>
                  <ChevronDown size={14} color="rgba(255,255,255,0.4)" />
                </TouchableOpacity>
              </View>

              {/* ── Age + Height side by side ────────────── */}
              <View style={ms.rowFields}>
                <View style={[ms.fieldBlock, { flex: 1, marginRight: 10 }]}>
                  <View style={ms.fieldLabelRow}>
                    <User size={13} color="#B085F5" />
                    <Text style={ms.fieldLabel}>Age (yrs)</Text>
                  </View>
                  <TextInput
                    style={ms.textInput}
                    value={editAge}
                    onChangeText={v => setEditAge(v.replace(/[^0-9]/g, ''))}
                    placeholder="e.g. 28"
                    placeholderTextColor="rgba(255,255,255,0.22)"
                    keyboardType="number-pad"
                  />
                </View>
                <View style={[ms.fieldBlock, { flex: 1 }]}>
                  <View style={ms.fieldLabelRow}>
                    <Scale size={13} color="#B085F5" />
                    <Text style={ms.fieldLabel}>Height (cm)</Text>
                  </View>
                  <TextInput
                    style={ms.textInput}
                    value={editHeight}
                    onChangeText={v => setEditHeight(v.replace(/[^0-9.]/g, ''))}
                    placeholder="e.g. 175"
                    placeholderTextColor="rgba(255,255,255,0.22)"
                    keyboardType="decimal-pad"
                  />
                </View>
              </View>

              {/* ── Dietary Preference ───────────────────── */}
              <View style={ms.fieldBlock}>
                <View style={ms.fieldLabelRow}>
                  <Activity size={13} color="#B085F5" />
                  <Text style={ms.fieldLabel}>Dietary Preference</Text>
                </View>
                <TouchableOpacity
                  style={ms.pickerBtn}
                  activeOpacity={0.8}
                  onPress={() => setMealOpen(true)}
                >
                  <Text style={ms.pickerBtnText}>{editMeal || 'Select diet'}</Text>
                  <ChevronDown size={14} color="rgba(255,255,255,0.4)" />
                </TouchableOpacity>
              </View>

              {/* ── Timezone ─────────────────────────────── */}
              <View style={ms.fieldBlock}>
                <View style={ms.fieldLabelRow}>
                  <Globe size={13} color="#B085F5" />
                  <Text style={ms.fieldLabel}>Time Zone</Text>
                  {/* Remaining changes badge */}
                  <View style={[ms.tzBadge, tzRemaining === 0 && ms.tzBadgeRed]}>
                    <AlertTriangle size={9} color={tzRemaining === 0 ? '#FF5252' : '#FFD600'} />
                    <Text style={[ms.tzBadgeText, tzRemaining === 0 && ms.tzBadgeTextRed]}>
                      {tzRemaining === 0
                        ? 'Limit reached'
                        : `${tzRemaining} change${tzRemaining !== 1 ? 's' : ''} left this month`}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={[ms.pickerBtn, tzRemaining === 0 && ms.pickerBtnDisabled]}
                  activeOpacity={0.8}
                  onPress={() => {
                    if (tzRemaining <= 0) {
                      Alert.alert('⏳ Limit Reached', 'You can only change your timezone 2 times per month.');
                    } else {
                      setTzOpen(true);
                    }
                  }}
                >
                  <Text style={[ms.pickerBtnText, tzRemaining === 0 && ms.pickerBtnTextDisabled]} numberOfLines={1}>
                    {editTz || 'Select timezone'}
                  </Text>
                  <ChevronDown size={14} color={tzRemaining === 0 ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.4)'} />
                </TouchableOpacity>
              </View>

              {/* ── Note about timezone ───────────────────── */}
              <View style={ms.tzNote}>
                <Text style={ms.tzNoteText}>
                  🔒 Timezone can only be changed <Text style={{ color: '#B085F5', fontWeight: '700' }}>2 times per month</Text> for account security.
                </Text>
              </View>

            </ScrollView>

            {/* Save button */}
            <TouchableOpacity
              style={[ms.saveBtn, saving && ms.saveBtnLoading]}
              activeOpacity={0.85}
              onPress={handleSave}
              disabled={saving}
            >
              {saving
                ? <ActivityIndicator size="small" color="#FFFFFF" />
                : <Text style={ms.saveBtnText}>Save Changes</Text>
              }
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ─── Pickers (outside modal to avoid z-index clipping) ─────────────────── */}
      <BottomPicker visible={goalOpen}   title="Select Goal"               options={GOAL_OPTIONS}     selectedValue={editGoal}   onSelect={setEditGoal}       onClose={() => setGoalOpen(false)} />
      <BottomPicker visible={genderOpen} title="Select Gender"             options={GENDER_OPTIONS}   selectedValue={editGender} onSelect={setEditGender}     onClose={() => setGenderOpen(false)} />
      <BottomPicker visible={mealOpen}   title="Select Dietary Preference" options={MEAL_OPTIONS}     selectedValue={editMeal}   onSelect={setEditMeal}       onClose={() => setMealOpen(false)} />
      <BottomPicker visible={tzOpen}     title="Select Time Zone"          options={TIMEZONE_OPTIONS} selectedValue={editTz}     onSelect={handleTzSelect}    onClose={() => setTzOpen(false)} />
    </>
  );
};

// ─── Main Modal Styles (StyleSheet.create for proper layout) ────────────────────
const ms = StyleSheet.create({
  /* Edit pencil button */
  editBtn: {
    width: 34, height: 34, borderRadius: 10,
    backgroundColor: 'rgba(176,133,245,0.14)',
    borderWidth: 1, borderColor: 'rgba(176,133,245,0.35)',
    alignItems: 'center', justifyContent: 'center',
  },

  /* Account detail row border */
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },

  /* Edit Profile sheet */
  kaView:   { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.70)' },
  editSheet: {
    backgroundColor: '#0C1020',
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    borderTopWidth: 1, borderColor: 'rgba(255,255,255,0.07)',
    paddingTop: 20, paddingHorizontal: 20, paddingBottom: 30,
    maxHeight: Dimensions.get('window').height * 0.88,
  },
  editHeader:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 },
  editTitle:    { fontSize: 19, fontWeight: '800', color: '#FFFFFF', letterSpacing: -0.3 },
  editSubtitle: { fontSize: 11, color: 'rgba(255,255,255,0.38)', marginTop: 3, fontWeight: '500' },
  divider:      { height: 1, backgroundColor: 'rgba(255,255,255,0.06)', marginBottom: 16 },

  fieldsScroll:  { flexGrow: 0 },
  fieldsContent: { paddingBottom: 8 },

  /* Individual field block */
  fieldBlock:    { marginBottom: 14 },
  fieldLabelRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 7, gap: 6 },
  fieldLabel:    { fontSize: 11, color: 'rgba(255,255,255,0.5)', fontWeight: '600' },

  textInput: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.09)',
    borderRadius: 11, height: 46,
    paddingHorizontal: 14,
    color: '#FFFFFF', fontSize: 13, fontWeight: '500',
  },

  pickerBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.09)',
    borderRadius: 11, height: 46, paddingHorizontal: 14,
  },
  pickerBtnDisabled: {
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderColor: 'rgba(255,255,255,0.04)',
  },
  pickerBtnText:         { fontSize: 13, color: '#FFFFFF', fontWeight: '500', flex: 1 },
  pickerBtnTextDisabled: { color: 'rgba(255,255,255,0.25)' },

  rowFields: { flexDirection: 'row' },

  /* Timezone badge */
  tzBadge: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,214,0,0.13)',
    borderRadius: 6, paddingHorizontal: 7, paddingVertical: 3,
    marginLeft: 8,
  },
  tzBadgeRed:      { backgroundColor: 'rgba(255,82,82,0.13)' },
  tzBadgeText:     { fontSize: 9, color: '#FFD600', fontWeight: '700', marginLeft: 3 },
  tzBadgeTextRed:  { color: '#FF5252' },

  tzNote: {
    backgroundColor: 'rgba(176,133,245,0.08)',
    borderRadius: 10, padding: 12,
    borderWidth: 1, borderColor: 'rgba(176,133,245,0.18)',
    marginBottom: 4,
  },
  tzNoteText: { fontSize: 11, color: 'rgba(255,255,255,0.45)', fontWeight: '500', lineHeight: 16 },

  /* Save button */
  saveBtn: {
    backgroundColor: '#B085F5',
    borderRadius: 14, height: 50,
    alignItems: 'center', justifyContent: 'center',
    marginTop: 18,
    shadowColor: '#7C4DFF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 12,
    elevation: 8,
  },
  saveBtnLoading: { opacity: 0.7 },
  saveBtnText:    { fontSize: 15, fontWeight: '800', color: '#FFFFFF', letterSpacing: 0.3 },
});

export default ProfileDrawer;
