import { t } from './shared';
import { authRouter } from './auth';
import { profileRouter } from './profile';
import { publicRouter } from './public';
import { adminRouter } from './admin';

export const appRouter = t.router({
  // Auth routes
  register: authRouter.register,
  login: authRouter.login,
  logout: authRouter.logout,

  // Profile routes
  getProfile: profileRouter.getProfile,
  updateProfile: profileRouter.updateProfile,

  // Public routes
  hello: publicRouter.hello,
  getUsersForCards: publicRouter.getUsersForCards,
  getNextUser: publicRouter.getNextUser,
  getVerifiedUserCount: publicRouter.getVerifiedUserCount,

  // Admin routes
  adminGetUsers: adminRouter.getUsers,
  adminUpdateUserStatus: adminRouter.updateUserStatus,
  adminUpgradeUserRole: adminRouter.upgradeUserRole,
});

export type AppRouter = typeof appRouter;
