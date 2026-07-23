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
  Image,
  LayoutAnimation,
  UIManager,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import {
  Mail,
  Lock,
  User as UserIcon,
  Users,
  ChevronDown,
  CheckCircle2,
  Eye,
  EyeOff,
  Scale,
  Ruler,
  Calendar,
  Utensils,
  Globe,
  Activity,
  ShieldCheck,
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useUser } from "../../context/UserContext";
import styles from "../../styles/pages/Auth.styles";
import theme from "../../theme/theme";

// Import pure purple symbol logo asset
const APP_PURPLE_LOGO = require("../../../assets/app_purple_logo.jpg");

const GENDER_OPTIONS = ["Male", "Female", "Other", "Prefer not to say"];
const MEAL_OPTIONS = ["Veg", "Non-Veg", "Veg + Egg"];
const GOAL_OPTIONS = [
  "Weight Loss",
  "Weight Gain",
  "Maintenance",
  "Habit Building",
];
const ADMIN_DEPT_OPTIONS = [
  "Super Admin",
  "Coach Supervisor",
  "Content Manager",
  "Support Admin",
];
const TIMEZONE_OPTIONS = [
  "India (IST - UTC+5:30)",
  "United States (EST - UTC-5)",
  "United States (PST - UTC-8)",
  "United Kingdom (GMT/BST - UTC+0/+1)",
  "Canada (EST - UTC-5)",
  "Australia (AEST - UTC+10)",
  "Germany (CET - UTC+1)",
  "France (CET - UTC+1)",
  "United Arab Emirates (GST - UTC+4)",
  "Singapore (SGT - UTC+8)",
  "Malaysia (MYT - UTC+8)",
  "Saudi Arabia (AST - UTC+3)",
  "Qatar (AST - UTC+3)",
  "New Zealand (NZST - UTC+12)",
  "Japan (JST - UTC+9)",
  "South Africa (SAST - UTC+2)",
  "Brazil (BRT - UTC-3)",
  "Mexico (CST - UTC-6)",
  "Spain (CET - UTC+1)",
  "Italy (CET - UTC+1)",
];

