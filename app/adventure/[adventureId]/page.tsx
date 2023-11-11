'use client'

import Image from "next/image";
import { useEffect, useState } from "react"
import { useAction, useMutation, useQuery } from "convex/react";
import Dice from "react-dice-roll";

import { api, } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

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

  function Spinner() {
    return (
      <div role="status" className="flex items-center flex-col">
        <svg aria-hidden="true" className="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-primary" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
          <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
        </svg>
      </div>
    )
  }

  return (
    <main className="bg-slate-900 flex min-h-screen flex-col items-center "
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
          <div className="bg-white rounded-xl h-[350px] text-xl  p-4 mb-4 overflow-y-auto font-chakra">
            {entries?.map((e, idx) => (
              <div key={e._id} className="flex flex-col gap-2 mb-4">
                <p >YOU: {idx > 0 ? e.input : ''}</p>
                <p >{e.response}</p>
                <hr className="border-primary" />
              </div>
            ))}
          </div>
          <div className=" flex">

            <Dice onRoll={(value) => setMessage(value.toString())} size={40} />
            <form onSubmit={(e) => handleSubmit(e)} className="flex gap-3 w-full">

              <input name='message' value={message} className=" w-full p-1 px-2 rounded ml-2 capitalize text-lg"
                onChange={(e) => setMessage(e.target.value)}
              />
              <button className='bg-white hover:bg-primary text-black px-6 rounded text-lg' type="submit">Go!</button>
            </form>
          </div>
        </section>

        <section className="flex-1 rounded-xl flex ">
          <div className="w-5/6">

            <div className="h-[220px] justify-center flex mb-4">
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
                  : (<>
                    <Spinner />
                    <p className='text-white text-lg'>LOADING...</p>
                  </>)
              }
            </div>

            <div className="text-white flex gap-2 flex-wrap">
              {
                lastEntry?.inventory.map((itemName, idx) => {
                  const item = items?.find((item) => item.itemName === itemName);
                  return (
                    <div key={idx}>
                      {item && item.imageUrl ? (
                        <Image src={item.imageUrl}
                          alt={item.itemName} title={item.itemName}
                          width={80} height={80}
                          className="border border-white rounded hover:border-primary hover:border-2"
                        />
                      )
                        : (<>
                          <Spinner />
                          <p className="text-white">{item?.itemName}</p>
                        </>)}
                    </div>
                  )

                })
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