'use client'

import { useEffect, useState } from "react"
import { useAction, useMutation, useQuery } from "convex/react";

import { api, } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import Image from "next/image";

const AdventurePage = (props: { params: { adventureId: Id<'adventures'> } }) => {
  const handlePlayerAction = useAction(api.chat.handlePlayerAction);

  const [message, setMessage] = useState('');
  const [title, setTitle] = useState('');
  const [bgImg, setBgImg] = useState('');
  const entries = useQuery(api.chat.getAllEntries, { adventureId: props.params.adventureId });
  const items = useQuery(api.inventory.getAllItems, {});


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

  const lastEntry = entries && entries[entries.length - 1];

  return (
    <main className=" flex min-h-screen flex-col items-center "
    >
      <h1 className="text-white text-4xl my-6 underline decoration-1 text-shadow  z-10 ">{title}</h1>

      <Image
        src={bgImg}
        alt='Arik'
        fill quality={100}
        sizes="100vw"
        objectFit="cover"
        priority
      />
      <div className="flex bg-trans rounded-xl gap-6  z-10 max-w-6xl w-full justify-between p-6 text-sm lg:flex">
        <section className="flex flex-col flex-1">
          <div className="bg-white rounded-xl h-[350px]  p-4 mb-4 overflow-y-auto font-mono">
            {entries?.map((e, idx) => (
              <div key={e._id} className="flex flex-col gap-2 mb-4">
                <p >{idx > 0 ? e.input : ''}</p>
                <p >{e.response}</p>
                <hr className="border-primary" />
              </div>
            ))}
          </div>
          <form onSubmit={(e) => handleSubmit(e)} className="flex items-center">
            <input name='message' value={message} className="p-1 px-2 rounded mr-2 capitalize"
              onChange={(e) => setMessage(e.target.value)}
            />
            <button className='bg-white text-black px-6 rounded text-lg' type="submit">Go!</button>
          </form>
        </section>

        <section className="flex-1 rounded-xl flex ">
          <div className="w-5/6">

            <div className=" max-h-[50%] justify-center flex mb-4">
              {
                lastEntry && lastEntry.imageUrl
                  ? (
                    <Image
                      src={lastEntry.imageUrl}
                      width={300}
                      height={300}
                      alt='Arik Alexandrov'
                      className='rounded-lg '
                      objectFit="cover"
                      style={{ aspectRatio: '4/3' }}
                    />
                  )
                  : (<span className="text-white">LOADING...</span>)
              }
            </div>
            <div className="text-white flex gap-2 flex-wrap">
              {
                items?.map((i, idx) => (
                  <Image key={idx} src={i.imageUrl}
                    alt={i.itemName} title={i.itemName}
                    width={80} height={80}
                    className="border border-white rounded"
                  />
                ))
              }
            </div>
          </div>
          <div className=" flex flex-col items-end w-1/5 text-4xl">
            {
              new Array(lastEntry?.health).fill('').map((_, idx) => (
                <h1 key={idx}>❤️</h1>
              ))
            }
            {
              lastEntry?.health < 10 && (
                new Array((10 - lastEntry?.health)).fill('').map((_, idx) => (
                  <h1 key={idx}>🩶</h1>
                ))
              )
            }
          </div>

        </section>
      </div>

      {/* <img src={bgImg } alt='aa' /> */}
    </main>
  )
}

export default AdventurePage