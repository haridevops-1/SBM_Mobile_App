import React, { useEffect, useRef, useState } from 'react';
import {
  Modal, View, Text, TouchableOpacity, Animated,
  TouchableWithoutFeedback, useWindowDimensions, ScrollView,
  Platform, TextInput, Alert, ActivityIndicator
} from 'react-native';
import { useNavigation, useNavigationState } from '@react-navigation/native';
import {
  X, LogOut, Home, Flame, BarChart2, BookOpen, MessageSquare,
  Mail, Scale, User, Globe, Activity, Pencil, ChevronDown,
  Check, AlertTriangle
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUser } from '../../context/UserContext';
import theme from '../../theme/theme';
import styles from '../../styles/components/ProfileDrawer.styles';

// ─── Constants ────────────────────────────────────────────────────────────────
const GENDER_OPTIONS    = ['Male', 'Female', 'Other'];
const MEAL_OPTIONS      = ['Veg', 'Non-Veg', 'Veg + Egg'];
const GOAL_OPTIONS      = ['Weight Loss', 'Weight Gain', 'Maintenance', 'Habit Building'];
const TIMEZONE_OPTIONS  = [
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
  'Netherlands (CET - UTC+1)'
];

const MAX_TIMEZONE_CHANGES_PER_MONTH = 2;

