'use client'

import { Avatar } from "@heroui/react"
import { ComposePostButton } from "./compose-post-button"

interface ComposePostClientProps {
  userAvatarUrl: string
  onSubmit: (formData: FormData) => void
}

export function ComposePostClient({ userAvatarUrl, onSubmit }: ComposePostClientProps) {
  const handleSubmit = (formData: FormData) => {
    onSubmit(formData)
  }

  return (
    <form action={handleSubmit} className='flex flex-row space-x-4 p-4 border-b border-white/20'>
      <Avatar
        isBordered
        radius="full"
        size="md"
        src={userAvatarUrl}
      />
      <div className='flex flex-1 flex-col gap-y-4'>
        <textarea
          name='post'
          rows={4}
          className='w-full text-xl placeholder-gray-500 p-2'
          placeholder='¿¡Qué está pasando!?'
        >
        </textarea>
        <ComposePostButton />

        
      </div>
    </form>
  )
}
