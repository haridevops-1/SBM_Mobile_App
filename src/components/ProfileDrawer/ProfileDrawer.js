import React, { useEffect, useRef } from 'react';
import { Modal, View, Text, TouchableOpacity, Animated, TouchableWithoutFeedback, Dimensions } from 'react-native';
import { useNavigation, useNavigationState } from '@react-navigation/native';
import { X, LogOut, Home, Flame, BarChart2, BookOpen, MessageSquare, Mail, Scale } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useUser } from '../../context/UserContext';
import theme from '../../theme/theme';
import styles from './ProfileDrawer.styles';

const { width } = Dimensions.get('window');
const DRAWER_WIDTH = width * 0.8;

export const ProfileDrawer = () => {
  const {
    isProfileOpen,
    setIsProfileOpen,
    username,
    userId,
    userEmail,
    loggedWeight,
    userGoal,
    logoutUser
  } = useUser();

  const navigation = useNavigation();

  // Obtain active route name
  const state = useNavigationState(state => state);
  const activeRoute = state ? state.routes[state.index]?.name : 'Tracker';

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
  }, [isProfileOpen]);

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
    // Close the drawer first
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
      <View style={styles.overlay}>
        {/* Backdrop Tap Zone */}
        <TouchableWithoutFeedback onPress={handleClose}>
          <View style={{ flex: 1 }} />
        </TouchableWithoutFeedback>

        {/* Sliding Drawer Body Container */}
        <Animated.View 
          style={[
            styles.drawerContainer,
            { transform: [{ translateX: slideAnim }] }
          ]}
        >
          <View style={{ flex: 1 }}>
            {/* Header Row */}
            <View style={styles.drawerHeader}>
              <Text style={styles.drawerTitle}>Navigation Menu</Text>
              <TouchableOpacity style={styles.drawerCloseBtn} onPress={handleClose}>
                <X size={20} color={theme.colors.textPrimary} />
              </TouchableOpacity>
            </View>

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
                <View style={styles.drawerMetaRow}>
                  <Mail size={14} color={theme.colors.textMuted} style={styles.metaIcon} />
                  <View style={styles.metaTexts}>
                    <Text style={styles.metaLabel}>Email</Text>
                    <Text style={styles.metaValue}>{userEmail}</Text>
                  </View>
                </View>
                <View style={styles.drawerMetaRow}>
                  <Scale size={14} color={theme.colors.textMuted} style={styles.metaIcon} />
                  <View style={styles.metaTexts}>
                    <Text style={styles.metaLabel}>Weight / Goal</Text>
                    <Text style={styles.metaValue}>{loggedWeight} kg ({userGoal})</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* Logout Action Button */}
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
      </View>
    </Modal>
  );
};

export default ProfileDrawer;
