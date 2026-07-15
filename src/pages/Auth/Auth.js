import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Mail, Lock, User as UserIcon, Scale, Sparkles } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useUser } from '../../context/UserContext';
import theme from '../../theme/theme';
import styles from '../../styles/pages/Auth.styles';

export const Auth = () => {
  const { loginUser } = useUser();
  const [isLogin, setIsLogin] = useState(true);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [weight, setWeight] = useState('77.8');
  const [goal, setGoal] = useState('Fat Loss');

  const handleSubmit = () => {
    if (isLogin) {
      if (email.trim() !== '' && password.trim() !== '') {
        loginUser('Harish', '77.8');
      } else {
        Alert.alert("Error", "Please fill in your Email and Password.");
      }
    } else {
      if (name.trim() !== '' && email.trim() !== '' && password.trim() !== '') {
        loginUser(name, weight);
      } else {
        Alert.alert("Error", "Please fill in your Name, Email, and Password.");
      }
    }
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
                <View style={styles.inputFieldWrapper}>
                  <UserIcon size={18} color={theme.colors.textSecondary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.authInput}
                    placeholder="Harish"
                    placeholderTextColor="#546E7A"
                    value={name}
                    onChangeText={setName}
                  />
                </View>
              </View>
            )}

            {/* Email Address */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email Address</Text>
              <View style={styles.inputFieldWrapper}>
                <Mail size={18} color={theme.colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.authInput}
                  placeholder="name@example.com"
                  placeholderTextColor="#546E7A"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>
            </View>

            {/* Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Password</Text>
              <View style={styles.inputFieldWrapper}>
                <Lock size={18} color={theme.colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.authInput}
                  placeholder="••••••••"
                  placeholderTextColor="#546E7A"
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                />
              </View>
            </View>

            {/* Weight and Goal Fields (Only on Signup) */}
            {!isLogin && (
              <View style={styles.signupGridFields}>
                {/* Current Weight */}
                <View style={[styles.inputGroup, styles.gridHalf]}>
                  <Text style={styles.inputLabel}>Current Weight</Text>
                  <View style={styles.inputFieldWrapper}>
                    <Scale size={18} color={theme.colors.textSecondary} style={styles.inputIcon} />
                    <TextInput
                      style={styles.authInput}
                      placeholder="77.8"
                      placeholderTextColor="#546E7A"
                      keyboardType="numeric"
                      value={weight}
                      onChangeText={setWeight}
                    />
                    <Text style={styles.unitLabel}>kg</Text>
                  </View>
                </View>

                {/* Goal Selector */}
                <View style={[styles.inputGroup, styles.gridHalf]}>
                  <Text style={styles.inputLabel}>Weight Goal</Text>
                  <View style={styles.goalSelectorContainer}>
                    {['Fat Loss', 'Strength', 'Habits'].map((item) => {
                      const isSelected = goal === item;
                      return (
                        <TouchableOpacity
                          key={item}
                          activeOpacity={0.8}
                          style={[styles.goalOption, isSelected && styles.activeGoalOption]}
                          onPress={() => setGoal(item)}
                        >
                          <Text style={[styles.goalText, isSelected && styles.activeGoalText]}>
                            {item === 'Fat Loss' ? 'Loss' : item === 'Strength' ? 'Str' : 'Habit'}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              </View>
            )}

            {/* Submit Button */}
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

          {/* Toggle Option Link */}
          <View style={styles.toggleLinkRow}>
            <Text style={styles.toggleText}>
              {isLogin ? "Don't have an account? " : "Already have an account? "}
            </Text>
            <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
              <Text style={styles.toggleBtnText}>
                {isLogin ? 'Sign Up' : 'Log In'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default Auth;