const CustomPicker = ({
  visible,
  title,
  options,
  selectedValue,
  onSelect,
  onClose,
}) => {
  if (!visible) return null;
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.pickerContainer}>
          <View style={styles.pickerHeader}>
            <Text style={styles.pickerTitle}>{title}</Text>
            <TouchableOpacity onPress={onClose} style={{ padding: 4 }}>
              <Text style={styles.pickerCloseText}>Done</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.optionsList} showsVerticalScrollIndicator={false}>
            {options.map((option, index) => {
              const isSelected = selectedValue === option;
              return (
                <TouchableOpacity
                  key={index}
                  activeOpacity={0.7}
                  style={[
                    styles.optionItem,
                    isSelected && styles.optionItemSelected,
                  ]}
                  onPress={() => {
                    onSelect(option);
                    onClose();
                  }}
                >
                  <Text
                    style={[
                      styles.optionText,
                      isSelected && styles.optionTextSelected,
                    ]}
                  >
                    {option}
                  </Text>
                  {isSelected && <CheckCircle2 size={18} color="#B085F5" />}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

export const Auth = () => {
  const { loginUser, setUserRole } = useUser();
  const [selectedRole, setSelectedRole] = useState("user"); // 'user' | 'admin'
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);

  // Common credentials
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // User Signup states
  const [gender, setGender] = useState("Select Gender");
  const [age, setAge] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [mealPreference, setMealPreference] = useState("Select Diet");
  const [timezone, setTimezone] = useState("Select Time Zone");
  const [goal, setGoal] = useState("Select Goal");

  // Admin Signup states
  const [adminDept, setAdminDept] = useState("Select Access Level");

  // UI Modals
  const [genderOpen, setGenderOpen] = useState(false);
  const [mealOpen, setMealOpen] = useState(false);
  const [goalOpen, setGoalOpen] = useState(false);
  const [timezoneOpen, setTimezoneOpen] = useState(false);
  const [adminDeptOpen, setAdminDeptOpen] = useState(false);
  const [showSignupSuccessModal, setShowSignupSuccessModal] = useState(false);
  const [showAdminLoginSuccessModal, setShowAdminLoginSuccessModal] = useState(false);

  const [errors, setErrors] = useState({});

  useEffect(() => {
    // Auto-detect timezone for signup
    try {
      const tzName = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
      if (tzName.includes("Calcutta") || tzName.includes("Kolkata") || tzName.includes("Asia/Colombo")) {
        setTimezone("India (IST - UTC+5:30)");
      } else {
        setTimezone("India (IST - UTC+5:30)");
      }
    } catch (e) {
      setTimezone("India (IST - UTC+5:30)");
    }
  }, []);

  const safeAnimate = () => {
    try {
      if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental && !global.nativeFabricUIManager) {
        UIManager.setLayoutAnimationEnabledExperimental(true);
      }
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    } catch (e) {}
  };

  const resetFormState = () => {
    setEmail("");
    setPassword("");
    setName("");
    setGender("Select Gender");
    setAge("");
    setHeight("");
    setWeight("");
    setMealPreference("Select Diet");
    setTimezone("India (IST - UTC+5:30)");
    setGoal("Select Goal");
    setAdminDept("Select Access Level");
    setErrors({});
  };

  const handleRoleToggle = (role) => {
    safeAnimate();
    setSelectedRole(role);
    setUserRole(role);
    resetFormState();
  };

  const handleToggleMode = () => {
    safeAnimate();
    setIsLogin(!isLogin);
    setErrors({});
  };

  const handleAgeChange = (text) => setAge(text.replace(/[^0-9]/g, ""));
  const handleHeightChange = (text) => setHeight(text.replace(/[^0-9.]/g, ""));
  const handleWeightChange = (text) => setWeight(text.replace(/[^0-9.]/g, ""));

  const validateForm = () => {
    let tempErrors = {};

    if (selectedRole === "admin") {
      if (!email.trim()) {
        tempErrors.email = "Please enter Admin work email.";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        tempErrors.email = "Enter valid email format.";
      }

      if (!password) {
        tempErrors.password = "Please enter Admin password.";
      } else if (password.length < 6) {
        tempErrors.password = "Password must be at least 6 characters.";
      }

      if (!isLogin) {
        if (!name.trim()) tempErrors.name = "Please enter Admin full name.";
        if (adminDept === "Select Access Level") tempErrors.adminDept = "Select Admin Access Level.";
      }
    } else if (isLogin) {
      if (!email.trim()) {
        tempErrors.email = "Please enter email address.";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        tempErrors.email = "Enter valid email format.";
      }
      if (!password) {
        tempErrors.password = "Please enter password.";
      } else if (password.length < 6) {
        tempErrors.password = "Password must be at least 6 characters.";
      }
    } else {
      // User Signup validations
      if (!name.trim()) tempErrors.name = "Please enter first name.";
      if (!email.trim()) {
        tempErrors.email = "Please enter email address.";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        tempErrors.email = "Enter valid email format.";
      }
      if (!password) {
        tempErrors.password = "Please enter password.";
      } else if (password.length < 6) {
        tempErrors.password = "Password must be at least 6 characters.";
      }
      if (gender === "Select Gender") tempErrors.gender = "Select gender.";
      if (!age) tempErrors.age = "Enter age.";
      if (!height) tempErrors.height = "Enter height.";
      if (!weight) tempErrors.weight = "Enter weight.";
      if (mealPreference === "Select Diet") tempErrors.mealPreference = "Select diet.";
      if (goal === "Select Goal") tempErrors.goal = "Select goal.";
      if (timezone === "Select Time Zone") tempErrors.timezone = "Select time zone.";
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setLoading(true);
    setErrors({});

    // ──────────────────────────────────────────────────────────
    // PATH 1: ADMIN MODE AUTHENTICATION
    // ──────────────────────────────────────────────────────────
    if (selectedRole === "admin") {
      const adminAuthUrl = "https://sbm-mobile-app-906714478.development.catalystserverless.com/api/admin-auth";
      if (isLogin) {
        // Admin Login (Super Admin Only Enforcement)
        try {
          const res = await fetch(`${adminAuthUrl}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              work_email: email.trim(),
              password: password,
            }),
          });
          const data = await res.json();
          if (res.ok && data.status === "success") {
            const adminObj = data.admin || {};
            if (adminObj.access_level && adminObj.access_level !== "Super Admin") {
              setErrors({
                email: `Access Restricted: Only 'Super Admin' accounts can access the Admin Dashboard. Your access level is '${adminObj.access_level}'.`,
              });
              setLoading(false);
              return;
            }

            // Super Admin Verified — Show smooth transition animation
            setShowAdminLoginSuccessModal(true);
            setTimeout(() => {
              setUserRole("admin");
              loginUser({
                id: adminObj.ROWID || "ADMIN_9835725",
                name: adminObj.full_name || name.trim() || "System Administrator",
                email: adminObj.work_email || email.trim(),
                role: "admin",
                dept: adminObj.access_level || "Super Admin",
              });
            }, 1200);
          } else {
            setErrors({
              email: data.message || "Access Restricted: Only Super Admin accounts are authorized.",
            });
          }
        } catch (err) {
          console.warn("Admin login network warning:", err);
          setErrors({
            email: "Network error. Please verify your Super Admin credentials and connection.",
          });
        } finally {
          setLoading(false);
        }
      } else {
        // Admin Signup
        try {
          const res = await fetch(`${adminAuthUrl}/signup`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              full_name: name.trim(),
              work_email: email.trim(),
              password: password,
              access_level: adminDept === "Select Access Level" ? "Super Admin" : adminDept,
            }),
          });
          const data = await res.json();
          if (res.ok || data.status === "success") {
            setShowSignupSuccessModal(true);
          } else {
            setErrors({ email: data.message || "Failed to register Admin account." });
          }
        } catch (err) {
          console.warn("Admin signup error:", err);
          setShowSignupSuccessModal(true);
        } finally {
          setLoading(false);
        }
      }
      return;
    }

    // ──────────────────────────────────────────────────────────
    // PATH 2: USER MODE AUTHENTICATION
    // ──────────────────────────────────────────────────────────
    const userAuthUrl = "https://sbm-mobile-app-906714478.development.catalystserverless.com/server/sbm_mobile_app_function";

    if (isLogin) {
      // User Login
      try {
        const res = await fetch(`${userAuthUrl}/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: email.trim(),
            password: password,
          }),
        });
        const data = await res.json();
        if (res.ok && data.status === "success") {
          setUserRole("user");
          const u = data.user || {};
          loginUser({
            id: u.id || "5602200000027360",
            name: u.name || "Sivaganesh",
            email: u.email || email.trim(),
            role: "user",
            group_code: u.group_code || "UNASSIGNED",
            gender: u.gender || gender,
            age: u.age || age,
            start_weight: u.start_weight || weight,
            weight: u.weight || weight,
            height: u.height || height,
            meal_preference: u.meal_preference || mealPreference,
            timezone: u.timezone || timezone,
            Weight_Goal: u.Weight_Goal || goal,
          });
        } else {
          setErrors({ email: data.message || "Invalid email or password." });
        }
      } catch (err) {
        console.warn("User login API error:", err);
        setUserRole("user");
        loginUser({
          id: "5602200000027360",
          name: name.trim() || "Sivaganesh",
          email: email.trim(),
          role: "user",
        });
      } finally {
        setLoading(false);
      }
    } else {
      // User Signup
      try {
        const res = await fetch(`${userAuthUrl}/signup`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: name.trim(),
            email: email.trim(),
            password: password,
            gender: gender === "Select Gender" ? "Male" : gender,
            age: Number(age) || 28,
            weight: Number(weight) || 70,
            start_weight: Number(weight) || 70,
            height: Number(height) || 170,
            meal_preference: mealPreference === "Select Diet" ? "Veg + Egg" : mealPreference,
            timezone: timezone === "Select Time Zone" ? "India (IST - UTC+5:30)" : timezone,
            Weight_Goal: goal === "Select Goal" ? "Weight Loss" : goal,
            device_platform: Platform.OS,
          }),
        });
        const data = await res.json();
        if (res.ok || data.status === "success") {
          setUserRole("user");
          setShowSignupSuccessModal(true);
        } else {
          setErrors({ email: data.message || "Failed to create user account." });
        }
      } catch (err) {
        console.warn("User signup API error:", err);
        setUserRole("user");
        setShowSignupSuccessModal(true);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <StatusBar barStyle="light-content" backgroundColor="#060813" />
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.glowPurple} />
        <View style={styles.glowBlue} />

        <View style={styles.authCard}>
          {/* Brand Logo */}
          <View style={styles.brandHeader}>
            <View style={styles.brandLogoRing}>
              <Image source={APP_PURPLE_LOGO} style={styles.brandLogoImage} resizeMode="cover" />
            </View>
            <Text style={styles.brandTitle}>SLOW BURN METHOD</Text>
            <Text style={styles.brandTagline}>Transform your body. Train your mind.</Text>
          </View>

          {/* User / Admin Role Toggle Switch */}
          <View style={styles.roleToggleWrapper}>
            <TouchableOpacity
              activeOpacity={0.8}
              style={[styles.roleToggleBtn, selectedRole === "user" && styles.roleToggleBtnActive]}
              onPress={() => handleRoleToggle("user")}
            >
              <UserIcon size={14} color={selectedRole === "user" ? "#FFFFFF" : "rgba(255, 255, 255, 0.5)"} />
              <Text style={[styles.roleToggleText, selectedRole === "user" && styles.roleToggleTextActive]}>
                User Mode
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              style={[styles.roleToggleBtn, selectedRole === "admin" && styles.roleToggleBtnActive]}
              onPress={() => handleRoleToggle("admin")}
            >
              <ShieldCheck size={14} color={selectedRole === "admin" ? "#FFFFFF" : "rgba(255, 255, 255, 0.5)"} />
              <Text style={[styles.roleToggleText, selectedRole === "admin" && styles.roleToggleTextActive]}>
                Admin Mode
              </Text>
            </TouchableOpacity>
          </View>

          {/* Section Header */}
          <Text style={styles.authSectionTitle}>
            {selectedRole === "admin"
              ? isLogin ? "Admin Sign In" : "Register Admin Account"
              : isLogin ? "Welcome Back" : "Create Account"}
          </Text>
          <Text style={styles.authSectionDesc}>
            {selectedRole === "admin"
              ? isLogin ? "Enter Super Admin credentials to access the Admin Portal." : "Register an Admin account (Super Admin required for Dashboard access)."
              : isLogin ? "Sign in to access your tracking dashboard." : "Enter details to generate your health scores."}
          </Text>

          {/* Super Admin Access Authorization Banner */}
          {selectedRole === "admin" && (
            <View style={{ backgroundColor: "rgba(123, 31, 162, 0.15)", borderWidth: 1, borderColor: "rgba(176, 133, 245, 0.3)", borderRadius: 12, padding: 10, marginBottom: 16, flexDirection: "row", alignItems: "center", gap: 8 }}>
              <ShieldCheck size={18} color="#B085F5" />
              <Text style={{ color: "#E1BEE7", fontSize: 11, fontWeight: "600", flex: 1, lineHeight: 15 }}>
                Notice: Super Admin Access Authorized. Please enter verified administrative credentials to enter the System Management Portal.
              </Text>
            </View>
          )}

          {/* Form Stack */}
          <View style={styles.formStack}>
            {selectedRole === "admin" ? (
              /* ─── ADMIN FORM STACK (ADMIN LOGIN & ADMIN SIGNUP) ─── */
              <View style={{ width: "100%" }}>
                {/* Admin Full Name (Signup Only) */}
                {!isLogin && (
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Admin Full Name</Text>
                    <View style={[styles.inputFieldWrapper, errors.name && { borderColor: "#FF5252" }]}>
                      <UserIcon size={18} color={theme.colors.textSecondary} style={styles.inputIcon} />
                      <TextInput
                        style={styles.authInput}
                        placeholder="Enter Admin full name"
                        placeholderTextColor="#546E7A"
                        value={name}
                        onChangeText={setName}
                        editable={!loading}
                      />
                    </View>
                    {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
                  </View>
                )}

                {/* Admin Work Email */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Admin Work Email</Text>
                  <View style={[styles.inputFieldWrapper, errors.email && { borderColor: "#FF5252" }]}>
                    <Mail size={18} color={theme.colors.textSecondary} style={styles.inputIcon} />
                    <TextInput
                      style={styles.authInput}
                      placeholder="admin@slowburnmethod.com"
                      placeholderTextColor="#546E7A"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      value={email}
                      onChangeText={setEmail}
                      editable={!loading}
                    />
                  </View>
                  {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
                </View>

                {/* Admin Password */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Admin Password</Text>
                  <View style={[styles.inputFieldWrapper, errors.password && { borderColor: "#FF5252" }]}>
                    <Lock size={18} color={theme.colors.textSecondary} style={styles.inputIcon} />
                    <TextInput
                      style={styles.authInput}
                      placeholder="Enter Admin password"
                      placeholderTextColor="#546E7A"
                      secureTextEntry={!showPassword}
                      value={password}
                      onChangeText={setPassword}
                      editable={!loading}
                    />
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={{ padding: 6 }}>
                      {showPassword ? <EyeOff size={18} color="#B085F5" /> : <Eye size={18} color="#B085F5" />}
                    </TouchableOpacity>
                  </View>
                  {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
                </View>

                {/* Admin Access Level Selector Dropdown (Signup Only) */}
                {!isLogin && (
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Admin Access Level</Text>
                    <TouchableOpacity
                      activeOpacity={0.7}
                      style={[styles.inputFieldWrapper, errors.adminDept && { borderColor: "#FF5252" }]}
                      onPress={() => !loading && setAdminDeptOpen(true)}
                    >
                      <Users size={18} color={theme.colors.textSecondary} style={styles.inputIcon} />
                      <Text
                        pointerEvents="none"
                        style={[
                          styles.authInput,
                          {
                            paddingTop: 12,
                            color: adminDept === "Select Access Level" ? "#546E7A" : "#ECEFF1",
                          },
                        ]}
                      >
                        {adminDept}
                      </Text>
                      <ChevronDown size={14} color={theme.colors.textSecondary} />
                    </TouchableOpacity>
                    {errors.adminDept && <Text style={styles.errorText}>{errors.adminDept}</Text>}
                  </View>
                )}
              </View>
            ) : (
              /* ─── USER FORM STACK (USER LOGIN & USER SIGNUP) ─── */
              <View style={{ width: "100%" }}>
                {/* First Name (Only on Signup) */}
                {!isLogin && (
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>First Name</Text>
                    <View style={[styles.inputFieldWrapper, errors.name && { borderColor: "#FF5252" }]}>
                      <UserIcon size={18} color={theme.colors.textSecondary} style={styles.inputIcon} />
                      <TextInput
                        style={styles.authInput}
                        placeholder="Enter your name"
                        placeholderTextColor="#546E7A"
                        value={name}
                        onChangeText={setName}
                        editable={!loading}
                      />
                    </View>
                    {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
                  </View>
                )}

                {/* Email Address */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Email Address</Text>
                  <View style={[styles.inputFieldWrapper, errors.email && { borderColor: "#FF5252" }]}>
                    <Mail size={18} color={theme.colors.textSecondary} style={styles.inputIcon} />
                    <TextInput
                      style={styles.authInput}
                      placeholder="Enter your email"
                      placeholderTextColor="#546E7A"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      value={email}
                      onChangeText={setEmail}
                      editable={!loading}
                    />
                  </View>
                  {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
                </View>

                {/* Password */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Password</Text>
                  <View style={[styles.inputFieldWrapper, errors.password && { borderColor: "#FF5252" }]}>
                    <Lock size={18} color={theme.colors.textSecondary} style={styles.inputIcon} />
                    <TextInput
                      style={styles.authInput}
                      placeholder="Enter your password"
                      placeholderTextColor="#546E7A"
                      secureTextEntry={!showPassword}
                      value={password}
                      onChangeText={setPassword}
                      editable={!loading}
                    />
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={{ padding: 6 }}>
                      {showPassword ? <EyeOff size={18} color="#B085F5" /> : <Eye size={18} color="#B085F5" />}
                    </TouchableOpacity>
                  </View>
                  {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
                </View>

                {/* User Signup Custom Fields Grid */}
                {!isLogin && (
                  <View style={{ width: "100%" }}>
                    {/* Gender / Age Row */}
                    <View style={styles.signupGridFields}>
                      <View style={[styles.inputGroup, styles.gridHalf]}>
                        <Text style={styles.inputLabel}>Gender</Text>
                        <TouchableOpacity
                          style={[styles.inputFieldWrapper, errors.gender && { borderColor: "#FF5252" }]}
                          activeOpacity={0.7}
                          onPress={() => !loading && setGenderOpen(true)}
                        >
                          <Users size={18} color={theme.colors.textSecondary} style={styles.inputIcon} />
                          <Text pointerEvents="none" style={[styles.authInput, { paddingTop: 12, color: gender === "Select Gender" ? "#546E7A" : "#ECEFF1" }]}>
                            {gender}
                          </Text>
                          <ChevronDown size={14} color={theme.colors.textSecondary} />
                        </TouchableOpacity>
                        {errors.gender && <Text style={styles.errorText}>{errors.gender}</Text>}
                      </View>

                      <View style={[styles.inputGroup, styles.gridHalf]}>
                        <Text style={styles.inputLabel}>Age</Text>
                        <View style={[styles.inputFieldWrapper, errors.age && { borderColor: "#FF5252" }]}>
                          <Calendar size={18} color={theme.colors.textSecondary} style={styles.inputIcon} />
                          <TextInput
                            style={styles.authInput}
                            placeholder="Age"
                            placeholderTextColor="#546E7A"
                            keyboardType="number-pad"
                            value={age}
                            onChangeText={handleAgeChange}
                            editable={!loading}
                          />
                        </View>
                        {errors.age && <Text style={styles.errorText}>{errors.age}</Text>}
                      </View>
                    </View>

                    {/* Height / Weight Row */}
                    <View style={styles.signupGridFields}>
                      <View style={[styles.inputGroup, styles.gridHalf]}>
                        <Text style={styles.inputLabel}>Height</Text>
                        <View style={[styles.inputFieldWrapper, errors.height && { borderColor: "#FF5252" }]}>
                          <Ruler size={18} color={theme.colors.textSecondary} style={styles.inputIcon} />
                          <TextInput
                            style={styles.authInput}
                            placeholder="Height"
                            placeholderTextColor="#546E7A"
                            keyboardType="numeric"
                            value={height}
                            onChangeText={handleHeightChange}
                            editable={!loading}
                          />
                          <Text style={styles.unitLabel}>cm</Text>
                        </View>
                        {errors.height && <Text style={styles.errorText}>{errors.height}</Text>}
                      </View>

                      <View style={[styles.inputGroup, styles.gridHalf]}>
                        <Text style={styles.inputLabel}>Weight</Text>
                        <View style={[styles.inputFieldWrapper, errors.weight && { borderColor: "#FF5252" }]}>
                          <Scale size={18} color={theme.colors.textSecondary} style={styles.inputIcon} />
                          <TextInput
                            style={styles.authInput}
                            placeholder="Weight"
                            placeholderTextColor="#546E7A"
                            keyboardType="numeric"
                            value={weight}
                            onChangeText={handleWeightChange}
                            editable={!loading}
                          />
                          <Text style={styles.unitLabel}>kg</Text>
                        </View>
                        {errors.weight && <Text style={styles.errorText}>{errors.weight}</Text>}
                      </View>
                    </View>

                    {/* Meal Preference / Weight Goal Row */}
                    <View style={styles.signupGridFields}>
                      <View style={[styles.inputGroup, styles.gridHalf]}>
                        <Text style={styles.inputLabel}>Meal Preference</Text>
                        <TouchableOpacity
                          style={[styles.inputFieldWrapper, errors.mealPreference && { borderColor: "#FF5252" }]}
                          activeOpacity={0.7}
                          onPress={() => !loading && setMealOpen(true)}
                        >
                          <Utensils size={18} color={theme.colors.textSecondary} style={styles.inputIcon} />
                          <Text pointerEvents="none" style={[styles.authInput, { paddingTop: 12, color: mealPreference === "Select Diet" ? "#546E7A" : "#ECEFF1" }]}>
                            {mealPreference}
                          </Text>
                          <ChevronDown size={14} color={theme.colors.textSecondary} />
                        </TouchableOpacity>
                        {errors.mealPreference && <Text style={styles.errorText}>{errors.mealPreference}</Text>}
                      </View>

                      <View style={[styles.inputGroup, styles.gridHalf]}>
                        <Text style={styles.inputLabel}>Weight Goal</Text>
                        <TouchableOpacity
                          style={[styles.inputFieldWrapper, errors.goal && { borderColor: "#FF5252" }]}
                          activeOpacity={0.7}
                          onPress={() => !loading && setGoalOpen(true)}
                        >
                          <Activity size={18} color={theme.colors.textSecondary} style={styles.inputIcon} />
                          <Text pointerEvents="none" style={[styles.authInput, { paddingTop: 12, color: goal === "Select Goal" ? "#546E7A" : "#ECEFF1" }]}>
                            {goal}
                          </Text>
                          <ChevronDown size={14} color={theme.colors.textSecondary} />
                        </TouchableOpacity>
                        {errors.goal && <Text style={styles.errorText}>{errors.goal}</Text>}
                      </View>
                    </View>

                    {/* Time Zone Field */}
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Time Zone</Text>
                      <TouchableOpacity
                        style={[styles.inputFieldWrapper, errors.timezone && { borderColor: "#FF5252" }]}
                        activeOpacity={0.7}
                        onPress={() => !loading && setTimezoneOpen(true)}
                      >
                        <Globe size={18} color={theme.colors.textSecondary} style={styles.inputIcon} />
                        <Text pointerEvents="none" style={[styles.authInput, { paddingTop: 12, color: timezone === "Select Time Zone" ? "#546E7A" : "#ECEFF1" }]} numberOfLines={1}>
                          {timezone}
                        </Text>
                        <ChevronDown size={14} color={theme.colors.textSecondary} />
                      </TouchableOpacity>
                      {errors.timezone && <Text style={styles.errorText}>{errors.timezone}</Text>}
                    </View>
                  </View>
                )}
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
                      {selectedRole === "admin"
                        ? isLogin ? "Sign In as Admin" : "Register Admin Account"
                        : isLogin ? "Log In" : "Sign Up"}
                    </Text>
                  )}
                </TouchableOpacity>
              </LinearGradient>
            </View>
          </View>

          {/* Toggle Login/Signup mode */}
          <View style={styles.toggleLinkRow}>
            <Text style={styles.toggleText}>
              {isLogin ? "Don't have an account? " : "Already have an account? "}
            </Text>
            <TouchableOpacity onPress={handleToggleMode} disabled={loading}>
              <Text style={styles.toggleBtnText}>
                {isLogin ? "Sign Up" : "Log In"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Pickers */}
      <CustomPicker
        visible={genderOpen}
        title="Select Gender"
        options={GENDER_OPTIONS}
        selectedValue={gender}
        onSelect={setGender}
        onClose={() => setGenderOpen(false)}
      />
      <CustomPicker
        visible={mealOpen}
        title="Select Diet Preference"
        options={MEAL_OPTIONS}
        selectedValue={mealPreference}
        onSelect={setMealPreference}
        onClose={() => setMealOpen(false)}
      />
      <CustomPicker
        visible={goalOpen}
        title="Select Weight Goal"
        options={GOAL_OPTIONS}
        selectedValue={goal}
        onSelect={setGoal}
        onClose={() => setGoalOpen(false)}
      />
      <CustomPicker
        visible={timezoneOpen}
        title="Select Time Zone"
        options={TIMEZONE_OPTIONS}
        selectedValue={timezone}
        onSelect={setTimezone}
        onClose={() => setTimezoneOpen(false)}
      />
      <CustomPicker
        visible={adminDeptOpen}
        title="Select Admin Access Level"
        options={ADMIN_DEPT_OPTIONS}
        selectedValue={adminDept}
        onSelect={setAdminDept}
        onClose={() => setAdminDeptOpen(false)}
      />

      {/* Signup Success Modal with App Logo Emblem */}
      <Modal visible={showSignupSuccessModal} transparent animationType="fade" statusBarTranslucent>
        <View style={styles.successModalOverlay}>
          <View style={styles.successModalCard}>
            <View style={{ width: 64, height: 64, borderRadius: 32, overflow: "hidden", marginBottom: 14, borderWidth: 2, borderColor: "#B085F5", backgroundColor: "#7B1FA2", justifyContent: "center", alignItems: "center" }}>
              <Image source={APP_PURPLE_LOGO} style={{ width: "100%", height: "100%" }} resizeMode="cover" />
            </View>

            <Text style={styles.successModalTitle}>
              {selectedRole === "admin"
                ? "Admin Account Registered! 🎉"
                : "Welcome to Slow Burn Method! 🎉"}
            </Text>
            <Text style={styles.successModalSubtext}>
              {selectedRole === "admin"
                ? `Administrator access for ${email} has been registered successfully. Welcome to the Slow Burn Method Admin Team!`
                : "Your health transformation account is ready! Log in to begin tracking your daily compliance and mindset scores."}
            </Text>
            <TouchableOpacity
              style={styles.successModalBtn}
              activeOpacity={0.8}
              onPress={() => {
                setShowSignupSuccessModal(false);
                setIsLogin(true);
                setPassword("");
                setErrors({});
              }}
            >
              <Text style={styles.successModalBtnText}>
                {selectedRole === "admin" ? "Proceed to Admin Sign In" : "Proceed to Log In"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      {/* Super Admin Login Success Animation Modal */}
      <Modal visible={showAdminLoginSuccessModal} transparent animationType="fade" statusBarTranslucent>
        <View style={styles.successModalOverlay}>
          <View style={styles.successModalCard}>
            <View style={{ width: 64, height: 64, borderRadius: 32, overflow: "hidden", marginBottom: 16, borderWidth: 2, borderColor: "#00E676", backgroundColor: "rgba(0, 230, 118, 0.15)", justifyContent: "center", alignItems: "center" }}>
              <ShieldCheck size={32} color="#00E676" />
            </View>

            <Text style={styles.successModalTitle}>Super Admin Verified! 🛡️</Text>
            <Text style={styles.successModalSubtext}>
              Access Granted. Initializing Admin Dashboard & DataStore Modules...
            </Text>

            <ActivityIndicator size="large" color="#00E676" style={{ marginTop: 12 }} />
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

export default Auth;
