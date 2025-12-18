export const auth = {
  login: `/auth/user/login`,
  signup: `/auth/signup`,
  gen: `/auth/api-key`,
  forgotPassword: `/auth/user/password/forgot`,
  resetPassword: `/auth/user/password/reset`,
  verifyOtp: `/auth/verify-otp`,
  resendOtp: `/auth/resend-otp`,
  changePassword: `/auth/user/password/change`,
};
export const documents = {
  getActiveTypes: `/document-types/active`,
  generateUploadUrl: `/documents/upload-url`,
  create: `/client/documents/create`,
  myDocuments: `/client/documents/my-documents`,
  updateContent: `/client/documents/update-content`,
  delete: `/client/documents/delete`,
};
export const dashboard = {
  summary: `/dashboard/summary`,
  messageSent: (type: string) => `/dashboard/message/sent/${type}`,
  messageGraph: (type: string) => `/dashboard/message/sent/${type}/graph`,
  messageNetworkGraph: (type: string) => `/dashboard/message/sent/${type}/network/graph`,
  scheduledMessages: `/dashboard/message/scheduled`,
  billingStats: `/dashboard/billing-stats`,
  clients: `/admin/dashboard/api-billing/clients`,
  clientReports: (type: string) => `/client/reports/sms/${type}`,
  clientTransactional: `/client/sms/transactional`,
  clientPromotional: `/client/sms/promotional`,
};
export const messages = {
  sendTransactional: `/message/send/transactional`,
  sendPromotional: `/message/send/promotional`,
  sendBulkMsisdn: `/message/send/bulk-msisdn`,
  sendContactGroup: `/message/send/contact-group`,
  sendUploadFile: `/message/send/upload-file`,
  allPromotional: `/message/all/promotional`,
  allTransactional: `/message/all/transactional`,
  allScheduled: `/message/all/scheduled`,
  allRecurring: `/message/all/recurring`,
  bulk: `/message/bulk`,
  bulkGroup: `/message/group`,
  bulkMsisdnList: `/message/msisdn-list`,
  bulkDetails: (id: string) => `/message/bulk/${id}/view`,
};
export const senders = {
  getClientSenderIdsList: `/client/senderid/view/table`, // Client sender IDs table
  getClientSenderIdsListForMessages: `/client/senderid/view/list`, // For send messages forms
  requestSenderId: `/configuration/sender/create`,
  // Admin endpoints (for admin panel)
  getAllSendersList: `/configuration/sender/view/list`, // All senders (admin only)
  getAllSendersTable: `/configuration/sender/view/table`, // All senders table (admin only)
  updateSender: (id: string | number) => `/configuration/sender/${id}/update`, // Update sender (status, sender_name, package_id, connector_id)
  deleteSender: (id: string | number) => `/configuration/sender/${id}/delete`, // Delete sender (admin only)
  addConnector: (id: string | number) => `/configuration/sender/${id}/add-connector`, // Add connector to sender
  removeConnector: (id: string | number) => `/configuration/sender/${id}/remove-connector`, // Remove connector from sender
  // Client-sender assignment endpoints
  assignSenderToClient: `/admin/client/senderid/create`, // Assign sender to client (admin only) - creates client_sender relation
  unassignSenderFromClient: `/admin/client/senderid/delete`, // Unassign sender from client (admin only) - deletes client_sender relation
  updateClientSenderStatus: `/client/senderid/update/status`, // Update client_sender.status (id = client_sender.id, status)
  updateClientSenderOTP: `/client/senderid/update/otp`, // Update client sender OTP status
};
export const adminUsers = {
  list: `/auth/user/all`,
  create: `/auth/user/create`,
  update: `/auth/user/update`,
  details: `/auth/user/all`, // Utiliser all avec user_id dans le payload pour filtrer
  changeStatus: `/auth/user/update/status`,
  delete: `/auth/user/delete`,
  roles: `/admin/role/all`, // Utiliser role/all pour obtenir tous les rôles
  clients: `/client/all`, // Utiliser client/all pour obtenir tous les clients
};

// Client User Management endpoints (for clients managing their own users)
export const clientUsers = {
  list: `/client/user`,
  create: `/client/user/create`,
  update: `/client/user/update`,
  changeStatus: `/client/user/update/status`,
  table: `/client/user/table`,
  role: `/client/user/role`,
  delete: `/client/user/delete`,
};
export const adminClients = {
  list: `/client/all`, // Retourne tous les clients (pas de pagination)
  create: `/client/create`,
  update: `/client/update`,
  details: `/client/all`, // Utiliser all avec client_id dans le payload pour filtrer
  changeStatus: `/client/status`,
  balance: `/client/balance`,
  smsTopup: `/client/sms/topup`,
  billingView: `/client/billing/view`,
  billingUpdate: `/client/billing/update`,
  table: `/client/table`, // Pour pagination avec VueTable format
  billingDebit: `/client/billing/debit`,
  creditTopup: `/admin/credit/topup`, // Credit client account (admin only)
  // ⚠️ Ces endpoints n'existent pas dans le backend - à créer ou utiliser des alternatives
  accountTypes: `/admin/client/account-types`, // ❌ N'EXISTE PAS - À créer dans le backend
  countryCodes: `/admin/client/countries`, // ❌ N'EXISTE PAS - À créer dans le backend
};
export const adminTokens = {
  list: `/client/tokens/list`, // Utiliser /client/tokens/list avec client_id: 0 pour tous les tokens
  create: `/auth/api-key`, // Utiliser GET /auth/api-key pour générer un token
  revoke: `/client/tokens/delete`, // Utiliser client/tokens/delete pour révoquer
  clients: `/client/all`, // Utiliser client/all pour obtenir tous les clients
  kybStatus: `/admin/kyb/history`, // Utiliser /admin/kyb/history avec client_id dans le payload
};
export const clientTokens = {
  createLive: `/client/tokens/create-live`,
  delete: `/client/tokens/delete`,
  list: `/client/tokens/list`,
  kybStatus: `/client/kyb/status`,
};
export const adminRoles = {
  list: `/admin/role/all`,
  create: `/admin/role/create`,
  update: `/admin/role/update`,
  changeStatus: `/admin/role/status`,
  delete: `/admin/role/delete`,
  permissions: `/admin/role/all`, // Utiliser /admin/role/all avec role_id dans le payload pour obtenir les permissions d'un rôle
  assignPermission: `/admin/role/assign`,
  revokePermission: `/admin/role/revoke`,
  availablePermissions: `/admin/action/all`, // Utiliser /admin/action/all pour obtenir toutes les actions disponibles (permissions = module + action)
};

