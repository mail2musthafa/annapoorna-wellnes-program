export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name?: string;
  roles: string[];
}

export interface UserAuthSession {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: User;
}

export interface ProductPrice {
  currency: string;
  amount_minor: number;
  compare_at_minor?: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  product_type: string;
  short_description: string;
  full_description?: string;
  image_url?: string;
  instructor_name?: string;
  instructor_title?: string;
  rating?: number;
  review_count?: number;
  pillar_tag?: string;
  is_active: boolean;
  is_featured: boolean;
  capacity?: number;
  access_duration_days?: number;
  refund_policy_days?: number;
  learning_outcomes?: string[];
  what_is_included?: string[];
  requirements?: string[];
  suitable_audience?: string;
  prices: ProductPrice[];
}

export interface ClassSession {
  id: string;
  product_id: string;
  title: string;
  slug: string;
  description: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  iana_timezone: string;
  capacity: number;
  confirmed_count: number;
  held_count: number;
  available_seats: number;
  status: string;
  price_usd_cents: number;
  price_inr_paise: number;
  instructor_name?: string;
}

export interface CartItem {
  id: string;
  product_id: string;
  product_name: string;
  product_type: string;
  session_id?: string;
  seat_hold_id?: string;
  slot_hold_id?: string;
  quantity: number;
  unit_price_minor: number;
  total_minor: number;
  variation_meta?: {
    session_title?: string;
    instructor_name?: string;
    start_time?: string;
    timezone?: string;
    [key: string]: any;
  };
  seat_hold_expires_at?: string;
  seat_hold_seconds_remaining?: number;
}

export interface SavedItem {
  id: string;
  product_id: string;
  product_name: string;
  product_type: string;
  unit_price_minor: number;
  currency: string;
  variation_meta?: any;
}

export interface Cart {
  cart_id: string;
  currency: string;
  items: CartItem[];
  saved_items?: SavedItem[];
  subtotal_minor: number;
  discount_minor: number;
  tax_minor: number;
  total_minor: number;
  coupon_code?: string;
  item_count: number;
  has_expired_holds?: boolean;
}

export interface Enquiry {
  id: string;
  first_name: string;
  last_name?: string;
  email: string;
  phone?: string;
  country?: string;
  enquiry_type: string;
  interested_product?: string;
  message?: string;
  status: string;
  priority: string;
  assigned_staff_name?: string;
  internal_notes?: string;
  follow_up_date?: string;
  conversion_value_minor?: number;
  created_at: string;
  activities?: Array<{
    id: string;
    actor_name: string;
    activity_type: string;
    summary: string;
    details?: string;
    created_at: string;
  }>;
  tasks?: Array<{
    id: string;
    title: string;
    due_date: string;
    is_completed: boolean;
    assigned_to_name?: string;
  }>;
}

export interface NutritionPlan {
  id: string;
  title: string;
  objective: string;
  status: string;
  versions: Array<{
    version_number: number;
    daily_calorie_target?: number;
    protein_grams?: number;
    carbs_grams?: number;
    fat_grams?: number;
    fiber_grams?: number;
    dietary_preferences: string[];
    allergies_and_exclusions: string[];
    recommended_meals: Array<{ slot: string; title: string; calories: number; notes?: string }>;
    shopping_list_items: string[];
    hydration_guidelines?: string;
  }>;
  reviews: Array<{
    expert_name: string;
    decision: string;
    member_visible_notes: string;
    next_review_date?: string;
  }>;
}

export interface MemberDashboardData {
  user_id: string;
  full_name: string;
  email: string;
  active_program?: string;
  active_program_progress_percent?: number;
  next_live_class?: string;
  meal_plan_week?: number;
  total_bookings?: number;
}
