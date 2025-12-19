import { useUserStore } from '../stores/user-store';

export const useUserPlan = () => {
  const { user, isLoading, refreshUser } = useUserStore();
  
  // Get plan info from store
  const isPro = user?.plan !== null && user?.plan !== undefined;
  const isBasic = !isPro && !isLoading;
  
  return { 
    isPro, 
    loading: isLoading, 
    isBasic,
    refreshUser,
    plan: user?.plan || null
  };
};
