export type { User, Session, AuthError, UserResponse } from '@supabase/auth-js';
export type { SupabaseClient } from "@supabase/supabase-js";
export type { H3Event } from "h3";

export interface query {
    search: string,
    page: string,
    pending: string,
    action: "all" | "created" | "deleted" | "updated";
    timestamp: 1 | 7 | 30 | 90;
}
export interface MultiPartData {
    name?: string;
    data: Buffer | string
}
export interface FormDataItem {
    name: string;
    data: Buffer | string | never[];
}


