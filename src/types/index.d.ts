export interface CredentialsAuth {
  email?: string;
  msisdn?: string;
}
export interface CredentialsAuthWithPwd extends CredentialsAuth {
  password: string;
}
export interface ForgotPasswordRequest {
  email?: string;
  msisdn?: string;
}
export interface ForgotPasswordResponse {
  status: number;
  message: string;
}
export interface ResetPasswordRequest {
  token: string;
  new_password: string;
}
export interface ResetPasswordResponse {
  status: number;
  message: string;
}
export interface SignupData {
  company_name: string;
  full_name: string;
  msisdn: string;
  email: string;
  country_code: string;
  address: string;
  password: string;
}
export interface ResponseLog {
  status: number;
  message: MessageResponseLog;
  histories?: unknown;
  apiKey?: string;
}
export interface MessageResponseLog {
  token: string;
  user: UserResponseLog;
  client: ClientResponseLog;
  client_billing: ClientBillingResponseLog;
  has_documents: number;
}
export interface UserResponseLog {
  id: number;
  full_name: string;
  email: string;
  msisdn: string;
  country_code: string;
  status: number;
  role_id: number;
  created: string;
  updated: string;
  deleted: string | null;
}
export interface ClientResponseLog {
  id: number;
  name: string;
  address: string;
  msisdn: string;
  email: string;
  account_type: string;
  created: string;
  updated: string;
}
export interface ClientBillingResponseLog {
  id: number;
  client_id: number;
  billing_mode: string;
  billing_type: string | null;
  billing_rate: number;
  credit_limit: number | null;
  balance: number;
  bonus: number;
  created: string;
  updated: string;
}
export interface DocumentType {
  id: number;
  name: string;
  description: string;
  status: number;
  created: string;
  updated: string;
}
export interface DocumentTypesResponse {
  status: number;
  message: DocumentType[];
}
export interface PresignedUrlRequest {
  file_extension: string;
  file_type: string;
}
export interface PresignedUrlResponse {
  status: number;
  message: {
    upload_url: string;
    file_path: string;
  };
}
export interface DocumentCreateItem {
  document_type_id: number;
  file_path: string;
  document_name: string;
  document_number: string;
}
export interface DocumentCreateRequest {
  documents: DocumentCreateItem[];
}
export interface DocumentCreateResponse {
  status: number;
  message: string;
}
export interface MyDocumentsRequest {
  page?: number;
  per_page?: number;
  search?: string;
  sort?: string;
  order?: string;
}
export interface MyDocumentsResponse {
  status: number;
  message: {
    documents: unknown[];
    pagination: {
      current_page: number;
      per_page: number;
      total: number;
      total_pages: number;
    };
  };
}
export interface DashboardSummaryRequest {
  start?: string;
  end?: string;
}
export interface DashboardSummaryResponse {
  status: number;
  message: {
    total_sent?: number;
    total_delivered?: number;
    total_failed?: number;
    total_pending?: number;
    promotional_sent?: number;
    transactional_sent?: number;
    balance?: number;
    credit_limit?: number;
    bonus?: number;
    [key: string]: unknown;
  };
}
export interface MessageSentRequest {
  start?: string;
  end?: string;
  page?: number;
  limit?: number;
}
export interface MessageSentResponse {
  status: number;
  message: {
    messages?: unknown[];
    pagination?: {
      current_page: number;
      per_page: number;
      total: number;
      total_pages: number;
    };
    [key: string]: unknown;
  };
}
export interface MessageGraphRequest {
  start: string;
  end: string;
}
export interface MessageGraphResponse {
  status: number;
  message: {
    labels?: string[];
    data?: number[];
    [key: string]: unknown;
  };
}
export interface ScheduledMessagesRequest {
  page?: number;
  limit?: number;
}
export interface ScheduledMessagesResponse {
  status: number;
  message: {
    messages?: unknown[];
    pagination?: {
      current_page: number;
      per_page: number;
      total: number;
      total_pages: number;
    };
    [key: string]: unknown;
  };
}
export interface BillingStatsRequest {
  start?: string;
  end?: string;
}
export interface BillingStatsResponse {
  status?: number;
  message?: {
    total_clients: number;
    total_amount_spent: number;
    system_balance: number;
    [key: string]: unknown;
  };
  total_clients?: number;
  total_amount_spent?: number;
  system_balance?: number;
  [key: string]: unknown;
}
export interface Client {
  id: number;
  name: string;
  email: string;
  phone: number;
  status: string;
  kyb_status: string;
  compliance_status: string;
  registered_at: string;
  last_login: string;
  total_sms_sent: number;
  total_spent: number;
  account_type: string | null;
  country: string;
  balance: number;
}
export interface ClientsSummary {
  total_count: number;
  active_count: number;
  pending_count: number;
  compliance_pending: number;
  today_count: number;
  week_count: number;
  month_count: number;
}
export interface ClientsListRequest {
  page: number;
  per_page: number;
  search?: string;
  sort?: string;
  order?: "asc" | "desc";
}
export interface ClientsListResponse {
  current_page: number;
  data: {
    clients: Client[];
    summary: ClientsSummary;
  };
  from: number;
  last_page: number;
  next_page_url: string | null;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}
