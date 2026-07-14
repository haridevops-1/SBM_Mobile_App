import { StyleSheet } from 'react-native';
import theme from '../../theme/theme';

export default StyleSheet.create({
  container: {
    marginHorizontal: theme.spacing.lg,
    marginVertical: theme.spacing.sm,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.borderColor,
    padding: theme.spacing.md,
    overflow: 'hidden',
  },
  bannerGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  starContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(123, 31, 162, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  quoteText: {
    flex: 1,
    color: '#D1D5DB',
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
  },
});
