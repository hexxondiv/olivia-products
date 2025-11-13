/**
 * Role-based permissions configuration
 * Defines what each role can access in the CMS
 */

export type Role = 'admin' | 'sales' | 'support';

export interface RoutePermissions {
  path: string;
  roles: Role[];
  description: string;
}

export interface FeaturePermissions {
  [key: string]: {
    roles: Role[];
    description: string;
  };
}

// Define which routes each role can access
export const routePermissions: RoutePermissions[] = [
  {
    path: '/cms',
    roles: ['admin', 'sales', 'support'],
    description: 'Dashboard - All roles can view',
  },
  {
    path: '/cms/profile',
    roles: ['admin', 'sales', 'support'],
    description: 'Profile management - All roles can access',
  },
  {
    path: '/cms/products',
    roles: ['admin', 'sales'],
    description: 'Products - Admin and Sales can manage',
  },
  {
    path: '/cms/orders',
    roles: ['admin', 'sales'],
    description: 'Orders - Admin and Sales can manage',
  },
  {
    path: '/cms/wholesale',
    roles: ['admin', 'sales'],
    description: 'Wholesale - Admin and Sales can manage',
  },
  {
    path: '/cms/stock',
    roles: ['admin', 'sales'],
    description: 'Stock management - Admin and Sales can manage',
  },
  {
    path: '/cms/contacts',
    roles: ['admin', 'sales', 'support'],
    description: 'Contacts - All roles can view and reply',
  },
  {
    path: '/cms/faqs',
    roles: ['admin', 'support'],
    description: 'FAQs - Admin and Support can manage',
  },
  {
    path: '/cms/testimonials',
    roles: ['admin', 'support'],
    description: 'Testimonials - Admin and Support can manage',
  },
  {
    path: '/cms/flash-info',
    roles: ['admin', 'support'],
    description: 'Flash Info - Admin and Support can manage',
  },
  {
    path: '/cms/admin-users',
    roles: ['admin'],
    description: 'User management - Admin only',
  },
];

// Define feature-level permissions
export const featurePermissions: FeaturePermissions = {
  // Product management
  'products.create': { roles: ['admin', 'sales'], description: 'Create products' },
  'products.edit': { roles: ['admin', 'sales'], description: 'Edit products' },
  'products.delete': { roles: ['admin'], description: 'Delete products' },
  'products.view': { roles: ['admin', 'sales'], description: 'View products' },

  // Order management
  'orders.view': { roles: ['admin', 'sales'], description: 'View orders' },
  'orders.update': { roles: ['admin', 'sales'], description: 'Update order status' },
  'orders.delete': { roles: ['admin'], description: 'Delete orders' },

  // Contact management
  'contacts.view': { roles: ['admin', 'sales', 'support'], description: 'View contacts' },
  'contacts.reply': { roles: ['admin', 'sales', 'support'], description: 'Reply to contacts' },
  'contacts.delete': { roles: ['admin'], description: 'Delete contacts' },

  // Wholesale management
  'wholesale.view': { roles: ['admin', 'sales'], description: 'View wholesale applications' },
  'wholesale.update': { roles: ['admin', 'sales'], description: 'Update wholesale status' },
  'wholesale.delete': { roles: ['admin'], description: 'Delete wholesale applications' },

  // Stock management
  'stock.view': { roles: ['admin', 'sales'], description: 'View stock' },
  'stock.update': { roles: ['admin', 'sales'], description: 'Update stock' },
  'stock.delete': { roles: ['admin'], description: 'Delete stock records' },

  // Content management
  'faqs.manage': { roles: ['admin', 'support'], description: 'Manage FAQs' },
  'testimonials.manage': { roles: ['admin', 'support'], description: 'Manage testimonials' },
  'flash-info.manage': { roles: ['admin', 'support'], description: 'Manage flash info' },

  // User management
  'users.manage': { roles: ['admin'], description: 'Manage users' },
};

/**
 * Check if a role has access to a route
 */
export function canAccessRoute(role: Role | undefined, path: string): boolean {
  if (!role) return false;
  
  const permission = routePermissions.find((p) => p.path === path);
  if (!permission) {
    // If route not in permissions list, default to admin only for security
    return role === 'admin';
  }
  
  return permission.roles.includes(role);
}

/**
 * Check if a role has access to a feature
 */
export function canAccessFeature(role: Role | undefined, feature: string): boolean {
  if (!role) return false;
  
  const permission = featurePermissions[feature];
  if (!permission) {
    // If feature not in permissions list, default to admin only for security
    return role === 'admin';
  }
  
  return permission.roles.includes(role);
}

/**
 * Get all accessible routes for a role
 */
export function getAccessibleRoutes(role: Role | undefined): string[] {
  if (!role) return [];
  
  return routePermissions
    .filter((p) => p.roles.includes(role))
    .map((p) => p.path);
}

/**
 * Check if user is admin
 */
export function isAdmin(role: Role | undefined): boolean {
  return role === 'admin';
}

/**
 * Check if user is sales
 */
export function isSales(role: Role | undefined): boolean {
  return role === 'sales';
}

/**
 * Check if user is support
 */
export function isSupport(role: Role | undefined): boolean {
  return role === 'support';
}