export interface ClientReportsRequest {
  id?: number; // Client ID
  start?: string;
  end?: string;
}
export interface ClientReportsResponse {
  status: number;
  message: Array<{
    delivered?: number;
    sent?: number;
    pending?: number;
    failed?: number;
    connector_name?: string; // Pour Network Report
    sender_id?: string; // Pour Sender Report
    [key: string]: unknown;
  }>;
}
export interface ClientSMSRequest {
  page?: number;
  limit?: number;
  start_date?: string;
  end_date?: string;
  search?: string;
  sort?: string;
  order?: "asc" | "desc";
}
export interface ClientSMSResponse {
  status: number;
  message: {
    messages?: unknown[];
    pagination?: {
      current_page: number;
      per_page: number;
      total: number;
      total_pages: number;
    };
    [key: string]: unknown;
  };
}
export interface SendTransactionalSMSRequest {
  msisdn: string;
  message: string;
  sender_id: string;
  callback_url?: string;
  country_code?: string;
}
export interface SendTransactionalSMSResponse {
  status: number;
  message: string;
  data?: {
    message_id?: string;
    status?: string;
    [key: string]: unknown;
  };
}
export interface SendPromotionalSMSRequest {
  msisdn: string;
  message: string;
  sender_id: string;
  callback_url?: string;
  country_code?: string;
  schedule?: boolean;
  send_date?: string;
  send_time?: string;
  schedule_date?: string;
  date?: string;
}
export interface SendPromotionalSMSResponse {
  status: number;
  message: string;
  data?: {
    message_id?: string;
    status?: string;
    scheduled?: boolean;
    [key: string]: unknown;
  };
}
export interface SendBulkMsisdnSMSRequest {
  msisdn_list: string[];
  message: string;
  sender_id: string;
  campaign_name: string;
  schedule?: boolean;
  route?: string;
  service?: string;
  send_date?: string;
  send_time?: string;
  date?: string;
  repeat_type?: string;
}
export interface SendBulkMsisdnSMSResponse {
  status: number;
  message: string;
  data?: {
    total_sent?: number;
    message_ids?: string[];
    [key: string]: unknown;
  };
}
export interface SendContactGroupSMSRequest {
  contact_group_id: string;
  message: string;
  sender_id: string;
  campaign_name: string;
  sms_type?: "PLAIN" | "CUSTOM";
  schedule?: boolean;
  route?: string;
  service?: string;
  date?: string;
  send_time?: string;
  repeat_type?: string;
}
export interface SendContactGroupSMSResponse {
  status: number;
  message: string;
  data?: {
    total_sent?: number;
    message_ids?: string[];
    [key: string]: unknown;
  };
}
export interface SendUploadFileSMSRequest {
  file: File;
  message: string;
  sender_id: string;
  campaign_name: string;
  route?: string;
  service?: string;
  schedule?: boolean;
  send_date?: string;
  send_time?: string;
  date?: string;
  repeat_type?: string;
}
export interface SendUploadFileSMSResponse {
  status: number;
  message: string;
  data?: {
    total_sent?: number;
    message_ids?: string[];
    [key: string]: unknown;
  };
}
export interface SenderID {
  id: number;
  code: string;
  connector_id: number;
  connector_name?: string; // Can be empty string or undefined
  connectors: Array<{
    id: number;
    name: string;
  }>;
  created: string;
  package_id: number;
  status: number;
  [key: string]: unknown;
}
export interface GetClientSenderIdsListRequest {
  [key: string]: never;
}
export interface GetClientSenderIdsListResponse {
  status: number;
  message: SenderID[];
  data?: SenderID[];
}
export interface AdminUser {
  id: number | string;
  full_name: string;
  email: string;
  msisdn?: string;
  role?: string;
  role_id?: number | string;
  status?: number | string; // Ancien champ, peut être présent
  user_status?: number | string; // Nouveau champ retourné par l'API
  created?: string;
  created_at?: string;
  updated?: string;
  updated_at?: string;
  client_id?: number | string;
  role_name?: string;
  role_status?: number | string;
  country_code?: string;
  [key: string]: unknown;
}
export interface PaginationInfo {
  current_page?: number;
  per_page?: number;
  total?: number;
  total_pages?: number;
  last_page?: number;
  from?: number;
  to?: number;
  [key: string]: unknown;
}
export interface AdminUsersListRequest {
  page?: number;
  per_page?: number;
  search?: string;
  status?: string | number;
  role_id?: string | number;
  sort?: string;
  order?: string;
}
export interface AdminUsersListResponse {
  status: number;
  message?: {
    data?: AdminUser[];
    users?: AdminUser[];
    pagination?: PaginationInfo;
    [key: string]: unknown;
  };
  data?: {
    data?: AdminUser[];
    users?: AdminUser[];
    pagination?: PaginationInfo;
    [key: string]: unknown;
  };
  users?: AdminUser[];
  pagination?: PaginationInfo;
  [key: string]: unknown;
}
export interface AdminCreateUserRequest {
  full_name: string;
  email: string;
  password: string;
  msisdn: string;
  role_id: string | number;
  client_id: string | number;
}
export interface AdminUpdateUserRequest {
  user_id: string | number;
  full_name?: string;
  email?: string;
  password?: string;
  msisdn?: string;
  role_id?: string | number;
  client_id?: string | number;
}
export interface AdminUserDetailsRequest {
  user_id: string | number;
}
export interface AdminUserDetailsResponse {
  status: number;
  message?: AdminUser;
  data?: AdminUser;
  [key: string]: unknown;
}
export interface AdminUserStatusRequest {
  user_id: string | number;
  status: string | number;
}
export interface AdminSimpleResponse {
  status: number;
  message: string;
  data?: unknown;
  [key: string]: unknown;
}
export interface AdminUserRole {
  id: number | string;
  name: string;
  [key: string]: unknown;
}
export interface AdminUserRolesResponse {
  status: number;
  message?: AdminUserRole[];
  data?: AdminUserRole[];
  [key: string]: unknown;
}
export interface AdminUserClient {
  id: number | string;
  name: string;
  [key: string]: unknown;
}
export interface AdminUserClientsResponse {
  status: number;
  message?: AdminUserClient[];
  data?: AdminUserClient[];
  [key: string]: unknown;
}
export interface AdminClient {
  id?: number | string;
  name?: string;
  email?: string;
  msisdn?: string;
  status?: string | number;
  account_type?: string | number;
  country_code?: string;
  address?: string;
  created_at?: string;
  [key: string]: unknown;
}
export interface AdminClientsListRequest {
  page?: number;
  per_page?: number;
  search?: string;
  status?: string | number;
  account_type?: string | number;
  country_code?: string;
  sort?: string;
  order?: string;
}
export interface AdminClientsListResponse {
  status: number;
  message?: {
    data?: AdminClient[];
    clients?: AdminClient[];
    pagination?: PaginationInfo;
    [key: string]: unknown;
  };
  data?: {
    data?: AdminClient[];
    clients?: AdminClient[];
    pagination?: PaginationInfo;
    [key: string]: unknown;
  };
  clients?: AdminClient[];
  pagination?: PaginationInfo;
  [key: string]: unknown;
}
export interface AdminCreateClientRequest {
  name: string;
  email: string;
  msisdn: string;
  account_type: string | number;
  country_code?: string;
  address?: string;
}
export interface AdminUpdateClientRequest {
  client_id: string | number;
  name?: string;
  email?: string;
  msisdn?: string;
  account_type?: string | number;
  country_code?: string;
  address?: string;
  status?: string | number;
}
export interface AdminClientDetailsRequest {
  client_id: string | number;
}
export interface AdminClientDetailsResponse {
  status: number;
  message?: AdminClient;
  data?: AdminClient;
  [key: string]: unknown;
}
export interface AdminClientStatusRequest {
  client_id: string | number;
  status: string | number;
}
export interface AdminClientAccountType {
  id?: number | string;
  name?: string;
  label?: string;
  code?: string;
  [key: string]: unknown;
}
export interface AdminClientAccountTypesResponse {
  status: number;
  message?: AdminClientAccountType[];
  data?: AdminClientAccountType[];
  [key: string]: unknown;
}
export interface AdminClientCountry {
  code: string;
  prefix?: string;
  name?: string;
  dial_code?: string;
  [key: string]: unknown;
}
export interface AdminClientCountriesResponse {
  status: number;
  message?: AdminClientCountry[];
  data?: AdminClientCountry[];
  [key: string]: unknown;
}
export interface AdminToken {
  id?: number | string;
  client_id?: number | string;
  client_name?: string;
  token?: string;
  status?: string | number;
  token_type?: string;
  created_at?: string;
  last_used_at?: string;
  [key: string]: unknown;
}
export interface AdminTokensListRequest {
  page?: number;
  per_page?: number;
  search?: string;
  status?: string | number;
  token_type?: string;
  client_id?: string | number;
  sort?: string;
  order?: string;
}
export interface AdminTokensListResponse {
  status: number;
  message?: {
    data?: AdminToken[];
    tokens?: AdminToken[];
    pagination?: PaginationInfo;
    [key: string]: unknown;
  };
  data?: {
    data?: AdminToken[];
    tokens?: AdminToken[];
    pagination?: PaginationInfo;
    [key: string]: unknown;
  };
  tokens?: AdminToken[];
  pagination?: PaginationInfo;
  [key: string]: unknown;
}
export interface AdminCreateTokenRequest {
  client_id: string | number;
  token_type: string;
  label?: string;
}
export interface AdminTokenStatusRequest {
  token_id: string | number;
  status: string | number;
}
export interface AdminTokenClientsResponse {
  status: number;
  message?:
    | {
        clients?: AdminClient[];
        [key: string]: unknown;
      }
    | AdminClient[];
  data?:
    | {
        clients?: AdminClient[];
        [key: string]: unknown;
      }
    | AdminClient[];
  clients?: AdminClient[];
  [key: string]: unknown;
}
export interface AdminTokenKYBRecord {
  id?: number | string;
  client_id?: number | string;
  client_name?: string;
  kyb_status?: string;
  token_status?: string;
  verified_at?: string;
  updated_at?: string;
  [key: string]: unknown;
}
export interface AdminTokenKYBStatusRequest {
  page?: number;
  per_page?: number;
  search?: string;
  kyb_status?: string;
  token_status?: string;
}
export interface AdminTokenKYBStatusResponse {
  status: number;
  message?: {
    data?: AdminTokenKYBRecord[];
    records?: AdminTokenKYBRecord[];
    pagination?: PaginationInfo;
    [key: string]: unknown;
  };
  data?: {
    data?: AdminTokenKYBRecord[];
    records?: AdminTokenKYBRecord[];
    pagination?: PaginationInfo;
    [key: string]: unknown;
  };
  records?: AdminTokenKYBRecord[];
  pagination?: PaginationInfo;
  [key: string]: unknown;
}
// Client Token Management Types
export interface ClientToken {
  id?: number | string;
  token?: string;
  token_id?: string | number;
  key?: string;
  status?: string | number;
  token_type?: string;
  type?: string;
  label?: string; // For backward compatibility
  token_name?: string; // Backend returns token_name
  created_at?: string;
  created?: string;
  createdOn?: string;
  last_used_at?: string;
  // Additional fields from backend response
  sms_limit?: number;
  sms_remaining?: number;
  sms_used?: number;
  usage_count?: number;
  [key: string]: unknown;
}
export interface ClientCreateLiveTokenRequest {
  name: string; // Required by backend - token name
  description?: string; // Optional - defaults to "LIVE API Token"
}
export interface ClientDeleteTokenRequest {
  token_id: string | number;
}
export interface ClientTokensListRequest {
  page?: number;
  per_page?: number;
  search?: string;
  status?: string | number;
  token_type?: string;
  sort?: string;
  order?: string;
}
export interface ClientTokensListResponse {
  status: number;
  message?: {
    data?: ClientToken[];
    tokens?: ClientToken[];
    pagination?: PaginationInfo;
    [key: string]: unknown;
  };
  data?: {
    data?: ClientToken[];
    tokens?: ClientToken[];
    pagination?: PaginationInfo;
    [key: string]: unknown;
  };
  tokens?: ClientToken[];
  pagination?: PaginationInfo;
  [key: string]: unknown;
}
export interface ClientCreateLiveTokenResponse {
  status: number;
  message?:
    | string
    | {
        token_value?: string; // Backend returns token_value in message
        token?: string;
        token_id?: string | number;
        token_name?: string;
        token_type?: string;
        description?: string;
        sms_limit?: number | null;
        expires_at?: string;
        created_at?: string;
        [key: string]: unknown;
      };
  data?: {
    token_value?: string; // Backend returns token_value in data
    token?: string;
    token_id?: string | number;
    token_name?: string;
    token_type?: string;
    description?: string;
    sms_limit?: number | null;
    expires_at?: string;
    created_at?: string;
    [key: string]: unknown;
  };
  token_value?: string; // Backend may return token_value directly
  token?: string;
  token_id?: string | number;
  token_name?: string;
  token_type?: string;
  description?: string;
  sms_limit?: number | null;
  expires_at?: string;
  created_at?: string;
  [key: string]: unknown;
}
export interface ClientSimpleResponse {
  status: number;
  message?: string;
  data?: unknown;
  [key: string]: unknown;
}
export interface ClientKYBStatusResponse {
  status: number;
  message?: {
    can_generate_tokens?: boolean;
    client_id?: number | string;
    client_name?: string;
    created?: string;
    kyb_status?: string;
    live_tokens?: number;
    test_tokens?: number;
    status?: string;
    verified_at?: string;
    updated_at?: string;
    [key: string]: unknown;
  };
  data?: {
    can_generate_tokens?: boolean;
    client_id?: number | string;
    client_name?: string;
    created?: string;
    kyb_status?: string;
    live_tokens?: number;
    test_tokens?: number;
    status?: string;
    verified_at?: string;
    updated_at?: string;
    [key: string]: unknown;
  };
  can_generate_tokens?: boolean;
  client_id?: number | string;
  client_name?: string;
  created?: string;
  kyb_status?: string;
  live_tokens?: number;
  test_tokens?: number;
  status?: string;
  verified_at?: string;
  updated_at?: string;
  [key: string]: unknown;
}
export interface AdminRole {
  id?: number | string;
  name?: string;
  description?: string;
  permissions_count?: number;
  users_count?: number;
  status?: number | string; // 1 = Active, 0 = Inactive
  created_at?: string;
  [key: string]: unknown;
}
export interface AdminRolesListRequest {
  page?: number;
  per_page?: number;
  search?: string;
  sort?: string;
  order?: string;
}
export interface AdminRolesListResponse {
  status: number;
  message?: {
    data?: AdminRole[];
    roles?: AdminRole[];
    pagination?: PaginationInfo;
    [key: string]: unknown;
  };
  data?: {
    data?: AdminRole[];
    roles?: AdminRole[];
    pagination?: PaginationInfo;
    [key: string]: unknown;
  };
  roles?: AdminRole[];
  pagination?: PaginationInfo;
  [key: string]: unknown;
}
export interface AdminCreateRoleRequest {
  name: string;
  role_type: "MANAGEMENT" | "CLIENT" | "CLIENT_USER";
  description?: string; // Optional, not used by backend but kept for UI
}

