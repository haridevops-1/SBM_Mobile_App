import { StyleSheet } from 'react-native';
import theme from '../../theme/theme';

export default StyleSheet.create({
  card: {
    marginHorizontal: theme.spacing.lg,
    marginVertical: theme.spacing.sm,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: theme.colors.borderColor,
    backgroundColor: theme.colors.bgCard,
    padding: theme.spacing.md,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  viewDetailsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewDetailsText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4CAF50',
    marginRight: 2,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progressCircleWrapper: {
    position: 'relative',
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressSvg: {
    width: 120,
    height: 120,
  },
  progressTextContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressPercentage: {
    fontSize: 22,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    lineHeight: 24,
  },
  progressLabel: {
    fontSize: 9,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  statsList: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  statIconWrapper: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  orangeIcon: {
    backgroundColor: 'rgba(255, 152, 0, 0.15)',
  },
  yellowIcon: {
    backgroundColor: 'rgba(255, 235, 59, 0.15)',
  },
  greenIcon: {
    backgroundColor: 'rgba(76, 175, 80, 0.15)',
  },
  statDetails: {
    flex: 1,
  },
  statLabel: {
    fontSize: 10,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  statSublabel: {
    fontSize: 8,
    color: theme.colors.textMuted,
  },
  statValue: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginTop: 1,
  },
  greenText: {
    color: '#4CAF50',
  },
});
