'use client'

import { useEffect, useState } from "react"
import { useAction, useMutation, useQuery } from "convex/react";

import { api, } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

const AdventurePage = (props: { params: { adventureId: Id<'adventures'> } }) => {
  const handlePlayerAction = useAction(api.chat.handlePlayerAction);

  const [message, setMessage] = useState('');
  const [title, setTitle] = useState('');
  const [bgImg, setBgImg] = useState('');
  const entries = useQuery(api.chat.getAllEntries, { adventureId: props.params.adventureId });


  const handleSubmit = (e: any) => {
    e.preventDefault();
    handlePlayerAction({ message, adventureId: props.params.adventureId });
    setMessage('');
  }

  useEffect(() => {
    if (entries?.length > 0) {
      const adventureTitle = entries[0].response;
      const regex = /"([^"]*)"/;
      const result = adventureTitle.match(regex);

      if (result) {
        const textInQuotes = result[1];
        setTitle(textInQuotes);
      } else {
        setTitle('Enjoy your Adventure!');
      }
      // const adventureTitle = entries[0].response.substring(1, entries[0].response.length - 1)
      // setTitle(adventureTitle || '')
    }
    setBgImg(JSON.parse(localStorage.getItem('next-ai-adventure-bgImg')))

  }, [entries])

  const lastEntry = entries&& entries[entries.length - 1];

  return (
    <main className="bg-slate-900 flex min-h-screen flex-col items-center "
      style={{ backgroundImage: `url(${bgImg})` }}
    >
      <h1 className="text-white text-4xl my-6 ">{title}</h1>
      <div className="flex bg-trans rounded-xl gap-2  z-10 max-w-6xl w-full justify-between  text-sm lg:flex">
        <section className="flex flex-col flex-1">
          <div className="bg-white rounded-xl h-[400px]  p-4 mb-4 overflow-y-auto font-mono">
            {entries?.map((e, idx) => (
              <div key={e._id} className="flex flex-col gap-2 mb-4">
                <p >{idx > 0 ? e.input : ''}</p>
                <p >{e.response}</p>
                <hr className="border-cyan-400" />
              </div>
            ))}
          </div>
          <form onSubmit={(e) => handleSubmit(e)} className="flex items-center">
            <input name='message' value={message} className="p-1 px-2 rounded mr-2"
              onChange={(e) => setMessage(e.target.value)}
            />
            <button className='bg-white text-black px-6 rounded text-lg' type="submit">Go!</button>
          </form>
        </section> 

        <section className="flex-1 rounded-xl">

          {
            lastEntry && lastEntry.imageUrl
              ? (<img src={ lastEntry.imageUrl} alt='aa' className=' h-[200px] w-2/3 rounded-lg '/>
)
              :(<span className="text-white">LOADING...</span>)
          }

        </section>
      </div>

      {/* <img src={bgImg } alt='aa' /> */}
    </main>
  )
}

export default AdventurePage