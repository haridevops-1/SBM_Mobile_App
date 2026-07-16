import React, { useEffect, useRef } from 'react';
import { Modal, View, Text, TouchableOpacity, Animated, TouchableWithoutFeedback, useWindowDimensions, ScrollView, Platform } from 'react-native';
import { useNavigation, useNavigationState } from '@react-navigation/native';
import { X, LogOut, Home, Flame, BarChart2, BookOpen, MessageSquare, Mail, Scale, User, Globe, Activity } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useUser } from '../../context/UserContext';
import theme from '../../theme/theme';
import styles from '../../styles/components/ProfileDrawer.styles';

export const ProfileDrawer = () => {
  const {
    isProfileOpen,
    setIsProfileOpen,
    username,
    userId,
    userEmail,
    loggedWeight,
    userGoal,
    gender,
    age,
    height,
    mealPreference,
    timezone,
    logoutUser
  } = useUser();

  const navigation = useNavigation();
  const { width } = useWindowDimensions();

  // Responsive Width Settings for Desktop Simulation compatibility
  const isWebDesktop = Platform.OS === 'web' && width > 768;
  const DRAWER_WIDTH = isWebDesktop ? 440 * 0.8 : width * 0.8;

  // Obtain active route name
  const state = useNavigationState(state => state);
  const activeRoute = state ? state.routes[state.index]?.name : 'Tracker';

  // Animation starting value: fully off-screen left
  const slideAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;

  useEffect(() => {
    if (isProfileOpen) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: -DRAWER_WIDTH,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [isProfileOpen, DRAWER_WIDTH]);

  if (!isProfileOpen) return null;

  const initialLetter = username ? username.charAt(0).toUpperCase() : 'H';

  const menuItems = [
    { label: 'Tracker (Home)', route: 'Tracker', icon: (color) => <Home size={18} color={color} /> },
    { label: 'Efforts Log', route: 'Efforts', icon: (color) => <Flame size={18} color={color} /> },
    { label: 'Results & Trends', route: 'Results', icon: (color) => <BarChart2 size={18} color={color} /> },
    { label: 'Resources Library', route: 'Resources', icon: (color) => <BookOpen size={18} color={color} /> },
    { label: 'Support & Help', route: 'Support', icon: (color) => <MessageSquare size={18} color={color} /> }
  ];

  const handleNavClick = (route) => {
    Animated.timing(slideAnim, {
      toValue: -DRAWER_WIDTH,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      setIsProfileOpen(false);
      navigation.navigate(route);
    });
  };

  const handleClose = () => {
    Animated.timing(slideAnim, {
      toValue: -DRAWER_WIDTH,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setIsProfileOpen(false);
    });
  };

  return (
    <Modal
      transparent={true}
      visible={isProfileOpen}
      onRequestClose={handleClose}
      animationType="none"
    >
      <View style={[styles.overlay, isWebDesktop && styles.webOverlay]}>
        {/* Sliding Drawer Body Container (Now positioned on the LEFT side) */}
        <Animated.View 
          style={[
            styles.drawerContainer,
            { width: DRAWER_WIDTH, transform: [{ translateX: slideAnim }] }
          ]}
        >
          {/* Header Row */}
          <View style={styles.drawerHeader}>
            <Text style={styles.drawerTitle}>Navigation Menu</Text>
            <TouchableOpacity style={styles.drawerCloseBtn} onPress={handleClose}>
              <X size={20} color={theme.colors.textPrimary} />
            </TouchableOpacity>
          </View>

          {/* Scrollable middle container to prevent UI elements overlapping */}
          <ScrollView 
            style={{ flex: 1 }} 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
          >
            {/* Avatar Section */}
            <View style={styles.drawerAvatarSection}>
              <LinearGradient
                colors={theme.colors.gradients.avatar}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.drawerAvatarCircle}
              >
                <Text style={styles.avatarText}>{initialLetter}</Text>
              </LinearGradient>
              <View style={styles.avatarMetaInfo}>
                <Text style={styles.drawerUsername}>{username}</Text>
                <Text style={styles.drawerUseridBadge}>{userId}</Text>
              </View>
            </View>

            {/* Divider */}
            <View style={styles.drawerSectionDivider} />

            {/* Main Navigation List */}
            <View style={styles.drawerNavSection}>
              <Text style={styles.drawerSectionLabel}>Main Pages</Text>
              <View style={styles.drawerNavList}>
                {menuItems.map((item) => {
                  const isActive = activeRoute === item.route;
                  const iconColor = isActive ? '#B085F5' : theme.colors.textSecondary;
                  return (
                    <TouchableOpacity
                      key={item.route}
                      activeOpacity={0.7}
                      style={[styles.drawerNavItem, isActive && styles.activeNavItem]}
                      onPress={() => handleNavClick(item.route)}
                    >
                      <View style={styles.navItemIcon}>
                        {item.icon(iconColor)}
                      </View>
                      <Text style={[styles.navItemLabel, isActive && styles.activeNavLabel]}>
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Divider */}
            <View style={styles.drawerSectionDivider} />

            {/* Account Details Card */}
            <View style={styles.drawerDetailsSection}>
              <Text style={styles.drawerSectionLabel}>Account Details</Text>
              <View style={styles.drawerDetailsCard}>
                {/* Email row */}
                <View style={styles.drawerMetaRow}>
                  <Mail size={14} color={theme.colors.textMuted} style={styles.metaIcon} />
                  <View style={styles.metaTexts}>
                    <Text style={styles.metaLabel}>Email</Text>
                    <Text style={styles.metaValue} numberOfLines={1}>{userEmail}</Text>
                  </View>
                </View>

                {/* Weight / Goal row */}
                <View style={styles.drawerMetaRow}>
                  <Scale size={14} color={theme.colors.textMuted} style={styles.metaIcon} />
                  <View style={styles.metaTexts}>
                    <Text style={styles.metaLabel}>Weight / Goal</Text>
                    <Text style={styles.metaValue}>{loggedWeight} kg ({userGoal})</Text>
                  </View>
                </View>

                {/* Gender / Age / Height / Meal preference row */}
                <View style={styles.drawerMetaRow}>
                  <User size={14} color={theme.colors.textMuted} style={styles.metaIcon} />
                  <View style={styles.metaTexts}>
                    <Text style={styles.metaLabel}>Gender / Age / Height</Text>
                    <Text style={styles.metaValue}>{gender} / {age} yrs / {height} cm</Text>
                  </View>
                </View>

                {/* Meal Preference / Timezone row */}
                <View style={styles.drawerMetaRow}>
                  <Activity size={14} color={theme.colors.textMuted} style={styles.metaIcon} />
                  <View style={styles.metaTexts}>
                    <Text style={styles.metaLabel}>Dietary Preference</Text>
                    <Text style={styles.metaValue}>{mealPreference}</Text>
                  </View>
                </View>

                {/* Timezone row */}
                <View style={styles.drawerMetaRow}>
                  <Globe size={14} color={theme.colors.textMuted} style={styles.metaIcon} />
                  <View style={styles.metaTexts}>
                    <Text style={styles.metaLabel}>Time Zone</Text>
                    <Text style={styles.metaValue} numberOfLines={1}>{timezone}</Text>
                  </View>
                </View>
              </View>
            </View>
          </ScrollView>

          {/* Logout Action Button (Remains fixed at the bottom of the drawer) */}
          <View style={styles.drawerActionContainer}>
            <TouchableOpacity 
              activeOpacity={0.8} 
              style={styles.drawerLogoutBtn} 
              onPress={logoutUser}
            >
              <LogOut size={16} color="#FF5252" />
              <Text style={styles.logoutText}>Log Out Session</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Backdrop Tap Zone (Positioned on the RIGHT side to close modal) */}
        <TouchableWithoutFeedback onPress={handleClose}>
          <View style={{ flex: 1 }} />
        </TouchableWithoutFeedback>
      </View>
    </Modal>
  );
};

export default ProfileDrawer;
