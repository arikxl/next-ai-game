'use client'

import { useMutation } from 'convex/react';
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation';

import { api } from '@/convex/_generated/api';

export default function Home() {

  const router = useRouter();
  const createAdventure = useMutation(api.adventure.createAdventure);

  const handleSubmit = async () => {
    const adventureId = await createAdventure(
      {
        characterClass: 'warrior',
        characterName: 'Arik',
        adventurePlace: 'The Wild West',
      }
    );
    router.push(`/adventure/${adventureId}`)
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <button onClick={handleSubmit}>START YOUR ADVENTURE</button>
      </div>
    </main>
  )
}
