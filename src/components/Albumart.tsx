import React, { useEffect, useState, useContext } from 'react'
import art from '../assets/folder.jpg'
import { BsImage, FaRegSave } from 'react-icons/all'
import ReactTooltip from 'react-tooltip'
import { songContext } from '../App'


interface Files {
  file: {
    name: string;
    root: string;
    full: string;
  }
}

export default function Albumart() {
  const [metadata, setMetadata] = useState<any>()
  const {currentSong} = useContext(songContext)
  const [sent, setsent] = useState<boolean>()
  
  useEffect(() => {
    window.Main.on('metadata', (data) => {
      setMetadata(data)
    })
  }, [sent])
  
  function saveFile() {
    let f: any = metadata.tags.tags
    window.Main.sanitize(`${f.title} - ${f.artist}`)
    window.Main.on('sanitized', (sanitized) => {
      const element = document.createElement("a");
      element.href = metadata.src;
      element.download = `${sanitized}.${f.picture.format.split('/')[1]}`
      element.click();
    })
  }

  useEffect(() => {
    window.Main.getMetadata(currentSong.full)
  }, [currentSong])
  
  useEffect(() => {
    ReactTooltip.rebuild()
  });

  return (
    <>
    {metadata &&
      <div className="flex flex-col items-center w-fit h-fit p-5 rounded-lg max-w-lg max-h-lg text-gray-300 font-bold bg-neutral">
        {metadata.src ?
          <div className='relative'>
            <button data-tip="Save Album Cover" onClick={(e) => saveFile()} className='absolute right-1 bottom-1 rounded-full bg-gray-600 p-2 opacity-70 hover:opacity-100 transition-all'><FaRegSave size={20}/></button>
            <img className='w-52 h-52 object-contain' src={metadata.src} alt="art" />
          </div>
        :
          <span className='flex flex-col items-center bg-base-100 p-3 rounded-lg my-2'>
            <BsImage size={40} />
            <p><i>Cover Unavailable</i></p>
          </span>
        }
        <span className='flex flex-col w-full items-stretch mt-2'>
          <span className="flex justify-between font-thin">Title: 
            <p>{metadata.tags.tags.title || <i>Unavailable</i>}</p>
          </span>
          <span className='flex justify-between font-thin'>Artist: 
            <p>{metadata.tags.tags.artist || <i>Unavailable</i>}</p>
          </span>
          <span className='flex justify-between font-thin'>Album: 
            <p>{metadata.tags.tags.album || <i>Unavailable</i>}</p>
          </span>
        </span>
      </div>
    }
    <ReactTooltip effect='solid' padding='10px'/>
    </>
  )
}
