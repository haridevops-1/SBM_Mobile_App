import { StyleSheet, Platform } from 'react-native';
import theme from '../../theme/theme';

export default StyleSheet.create({
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: 'rgba(10, 13, 24, 0.85)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
    height: Platform.OS === 'ios' ? 76 : 64,
    paddingBottom: Platform.OS === 'ios' ? 20 : 8,
    paddingTop: 8,
    justifyContent: 'space-around',
    alignItems: 'center',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  navIconWrapper: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  navLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  activeNavLabel: {
    color: '#B085F5',
  },
});
