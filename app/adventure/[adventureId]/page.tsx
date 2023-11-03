'use client'

import { useState } from "react"
import { useAction, useQuery } from "convex/react";

import { api,  } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

const AdventurePage = ( props: {params: {adventureId: Id<'adventures'>}}) => {
  const handlePlayerAction = useAction(api.chat.handlePlayerAction);

  const [message, setMessage] = useState('');
  const entries = useQuery(api.chat.getAllEntries, { adventureId: props.params.adventureId });


  const handleSubmit = (e: any) => {
    e.preventDefault();
    handlePlayerAction({ message, adventureId: props.params.adventureId });
    setMessage('');
  }

  return (
    <main className="bg-slate-900 flex min-h-screen flex-col items-center justify-between p-24">
      <div className="flex flex-col   z-10 max-w-5xl w-full justify-between font-mono text-sm lg:flex">
        <section className="flex flex-col">
          <div className="bg-white rounded-xl h-[400px] w-1/2 p-4 mb-4 overflow-y-auto">
            {entries?.map((e) => (
              <div key={e._id} className="flex flex-col gap-2 mb-4">
                <p >{e.input}</p>
                <p >{e.response}</p>
                <hr className="border-bermuda"/>
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
      </div>
    </main>
  )
}

export default AdventurePage