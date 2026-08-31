export interface FlightAlert {
  id:string; user_id:string; origin:string; destination:string;
  departure_date:string|null; return_date:string|null; currency:string;
  target_price:number|null; active:boolean; created_at:string; updated_at:string;
}
