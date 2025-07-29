import { Tables, TablesInsert, TablesUpdate } from "./database";

export type Itinerary = Tables<'itinerary'>
export type ItineraryInsert = TablesInsert<'itinerary'>
export type ItineraryUpdate = TablesUpdate<'itinerary'>

export type Day = Tables<'day'>
export type DayInsert = TablesInsert<'day'>
export type DayUpdate = TablesUpdate<'day'>

export type Activity = Tables<'activity'>
export type ActivityInsert = TablesInsert<'activity'>
export type ActivityUpdate = TablesUpdate<'activity'>

export type City = Tables<'city'>
export type CityInsert = TablesInsert<'city'>
export type CityUpdate = TablesUpdate<'city'>

export interface DayWithActivities extends Day {
  activities: Activity[]
}

export interface ItineraryFormProps {
  initialData?: Itinerary;
  mode: 'create' | 'edit';
  onSuccess?: (data: Itinerary) => void;
  onCancel?: () => void;
}
