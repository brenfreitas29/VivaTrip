import type { SupabaseClient,User } from "@supabase/supabase-js";
import type { FlightAlert } from "@/types/alert";
const C="id,user_id,origin,destination,departure_date,return_date,currency,target_price,active,created_at,updated_at";
export async function listAlerts(s:SupabaseClient,u:User){const r=await s.from("flight_alerts").select(C).eq("user_id",u.id).order("created_at",{ascending:false});if(r.error)throw r.error;return r.data as FlightAlert[]}
export async function createAlert(s:SupabaseClient,u:User,input:Pick<FlightAlert,"origin"|"destination"|"departure_date"|"return_date"|"currency"|"target_price">){const r=await s.from("flight_alerts").insert({...input,user_id:u.id,active:true}).select(C).single();if(r.error)throw r.error;return r.data as FlightAlert}
export async function deleteAlert(s:SupabaseClient,u:User,id:string){const r=await s.from("flight_alerts").delete().eq("id",id).eq("user_id",u.id).select("id").maybeSingle();if(r.error)throw r.error;return !!r.data}
