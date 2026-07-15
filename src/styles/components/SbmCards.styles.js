import { StyleSheet } from 'react-native';
import theme from '../../theme/theme';

export default StyleSheet.create({
  container: {
    marginHorizontal: theme.spacing.lg,
    marginVertical: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
    letterSpacing: -0.3,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    padding: theme.spacing.md,
    marginBottom: 12,
    backgroundColor: 'rgba(22, 28, 45, 0.7)',
    overflow: 'hidden',
  },
  cardGradient: {
    padding: 2,
    borderRadius: 14,
  },
  iconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  scoreValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  cardTitle: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
});
