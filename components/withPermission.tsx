import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { usePermission } from '@/hooks/usePermissions';
import { useRouter } from 'expo-router';
import React from 'react';
import { ActivityIndicator, View } from 'react-native';

interface WithPermissionProps {
  children: React.ReactNode;
  permissionKey: string;
  fallback?: React.ReactNode;
}

export function WithPermission({ 
  children, 
  permissionKey, 
  fallback 
}: WithPermissionProps) {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const { permitted, loading } = usePermission(permissionKey);

  React.useEffect(() => {
    if (!loading && !permitted) {
      router.replace('/dashboard/home');
    }
  }, [permitted, loading, router]);

  if (loading) {
    return (
      <View style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center',
        backgroundColor: Colors[colorScheme].background 
      }}>
        <ActivityIndicator size="large" color={Colors[colorScheme].primary} />
      </View>
    );
  }

  if (!permitted) {
    return fallback || null;
  }

  return <>{children}</>;
}

export function withPermission<P extends object>(
  Component: React.ComponentType<P>,
  permissionKey: string
) {
  return function WrappedComponent(props: P) {
    return (
      <WithPermission permissionKey={permissionKey}>
        <Component {...props} />
      </WithPermission>
    );
  };
}