export interface AdminChangeRoleStatusRequest {
  role_id: string | number;
  status: number; // 1 = Active, 0 = Inactive
}

export interface AdminRolePermission {
  id?: number | string;
  name?: string;
  code?: string;
  description?: string;
  module?: string;
  action?: string;
  assigned?: boolean;
  [key: string]: unknown;
}
export interface AdminRolePermissionsResponse {
  status: number;
  message?:
    | {
        permissions?: AdminRolePermission[];
        [key: string]: unknown;
      }
    | AdminRolePermission[];
  data?:
    | {
        permissions?: AdminRolePermission[];
        [key: string]: unknown;
      }
    | AdminRolePermission[];
  permissions?: AdminRolePermission[];
  [key: string]: unknown;
}
export interface AdminAssignPermissionRequest {
  role_id: string | number;
  module: string;
  permission: string; // This is the action name
}
export interface AdminRevokePermissionRequest {
  role_id: string | number;
  module: string;
  permission: string; // This is the action name
}
export interface AdminDocument {
  id?: number | string;
  client_id?: number | string;
  client_name?: string;
  document_type_id?: number | string;
  document_type_name?: string;
  document_path?: string;
  document_name?: string;
  document_number?: string;
  document_type?: string;
  status?: string;
  uploaded_at?: string;
  created?: string;
  updated?: string;
  updated_at?: string;
  [key: string]: unknown;
}
export interface AdminDocumentsListRequest {
  page?: number;
  per_page?: number;
  search?: string;
  status?: string; // Filtré côté frontend, pas envoyé au backend
  client_id?: string | number;
  sort?: string;
  order?: string;
}
export interface AdminDocumentsListResponse {
  status?: number;
  total?: number;
  per_page?: number;
  current_page?: number;
  last_page?: number;
  from?: number;
  to?: number;
  next_page_url?: string | null;
  prev_page_url?: string | null;
  data?: AdminDocument[];
  message?: {
    data?: AdminDocument[];
    documents?: AdminDocument[];
    pagination?: PaginationInfo;
    [key: string]: unknown;
  };
  documents?: AdminDocument[];
  pagination?: PaginationInfo;
  [key: string]: unknown;
}
export interface AdminDocumentType {
  id?: number | string;
  name?: string;
  description?: string;
  required?: boolean;
  status?: string | number;
  created_at?: string;
  updated_at?: string;
  [key: string]: unknown;
}
export interface AdminDocumentTypesResponse {
  status: number;
  message?: {
    data?: AdminDocumentType[];
    types?: AdminDocumentType[];
    [key: string]: unknown;
  };
  data?: {
    data?: AdminDocumentType[];
    types?: AdminDocumentType[];
    [key: string]: unknown;
  };
  types?: AdminDocumentType[];
  [key: string]: unknown;
}
export interface AdminCreateDocumentTypeRequest {
  name: string;
  description: string;
  required?: boolean;
  status?: string | number;
}
export interface AdminUpdateDocumentTypeRequest {
  type_id: string | number;
  name?: string;
  description?: string;
  required?: boolean;
  status?: string | number;
}
export interface AdminChangeDocumentTypeStatusRequest {
  type_id: string | number;
  status: string | number;
}
export interface AdminGetDocumentTypeRequest {
  type_id: string | number;
}
export interface AdminDeleteDocumentTypeRequest {
  type_id: string | number;
}
export interface AdminUpdateDocumentContentRequest {
  document_id: string | number;
  document_name?: string;
  document_number?: string;
}
export interface AdminDeleteDocumentRequest {
  document_id: string | number;
}
export interface AdminCreateDocumentRequest {
  client_id: string | number;
  document_type_id: string | number;
  file_path: string;
  document_name: string;
  document_number?: string;
}
export interface AdminGlobalStatisticsRequest {
  range?: string;
}
export interface AdminGlobalStatisticsResponse {
  status: number;
  message?: {
    totals?: Record<string, number>;
    [key: string]: unknown;
  };
  data?: {
    totals?: Record<string, number>;
    [key: string]: unknown;
  };
  totals?: Record<string, number>;
  [key: string]: unknown;
}
export interface AdminBillingStatisticsRequest {
  range?: string;
}
export interface AdminBillingDailyRecord {
  id?: number | string;
  date?: string;
  revenue?: number;
  transactions?: number;
  average_transaction?: number;
  [key: string]: unknown;
}
export interface AdminBillingStatisticsResponse {
  status: number;
  message?: {
    summary?: Record<string, number>;
    records?: AdminBillingDailyRecord[];
    [key: string]: unknown;
  };
  data?: {
    summary?: Record<string, number>;
    records?: AdminBillingDailyRecord[];
    [key: string]: unknown;
  };
  summary?: Record<string, number>;
  records?: AdminBillingDailyRecord[];
  [key: string]: unknown;
}
export interface AdminClientStatisticRecord {
  id?: number | string;
  client_name?: string;
  total_messages?: number;
  total_revenue?: number;
  average_delivery?: number;
  active_users?: number;
  [key: string]: unknown;
}
export interface AdminClientStatisticsRequest {
  range?: string;
  search?: string;
  page?: number;
  per_page?: number;
}
export interface AdminClientStatisticsResponse {
  status: number;
  message?: {
    data?: AdminClientStatisticRecord[];
    records?: AdminClientStatisticRecord[];
    pagination?: PaginationInfo;
    [key: string]: unknown;
  };
  data?: {
    data?: AdminClientStatisticRecord[];
    records?: AdminClientStatisticRecord[];
    pagination?: PaginationInfo;
    [key: string]: unknown;
  };
  records?: AdminClientStatisticRecord[];
  pagination?: PaginationInfo;
  [key: string]: unknown;
}
export interface AdminKYBRecord {
  client_id?: number | string;
  name?: string;
  email?: string;
  msisdn?: number | string;
  created?: string;
  kyb_status?: string;
  kyb_message?: string;
  approved_by?: number | string;
  approved_at?: string;
  approved_by_name?: string;
  // Backward compatibility fields
  id?: number | string;
  client_name?: string;
  submitted_at?: string;
  status?: string;
  documents_count?: number;
  reviewer?: string;
  updated_at?: string;
  notes?: string;
  [key: string]: unknown;
}
export interface AdminKYBListRequest {
  page?: number;
  per_page?: number;
  search?: string;
  status?: string;
  kyb_status?: "PENDING" | "APPROVED" | "REJECTED" | "LEGACY";
}
export interface AdminKYBListResponse {
  // Backend returns pagination directly (RespondRaw) without wrapper
  total?: number;
  per_page?: number;
  current_page?: number;
  last_page?: number;
  from?: number;
  to?: number;
  next_page_url?: string | null;
  prev_page_url?: string | null;
  data?: AdminKYBRecord[];
  // Wrapped response format (backward compatibility)
  status?: number;
  message?: {
    data?: AdminKYBRecord[];
    records?: AdminKYBRecord[];
    pagination?: PaginationInfo;
    [key: string]: unknown;
  };
  records?: AdminKYBRecord[];
  pagination?: PaginationInfo;
  [key: string]: unknown;
}
export interface AdminKYBDetailsRequest {
  kyb_id?: string | number;
  client_id?: string | number;
}
export interface AdminKYBDetailsResponse {
  status: number;
  message?: AdminKYBRecord;
  data?: AdminKYBRecord;
  [key: string]: unknown;
}
export interface AdminKYBDecisionRequest {
  kyb_id?: string | number;
  client_id?: string | number;
  notes?: string;
}
export interface CreateSenderIdRequest {
  code: string;
  connector_id: number;
  description?: string;
  use_case?: string;
}
export interface CreateSenderIdResponse {
  status: number;
  message: string;
  data?: {
    id?: number;
    code?: string;
    connector_id?: number;
    status?: number | string;
    [key: string]: unknown;
  };
}
export interface MessageHistoryItem {
  id: number;
  msisdn: string;
  message: string;
  sender_id?: string;
  status: string;
  sent_at: string;
  delivered_at?: string;
  cost?: number;
  country_code?: string;
  [key: string]: unknown;
}
export interface BulkMessageHistoryItem {
  id: number;
  campaign_name: string;
  recipients: number;
  delivered?: number;
  failed?: number;
  pending?: number;
  status: string;
  sent_at: string;
  message?: string;
  sender_id?: string;
  [key: string]: unknown;
}
export interface ScheduledMessageHistoryItem {
  id: number;
  message: string;
  sender_id?: string;
  send_date: string;
  send_time: string;
  recipients: number;
  status: string;
  campaign_name?: string;
  repeat_type?: string;
  [key: string]: unknown;
}
export interface MessageHistoryRequest {
  page: number;
  limit: number;
  start_date?: string;
  end_date?: string;
  search?: string;
}
export interface MessageHistoryResponse {
  status: number;
  message?: {
    messages?: MessageHistoryItem[];
    pagination?: {
      current_page: number;
      per_page: number;
      total: number;
      total_pages: number;
      last_page: number;
      from: number;
      to: number;
    };
    [key: string]: unknown;
  };
  data?: {
    messages?: MessageHistoryItem[];
    pagination?: {
      current_page: number;
      per_page: number;
      total: number;
      total_pages: number;
      last_page: number;
      from: number;
      to: number;
    };
    [key: string]: unknown;
  };
  messages?: MessageHistoryItem[];
  pagination?: {
    current_page: number;
    per_page: number;
    total: number;
    total_pages: number;
    last_page: number;
    from: number;
    to: number;
  };
  [key: string]: unknown;
}
export interface BulkMessageHistoryResponse {
  status: number;
  message?: {
    messages?: BulkMessageHistoryItem[];
    pagination?: {
      current_page: number;
      per_page: number;
      total: number;
      total_pages: number;
      last_page: number;
      from: number;
      to: number;
    };
    [key: string]: unknown;
  };
  data?: {
    messages?: BulkMessageHistoryItem[];
    pagination?: {
      current_page: number;
      per_page: number;
      total: number;
      total_pages: number;
      last_page: number;
      from: number;
      to: number;
    };
    [key: string]: unknown;
  };
  messages?: BulkMessageHistoryItem[];
  pagination?: {
    current_page: number;
    per_page: number;
    total: number;
    total_pages: number;
    last_page: number;
    from: number;
    to: number;
  };
  [key: string]: unknown;
}
export interface ScheduledMessageHistoryResponse {
  status: number;
  message?: {
    messages?: ScheduledMessageHistoryItem[];
    pagination?: {
      current_page: number;
      per_page: number;
      total: number;
      total_pages: number;
      last_page: number;
      from: number;
      to: number;
    };
    [key: string]: unknown;
  };
  data?: {
    messages?: ScheduledMessageHistoryItem[];
    pagination?: {
      current_page: number;
      per_page: number;
      total: number;
      total_pages: number;
      last_page: number;
      from: number;
      to: number;
    };
    [key: string]: unknown;
  };
  messages?: ScheduledMessageHistoryItem[];
  pagination?: {
    current_page: number;
    per_page: number;
    total: number;
    total_pages: number;
    last_page: number;
    from: number;
    to: number;
  };
  [key: string]: unknown;
}
export interface Contact {
  id: number;
  contact_group_msisdn_id?: number;
  msisdn: string;
  first_name: string;
  other_name?: string;
  last_name?: string;
  email?: string;
  status?: number;
  created_at?: string;
  updated_at?: string;
  [key: string]: unknown;
}
export interface ContactGroup {
  id: number;
  name: string;
  description?: string;
  contact_count?: number;
  total_contacts?: number;
  created_at?: string;
  updated_at?: string;
  [key: string]: unknown;
}
export interface CreateContactRequest {
  msisdn: string;
  first_name: string;
  other_name?: string;
  last_name?: string;
  email?: string;
  contact_group_id?: string | number; // Can be group name (string) or ID (number)
  name?: string;
  country_code?: string;
}
export interface CreateContactResponse {
  status: number;
  message: string;
  data?: {
    contact_id?: number;
    [key: string]: unknown;
  };
}
export interface UploadContactsRequest {
  file: File;
  contact_group_id?: number;
  name?: string; // Optional: group name if creating new group
  country_code?: string; // Optional: country code for phone numbers
}
export interface UploadContactsResponse {
  status: number;
  message: string;
  data?: {
    total_uploaded?: number;
    total_failed?: number;
    [key: string]: unknown;
  };
}
export interface ContactGroupListRequest {
  page: number;
  limit: number;
  search?: string;
}
export interface ContactGroupListResponse {
  status: number;
  message?: {
    groups?: ContactGroup[];
    pagination?: {
      current_page: number;
      per_page: number;
      total: number;
      total_pages: number;
      last_page: number;
      from: number;
      to: number;
    };
    [key: string]: unknown;
  };
  data?: {
    groups?: ContactGroup[];
    pagination?: {
      current_page: number;
      per_page: number;
      total: number;
      total_pages: number;
      last_page: number;
      from: number;
      to: number;
    };
    [key: string]: unknown;
  };
  groups?: ContactGroup[];
  pagination?: {
    current_page: number;
    per_page: number;
    total: number;
    total_pages: number;
    last_page: number;
    from: number;
    to: number;
  };
  [key: string]: unknown;
}
export interface GetContactGroupRequest {
  contact_group_id: number;
  page: number;
  limit: number;
}
export interface GetContactGroupResponse {
  status: number;
  message?: {
    group?: ContactGroup;
    contacts?: Contact[];
    pagination?: {
      current_page: number;
      per_page: number;
      total: number;
      total_pages: number;
      last_page: number;
      from: number;
      to: number;
    };
    [key: string]: unknown;
  };
  data?: {
    group?: ContactGroup;
    contacts?: Contact[];
    pagination?: {
      current_page: number;
      per_page: number;
      total: number;
      total_pages: number;
      last_page: number;
      from: number;
      to: number;
    };
    [key: string]: unknown;
  };
  [key: string]: unknown;
}
export interface GetContactGroupListRequest {
  sort?: string;
  page?: number;
  per_page?: number;
  service?: string;
  route?: string;
  id?: number;
  filter?: string;
  end?: string;
}
export interface GetContactGroupListResponse {
  total: number;
  per_page: number;
  next_page_url: string | null;
  prev_page_url: string | null;
  current_page: number;
  last_page: number;
  from: number;
  to: number;
  data: Array<{
    id: number;
    msisdn: string;
    client_id: number | null;
    first_name: string;
    other_name: string | null;
    status: number;
    contact_group_msisdn_id: number;
    created: string;
    updated: string | null;
    deleted: string | null;
  }>;
}
export interface UpdateContactGroupRequest {
  contact_group_id: number;
  name?: string;
  description?: string;
}
export interface UpdateContactGroupResponse {
  status: number;
  message: string;
}
export interface DeleteContactGroupRequest {
  contact_group_id: number;
}
export interface DeleteContactGroupResponse {
  status: number;
  message: string;
}
export interface UpdateContactGroupMSISDNRequest {
  contact_group_msisdn_id: number;
  first_name?: string;
  other_name?: string;
  last_name?: string;
  route?: string;
  service?: string;
}
export interface UpdateContactGroupMSISDNResponse {
  status: number;
  message: string;
}
export interface UpdateContactGroupMSISDNStatusRequest {
  contact_group_msisdn_id: number;
  status: number | string;
  route?: string;
  service?: string;
}
export interface UpdateContactGroupMSISDNStatusResponse {
  status: number;
  message: string;
}
export interface DeleteContactGroupMSISDNRequest {
  contact_group_msisdn_id: number;
  route?: string;
  service?: string;
}
export interface DeleteContactGroupMSISDNResponse {
  status: number;
  message: string;
}
export interface MpesaPaymentRequest {
  client_id: number;
  amount: number;
  msisdn: string;
}
export interface MpesaPaymentResponse {
  status: number;
  message: string;
  data?: {
    transaction_id?: string;
    reference?: string;
    [key: string]: unknown;
  };
}
export interface MNOProvider {
  id: string;
  name: string;
  code: string;
  description?: string;
  status?: string;
  [key: string]: unknown;
}
export interface GetMNOProvidersResponse {
  status: number;
  message: MNOProvider[];
  data?: MNOProvider[];
}
export interface MNOSelfTopupRequest {
  amount: number;
  msisdn: string;
  mno_wallet_type: "AIRTEL" | "ORANGE" | "VODACOM" | "AFRICELL";
  currency?: string;
  narration?: string;
}
export interface MNOSelfTopupResponse {
  status: number;
  message: string;
  data?: {
    transaction_id?: string;
    reference?: string;
    status?: string;
    [key: string]: unknown;
  };
}
export interface MNOTopupHistoryRequest {
  page?: number;
  per_page?: number;
  sort?: string;
  search?: string;
  status?: string;
  mno_wallet_type?: string;
}
export interface MNOTopupHistoryItem {
  id: number;
  amount: number;
  currency: string;
  msisdn: string;
  mno_wallet_type: string;
  status: string;
  reference?: string;
  transaction_id?: string;
  narration?: string;
  created_at: string;
  updated_at?: string;
  [key: string]: unknown;
}
export interface MNOTopupHistoryResponse {
  status: number;
  message?: {
    transactions?: MNOTopupHistoryItem[];
    pagination?: {
      current_page: number;
      per_page: number;
      total: number;
      total_pages: number;
      last_page: number;
      from: number;
      to: number;
    };
    [key: string]: unknown;
  };
  data?: {
    transactions?: MNOTopupHistoryItem[];
    pagination?: {
      current_page: number;
      per_page: number;
      total: number;
      total_pages: number;
      last_page: number;
      from: number;
      to: number;
    };
    [key: string]: unknown;
  };
  transactions?: MNOTopupHistoryItem[];
  pagination?: {
    current_page: number;
    per_page: number;
    total: number;
    total_pages: number;
    last_page: number;
    from: number;
    to: number;
  };
  [key: string]: unknown;
}
// Admin Manual Topup
export interface CreateManualTopupRequest {
  amount: number;
  currency?: string;
  connector_id: number;
  invoice_path: string;
  invoice_number: string;
  description?: string;
}
export interface CreateManualTopupResponse {
  status: number;
  message: string;
  data?: {
    request_id?: number;
    transaction_id?: string;
    reference?: string;
    [key: string]: unknown;
  };
}
export interface GetManualTopupRequestsRequest {
  page?: number;
  per_page?: number;
  search?: string;
  sort?: string;
  order?: "asc" | "desc";
}
export interface ManualTopupRequest {
  id: number;
  amount: number;
  currency: string;
  connector_id: number;
  connector_name?: string;
  invoice_path: string;
  invoice_number: string;
  description?: string;
  status: string;
  client_id?: number;
  client_name?: string;
  created_at: string;
  updated_at?: string;
  [key: string]: unknown;
}
export interface GetManualTopupRequestsResponse {
  status: number;
  message?: {
    data?: ManualTopupRequest[];
    pagination?: {
      current_page: number;
      per_page: number;
      total: number;
      total_pages: number;
      last_page: number;
      from: number;
      to: number;
    };
    [key: string]: unknown;
  };
  data?: {
    data?: ManualTopupRequest[];
    pagination?: {
      current_page: number;
      per_page: number;
      total: number;
      total_pages: number;
      last_page: number;
      from: number;
      to: number;
    };
    [key: string]: unknown;
  };
  [key: string]: unknown;
}
export interface GetManualTopupRequestDetailsRequest {
  request_id: number;
}
export interface GetManualTopupRequestDetailsResponse {
  status: number;
  message?: ManualTopupRequest;
  data?: ManualTopupRequest;
  [key: string]: unknown;
}
export interface Connector {
  id: number;
  status: number;
  mnc: number;
  mcc: number;
  name: string;
  s_cope?: string;
  scope?: string;
  queue_prefix?: string;
  [key: string]: unknown;
}
export interface GetAvailableConnectorsResponse {
  status: number;
  success?: boolean;
  message?: string;
  connectors?: Connector[];
  [key: string]: unknown;
}

