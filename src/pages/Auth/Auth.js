/**
 * ============================================================================
 * FILE: Auth.js
 * PATH: C:\SBM_Mobile_App\src\pages\Auth\Auth.js
 *
 * PURPOSE:
 * Provides the User Authentication interface (Login & Registration / Sign Up).
 * Handles form validation, user profile onboarding (gender, age, weight, height,
 * meal preference, timezone, and weight goal), and connects directly to Zoho Catalyst
 * serverless endpoints (/login and /signup).
 * ============================================================================
 */

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Alert,
  ActivityIndicator,
  Image,
} from "react-native";
import {
  Mail,
  Lock,
  User as UserIcon,
  Scale,
  Sparkles,
  Calendar,
  Globe,
  Utensils,
  Ruler,
  ChevronDown,
  X,
  Users,
  Activity,
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useUser } from "../../context/UserContext";
import theme from "../../theme/theme";
import styles from "../../styles/pages/Auth.styles";

const APP_PURPLE_LOGO = require("../../assets/app_purple_logo.jpg");

const GENDER_OPTIONS = ["Male", "Female", "Other"];
const MEAL_OPTIONS = ["Veg", "Non-Veg", "Veg + Egg"];
const GOAL_OPTIONS = [
  "Weight Loss",
  "Weight Gain",
  "Maintenance",
  "Habit Building",
];
const TIMEZONE_OPTIONS = [
  "India (IST - UTC+5:30)",
  "United States (EST - UTC-5)",
  "United States (PST - UTC-8)",
  "United Kingdom (GMT - UTC+0)",
  "Australia (AEST - UTC+10)",
  "Singapore (SGT - UTC+8)",
  "Canada (EST - UTC-5)",
  "Germany (CET - UTC+1)",
  "France (CET - UTC+1)",
  "Japan (JST - UTC+9)",
  "South Korea (KST - UTC+9)",
  "New Zealand (NZST - UTC+12)",
  "South Africa (SAST - UTC+2)",
  "Brazil (BRT - UTC-3)",
  "United Arab Emirates (GST - UTC+4)",
  "Saudi Arabia (AST - UTC+3)",
  "Hong Kong (HKT - UTC+8)",
  "Russia (MSK - UTC+3)",
  "Switzerland (CET - UTC+1)",
  "Netherlands (CET - UTC+1)",
];

