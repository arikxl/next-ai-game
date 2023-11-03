'use client'

import { useState } from "react"
import { useAction } from "convex/react";

import { api } from "@/convex/_generated/api";

const AdventurePage = () => {
  const handlePlayerAction = useAction(api.chat.handlePlayerAction);

  const [message, setMessage] = useState('');

  const handleSubmit = (e:any) => {
    e.preventDefault();
    handlePlayerAction({message});
  }

  return (
    <main className="bg-slate-900 flex min-h-screen flex-col items-center justify-between p-24">
      <div className="flex flex-col   z-10 max-w-5xl w-full justify-between font-mono text-sm lg:flex">
        <section className="flex flex-col">
          <div className="bg-white rounded-xl h-[400px] w-[400px] p-4 mb-4">
            {message}
          </div>
          <form onSubmit={(e)=> handleSubmit(e)} className="flex items-center">
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