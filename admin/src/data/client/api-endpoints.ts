export const API_ENDPOINTS = {
  // Authentication endpoints
  REGISTER: 'auth/register',
  LOGIN: 'auth/login',
  LOGOUT: 'auth/logout',
  ME: 'auth/me',
  REFRESH_TOKEN: 'auth/refresh-token',
  FORGET_PASSWORD: 'auth/forgot-password',
  RESET_PASSWORD: 'auth/reset-password',
  CHANGE_PASSWORD: 'auth/update-password',
  
  // User management endpoints
  USERS: 'auth/users',
  USER_APPROVE: 'auth/users/:id/approve',
  USER_BAN: 'auth/users/:id/ban',
  USER_DELETE: 'auth/users/:id',
  USER_PERMISSIONS: 'auth/users/:id/permissions',
  ALL_PERMISSIONS: 'auth/permissions',
  ROLES: 'roles',
  
  // Business endpoints
  BUSINESSES: 'businesses',
  BUSINESS_CREATE: 'businesses',
  BUSINESS_UPDATE: 'businesses/:id',
  BUSINESS_DELETE: 'businesses/:id',
  BUSINESS_ACTIVATE: 'businesses/:id/activate',
  BUSINESS_DEACTIVATE: 'businesses/:id/deactivate',
  BUSINESS_BY_OWNER: 'businesses/owner/:ownerId',
  BUSINESS_UPDATE_OWNER: 'businesses/:id/owner',
  
  // Location endpoints
  LOCATIONS: 'locations',
  LOCATION_CREATE: 'locations',
  LOCATION_UPDATE: 'locations/:id',
  LOCATION_DELETE: 'locations/:id',
  LOCATION_ACTIVATE: 'locations/:id/activate',
  LOCATION_DEACTIVATE: 'locations/:id/deactivate',
  LOCATION_NEARBY: 'locations/nearby',
  LOCATIONS_BY_BUSINESS: 'locations/business/:businessId',
  
  // Legacy endpoints
  SETTINGS: 'settings',
  PROFILE_UPDATE: 'profile-update',
  
  // Additional endpoints for compatibility (may not exist in customize_server yet)
  VERIFY_FORGET_PASSWORD_TOKEN: 'auth/verify-reset-token',
  SEND_VERIFICATION_EMAIL: 'auth/send-verification-email',
  UPDATE_EMAIL: 'auth/update-email',
  ADD_WALLET_POINTS: 'auth/add-wallet-points',
  ADD_LICENSE_KEY_VERIFY: 'auth/verify-license',
  
  // User management endpoints (legacy - using USERS endpoint with role filters)
  STAFFS: 'auth/users',
  ADMIN_LIST: 'auth/users', 
  CUSTOMERS: 'auth/users',
  VENDORS_LIST: 'auth/users',
  MY_STAFFS: 'auth/users',
  ALL_STAFFS: 'auth/users',
  
  // Placeholder endpoints
  PRODUCTS: 'products',
  ORDERS: 'orders',
  CATEGORIES: 'categories',
  TYPES: 'types',
  ANALYTICS: 'analytics',
  
  // Product endpoints
  POPULAR_PRODUCTS: 'products/popular',
  LOW_STOCK_PRODUCTS_ANALYTICS: 'products/low-stock',
  CATEGORY_WISE_PRODUCTS: 'products/category-wise',
  CATEGORY_WISE_PRODUCTS_SALE: 'products/category-wise-sale',
  TOP_RATED_PRODUCTS: 'products/top-rated',
  
  // Withdraw endpoints
  WITHDRAWS: 'withdraws',
  APPROVE_WITHDRAW: 'withdraws/:id/approve',
};