// Notifications
export interface Notification {
  id?: number | string;
  title?: string;
  message?: string;
  type?: string;
  priority?: string;
  read?: boolean | number;
  created_at?: string;
  createdAt?: string;
  action_url?: string;
  actionUrl?: string;
  [key: string]: unknown;
}

export interface NotificationsListRequest {
  page?: number;
  per_page?: number;
  search?: string;
  type?: string;
  priority?: string;
  read?: boolean | number;
  sort?: string;
  order?: string;
}

export interface NotificationsListResponse {
  status: number;
  message?: {
    data?: Notification[];
    notifications?: Notification[];
    pagination?: PaginationInfo;
    [key: string]: unknown;
  };
  data?: {
    data?: Notification[];
    notifications?: Notification[];
    pagination?: PaginationInfo;
    [key: string]: unknown;
  };
  notifications?: Notification[];
  pagination?: PaginationInfo;
  [key: string]: unknown;
}

export interface MarkNotificationReadRequest {
  notification_id: string | number;
}

export interface NotificationPreferencesRequest {
  email?: {
    enabled?: boolean;
    transactional?: boolean;
    promotional?: boolean;
    system?: boolean;
    security?: boolean;
  };
  sms?: {
    enabled?: boolean;
    transactional?: boolean;
    promotional?: boolean;
    system?: boolean;
    security?: boolean;
  };
  push?: {
    enabled?: boolean;
    transactional?: boolean;
    promotional?: boolean;
    system?: boolean;
    security?: boolean;
  };
  general?: {
    sound?: boolean;
    desktop?: boolean;
    quietHours?: boolean;
    quietStart?: string;
    quietEnd?: string;
  };
}

