import { StyleSheet, Dimensions } from 'react-native';
import theme from '../../theme/theme';

const { width, height: SCREEN_HEIGHT } = Dimensions.get('screen');
const DRAWER_WIDTH = width * 0.8;

export default StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    flexDirection: 'row',
    // No overflow:hidden — allows drawer to cover full screen including status bar
  },
  webOverlay: {
    width: '100%',
    maxWidth: 440,
    alignSelf: 'center',
  },
  drawerContainer: {
    // Use full physical screen height to cover status bar & home indicator areas
    height: SCREEN_HEIGHT,
    backgroundColor: '#070913',
    borderRightWidth: 1,
    borderRightColor: 'rgba(255, 255, 255, 0.05)',
    // paddingTop and paddingBottom are handled dynamically via safe area insets in ProfileDrawer.js
    paddingHorizontal: 16,
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  drawerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  drawerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  drawerCloseBtn: {
    padding: 4,
  },
  drawerAvatarSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  drawerAvatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 18,
  },
  avatarMetaInfo: {
    justifyContent: 'center',
  },
  drawerUsername: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  drawerUseridBadge: {
    fontSize: 10,
    color: '#29B6F6',
    fontWeight: '600',
    marginTop: 2,
  },
  drawerSectionDivider: {
    width: '100%',
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginVertical: 16,
  },
  drawerNavSection: {
    marginBottom: 10,
  },
  drawerSectionLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  drawerNavList: {
    width: '100%',
  },
  drawerNavItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 6,
  },
  activeNavItem: {
    backgroundColor: 'rgba(123, 31, 162, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(176, 133, 245, 0.15)',
  },
  navItemIcon: {
    marginRight: 12,
  },
  navItemLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  activeNavLabel: {
    color: '#B085F5',
  },
  drawerDetailsSection: {
    marginBottom: 20,
  },
  drawerDetailsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
    padding: 12,
  },
  drawerMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  metaIcon: {
    marginRight: 10,
  },
  metaTexts: {
    flex: 1,
  },
  metaLabel: {
    fontSize: 9,
    color: theme.colors.textMuted,
    fontWeight: '600',
  },
  metaValue: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: '500',
    marginTop: 1,
  },
  drawerActionContainer: {
    width: '100%',
  },
  drawerLogoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#C62828',
    borderRadius: 12,
    paddingVertical: 12,
  },
  logoutText: {
    color: '#FF5252',
    fontWeight: '700',
    fontSize: 13,
    marginLeft: 8,
  },
});
