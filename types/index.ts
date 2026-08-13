export type UserRole = "user" | "admin";

export type OrderStatus =
  | "pending"
  | "processing"
  | "completed"
  | "cancelled"
  | "partial"
  | "refunded";

export type TransactionType = "credit" | "debit";

export type FundRequestStatus = "pending" | "approved" | "rejected";

export type FundRequestMethod = "upi" | "bank";

export interface UserProfile {
  id: string;
  email: string | null;
  username: string | null;
  balance: number;
  role: UserRole;
  created_at: string;
}

export interface Order {
  id: number;
  user_id: string;
  niva_order_id: string | null;
  service_id: number;
  service_name: string;
  link: string;
  quantity: number;
  charge: number;
  charge_inr: number;
  status: OrderStatus;
  start_count: number;
  remains: number;
  created_at: string;
}

export interface AdminOrder extends Order {
  user_email?: string;
}

export interface Service {
  id: number;
  name: string;
  type: string;
  category: string;
  rate: number;
  min: number;
  max: number;
  price_inr: number;
  min_qty: number;
  max_qty: number;
  is_active: boolean;
  description: string | null;
  refill: boolean;
  cancel: boolean;
  updated_at?: string;
}

export interface Transaction {
  id: number;
  user_id: string;
  type: TransactionType;
  amount: number;
  description: string;
  created_at: string;
}

export interface FundRequest {
  id: number;
  user_id: string;
  amount: number;
  method: FundRequestMethod;
  reference: string | null;
  status: FundRequestStatus;
  created_at: string;
}

export interface AdminFundRequest extends FundRequest {
  user_email?: string;
}

export interface NivaOrderStatusEntry {
  order: number;
  status: OrderStatus;
  rawStatus: string;
  start_count: number;
  remains: number;
}

export interface AdminUser extends UserProfile {
  orders_count: number;
  total_spent: number;
}