// OTP Verification
export interface VerifyOtpRequest {
  email?: string;
  msisdn?: string;
  verification_code: string;
}

export interface VerifyOtpResponse {
  status: number;
  message: string;
}

export interface ResendOtpRequest {
  email?: string;
  msisdn?: string;
}

export interface ResendOtpResponse {
  status: number;
  message: string;
}

// Pricing Configuration
export interface SMSPricingConfig {
  id?: number;
  config_name?: string;
  purchase_price?: number;
  is_active?: boolean;
  created_by?: number | null;
  created?: string;
  updated?: string;
}

export interface GetPricingConfigResponse {
  status: number;
  message: SMSPricingConfig;
}

export interface UpdatePricingConfigRequest {
  purchase_price: number;
}

export interface UpdatePricingConfigResponse {
  status: number;
  message: {
    message: string;
    old_price: number;
    new_price: number;
    config_id: number;
  };
}

// Pricing Tiers
export interface SMSPricingTier {
  id?: number;
  pricing_config_id?: number;
  tier_name?: string;
  volume_min?: number;
  volume_max?: number | null;
  sale_price?: number;
  tier_order?: number;
  is_active?: boolean;
  created?: string;
  updated?: string;
}

export interface GetPricingTiersResponse {
  status: number;
  message: SMSPricingTier[];
}

