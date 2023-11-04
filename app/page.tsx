'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation';
import { useMutation } from 'convex/react';


import { api } from '@/convex/_generated/api';
import { useState } from 'react';
import { places, professions } from './data/data';

export default function Home() {

  const router = useRouter();
  const createAdventure = useMutation(api.adventure.createAdventure);

  const [story, setStory] = useState({
    characterName: '',
    characterClass: '',
    adventurePlace: '',
  });

  const handleChange = (e: { target: { value: any; name: any; }; }) => {
    const value = e.target.value;
    const name = e.target.name;

    setStory((prevState) => ({
      ...prevState,
      [name]: value
    }))
  }

  const handleSubmit = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    if (!story.characterClass || !story.adventurePlace) {
      window.alert('Choose Your Adventure');
      return
    }
    const adventureId = await createAdventure(
      {
        characterClass: story.characterClass,
        characterName: story.characterName,
        adventurePlace: story.adventurePlace,
      }
    );
    router.push(`/adventure/${adventureId}`)
  }

  const handleClick = (name: string, value: string, img: string | void) => {

    if (img) {
      localStorage.setItem('next-ai-adventure-bgImg', JSON.stringify( img ))
    }
    setStory((prevState) => ({
      ...prevState,
      [name]: value
    }))
  }

  return (
    <main className=" bg-slate-900 text-white flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <form className='flex flex-col' onSubmit={handleSubmit}>
          <input type="text" id='characterName' name='characterName' required={true}
            className='text-black'
            onChange={handleChange} value={story.characterName}
          />
          <div>
            {professions.map((p) => (
              <div key={p.id} onClick={() => handleClick('characterClass', p.profession)}
                className={story.characterClass === p.profession ? 'card bg-red-300' : 'card bg-green-400'}
              >
                {p.profession}
              </div>
            ))}
          </div>
          <hr />
          <div>
            {places.map((p) => (
              <div key={p.id} onClick={() => handleClick('adventurePlace', p.place, p.img)}
                className='mb-2 cursor-pointer'
              >
                {p.place}
              </div>
            ))}
          </div>

          <button >START YOUR ADVENTURE</button>
        </form>

      </div>
    </main>
  )
}