// Reusable Custom Bottom Sheet Picker Component
const CustomPicker = ({
  visible,
  title,
  options,
  selectedValue,
  onSelect,
  onClose,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.pickerModalOverlay}>
        <TouchableOpacity
          style={{ flex: 1 }}
          activeOpacity={1}
          onPress={onClose}
        />
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
                  style={[
                    styles.pickerModalOption,
                    isSelected && styles.pickerModalOptionActive,
                  ]}
                  onPress={() => {
                    onSelect(opt);
                    onClose();
                  }}
                >
                  <Text
                    style={[
                      styles.pickerModalOptionText,
                      isSelected && styles.pickerModalOptionTextActive,
                    ]}
                  >
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
  const [loading, setLoading] = useState(false);

  // Core Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  // Custom Registration states
  const [gender, setGender] = useState("Select Gender");
  const [age, setAge] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [mealPreference, setMealPreference] = useState("Select Diet");
  const [timezone, setTimezone] = useState("Select Time Zone");
  const [goal, setGoal] = useState("Select Goal");

  // Modal Open states
  const [genderOpen, setGenderOpen] = useState(false);
  const [mealOpen, setMealOpen] = useState(false);
  const [timezoneOpen, setTimezoneOpen] = useState(false);
  const [goalOpen, setGoalOpen] = useState(false);

  // Field Validation errors
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [showSignupSuccessModal, setShowSignupSuccessModal] = useState(false);

  // Helper function to detect local device time zone and match against options
  const getAutoDetectedTimezone = () => {
    try {
      const userTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (userTz) {
        const lowerTz = userTz.toLowerCase();
        let matched = TIMEZONE_OPTIONS.find((opt) =>
          opt.toLowerCase().includes(lowerTz),
        );

        if (!matched) {
          if (
            lowerTz.includes("asia/kolkata") ||
            lowerTz.includes("calcutta") ||
            lowerTz.includes("india")
          ) {
            matched = "India (IST - UTC+5:30)";
          } else if (
            lowerTz.includes("america/new_york") ||
            lowerTz.includes("eastern")
          ) {
            matched = "United States (EST - UTC-5)";
          } else if (
            lowerTz.includes("america/los_angeles") ||
            lowerTz.includes("pacific")
          ) {
            matched = "United States (PST - UTC-8)";
          } else if (lowerTz.includes("europe/london")) {
            matched = "United Kingdom (GMT - UTC+0)";
          } else if (lowerTz.includes("asia/tokyo")) {
            matched = "Japan (JST - UTC+9)";
          } else if (lowerTz.includes("australia")) {
            matched = "Australia (AEST - UTC+10)";
          } else if (
            lowerTz.includes("dubai") ||
            lowerTz.includes("asia/dubai")
          ) {
            matched = "United Arab Emirates (GST - UTC+4)";
          }
        }

        return matched || userTz;
      }
    } catch (e) {
      console.log("Auto timezone detect error:", e);
    }
    return "India (IST - UTC+5:30)"; // Standard default fallback
  };

  // Auto-detect user's device/location timezone on component mount
  useEffect(() => {
    const detected = getAutoDetectedTimezone();
    if (detected) {
      setTimezone(detected);
    }
  }, []);

  // Clear inputs on mount to combat browser autofill caching
  useEffect(() => {
    const timer = setTimeout(() => {
      setEmail("");
      setPassword("");
    }, 200);
    return () => clearTimeout(timer);
  }, []);

  // Input Sanitization helpers
  const handleAgeChange = (text) => {
    const sanitized = text.replace(/[^0-9]/g, "");
    setAge(sanitized);
  };

  const handleHeightChange = (text) => {
    const sanitized = text.replace(/[^0-9.]/g, "");
    const parts = sanitized.split(".");
    if (parts.length > 2) {
      setHeight(parts[0] + "." + parts.slice(1).join(""));
    } else {
      setHeight(sanitized);
    }
  };

  const handleWeightChange = (text) => {
    const sanitized = text.replace(/[^0-9.]/g, "");
    const parts = sanitized.split(".");
    if (parts.length > 2) {
      setWeight(parts[0] + "." + parts.slice(1).join(""));
    } else {
      setWeight(sanitized);
    }
  };

  const validateForm = () => {
    let tempErrors = {};

    if (isLogin) {
      if (!email.trim()) {
        tempErrors.email = "Please enter your email address.";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        tempErrors.email =
          "Please enter a valid email format (e.g. user@example.com).";
      }

      if (!password) {
        tempErrors.password = "Please enter your password.";
      } else if (password.length < 6) {
        tempErrors.password = "Password must be at least 6 characters.";
      }
    } else {
      // Signup validations
      if (!name.trim()) {
        tempErrors.name = "Please enter your first name.";
      } else if (name.trim().length < 2) {
        tempErrors.name = "First name must be at least 2 characters.";
      }

      if (!email.trim()) {
        tempErrors.email = "Please enter your email address.";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        tempErrors.email =
          "Please enter a valid email format (e.g. user@example.com).";
      }

      if (!password) {
        tempErrors.password = "Please enter a password.";
      } else if (password.length < 6) {
        tempErrors.password =
          "Password must be at least 6 characters for security.";
      }

      // Gender Selection
      if (gender === "Select Gender") {
        tempErrors.gender = "Please select your gender.";
      }

      // Age validations
      const ageNum = parseInt(age, 10);
      if (!age) {
        tempErrors.age = "Please enter your age.";
      } else if (isNaN(ageNum) || ageNum < 12 || ageNum > 100) {
        tempErrors.age = "Age must be between 12 and 100 years.";
      }

      // Height validations
      const heightNum = parseFloat(height);
      if (!height) {
        tempErrors.height = "Please enter your height.";
      } else if (isNaN(heightNum) || heightNum < 100 || heightNum > 250) {
        tempErrors.height = "Height must be between 100 and 250 cm.";
      }

      // Weight validations
      const weightNum = parseFloat(weight);
      if (!weight) {
        tempErrors.weight = "Please enter your weight.";
      } else if (isNaN(weightNum) || weightNum < 30 || weightNum > 300) {
        tempErrors.weight = "Weight must be between 30 and 300 kg.";
      }

      // Meal preference selection
      if (mealPreference === "Select Diet") {
        tempErrors.mealPreference = "Please select dietary preference.";
      }

      // Weight Goal Selection
      if (goal === "Select Goal") {
        tempErrors.goal = "Please select your weight goal.";
      }

      // Timezone Selection
      if (timezone === "Select Time Zone") {
        tempErrors.timezone = "Please select your timezone.";
      }
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleLoginAPI = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        "https://sbm-mobile-app-906714478.development.catalystserverless.com/server/sbm_mobile_app_function/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "text/plain",
          },
          body: JSON.stringify({
            email: email.trim(),
            password: password,
          }),
        },
      );

      const data = await response.json();
      if (response.status === 200 && data.status === "success") {
        setSuccessMessage(
          `Login successful! Welcome back, ${data.user.name || "User"}! 🎉`,
        );

        const goalVal =
          data.user.Weight_Goal ||
          data.user.weight_goal ||
          data.user.userGoal ||
          "Weight Loss";

        setTimeout(() => {
          loginUser(data.user.name, data.user.weight || "75.0", {
            email: data.user.email,
            userId: data.user.id,
            token: data.token,
            gender: data.user.gender,
            age: data.user.age,
            height: data.user.height,
            mealPreference: data.user.meal_preference,
            timezone: data.user.timezone,
            Weight_Goal: goalVal,
          });
          setSuccessMessage("");
          setEmail("");
          setPassword("");
          setErrors({});
        }, 1500);
      } else {
        Alert.alert(
          "Login Failed",
          data.message || "Invalid email or password.",
        );
      }
    } catch (err) {
      Alert.alert(
        "Connection Error",
        "Unable to reach Catalyst servers. Please check your internet connection.",
      );
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSignupAPI = async () => {
    setLoading(true);
    try {
      // Ensure timezone is auto-captured if left unselected
      const finalTz =
        timezone && timezone !== "Select Time Zone"
          ? timezone
          : getAutoDetectedTimezone();

      const payload = {
        email: email.trim(),
        password: password,
        name: name.trim(),
        gender: gender,
        age: Number(age),
        weight: Number(weight),
        height: Number(height) || 0.0,
        meal_preference: mealPreference,
        timezone: finalTz,
        Weight_Goal: goal,
        device_platform: Platform.OS,
      };

      const response = await fetch(
        "https://sbm-mobile-app-906714478.development.catalystserverless.com/server/sbm_mobile_app_function/signup",
        {
          method: "POST",
          headers: {
            "Content-Type": "text/plain",
          },
          body: JSON.stringify(payload),
        },
      );

      const data = await response.json();
      if (response.status === 201 && data.status === "success") {
        setShowSignupSuccessModal(true);
      } else {
        Alert.alert(
          "Registration Failed",
          data.message ||
            "Catalyst database rejected the registration request.",
        );
      }
    } catch (err) {
      Alert.alert(
        "Connection Error",
        "Unable to reach Catalyst servers. Please check your internet connection.",
      );
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    if (validateForm()) {
      if (isLogin) {
        handleLoginAPI();
      } else {
        handleSignupAPI();
      }
    }
  };

  const handleToggleMode = () => {
    const nextIsLogin = !isLogin;
    setIsLogin(nextIsLogin);
    setErrors({});

    // Clear inputs
    setName("");
    setEmail("");
    setPassword("");
    setGender("Select Gender");
    setAge("");
    setHeight("");
    setWeight("");
    setMealPreference("Select Diet");
    setGoal("Select Goal");

    // Auto-detect & pre-fill local timezone whenever entering Signup mode
    if (!nextIsLogin) {
      const detected = getAutoDetectedTimezone();
      setTimezone(detected);
    } else {
      setTimezone("Select Time Zone");
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        {/* Background glowing decorations */}
        <View style={styles.glowPurple} />
        <View style={styles.glowBlue} />

        <View style={styles.authCard}>
          {/* Brand Logo Header */}
          <View style={styles.brandHeader}>
            <View style={styles.brandLogoRing}>
              <Image
                source={APP_PURPLE_LOGO}
                style={styles.brandLogoImage}
                resizeMode="cover"
              />
            </View>
            <Text style={styles.brandTitle}>SLOW BURN METHOD</Text>
            <Text style={styles.brandTagline}>
              Transform your body. Train your mind.
            </Text>
          </View>

          {successMessage ? (
            <View style={styles.successBanner}>
              <Sparkles size={16} color="#4CAF50" style={{ marginRight: 8 }} />
              <Text style={styles.successBannerText}>{successMessage}</Text>
            </View>
          ) : null}

          {/* Section Header */}
          <Text style={styles.authSectionTitle}>
            {isLogin ? "Welcome Back" : "Create Account"}
          </Text>
          <Text style={styles.authSectionDesc}>
            {isLogin
              ? "Sign in to access your custom tracking dashboard."
              : "Enter your details to generate your SBM health scores."}
          </Text>

          {/* Form Stack */}
          <View style={styles.formStack}>
            {/* First Name (Only on Signup) */}
            {!isLogin && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>First Name</Text>
                <View
                  style={[
                    styles.inputFieldWrapper,
                    errors.name && { borderColor: "#FF5252" },
                  ]}
                >
                  <UserIcon
                    size={18}
                    color={theme.colors.textSecondary}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.authInput}
                    placeholder="Enter your name"
                    placeholderTextColor="#546E7A"
                    value={name}
                    onChangeText={setName}
                    editable={!loading}
                  />
                </View>
                {errors.name && (
                  <Text style={styles.errorText}>{errors.name}</Text>
                )}
              </View>
            )}

            {/* Email Address */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email Address</Text>
              <View
                style={[
                  styles.inputFieldWrapper,
                  errors.email && { borderColor: "#FF5252" },
                ]}
              >
                <Mail
                  size={18}
                  color={theme.colors.textSecondary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.authInput}
                  placeholder="Enter your email"
                  placeholderTextColor="#546E7A"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="off"
                  textContentType="none"
                  importantForAutofill="no"
                  value={email}
                  onChangeText={setEmail}
                  editable={!loading}
                />
              </View>
              {errors.email && (
                <Text style={styles.errorText}>{errors.email}</Text>
              )}
            </View>

            {/* Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Password</Text>
              <View
                style={[
                  styles.inputFieldWrapper,
                  errors.password && { borderColor: "#FF5252" },
                ]}
              >
                <Lock
                  size={18}
                  color={theme.colors.textSecondary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.authInput}
                  placeholder="Enter your password"
                  placeholderTextColor="#546E7A"
                  secureTextEntry
                  autoComplete="new-password"
                  textContentType="none"
                  importantForAutofill="no"
                  value={password}
                  onChangeText={setPassword}
                  editable={!loading}
                />
              </View>
              {errors.password && (
                <Text style={styles.errorText}>{errors.password}</Text>
              )}
            </View>

            {/* Signup Custom Fields Grid Layout */}
            {!isLogin && (
              <View style={{ width: "100%" }}>
                {/* Gender / Age Row */}
                <View style={styles.signupGridFields}>
                  {/* Gender Selector Dropdown */}
                  <View style={[styles.inputGroup, styles.gridHalf]}>
                    <Text style={styles.inputLabel}>Gender</Text>
                    <TouchableOpacity
                      activeOpacity={0.8}
                      style={[
                        styles.inputFieldWrapper,
                        errors.gender && { borderColor: "#FF5252" },
                      ]}
                      onPress={() => !loading && setGenderOpen(true)}
                      disabled={loading}
                    >
                      <Users
                        size={18}
                        color={theme.colors.textSecondary}
                        style={styles.inputIcon}
                      />
                      <Text
                        style={[
                          styles.authInput,
                          {
                            paddingTop: 12,
                            color:
                              gender === "Select Gender"
                                ? "#546E7A"
                                : "#ECEFF1",
                          },
                        ]}
                      >
                        {gender}
                      </Text>
                      <ChevronDown
                        size={14}
                        color={theme.colors.textSecondary}
                      />
                    </TouchableOpacity>
                    {errors.gender && (
                      <Text style={styles.errorText}>{errors.gender}</Text>
                    )}
                  </View>

                  {/* Age Inputs (Number) */}
                  <View style={[styles.inputGroup, styles.gridHalf]}>
                    <Text style={styles.inputLabel}>Age</Text>
                    <View
                      style={[
                        styles.inputFieldWrapper,
                        errors.age && { borderColor: "#FF5252" },
                      ]}
                    >
                      <Calendar
                        size={18}
                        color={theme.colors.textSecondary}
                        style={styles.inputIcon}
                      />
                      <TextInput
                        style={styles.authInput}
                        placeholder="Enter age"
                        placeholderTextColor="#546E7A"
                        keyboardType="number-pad"
                        value={age}
                        onChangeText={handleAgeChange}
                        editable={!loading}
                      />
                    </View>
                    {errors.age && (
                      <Text style={styles.errorText}>{errors.age}</Text>
                    )}
                  </View>
                </View>

                {/* Height / Weight Row */}
                <View style={styles.signupGridFields}>
                  {/* Height Input (Number) */}
                  <View style={[styles.inputGroup, styles.gridHalf]}>
                    <Text style={styles.inputLabel}>Current Height</Text>
                    <View
                      style={[
                        styles.inputFieldWrapper,
                        errors.height && { borderColor: "#FF5252" },
                      ]}
                    >
                      <Ruler
                        size={18}
                        color={theme.colors.textSecondary}
                        style={styles.inputIcon}
                      />
                      <TextInput
                        style={styles.authInput}
                        placeholder="Enter height"
                        placeholderTextColor="#546E7A"
                        keyboardType="numeric"
                        value={height}
                        onChangeText={handleHeightChange}
                        editable={!loading}
                      />
                      <Text style={styles.unitLabel}>cm</Text>
                    </View>
                    {errors.height && (
                      <Text style={styles.errorText}>{errors.height}</Text>
                    )}
                  </View>

                  {/* Weight Input (Number) */}
                  <View style={[styles.inputGroup, styles.gridHalf]}>
                    <Text style={styles.inputLabel}>Current Weight</Text>
                    <View
                      style={[
                        styles.inputFieldWrapper,
                        errors.weight && { borderColor: "#FF5252" },
                      ]}
                    >
                      <Scale
                        size={18}
                        color={theme.colors.textSecondary}
                        style={styles.inputIcon}
                      />
                      <TextInput
                        style={styles.authInput}
                        placeholder="Enter weight"
                        placeholderTextColor="#546E7A"
                        keyboardType="numeric"
                        value={weight}
                        onChangeText={handleWeightChange}
                        editable={!loading}
                      />
                      <Text style={styles.unitLabel}>kg</Text>
                    </View>
                    {errors.weight && (
                      <Text style={styles.errorText}>{errors.weight}</Text>
                    )}
                  </View>
                </View>

                {/* Meal Preference / Goal Row */}
                <View style={styles.signupGridFields}>
                  {/* Meal Preference Dropdown */}
                  <View style={[styles.inputGroup, styles.gridHalf]}>
                    <Text style={styles.inputLabel}>Meal Preference</Text>
                    <TouchableOpacity
                      activeOpacity={0.8}
                      style={[
                        styles.inputFieldWrapper,
                        errors.mealPreference && { borderColor: "#FF5252" },
                      ]}
                      onPress={() => !loading && setMealOpen(true)}
                      disabled={loading}
                    >
                      <Utensils
                        size={18}
                        color={theme.colors.textSecondary}
                        style={styles.inputIcon}
                      />
                      <Text
                        style={[
                          styles.authInput,
                          {
                            paddingTop: 12,
                            color:
                              mealPreference === "Select Diet"
                                ? "#546E7A"
                                : "#ECEFF1",
                          },
                        ]}
                      >
                        {mealPreference}
                      </Text>
                      <ChevronDown
                        size={14}
                        color={theme.colors.textSecondary}
                      />
                    </TouchableOpacity>
                    {errors.mealPreference && (
                      <Text style={styles.errorText}>
                        {errors.mealPreference}
                      </Text>
                    )}
                  </View>

                  {/* Weight Goal Selector Dropdown */}
                  <View style={[styles.inputGroup, styles.gridHalf]}>
                    <Text style={styles.inputLabel}>Weight Goal</Text>
                    <TouchableOpacity
                      activeOpacity={0.8}
                      style={[
                        styles.inputFieldWrapper,
                        errors.goal && { borderColor: "#FF5252" },
                      ]}
                      onPress={() => !loading && setGoalOpen(true)}
                      disabled={loading}
                    >
                      <Activity
                        size={18}
                        color={theme.colors.textSecondary}
                        style={styles.inputIcon}
                      />
                      <Text
                        style={[
                          styles.authInput,
                          {
                            paddingTop: 12,
                            color:
                              goal === "Select Goal" ? "#546E7A" : "#ECEFF1",
                          },
                        ]}
                      >
                        {goal}
                      </Text>
                      <ChevronDown
                        size={14}
                        color={theme.colors.textSecondary}
                      />
                    </TouchableOpacity>
                    {errors.goal && (
                      <Text style={styles.errorText}>{errors.goal}</Text>
                    )}
                  </View>
                </View>

                {/* Timezone (List of 20 countries) */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Time Zone</Text>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    style={[
                      styles.inputFieldWrapper,
                      errors.timezone && { borderColor: "#FF5252" },
                    ]}
                    onPress={() => !loading && setTimezoneOpen(true)}
                    disabled={loading}
                  >
                    <Globe
                      size={18}
                      color={theme.colors.textSecondary}
                      style={styles.inputIcon}
                    />
                    <Text
                      style={[
                        styles.authInput,
                        {
                          paddingTop: 12,
                          color:
                            timezone === "Select Time Zone"
                              ? "#546E7A"
                              : "#ECEFF1",
                        },
                      ]}
                      numberOfLines={1}
                    >
                      {timezone}
                    </Text>
                    <ChevronDown size={14} color={theme.colors.textSecondary} />
                  </TouchableOpacity>
                  {errors.timezone && (
                    <Text style={styles.errorText}>{errors.timezone}</Text>
                  )}
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
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.submitBtnText}>
                      {isLogin ? "Log In" : "Sign Up"}
                    </Text>
                  )}
                </TouchableOpacity>
              </LinearGradient>
            </View>
          </View>

          {/* Switch Screen Mode Link */}
          <View style={styles.toggleLinkRow}>
            <Text style={styles.toggleText}>
              {isLogin
                ? "Don't have an account? "
                : "Already have an account? "}
            </Text>
            <TouchableOpacity onPress={handleToggleMode} disabled={loading}>
              <Text style={styles.toggleBtnText}>
                {isLogin ? "Sign Up" : "Log In"}
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

      {/* Signup Success Frozen Screen Modal */}
      <Modal
        visible={showSignupSuccessModal}
        transparent
        animationType="fade"
        statusBarTranslucent
      >
        <View style={styles.successModalOverlay}>
          <View style={styles.successModalCard}>
            <View style={styles.successModalHeaderBadge}>
              <Image
                source={APP_PURPLE_LOGO}
                style={styles.brandLogoImage}
                resizeMode="cover"
              />
            </View>

            <Text style={styles.successModalTitle}>
              Welcome to Slow Burn Method! 🎉
            </Text>

            <Text style={styles.successModalQuote}>
              "Every great transformation begins with a single step. You have
              taken yours today. Consistency is your superpower!" 💪✨
            </Text>

            <Text style={styles.successModalSubtext}>
              Your account has been created successfully. Log in to start
              tracking your progress and transforming your routine.
            </Text>

            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.successModalBtn}
              onPress={() => {
                setShowSignupSuccessModal(false);
                setIsLogin(true);
                setPassword("");
                setErrors({});
              }}
            >
              <LinearGradient
                colors={theme.colors.gradients.purpleButton}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.successModalBtnGradient}
              >
                <Text style={styles.successModalBtnText}>Go to Log In</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

export default Auth;
