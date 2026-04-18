// file: /types/index.ts

export interface Profile {
    id: string;
    business_name: string;
    slug: string;
    tier_name: string;
    subscription_status: string;
    subscription_end_date: string;
    visits: number;
    clicks: number;
  }
  
  export interface Campaign {
    id: string;
    user_id: string;
    brand_name: string;
    slug: string;
    google_map_url: string;
    visits: number;
    clicks: number;
    status: string;
    created_at: string;
  }
  
  export interface Feedback {
    id: string;
    campaign_id: string;
    customer_name: string;
    customer_phone: string;
    rating: number;
    comment: string;
    status: string;
    created_at: string;
  }