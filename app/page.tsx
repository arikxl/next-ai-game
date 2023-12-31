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
    <main className=" bg-slate-900 text-white flex min-h-screen flex-col items-center justify-between p-10">
      <div className=" max-w-6xl w-full ">
        <h1 className='text-center text-4xl underline decoration-1'>Let Your Journey Begin</h1>
        <form className='flex flex-col my-6 justify-center items-center' onSubmit={handleSubmit}>
          <input type="text" id='characterName' name='characterName' required={true}
            className='capitalize text-black w-1/3 mb-6 p-4 text-xl outline-none rounded-md focus:border-primary border-[3px]'
            onChange={handleChange} value={story.characterName} placeholder='Choose your name'
          />
          <div className='flex gap-6 w-full flex-wrap justify-between'>
            {professions.map((p) => (
              <div key={p.id} onClick={() => handleClick('characterClass', p.profession)}
                className={story.characterClass === p.profession ? 'card border-primary border-[4px]' : 'card '}
                style={{backgroundImage: `url(${p.img})`}}
              >
                {p.profession}
              </div>
            ))}
          </div>
          <div className='w-full h-[0.3px] my-3 bg-white'></div>
          <div className='flex gap-6 w-full flex-wrap justify-between'>
            {places.map((p) => (
              <div key={p.id} onClick={() => handleClick('adventurePlace', p.place, p.img)}
                className={story.adventurePlace === p.place ? 'card1 border-primary border-[4px]' : 'card1 '}
                style={{ backgroundImage: `url(${p.img})` }}
              >
                <span className='bg-trans1 w-full text-center'>
                {p.place}
                </span>
              </div>
            ))}
          </div>

          <button className='bg-primary' >START YOUR ADVENTURE</button>
        </form>

      </div>
    </main>
  )
}
