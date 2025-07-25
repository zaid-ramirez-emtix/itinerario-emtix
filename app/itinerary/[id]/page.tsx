'use client'

import { useParams } from 'next/navigation'
import { ItineraryDetails } from '@/components/itinerary/itinerary-details'

export default function ItineraryById() {
  const params = useParams()
  const id = params.id as string
  return (
    <ItineraryDetails id={id} />
  )
}