export interface CreatePricingTierRequest {
  tier_name: string;
  volume_min: number;
  volume_max?: number | null;
  sale_price: number;
  tier_order: number;
}

export interface CreatePricingTierResponse {
  status: number;
  message: {
    message: string;
    tier_id: number;
  };
}

export interface UpdatePricingTierRequest {
  tier_id: number;
  tier_name?: string;
  volume_min?: number;
  volume_max?: number | null;
  sale_price?: number;
  tier_order?: number;
}

export interface UpdatePricingTierResponse {
  status: number;
  message: {
    message: string;
    tier_id: number;
  };
}

export interface TogglePricingTierRequest {
  tier_id: number;
}

export interface TogglePricingTierResponse {
  status: number;
  message: {
    message: string;
    tier_id: number;
    is_active: boolean;
  };
}

// Benefits
export interface BenefitGraphRequest {
  start_date?: string;
  end_date?: string;
}

// Client Billing Rate
export interface BillingRate {
  connector_id: number;
  billing_rate: number;
}

export interface ClientBillingRateRequest {
  id: number; // client_id
  billing_rate: BillingRate[];
}

export interface ClientBillingRateResponse {
  status: number;
  message: string;
}

export interface GetClientSMSBillingRequest {
  client_id?: number;
}

export interface ClientSMSBillingInfo {
  connector_id?: number;
  billing_rate?: number;
  [key: string]: unknown;
}

