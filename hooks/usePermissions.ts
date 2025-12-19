import { UserRole, canAccessRole, hasPermission } from '@/config/permissions';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

export function usePermissions() {
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserRole();
  }, []);

  const loadUserRole = async () => {
    try {
      const role = await AsyncStorage.getItem('user_role');
      if (role && ['owner', 'manager', 'cashier'].includes(role)) {
        setUserRole(role as UserRole);
      }
    } catch (error) {
      console.error('Error loading user role:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveUserRole = async (role: UserRole) => {
    try {
      await AsyncStorage.setItem('user_role', role);
      setUserRole(role);
    } catch (error) {
      console.error('Error saving user role:', error);
    }
  };

  const clearUserRole = async () => {
    try {
      await AsyncStorage.removeItem('user_role');
      setUserRole(null);
    } catch (error) {
      console.error('Error clearing user role:', error);
    }
  };

  const checkPermission = (menuKey: string): boolean => {
    if (!userRole) return false;
    return hasPermission(userRole, menuKey);
  };

  const checkRoleAccess = (requiredRole: UserRole): boolean => {
    if (!userRole) return false;
    return canAccessRole(requiredRole, userRole);
  };

  return {
    userRole,
    loading,
    saveUserRole,
    clearUserRole,
    hasPermission: checkPermission,
    canAccessRole: checkRoleAccess,
  };
}

export function usePermission(menuKey: string) {
  const { hasPermission, loading } = usePermissions();
  const [permitted, setPermitted] = useState(false);

  useEffect(() => {
    if (!loading) {
      setPermitted(hasPermission(menuKey));
    }
  }, [menuKey, hasPermission, loading]);

  return { permitted, loading };
}
