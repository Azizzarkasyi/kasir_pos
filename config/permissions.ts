export type UserRole = 'owner' | 'manager' | 'cashier';

export interface MenuPermission {
  key: string;
  roles: UserRole[];
}

export const MENU_PERMISSIONS: MenuPermission[] = [
  // Dashboard
  {
    key: 'dashboard',
    roles: ['owner', 'manager', 'cashier']
  },
  
  // Transaction
  {
    key: 'transaction',
    roles: ['owner', 'manager', 'cashier']
  },
  
  // Reports
  {
    key: 'reports',
    roles: ['owner', 'manager']
  },
  
  // Products
  {
    key: 'products',
    roles: ['owner', 'manager']
  },
  
  // Categories
  {
    key: 'categories',
    roles: ['owner', 'manager']
  },
  
  // Customers
  {
    key: 'customers',
    roles: ['owner', 'manager']
  },
  
  // Suppliers
  {
    key: 'suppliers',
    roles: ['owner', 'manager']
  },
  
  // Employee Management
  {
    key: 'employees',
    roles: ['owner']
  },
  
  // Outlet Management
  {
    key: 'outlets',
    roles: ['owner']
  },
  
  // General Settings
  {
    key: 'settings',
    roles: ['owner', 'manager', 'cashier']
  },
  
  // Scanner
  {
    key: 'scanner',
    roles: ['owner', 'manager', 'cashier']
  },
  
  // Receipt
  {
    key: 'receipt',
    roles: ['owner', 'manager', 'cashier']
  },
  
  // Printer
  {
    key: 'printer',
    roles: ['owner', 'manager', 'cashier']
  }
];

export const ROLE_HIERARCHY: Record<UserRole, number> = {
  owner: 3,
  manager: 2,
  cashier: 1
};

export function hasPermission(userRole: UserRole, menuKey: string): boolean {
  const permission = MENU_PERMISSIONS.find(p => p.key === menuKey);
  if (!permission) return false;
  return permission.roles.includes(userRole);
}

export function canAccessRole(requiredRole: UserRole, userRole: UserRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}
