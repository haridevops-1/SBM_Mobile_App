import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Bell } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useUser } from '../../context/UserContext';
import theme from '../../theme/theme';
import styles from './Header.styles';

export const Header = () => {
  const { username, setIsProfileOpen } = useUser();
  const initial = username ? username.charAt(0).toUpperCase() : 'H';

  return (
    <View style={styles.headerContainer}>
      <View style={styles.headerTop}>
        <TouchableOpacity activeOpacity={0.8} onPress={() => setIsProfileOpen(true)}>
          <LinearGradient
            colors={theme.colors.gradients.avatar}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.headerProfileAvatar}
          >
            <Text style={styles.avatarText}>{initial}</Text>
          </LinearGradient>
        </TouchableOpacity>
        
        <TouchableOpacity activeOpacity={0.8} style={styles.notificationBtn}>
          <Bell size={24} color={theme.colors.textPrimary} />
          <View style={styles.notificationBadge}>
            <Text style={styles.badgeText}>1</Text>
          </View>
        </TouchableOpacity>
      </View>
      
      <View style={styles.headerGreeting}>
        <Text style={styles.greetingTitle}>
          Good Morning, {username}! 👋
        </Text>
        <Text style={styles.greetingSubtitle}>
          Stay consistent, stay unstoppable.
        </Text>
      </View>
    </View>
  );
};

export default Header;
