import type { SupabaseClient, User } from "@supabase/supabase-js";
import { PRETRIP_KEYS, type PretripItem, type PretripKey } from "@/types/pretrip";

const COLUMNS = "id,trip_id,user_id,item_key,completed,notes,updated_at";
export async function listPretripItems(supabase:SupabaseClient,user:User,tripId:string):Promise<PretripItem[]> {
  const result=await supabase.from("trip_checklist_items").select(COLUMNS).eq("trip_id",tripId).eq("user_id",user.id);
  if(result.error) throw result.error;
  return result.data as PretripItem[];
}
export async function upsertPretripItem(supabase:SupabaseClient,user:User,tripId:string,key:PretripKey,completed:boolean,notes:string|null){
  if(!PRETRIP_KEYS.includes(key)) throw new Error("invalid_key");
  const result=await supabase.from("trip_checklist_items").upsert({trip_id:tripId,user_id:user.id,item_key:key,completed,notes},{onConflict:"trip_id,item_key"}).select(COLUMNS).single();
  if(result.error) throw result.error;
  return result.data as PretripItem;
}