export interface GetClientSMSBillingResponse {
  status: number;
  message: ClientSMSBillingInfo | ClientSMSBillingInfo[];
}

// Manual Top-up
export interface ManualTopupRequest {
  client_id: number;
  amount: number;
  connector_id: number;
  reference?: string;
  description?: string;
}

export interface ManualTopupResponse {
  status: number;
  message: {
    message: string;
    request_id?: number;
    [key: string]: unknown;
  };
}

export interface GetManualTopupRequestsRequest {
  page?: number;
  limit?: number;
  status?: string | number;
  client_id?: number;
}

export interface ManualTopupRequestItem {
  id?: number;
  client_id?: number;
  client_name?: string;
  amount?: number;
  connector_id?: number;
  connector_name?: string;
  status?: string | number;
  reference?: string;
  description?: string;
  created?: string;
  updated?: string;
  [key: string]: unknown;
}

export interface GetManualTopupRequestsResponse {
  status: number;
  message:
    | ManualTopupRequestItem[]
    | { data?: ManualTopupRequestItem[]; requests?: ManualTopupRequestItem[] };
  data?: {
    requests?: ManualTopupRequestItem[];
    data?: ManualTopupRequestItem[];
  };
}

export interface GetManualTopupRequestDetailsRequest {
  request_id: number;
}

export interface GetManualTopupRequestDetailsResponse {
  status: number;
  message: ManualTopupRequestItem;
}

export interface GetAvailableConnectorsResponse {
  status: number;
  message: Array<{
    id: number;
    name?: string;
    connector_id?: number;
    [key: string]: unknown;
  }>;
}

// Client Credit Top-up
export interface ClientCreditTopupRequest {
  client_id: number;
  amount: number;
  description?: string;
}

