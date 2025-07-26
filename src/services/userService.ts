import { blink } from '../blink/client';

export interface UserStats {
  id: string;
  userId: string;
  email: string;
  plan: 'free' | 'pro' | 'admin';
  analysesUsedToday: number;
  dailyLimit: number;
  totalAnalyses: number;
  isAdmin: boolean;
  createdAt: string;
  lastAnalysisAt: string;
  lastQuotaReset: string;
}

export class UserService {
  static async initializeUser(userId: string, email: string): Promise<UserStats> {
    try {
      // Check if user already exists
      const existingUsers = await blink.db.users.list({
        where: { userId },
        limit: 1
      });

      if (existingUsers && existingUsers.length > 0) {
        return existingUsers[0] as UserStats;
      }

      // Create new user
      const newUser = {
        id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        email,
        plan: 'free' as const,
        analysesUsedToday: 0,
        dailyLimit: 3,
        totalAnalyses: 0,
        isAdmin: false,
        createdAt: new Date().toISOString(),
        lastAnalysisAt: '',
        lastQuotaReset: new Date().toISOString()
      };

      await blink.db.users.create(newUser);
      return newUser;

    } catch (error) {
      console.error('Error initializing user:', error);
      throw error;
    }
  }

  static async getUserStats(userId: string): Promise<UserStats | null> {
    try {
      const users = await blink.db.users.list({
        where: { userId },
        limit: 1
      });

      if (!users || users.length === 0) {
        return null;
      }

      const user = users[0] as UserStats;

      // Check if quota needs to be reset (daily reset)
      const lastReset = new Date(user.lastQuotaReset);
      const now = new Date();
      const isNewDay = lastReset.toDateString() !== now.toDateString();

      if (isNewDay) {
        await blink.db.users.update(user.id, {
          analysesUsedToday: 0,
          lastQuotaReset: now.toISOString()
        });
        user.analysesUsedToday = 0;
        user.lastQuotaReset = now.toISOString();
      }

      return user;

    } catch (error) {
      console.error('Error getting user stats:', error);
      return null;
    }
  }

  static async consumeAnalysisQuota(userId: string): Promise<boolean> {
    try {
      const user = await this.getUserStats(userId);
      if (!user) {
        throw new Error('User not found');
      }

      if (user.analysesUsedToday >= user.dailyLimit) {
        return false; // Quota exceeded
      }

      await blink.db.users.update(user.id, {
        analysesUsedToday: user.analysesUsedToday + 1,
        totalAnalyses: user.totalAnalyses + 1,
        lastAnalysisAt: new Date().toISOString()
      });

      return true;

    } catch (error) {
      console.error('Error consuming analysis quota:', error);
      return false;
    }
  }

  static async updateUserPlan(userId: string, plan: 'free' | 'pro' | 'admin'): Promise<boolean> {
    try {
      const user = await this.getUserStats(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const dailyLimit = plan === 'free' ? 3 : plan === 'pro' ? 999 : 999;
      const isAdmin = plan === 'admin';

      await blink.db.users.update(user.id, {
        plan,
        dailyLimit,
        isAdmin
      });

      return true;

    } catch (error) {
      console.error('Error updating user plan:', error);
      return false;
    }
  }

  static async resetUserQuota(userId: string): Promise<boolean> {
    try {
      const user = await this.getUserStats(userId);
      if (!user) {
        throw new Error('User not found');
      }

      await blink.db.users.update(user.id, {
        analysesUsedToday: 0,
        lastQuotaReset: new Date().toISOString()
      });

      return true;

    } catch (error) {
      console.error('Error resetting user quota:', error);
      return false;
    }
  }

  static async getAllUsers(): Promise<UserStats[]> {
    try {
      const users = await blink.db.users.list({
        orderBy: { createdAt: 'desc' },
        limit: 1000
      });

      return users as UserStats[];

    } catch (error) {
      console.error('Error getting all users:', error);
      return [];
    }
  }

  static async getUserAnalysisHistory(userId: string, limit: number = 10): Promise<any[]> {
    try {
      const analyses = await blink.db.analyses.list({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        limit
      });

      return analyses;

    } catch (error) {
      console.error('Error getting user analysis history:', error);
      return [];
    }
  }
}