// Module Management endpoints
export const adminModules = {
  list: `/admin/module/all`,
  create: `/admin/module/create`,
  delete: `/admin/module/delete`,
};

// Action Management endpoints
export const adminActions = {
  list: `/admin/action/all`, // Already used in adminRoles.availablePermissions
  create: `/admin/action/create`,
  delete: `/admin/action/delete`,
};
export const adminDocuments = {
  list: `/admin/client/documents/by-client`, // Utiliser by-client avec client_id: 0 pour tous les documents
  clientDocuments: `/admin/client/documents/by-client`, // Corriger le nom
  types: `/admin/document-types/all`,
  createType: `/admin/document-types/create`,
  getType: `/admin/document-types/view`,
  updateType: `/admin/document-types/update`,
  changeTypeStatus: `/admin/document-types/status`,
  deleteType: `/admin/document-types/delete`,
  // Admin Client Document Management
  adminCreate: `/admin/client/documents/create`,
  byClient: `/admin/client/documents/by-client`,
  adminUpdateContent: `/admin/client/documents/update-content`, // Admin endpoint for updating document content
  adminDelete: `/admin/client/documents/delete`, // Admin endpoint for deleting documents
};
export const adminStatistics = {
  global: `/dashboard/billing-stats`,
  billing: `/admin/dashboard/api-billing/clients`, // Vérifier si c'est le bon endpoint
  clients: `/admin/dashboard/api-billing/clients`,
};
export const adminKyb = {
  pending: `/admin/kyb/clients`, // Utilise clients avec kyb_status dans le payload
  clients: `/admin/kyb/clients`,
  history: `/admin/kyb/history`, // Utilise client_id dans le payload
  details: `/admin/kyb/history`, // Utilise history avec client_id au lieu de kyb_id
  approve: `/admin/kyb/approve`,
  reject: `/admin/kyb/reject`,
};
export const contacts = {
  create: `/contact/create`,
  upload: `/contact/upload`,
  groupList: `/contact/group/list`,
  group: `/contact/group`,
  groupUpdate: `/contact/group/update`,
  groupDelete: `/contact/group/delete`,
  groupMsisdnUpdate: `/contact/group/msisdn/update`,
  groupMsisdnStatus: `/contact/group/msisdn/status`,
  groupMsisdnDelete: `/contact/group/msisdn/delete`,
};
export const topup = {
  mnoProviders: `/mno/providers`,
  mnoSelfTopup: `/client/self/topup`,
  mnoTopupHistory: `/client/self/topup/history`,
  clientBalance: `/client/balance`,
  clientSmsTopup: `/client/sms/topup`,
  // Admin Manual Topup
  createManualTopup: `/admin/topup/request`,
  getManualTopupRequests: `/admin/topup/requests`,
  getManualTopupRequestDetails: `/admin/topup/request/view`,
  getAvailableConnectors: `/admin/topup/connectors`,
  clientPayment: `/client/payment`,
};
export const notifications = {
  list: `/notifications/list`,
  markAsRead: `/notifications/mark-read`,
  markAllAsRead: `/notifications/mark-all-read`,
  delete: `/notifications/delete`,
  deleteAll: `/notifications/delete-all`,
  preferences: `/notifications/preferences`,
};
export const adminPricing = {
  configActive: `/admin/pricing/config/active`,
  configUpdate: `/admin/pricing/config/update`,
  tiersList: `/admin/pricing/tiers/list`,
  tiersCreate: `/admin/pricing/tiers/create`,
  tiersUpdate: `/admin/pricing/tiers/update`,
  tiersToggle: `/admin/pricing/tiers/toggle`,
};
export const adminBenefit = {
  graph: `/admin/benefit/graph`,
  byTier: `/admin/benefit/by-tier`,
  byClient: `/admin/benefit/by-client`,
  details: `/admin/benefit/details`,
};
export const connectors = {
  getAll: `/connector/all`,
  upsert: `/connector/upsert`,
  delete: (id: string | number) => `/connector/${id}/delete`,
  getById: (id: string | number) => `/connector/${id}/view`,
};

export const admin = {
  clients: adminClients,
  users: adminUsers,
  tokens: adminTokens,
  roles: adminRoles,
  modules: adminModules,
  actions: adminActions,
  documents: adminDocuments,
  statistics: adminStatistics,
  kyb: adminKyb,
  pricing: adminPricing,
  benefit: adminBenefit,
};

export const client = {
  users: clientUsers,
  tokens: clientTokens,
};

export const apiLink = {
  auth,
  documents,
  dashboard,
  messages,
  senders,
  connectors,
  adminUsers,
  clientUsers,
  adminClients,
  adminTokens,
  clientTokens,
  adminRoles,
  adminModules,
  adminActions,
  adminDocuments,
  adminStatistics,
  adminKyb,
  contacts,
  topup,
  notifications,
  adminPricing,
  adminBenefit,
  admin,
  client,
};
