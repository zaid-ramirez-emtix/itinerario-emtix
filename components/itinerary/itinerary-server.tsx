'use server'
import { revalidatePath } from "next/cache"

export async function revalidateItinerary(route: string) {
  revalidatePath(route)
}