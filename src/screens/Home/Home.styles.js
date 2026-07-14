import { StyleSheet } from 'react-native';
import theme from '../../theme/theme';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0D18',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: theme.spacing.lg,
    marginVertical: theme.spacing.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
    alignSelf: 'flex-start',
  },
  calendarIcon: {
    marginRight: 8,
  },
  dateText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
});