// ─── Bottom‑sheet Picker ──────────────────────────────────────────────────────
const BottomPicker = ({ visible, title, options, selectedValue, onSelect, onClose }) => (
  <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
    <View style={pickerStyles.overlay}>
      <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={onClose} />
      <View style={pickerStyles.sheet}>
        <View style={pickerStyles.header}>
          <Text style={pickerStyles.title}>{title}</Text>
          <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <X size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        <ScrollView style={pickerStyles.list} showsVerticalScrollIndicator={false}>
          {options.map((opt) => {
            const isSelected = selectedValue === opt;
            return (
              <TouchableOpacity
                key={opt}
                activeOpacity={0.8}
                style={[pickerStyles.option, isSelected && pickerStyles.optionActive]}
                onPress={() => { onSelect(opt); onClose(); }}
              >
                <Text style={[pickerStyles.optionText, isSelected && pickerStyles.optionTextActive]}>
                  {opt}
                </Text>
                {isSelected && <Check size={14} color="#B085F5" />}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    </View>
  </Modal>
);

// Inline picker styles (self-contained so they don't pollute the main stylesheet)
const pickerStyles = {
  overlay:      { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'flex-end' },
  sheet:        { backgroundColor: '#141829', borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingHorizontal: 20, paddingBottom: 30, maxHeight: '65%' },
  header:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.07)' },
  title:        { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },
  list:         { marginTop: 8 },
  option:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 13, paddingHorizontal: 4, borderRadius: 8 },
  optionActive: { backgroundColor: 'rgba(176,133,245,0.12)' },
  optionText:   { fontSize: 13, color: 'rgba(255,255,255,0.65)', fontWeight: '500' },
  optionTextActive: { color: '#B085F5', fontWeight: '700' },
};

// ─── Main Component ───────────────────────────────────────────────────────────
export const ProfileDrawer = () => {
  const {
    isProfileOpen, setIsProfileOpen,
    username,     userId,       userEmail,
    loggedWeight, userGoal,     gender,
    age,          height,       mealPreference,
    timezone,     logoutUser,
    setUserGoal,
  } = useUser();

  const navigation = useNavigation();
  const { width } = useWindowDimensions();

  const isWebDesktop  = Platform.OS === 'web' && width > 768;
  const DRAWER_WIDTH  = isWebDesktop ? 440 * 0.8 : width * 0.8;

  const state       = useNavigationState(s => s);
  const activeRoute = state ? state.routes[state.index]?.name : 'Tracker';
  const slideAnim   = useRef(new Animated.Value(-DRAWER_WIDTH)).current;

  // ─── Edit modal state ───────────────────────────────────────────
  const [isEditOpen,   setIsEditOpen]   = useState(false);
  const [saving,       setSaving]       = useState(false);

  // Local editable copies
  const [editName,    setEditName]    = useState('');
  const [editGoal,    setEditGoal]    = useState('');
  const [editGender,  setEditGender]  = useState('');
  const [editAge,     setEditAge]     = useState('');
  const [editHeight,  setEditHeight]  = useState('');
  const [editMeal,    setEditMeal]    = useState('');
  const [editTz,      setEditTz]      = useState('');

  // Picker visibility flags
  const [goalPickerOpen,   setGoalPickerOpen]   = useState(false);
  const [genderPickerOpen, setGenderPickerOpen] = useState(false);
  const [mealPickerOpen,   setMealPickerOpen]   = useState(false);
  const [tzPickerOpen,     setTzPickerOpen]     = useState(false);

  // Timezone change limit tracking
  const [tzChangesThisMonth, setTzChangesThisMonth] = useState(0);

  // ─── Drawer slide animation ─────────────────────────────────────
  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue:        isProfileOpen ? 0 : -DRAWER_WIDTH,
      duration:       isProfileOpen ? 250 : 200,
      useNativeDriver: true,
    }).start();
  }, [isProfileOpen, DRAWER_WIDTH]);

  if (!isProfileOpen) return null;

  const initialLetter = username ? username.charAt(0).toUpperCase() : 'H';

  const menuItems = [
    { label: 'Tracker (Home)',    route: 'Tracker',   icon: (c) => <Home          size={18} color={c} /> },
    { label: 'Efforts Log',       route: 'Efforts',   icon: (c) => <Flame         size={18} color={c} /> },
    { label: 'Results & Trends',  route: 'Results',   icon: (c) => <BarChart2     size={18} color={c} /> },
    { label: 'Resources Library', route: 'Resources', icon: (c) => <BookOpen      size={18} color={c} /> },
    { label: 'Support & Help',    route: 'Support',   icon: (c) => <MessageSquare size={18} color={c} /> },
  ];

  const handleNavClick = (route) => {
    Animated.timing(slideAnim, { toValue: -DRAWER_WIDTH, duration: 150, useNativeDriver: true })
      .start(() => { setIsProfileOpen(false); navigation.navigate(route); });
  };

  const handleClose = () => {
    Animated.timing(slideAnim, { toValue: -DRAWER_WIDTH, duration: 200, useNativeDriver: true })
      .start(() => setIsProfileOpen(false));
  };

  // ─── Open edit modal — populate local state ─────────────────────
  const openEdit = async () => {
    setEditName(username  || '');
    setEditGoal(userGoal  || '');
    setEditGender(gender  || '');
    setEditAge(age        ? String(age)    : '');
    setEditHeight(height  ? String(height) : '');
    setEditMeal(mealPreference || '');
    setEditTz(timezone    || '');

    // Load this month's timezone change count
    try {
      const monthKey = `tz_changes_${new Date().toISOString().slice(0, 7)}`; // e.g. "2026-07"
      const stored   = await AsyncStorage.getItem(monthKey);
      setTzChangesThisMonth(stored ? parseInt(stored, 10) : 0);
    } catch (_) {
      setTzChangesThisMonth(0);
    }

    setIsEditOpen(true);
  };

  // ─── Timezone change with limit guard ──────────────────────────
  const handleTimezoneSelect = (newTz) => {
    if (newTz === editTz) { setTzPickerOpen(false); return; } // no actual change

    const remaining = MAX_TIMEZONE_CHANGES_PER_MONTH - tzChangesThisMonth;

    if (remaining <= 0) {
      Alert.alert(
        '⏳ Timezone Change Limit Reached',
        'You have already changed your timezone 2 times this month. You can change it again next month.',
        [{ text: 'OK', style: 'default' }]
      );
      setTzPickerOpen(false);
      return;
    }

    const warningMsg = remaining === 1
      ? 'This is your LAST timezone change for this month. After this, you won\'t be able to change it until next month.'
      : `You have ${remaining} timezone change${remaining > 1 ? 's' : ''} remaining this month.`;

    Alert.alert(
      '🌏 Change Timezone?',
      `${warningMsg}\n\nChanging to: ${newTz}`,
      [
        { text: 'Cancel', style: 'cancel', onPress: () => setTzPickerOpen(false) },
        {
          text: 'Confirm Change',
          style: 'default',
          onPress: async () => {
            setEditTz(newTz);
            const newCount = tzChangesThisMonth + 1;
            setTzChangesThisMonth(newCount);
            try {
              const monthKey = `tz_changes_${new Date().toISOString().slice(0, 7)}`;
              await AsyncStorage.setItem(monthKey, String(newCount));
            } catch (_) {}
            setTzPickerOpen(false);
          }
        }
      ]
    );
  };

  // ─── Save edited details ────────────────────────────────────────
  const handleSave = async () => {
    if (!editName.trim()) {
      Alert.alert('Validation', 'Name cannot be empty.'); return;
    }
    if (editAge && isNaN(parseInt(editAge, 10))) {
      Alert.alert('Validation', 'Age must be a number.'); return;
    }
    if (editHeight && isNaN(parseFloat(editHeight))) {
      Alert.alert('Validation', 'Height must be a number.'); return;
    }

    setSaving(true);
    try {
      // Update context — call setUserGoal + update AsyncStorage session
      if (editGoal !== userGoal) setUserGoal(editGoal);

      // Persist the updated profile to AsyncStorage (local only for now)
      const session = await AsyncStorage.getItem('sbm_user_session');
      if (session) {
        const parsed = JSON.parse(session);
        const updatedDetails = {
          ...parsed.details,
          userGoal:       editGoal,
          gender:         editGender,
          age:            editAge,
          height:         editHeight,
          mealPreference: editMeal,
          timezone:       editTz,
        };
        await AsyncStorage.setItem('sbm_user_session', JSON.stringify({
          ...parsed,
          name:    editName,
          details: updatedDetails,
        }));
      }

      Alert.alert('✅ Profile Updated', 'Your details have been saved successfully.', [
        { text: 'OK', onPress: () => setIsEditOpen(false) }
      ]);
    } catch (err) {
      Alert.alert('Error', 'Could not save your changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const tzRemaining = MAX_TIMEZONE_CHANGES_PER_MONTH - tzChangesThisMonth;

  // ─── Render ─────────────────────────────────────────────────────
  return (
    <>
      <Modal transparent visible={isProfileOpen} onRequestClose={handleClose} animationType="none">
        <View style={[styles.overlay, isWebDesktop && styles.webOverlay]}>
          {/* Drawer */}
          <Animated.View style={[styles.drawerContainer, { width: DRAWER_WIDTH, transform: [{ translateX: slideAnim }] }]}>

            {/* Header row */}
            <View style={styles.drawerHeader}>
              <Text style={styles.drawerTitle}>Navigation Menu</Text>
              <TouchableOpacity style={styles.drawerCloseBtn} onPress={handleClose}>
                <X size={20} color={theme.colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>

              {/* Avatar + name row + Edit button */}
              <View style={styles.drawerAvatarSection}>
                <LinearGradient
                  colors={theme.colors.gradients.avatar}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                  style={styles.drawerAvatarCircle}
                >
                  <Text style={styles.avatarText}>{initialLetter}</Text>
                </LinearGradient>

                <View style={[styles.avatarMetaInfo, { flex: 1 }]}>
                  <Text style={styles.drawerUsername}>{username}</Text>
                  <Text style={styles.drawerUseridBadge}>{userId}</Text>
                </View>

                {/* ✏️ Edit Profile Button */}
                <TouchableOpacity style={editBtnStyle.btn} activeOpacity={0.8} onPress={openEdit}>
                  <Pencil size={14} color="#B085F5" />
                </TouchableOpacity>
              </View>

              <View style={styles.drawerSectionDivider} />

              {/* Navigation */}
              <View style={styles.drawerNavSection}>
                <Text style={styles.drawerSectionLabel}>Main Pages</Text>
                <View style={styles.drawerNavList}>
                  {menuItems.map((item) => {
                    const isActive  = activeRoute === item.route;
                    const iconColor = isActive ? '#B085F5' : theme.colors.textSecondary;
                    return (
                      <TouchableOpacity
                        key={item.route}
                        activeOpacity={0.7}
                        style={[styles.drawerNavItem, isActive && styles.activeNavItem]}
                        onPress={() => handleNavClick(item.route)}
                      >
                        <View style={styles.navItemIcon}>{item.icon(iconColor)}</View>
                        <Text style={[styles.navItemLabel, isActive && styles.activeNavLabel]}>{item.label}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              <View style={styles.drawerSectionDivider} />

              {/* Account Details */}
              <View style={styles.drawerDetailsSection}>
                <Text style={styles.drawerSectionLabel}>Account Details</Text>
                <View style={styles.drawerDetailsCard}>
                  <DetailRow icon={<Mail     size={14} color={theme.colors.textMuted} />} label="Email"                  value={userEmail} />
                  <DetailRow icon={<Scale    size={14} color={theme.colors.textMuted} />} label="Weight / Goal"          value={`${loggedWeight} kg (${userGoal})`} />
                  <DetailRow icon={<User     size={14} color={theme.colors.textMuted} />} label="Gender / Age / Height"  value={`${gender} / ${age} yrs / ${height} cm`} />
                  <DetailRow icon={<Activity size={14} color={theme.colors.textMuted} />} label="Dietary Preference"     value={mealPreference} />
                  <DetailRow icon={<Globe    size={14} color={theme.colors.textMuted} />} label="Time Zone"              value={timezone} isLast />
                </View>
              </View>
            </ScrollView>

            {/* Logout */}
            <View style={styles.drawerActionContainer}>
              <TouchableOpacity activeOpacity={0.8} style={styles.drawerLogoutBtn} onPress={logoutUser}>
                <LogOut size={16} color="#FF5252" />
                <Text style={styles.logoutText}>Log Out Session</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* Backdrop */}
          <TouchableWithoutFeedback onPress={handleClose}>
            <View style={{ flex: 1 }} />
          </TouchableWithoutFeedback>
        </View>
      </Modal>

      {/* ═══ Edit Profile Modal ═══════════════════════════════════════ */}
      <Modal visible={isEditOpen} transparent animationType="slide" onRequestClose={() => setIsEditOpen(false)}>
        <View style={editStyles.overlay}>
          <View style={editStyles.sheet}>
            {/* Header */}
            <View style={editStyles.header}>
              <View>
                <Text style={editStyles.title}>Edit Profile</Text>
                <Text style={editStyles.subtitle}>Update your personal details</Text>
              </View>
              <TouchableOpacity onPress={() => setIsEditOpen(false)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <X size={20} color="rgba(255,255,255,0.6)" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>

              {/* Name */}
              <EditFieldGroup label="Full Name" icon={<User size={14} color="#B085F5" />}>
                <TextInput
                  style={editStyles.textInput}
                  value={editName}
                  onChangeText={setEditName}
                  placeholder="Your name"
                  placeholderTextColor="rgba(255,255,255,0.25)"
                  autoCapitalize="words"
                />
              </EditFieldGroup>

              {/* Goal */}
              <EditFieldGroup label="Goal" icon={<Activity size={14} color="#B085F5" />}>
                <TouchableOpacity style={editStyles.pickerRow} activeOpacity={0.8} onPress={() => setGoalPickerOpen(true)}>
                  <Text style={editStyles.pickerRowText}>{editGoal || 'Select Goal'}</Text>
                  <ChevronDown size={14} color="rgba(255,255,255,0.4)" />
                </TouchableOpacity>
              </EditFieldGroup>

              {/* Gender */}
              <EditFieldGroup label="Gender" icon={<User size={14} color="#B085F5" />}>
                <TouchableOpacity style={editStyles.pickerRow} activeOpacity={0.8} onPress={() => setGenderPickerOpen(true)}>
                  <Text style={editStyles.pickerRowText}>{editGender || 'Select Gender'}</Text>
                  <ChevronDown size={14} color="rgba(255,255,255,0.4)" />
                </TouchableOpacity>
              </EditFieldGroup>

              {/* Age + Height — side by side */}
              <View style={editStyles.rowGroup}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <EditFieldGroup label="Age (yrs)" icon={<User size={14} color="#B085F5" />}>
                    <TextInput
                      style={editStyles.textInput}
                      value={editAge}
                      onChangeText={v => setEditAge(v.replace(/[^0-9]/g, ''))}
                      placeholder="e.g. 28"
                      placeholderTextColor="rgba(255,255,255,0.25)"
                      keyboardType="number-pad"
                    />
                  </EditFieldGroup>
                </View>
                <View style={{ flex: 1 }}>
                  <EditFieldGroup label="Height (cm)" icon={<Scale size={14} color="#B085F5" />}>
                    <TextInput
                      style={editStyles.textInput}
                      value={editHeight}
                      onChangeText={v => setEditHeight(v.replace(/[^0-9.]/g, ''))}
                      placeholder="e.g. 175"
                      placeholderTextColor="rgba(255,255,255,0.25)"
                      keyboardType="decimal-pad"
                    />
                  </EditFieldGroup>
                </View>
              </View>

              {/* Dietary Preference */}
              <EditFieldGroup label="Dietary Preference" icon={<Activity size={14} color="#B085F5" />}>
                <TouchableOpacity style={editStyles.pickerRow} activeOpacity={0.8} onPress={() => setMealPickerOpen(true)}>
                  <Text style={editStyles.pickerRowText}>{editMeal || 'Select Diet'}</Text>
                  <ChevronDown size={14} color="rgba(255,255,255,0.4)" />
                </TouchableOpacity>
              </EditFieldGroup>

              {/* Timezone — with limit badge */}
              <EditFieldGroup
                label="Time Zone"
                icon={<Globe size={14} color="#B085F5" />}
                badge={
                  <View style={[editStyles.tzBadge, tzRemaining === 0 && editStyles.tzBadgeRed]}>
                    <AlertTriangle size={9} color={tzRemaining === 0 ? '#FF5252' : '#FFD600'} />
                    <Text style={[editStyles.tzBadgeText, tzRemaining === 0 && { color: '#FF5252' }]}>
                      {tzRemaining === 0 ? 'Limit reached' : `${tzRemaining} change${tzRemaining !== 1 ? 's' : ''} left this month`}
                    </Text>
                  </View>
                }
              >
                <TouchableOpacity
                  style={[editStyles.pickerRow, tzRemaining === 0 && editStyles.pickerRowDisabled]}
                  activeOpacity={0.8}
                  onPress={() => { if (tzRemaining > 0) setTzPickerOpen(true); else handleTimezoneSelect('__blocked__'); }}
                >
                  <Text style={[editStyles.pickerRowText, tzRemaining === 0 && { color: 'rgba(255,255,255,0.3)' }]} numberOfLines={1}>
                    {editTz || 'Select Timezone'}
                  </Text>
                  <ChevronDown size={14} color={tzRemaining === 0 ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.4)'} />
                </TouchableOpacity>
              </EditFieldGroup>

            </ScrollView>

            {/* Save button */}
            <TouchableOpacity
              style={[editStyles.saveBtn, saving && { opacity: 0.7 }]}
              activeOpacity={0.85}
              onPress={handleSave}
              disabled={saving}
            >
              {saving
                ? <ActivityIndicator size="small" color="#FFFFFF" />
                : <Text style={editStyles.saveBtnText}>Save Changes</Text>
              }
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Pickers (rendered outside the scroll to avoid clipping) */}
      <BottomPicker visible={goalPickerOpen}   title="Select Goal"               options={GOAL_OPTIONS}     selectedValue={editGoal}   onSelect={setEditGoal}           onClose={() => setGoalPickerOpen(false)} />
      <BottomPicker visible={genderPickerOpen} title="Select Gender"             options={GENDER_OPTIONS}   selectedValue={editGender} onSelect={setEditGender}         onClose={() => setGenderPickerOpen(false)} />
      <BottomPicker visible={mealPickerOpen}   title="Select Dietary Preference" options={MEAL_OPTIONS}     selectedValue={editMeal}   onSelect={setEditMeal}           onClose={() => setMealPickerOpen(false)} />
      <BottomPicker visible={tzPickerOpen}     title="Select Time Zone"          options={TIMEZONE_OPTIONS} selectedValue={editTz}     onSelect={handleTimezoneSelect}  onClose={() => setTzPickerOpen(false)} />
    </>
  );
};

// ─── Small helper components ──────────────────────────────────────────────────
const DetailRow = ({ icon, label, value, isLast }) => (
  <View style={[detailRowStyle.row, !isLast && detailRowStyle.border]}>
    <View style={detailRowStyle.iconWrap}>{icon}</View>
    <View style={{ flex: 1 }}>
      <Text style={detailRowStyle.label}>{label}</Text>
      <Text style={detailRowStyle.value} numberOfLines={1}>{value}</Text>
    </View>
  </View>
);
const detailRowStyle = {
  row:    { flexDirection: 'row', alignItems: 'center', paddingVertical: 9 },
  border: { borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.04)' },
  iconWrap: { marginRight: 10 },
  label:  { fontSize: 9,  color: 'rgba(255,255,255,0.4)', fontWeight: '600' },
  value:  { fontSize: 12, color: 'rgba(255,255,255,0.75)', fontWeight: '500', marginTop: 1 },
};

const EditFieldGroup = ({ label, icon, badge, children }) => (
  <View style={efgStyle.group}>
    <View style={efgStyle.labelRow}>
      <View style={efgStyle.labelIcon}>{icon}</View>
      <Text style={efgStyle.label}>{label}</Text>
      {badge && <View style={{ marginLeft: 8 }}>{badge}</View>}
    </View>
    {children}
  </View>
);
const efgStyle = {
  group:    { marginBottom: 14 },
  labelRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  labelIcon:{ marginRight: 6 },
  label:    { fontSize: 11, color: 'rgba(255,255,255,0.55)', fontWeight: '600' },
};

// ─── Inline styles for the edit pencil button ─────────────────────────────────
const editBtnStyle = {
  btn: {
    width: 34, height: 34, borderRadius: 10,
    backgroundColor: 'rgba(176,133,245,0.12)',
    borderWidth: 1, borderColor: 'rgba(176,133,245,0.30)',
    alignItems: 'center', justifyContent: 'center',
  },
};

// ─── Edit modal styles ────────────────────────────────────────────────────────
const editStyles = {
  overlay:      { flex: 1, backgroundColor: 'rgba(0,0,0,0.72)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: '#0D1120',
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingHorizontal: 20, paddingTop: 20, paddingBottom: 32,
    maxHeight: '90%',
    borderTopWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
  },
  header:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  title:    { fontSize: 18, fontWeight: '800', color: '#FFFFFF' },
  subtitle: { fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2, fontWeight: '500' },

  textInput: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.09)',
    borderRadius: 10, height: 44,
    paddingHorizontal: 14,
    color: '#FFFFFF', fontSize: 13, fontWeight: '500',
  },
  pickerRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.09)',
    borderRadius: 10, height: 44, paddingHorizontal: 14,
  },
  pickerRowDisabled: { borderColor: 'rgba(255,255,255,0.04)', backgroundColor: 'rgba(255,255,255,0.02)' },
  pickerRowText: { fontSize: 13, color: '#FFFFFF', fontWeight: '500', flex: 1 },

  rowGroup: { flexDirection: 'row' },

  tzBadge: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,214,0,0.12)',
    borderRadius: 6, paddingHorizontal: 6, paddingVertical: 3,
  },
  tzBadgeRed: { backgroundColor: 'rgba(255,82,82,0.12)' },
  tzBadgeText: { fontSize: 9, color: '#FFD600', fontWeight: '700', marginLeft: 3 },

  saveBtn: {
    backgroundColor: '#B085F5',
    borderRadius: 14, height: 50,
    alignItems: 'center', justifyContent: 'center',
    marginTop: 20,
    shadowColor: '#7C4DFF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  saveBtnText: { fontSize: 15, fontWeight: '800', color: '#FFFFFF', letterSpacing: 0.3 },
};

export default ProfileDrawer;
