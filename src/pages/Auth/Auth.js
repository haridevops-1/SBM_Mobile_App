import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Modal } from 'react-native';
import { Mail, Lock, User as UserIcon, Scale, Sparkles, Calendar, Globe, Utensils, Ruler, ChevronDown, X, Users, Activity } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useUser } from '../../context/UserContext';
import theme from '../../theme/theme';
import styles from '../../styles/pages/Auth.styles';

const GENDER_OPTIONS = ['Male', 'Female', 'Other'];
const MEAL_OPTIONS = ['Veg', 'Non-Veg'];
const GOAL_OPTIONS = ['Weight Loss', 'Weight Gain', 'Maintenance', 'Habit Building'];
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
  'Netherlands (CET - UTC+1)'
];

// Reusable Custom Bottom Sheet Picker Component
const CustomPicker = ({ visible, title, options, selectedValue, onSelect, onClose }) => {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.pickerModalOverlay}>
        <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={onClose} />
        <View style={styles.pickerModalContent}>
          <View style={styles.pickerModalHeader}>
            <Text style={styles.pickerModalTitle}>{title}</Text>
            <TouchableOpacity onPress={onClose} style={{ padding: 4 }}>
              <X size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.pickerModalList}>
            {options.map((opt) => {
              const isSelected = selectedValue === opt;
              return (
                <TouchableOpacity 
                  key={opt} 
                  activeOpacity={0.8}
                  style={[styles.pickerModalOption, isSelected && styles.pickerModalOptionActive]}
                  onPress={() => {
                    onSelect(opt);
                    onClose();
                  }}
                >
                  <Text style={[styles.pickerModalOptionText, isSelected && styles.pickerModalOptionTextActive]}>
                    {opt}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export const Auth = () => {
  const { loginUser } = useUser();
  const [isLogin, setIsLogin] = useState(true);

  // Core Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  
  // Custom Registration states
  const [gender, setGender] = useState('Select Gender');
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [mealPreference, setMealPreference] = useState('Select Diet');
  const [timezone, setTimezone] = useState('Select Time Zone');
  const [goal, setGoal] = useState('Select Goal');

  // Modal Open states
  const [genderOpen, setGenderOpen] = useState(false);
  const [mealOpen, setMealOpen] = useState(false);
  const [timezoneOpen, setTimezoneOpen] = useState(false);
  const [goalOpen, setGoalOpen] = useState(false);

  // Field Validation errors
  const [errors, setErrors] = useState({});

  // Input Sanitization helpers
  const handleAgeChange = (text) => {
    const sanitized = text.replace(/[^0-9]/g, '');
    setAge(sanitized);
  };

  const handleHeightChange = (text) => {
    const sanitized = text.replace(/[^0-9.]/g, '');
    const parts = sanitized.split('.');
    if (parts.length > 2) {
      setHeight(parts[0] + '.' + parts.slice(1).join(''));
    } else {
      setHeight(sanitized);
    }
  };

  const handleWeightChange = (text) => {
    const sanitized = text.replace(/[^0-9.]/g, '');
    const parts = sanitized.split('.');
    if (parts.length > 2) {
      setWeight(parts[0] + '.' + parts.slice(1).join(''));
    } else {
      setWeight(sanitized);
    }
  };

  const validateForm = () => {
    let tempErrors = {};

    if (isLogin) {
      if (!email.trim()) {
        tempErrors.email = "Email is required";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        tempErrors.email = "Invalid email format";
      }

      if (!password) {
        tempErrors.password = "Password is required";
      }
    } else {
      // Signup validations
      if (!name.trim()) {
        tempErrors.name = "Name is required";
      } else if (name.trim().length < 2) {
        tempErrors.name = "Name must be at least 2 characters";
      }

      if (!email.trim()) {
        tempErrors.email = "Email is required";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        tempErrors.email = "Invalid email format";
      }

      if (!password) {
        tempErrors.password = "Password is required";
      } else if (password.length < 6) {
        tempErrors.password = "Password must be at least 6 characters";
      }

      // Gender Selection
      if (gender === 'Select Gender') {
        tempErrors.gender = "Please select gender";
      }

      // Age validations
      const ageNum = parseInt(age, 10);
      if (!age) {
        tempErrors.age = "Age is required";
      } else if (isNaN(ageNum) || ageNum < 12 || ageNum > 100) {
        tempErrors.age = "Age must be 12 to 100";
      }

      // Height validations
      const heightNum = parseFloat(height);
      if (!height) {
        tempErrors.height = "Height is required";
      } else if (isNaN(heightNum) || heightNum < 100 || heightNum > 250) {
        tempErrors.height = "Height must be 100 to 250 cm";
      }

      // Weight validations
      const weightNum = parseFloat(weight);
      if (!weight) {
        tempErrors.weight = "Weight is required";
      } else if (isNaN(weightNum) || weightNum < 30 || weightNum > 300) {
        tempErrors.weight = "Weight must be 30 to 300 kg";
      }

      // Meal preference selection
      if (mealPreference === 'Select Diet') {
        tempErrors.mealPreference = "Please select preference";
      }

      // Weight Goal Selection
      if (goal === 'Select Goal') {
        tempErrors.goal = "Please select goal";
      }

      // Timezone Selection
      if (timezone === 'Select Time Zone') {
        tempErrors.timezone = "Please select timezone";
      }
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      if (isLogin) {
        const computedName = email.split('@')[0];
        const formattedName = computedName.charAt(0).toUpperCase() + computedName.slice(1);
        loginUser(formattedName, '75.0', { email });
      } else {
        loginUser(name, weight, {
          email,
          gender,
          age,
          height,
          mealPreference,
          timezone,
          userGoal: goal
        });
      }
    }
  };

  const handleToggleMode = () => {
    setIsLogin(!isLogin);
    setErrors({});
    
    // Clear inputs
    setName('');
    setEmail('');
    setPassword('');
    setGender('Select Gender');
    setAge('');
    setHeight('');
    setWeight('');
    setMealPreference('Select Diet');
    setTimezone('Select Time Zone');
    setGoal('Select Goal');
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        {/* Background glowing decorations */}
        <View style={styles.glowPurple} />
        <View style={styles.glowBlue} />

        <View style={styles.authCard}>
          {/* Brand Logo Header */}
          <View style={styles.brandHeader}>
            <View style={styles.brandLogoRing}>
              <Sparkles size={22} color="white" />
            </View>
            <Text style={styles.brandTitle}>SLOW BURN METHOD</Text>
            <Text style={styles.brandTagline}>Transform your body. Train your mind.</Text>
          </View>

          {/* Section Header */}
          <Text style={styles.authSectionTitle}>{isLogin ? 'Welcome Back' : 'Create Account'}</Text>
          <Text style={styles.authSectionDesc}>
            {isLogin 
              ? 'Sign in to access your custom tracking dashboard.' 
              : 'Enter your details to generate your SBM health scores.'}
          </Text>

          {/* Form Stack */}
          <View style={styles.formStack}>
            {/* First Name (Only on Signup) */}
            {!isLogin && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>First Name</Text>
                <View style={[styles.inputFieldWrapper, errors.name && { borderColor: '#FF5252' }]}>
                  <UserIcon size={18} color={theme.colors.textSecondary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.authInput}
                    placeholder="Enter your name"
                    placeholderTextColor="#546E7A"
                    value={name}
                    onChangeText={setName}
                  />
                </View>
                {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
              </View>
            )}

            {/* Email Address */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email Address</Text>
              <View style={[styles.inputFieldWrapper, errors.email && { borderColor: '#FF5252' }]}>
                <Mail size={18} color={theme.colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.authInput}
                  placeholder="Enter your email"
                  placeholderTextColor="#546E7A"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>
              {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
            </View>

            {/* Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Password</Text>
              <View style={[styles.inputFieldWrapper, errors.password && { borderColor: '#FF5252' }]}>
                <Lock size={18} color={theme.colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.authInput}
                  placeholder="Enter your password"
                  placeholderTextColor="#546E7A"
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                />
              </View>
              {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
            </View>

            {/* Signup Custom Fields Grid Layout */}
            {!isLogin && (
              <View style={{ width: '100%' }}>
                {/* Gender / Age Row */}
                <View style={styles.signupGridFields}>
                  {/* Gender Selector Dropdown */}
                  <View style={[styles.inputGroup, styles.gridHalf]}>
                    <Text style={styles.inputLabel}>Gender</Text>
                    <TouchableOpacity 
                      activeOpacity={0.8}
                      style={[styles.inputFieldWrapper, errors.gender && { borderColor: '#FF5252' }]}
                      onPress={() => setGenderOpen(true)}
                    >
                      <Users size={18} color={theme.colors.textSecondary} style={styles.inputIcon} />
                      <Text 
                        style={[
                          styles.authInput, 
                          { paddingTop: 12, color: gender === 'Select Gender' ? '#546E7A' : '#ECEFF1' }
                        ]}
                      >
                        {gender}
                      </Text>
                      <ChevronDown size={14} color={theme.colors.textSecondary} />
                    </TouchableOpacity>
                    {errors.gender && <Text style={styles.errorText}>{errors.gender}</Text>}
                  </View>

                  {/* Age Inputs (Number) */}
                  <View style={[styles.inputGroup, styles.gridHalf]}>
                    <Text style={styles.inputLabel}>Age</Text>
                    <View style={[styles.inputFieldWrapper, errors.age && { borderColor: '#FF5252' }]}>
                      <Calendar size={18} color={theme.colors.textSecondary} style={styles.inputIcon} />
                      <TextInput
                        style={styles.authInput}
                        placeholder="Enter age"
                        placeholderTextColor="#546E7A"
                        keyboardType="number-pad"
                        value={age}
                        onChangeText={handleAgeChange}
                      />
                    </View>
                    {errors.age && <Text style={styles.errorText}>{errors.age}</Text>}
                  </View>
                </View>

                {/* Height / Weight Row */}
                <View style={styles.signupGridFields}>
                  {/* Height Input (Number) */}
                  <View style={[styles.inputGroup, styles.gridHalf]}>
                    <Text style={styles.inputLabel}>Current Height</Text>
                    <View style={[styles.inputFieldWrapper, errors.height && { borderColor: '#FF5252' }]}>
                      <Ruler size={18} color={theme.colors.textSecondary} style={styles.inputIcon} />
                      <TextInput
                        style={styles.authInput}
                        placeholder="Enter height"
                        placeholderTextColor="#546E7A"
                        keyboardType="numeric"
                        value={height}
                        onChangeText={handleHeightChange}
                      />
                      <Text style={styles.unitLabel}>cm</Text>
                    </View>
                    {errors.height && <Text style={styles.errorText}>{errors.height}</Text>}
                  </View>

                  {/* Weight Input (Number) */}
                  <View style={[styles.inputGroup, styles.gridHalf]}>
                    <Text style={styles.inputLabel}>Current Weight</Text>
                    <View style={[styles.inputFieldWrapper, errors.weight && { borderColor: '#FF5252' }]}>
                      <Scale size={18} color={theme.colors.textSecondary} style={styles.inputIcon} />
                      <TextInput
                        style={styles.authInput}
                        placeholder="Enter weight"
                        placeholderTextColor="#546E7A"
                        keyboardType="numeric"
                        value={weight}
                        onChangeText={handleWeightChange}
                      />
                      <Text style={styles.unitLabel}>kg</Text>
                    </View>
                    {errors.weight && <Text style={styles.errorText}>{errors.weight}</Text>}
                  </View>
                </View>

                {/* Meal Preference / Goal Row */}
                <View style={styles.signupGridFields}>
                  {/* Meal Preference Dropdown */}
                  <View style={[styles.inputGroup, styles.gridHalf]}>
                    <Text style={styles.inputLabel}>Meal Preference</Text>
                    <TouchableOpacity 
                      activeOpacity={0.8}
                      style={[styles.inputFieldWrapper, errors.mealPreference && { borderColor: '#FF5252' }]}
                      onPress={() => setMealOpen(true)}
                    >
                      <Utensils size={18} color={theme.colors.textSecondary} style={styles.inputIcon} />
                      <Text 
                        style={[
                          styles.authInput, 
                          { paddingTop: 12, color: mealPreference === 'Select Diet' ? '#546E7A' : '#ECEFF1' }
                        ]}
                      >
                        {mealPreference}
                      </Text>
                      <ChevronDown size={14} color={theme.colors.textSecondary} />
                    </TouchableOpacity>
                    {errors.mealPreference && <Text style={styles.errorText}>{errors.mealPreference}</Text>}
                  </View>

                  {/* Weight Goal Selector Dropdown */}
                  <View style={[styles.inputGroup, styles.gridHalf]}>
                    <Text style={styles.inputLabel}>Weight Goal</Text>
                    <TouchableOpacity 
                      activeOpacity={0.8}
                      style={[styles.inputFieldWrapper, errors.goal && { borderColor: '#FF5252' }]}
                      onPress={() => setGoalOpen(true)}
                    >
                      <Activity size={18} color={theme.colors.textSecondary} style={styles.inputIcon} />
                      <Text 
                        style={[
                          styles.authInput, 
                          { paddingTop: 12, color: goal === 'Select Goal' ? '#546E7A' : '#ECEFF1' }
                        ]}
                      >
                        {goal}
                      </Text>
                      <ChevronDown size={14} color={theme.colors.textSecondary} />
                    </TouchableOpacity>
                    {errors.goal && <Text style={styles.errorText}>{errors.goal}</Text>}
                  </View>
                </View>

                {/* Timezone (List of 20 countries) */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Time Zone</Text>
                  <TouchableOpacity 
                    activeOpacity={0.8}
                    style={[styles.inputFieldWrapper, errors.timezone && { borderColor: '#FF5252' }]}
                    onPress={() => setTimezoneOpen(true)}
                  >
                    <Globe size={18} color={theme.colors.textSecondary} style={styles.inputIcon} />
                    <Text 
                      style={[
                        styles.authInput, 
                        { paddingTop: 12, color: timezone === 'Select Time Zone' ? '#546E7A' : '#ECEFF1' }
                      ]} 
                      numberOfLines={1}
                    >
                      {timezone}
                    </Text>
                    <ChevronDown size={14} color={theme.colors.textSecondary} />
                  </TouchableOpacity>
                  {errors.timezone && <Text style={styles.errorText}>{errors.timezone}</Text>}
                </View>
              </View>
            )}

            {/* Submit Action Button */}
            <View style={styles.submitBtnContainer}>
              <LinearGradient
                colors={theme.colors.gradients.purpleButton}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <TouchableOpacity 
                  activeOpacity={0.8} 
                  style={styles.submitBtn} 
                  onPress={handleSubmit}
                >
                  <Text style={styles.submitBtnText}>{isLogin ? 'Log In' : 'Sign Up'}</Text>
                </TouchableOpacity>
              </LinearGradient>
            </View>
          </View>

          {/* Switch Screen Mode Link */}
          <View style={styles.toggleLinkRow}>
            <Text style={styles.toggleText}>
              {isLogin ? "Don't have an account? " : "Already have an account? "}
            </Text>
            <TouchableOpacity onPress={handleToggleMode}>
              <Text style={styles.toggleBtnText}>
                {isLogin ? 'Sign Up' : 'Log In'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Gender Picker Bottom Sheet */}
      <CustomPicker
        visible={genderOpen}
        title="Select Gender"
        options={GENDER_OPTIONS}
        selectedValue={gender}
        onSelect={setGender}
        onClose={() => setGenderOpen(false)}
      />

      {/* Meal Preference Picker Bottom Sheet */}
      <CustomPicker
        visible={mealOpen}
        title="Select Diet Preference"
        options={MEAL_OPTIONS}
        selectedValue={mealPreference}
        onSelect={setMealPreference}
        onClose={() => setMealOpen(false)}
      />

      {/* Weight Goal Picker Bottom Sheet */}
      <CustomPicker
        visible={goalOpen}
        title="Select Weight Goal"
        options={GOAL_OPTIONS}
        selectedValue={goal}
        onSelect={setGoal}
        onClose={() => setGoalOpen(false)}
      />

      {/* Timezone Picker Bottom Sheet */}
      <CustomPicker
        visible={timezoneOpen}
        title="Select Country Time Zone"
        options={TIMEZONE_OPTIONS}
        selectedValue={timezone}
        onSelect={setTimezone}
        onClose={() => setTimezoneOpen(false)}
      />
    </KeyboardAvoidingView>
  );
};

export default Auth;