export interface ClientCreditTopupResponse {
  status: number;
  message: {
    message: string;
    [key: string]: unknown;
  };
}

// Connector Management
export interface CreateConnectorRequest {
  name: string;
  mcc?: string | number;
  mnc?: string | number;
  scope?: string;
  queue_prefix?: string;
  status?: number;
  id?: number; // For update, set id > 0
}

export interface CreateConnectorResponse {
  status: number;
  message: {
    message: string;
    connector_id?: number;
    id?: number;
    [key: string]: unknown;
  };
}

export interface DeleteConnectorRequest {
  connector_id: number;
}

export interface DeleteConnectorResponse {
  status: number;
  message: string;
}

export interface BenefitGraphDataPoint {
  label?: string;
  benefit?: number;
  topup?: number;
  count?: number;
  [key: string]: unknown;
}

export interface BenefitGraphResponse {
  status: number;
  message: {
    start_date?: string;
    end_date?: string;
    interval_days?: number;
    group_by?: string;
    data?: BenefitGraphDataPoint[];
  };
}

export interface BenefitByTierRequest {
  start_date: string;
  end_date: string;
}

export interface BenefitByTierData {
  tier_name?: string;
  topup_count?: number;
  total_benefit?: number;
  avg_benefit?: number;
  total_topup?: number;
  [key: string]: unknown;
}

export interface BenefitByTierResponse {
  status: number;
  message: BenefitByTierData[];
}

export interface BenefitByClientRequest {
  start_date: string;
  end_date: string;
  limit?: number;
}

export interface BenefitByClientData {
  client_id?: number;
  client_name?: string;
  topup_count?: number;
  total_benefit?: number;
  total_topup?: number;
  avg_benefit?: number;
  [key: string]: unknown;
}

export interface BenefitByClientResponse {
  status: number;
  message: BenefitByClientData[];
}

export interface BenefitDetailsRequest {
  page?: number;
  per_page?: number;
  sort?: string;
  start_date?: string;
  end_date?: string;
  client_id?: number;
}

export interface BenefitDetail {
  id?: number;
  source_client_id?: number;
  client_name?: string;
  mno_reference_no?: string;
  topup_amount?: number;
  sms_count?: number;
  purchase_price?: number;
  sale_price?: number;
  benefit_amount?: number;
  tier_name?: string;
  created?: string;
  [key: string]: unknown;
}

export interface BenefitDetailsResponse {
  status: number;
  message: {
    total?: number;
    per_page?: number;
    current_page?: number;
    last_page?: number;
    data?: BenefitDetail[];
    pagination?: PaginationInfo;
  };
}

// Client User Management Types (for clients managing their own users)
export interface ClientUser {
  id?: number | string;
  user_id?: number | string;
  full_name?: string;
  name?: string;
  email?: string;
  msisdn?: string;
  phone?: string;
  status?: string | number;
  role_id?: string | number;
  role?: string;
  role_name?: string;
  created_at?: string;
  created?: string;
  updated_at?: string;
  updated?: string;
  [key: string]: unknown;
}

export interface ClientUsersListRequest {
  page?: number;
  per_page?: number;
  search?: string;
  status?: string | number;
  role_id?: string | number;
  sort?: string;
  order?: string;
}

export interface ClientUsersListResponse {
  status: number;
  message?: {
    data?: ClientUser[];
    users?: ClientUser[];
    pagination?: PaginationInfo;
    [key: string]: unknown;
  };
  data?: {
    data?: ClientUser[];
    users?: ClientUser[];
    pagination?: PaginationInfo;
    [key: string]: unknown;
  };
  users?: ClientUser[];
  pagination?: PaginationInfo;
  [key: string]: unknown;
}

export interface ClientCreateUserRequest {
  full_name: string;
  email: string;
  password: string;
  msisdn: string;
  role_id: string | number;
}

export interface ClientUpdateUserRequest {
  user_id: string | number;
  full_name?: string;
  email?: string;
  password?: string;
  msisdn?: string;
  role_id?: string | number;
}

export interface ClientUserStatusRequest {
  user_id: string | number;
  status: string | number;
}

export interface ClientUserRole {
  id: number | string;
  name: string;
  [key: string]: unknown;
}

export interface ClientUserRolesResponse {
  status: number;
  message?: ClientUserRole[];
  data?: ClientUserRole[];
  [key: string]: unknown;
}

export interface ClientSimpleResponse {
  status: number;
  message: string;
  data?: unknown;
  [key: string]: unknown;
}
// Admin Senders Types
export interface AdminSender {
  id?: number | string;
  code?: string;
  sender_id?: string;
  client_id?: number | string;
  client_name?: string;
  connector_id?: number | string;
  connector_name?: string;
  connector?: string;
  connectors?: Array<{ id?: number; name?: string; [key: string]: unknown }>;
  description?: string;
  use_case?: string;
  package_id?: number | string;
  status?: string | number;
  created?: string;
  created_at?: string;
  updated?: string;
  updated_at?: string;
  [key: string]: unknown;
}
export interface AdminSendersListRequest {
  page?: number;
  per_page?: number;
  search?: string;
  status?: string | number;
  client_id?: string | number;
  sort?: string;
  order?: string;
}
export interface AdminSendersListResponse {
  status?: number;
  total?: number;
  per_page?: number;
  current_page?: number;
  last_page?: number;
  from?: number;
  to?: number;
  next_page_url?: string | null;
  prev_page_url?: string | null;
  data?: AdminSender[];
  message?: {
    data?: AdminSender[];
    senders?: AdminSender[];
    pagination?: PaginationInfo;
    [key: string]: unknown;
  };
  senders?: AdminSender[];
  pagination?: PaginationInfo;
  [key: string]: unknown;
}
export interface AdminApproveSenderRequest {
  sender_id: string | number;
  notes?: string;
}
export interface AdminRejectSenderRequest {
  sender_id: string | number;
  reason: string;
}
export interface AdminUpdateSenderStatusRequest {
  sender_id: string | number;
  status: string | number;
}
export interface AdminAssignSenderToClientRequest {
  sender_id: string | number;
  client_id: string | number;
  otp?: string | number; // Optional: 0 or 1
}
export interface AdminUnassignSenderFromClientRequest {
  id: string | number; // client_sender.id (the relation ID, not sender_id)
}
export interface AdminUpdateClientSenderStatusRequest {
  id: string | number; // client_sender.id (the relation ID, not sender_id)
  status: string | number; // 1 = Approved, 0 = Pending/Rejected
}
export interface AdminSenderDetailsRequest {
  sender_id: string | number;
}
export interface AdminSenderDetailsResponse {
  status: number;
  message?: AdminSender;
  data?: AdminSender;
  [key: string]: unknown;
}
