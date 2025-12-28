import AsyncStorage from '@react-native-async-storage/async-storage';

export interface UserData {
  id: number;
  name: string;
  phone: string;
  email?: string;
  role?: string;
  plan?: string;
  is_verified?: boolean;
}

export const getUserPlan = async (): Promise<string | null> => {
  try {
    const userDataStr = await AsyncStorage.getItem('user_data');
    if (!userDataStr) return null;
    
    const userData: UserData = JSON.parse(userDataStr);
    return userData.plan || null;
  } catch (error) {
    console.error('Error getting user plan:', error);
    return null;
  }
};

export const getUserRole = async (): Promise<string | null> => {
  try {
    const userDataStr = await AsyncStorage.getItem('user_data');
    if (!userDataStr) return null;
    
    const userData: UserData = JSON.parse(userDataStr);
    return userData.role || null;
  } catch (error) {
    console.error('Error getting user role:', error);
    return null;
  }
};

export const isProPlan = async (): Promise<boolean> => {
  const plan = await getUserPlan();
  return plan === 'pro' || plan === 'trial';
};

export const saveUserData = async (userData: UserData): Promise<void> => {
  try {
    await AsyncStorage.setItem('user_data', JSON.stringify(userData));
  } catch (error) {
    console.error('Error saving user data:', error);
  }
};
