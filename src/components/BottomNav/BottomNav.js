import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Home, ClipboardList, BarChart2, BookOpen, MessageSquare } from 'lucide-react-native';
import styles from '../../styles/components/BottomNav.styles';

export const BottomNav = ({ state, descriptors, navigation }) => {
  const getIcon = (routeName, color) => {
    switch (routeName) {
      case 'Tracker':
        return <Home size={18} color={color} />;
      case 'Efforts':
        return <ClipboardList size={18} color={color} />;
      case 'Results':
        return <BarChart2 size={18} color={color} />;
      case 'Resources':
        return <BookOpen size={18} color={color} />;
      case 'Support':
        return <MessageSquare size={18} color={color} />;
      default:
        return <Home size={18} color={color} />;
    }
  };

  return (
    <View style={styles.bottomNav}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
            ? options.title
            : route.name;

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        const color = isFocused ? '#B085F5' : '#90A4AE';

        return (
          <TouchableOpacity
            key={route.key}
            activeOpacity={0.8}
            onPress={onPress}
            style={styles.navItem}
          >
            <View style={styles.navIconWrapper}>
              {getIcon(route.name, color)}
            </View>
            <Text style={[styles.navLabel, isFocused && styles.activeNavLabel]}>
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default BottomNav;
