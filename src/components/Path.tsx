import React from 'react'
import { useState, useEffect, useRef } from 'react';
import { MdRefresh, VscFolderOpened } from 'react-icons/all'
import ReactTooltip from 'react-tooltip'

export default function () {
  const [isSent, setIsSent] = useState(false)
  const [path, setPath] = useState('')

  useEffect(() => {
    window.Main.on('path', (msg: string) => {
      setPath(msg)
  })}, [isSent])

  useEffect(() => {
    ReactTooltip.rebuild()
  })

  return (
    <div className='flex flex-row text-gray-300 items-center justify-center gap-3 mx-3'>
      <input value={path} onChange={(e) => {setPath(e.target.value)}} className='input input-bordered input-sm my-4 w-full bg-gray-700 pointer-events-none' placeholder={'Enter path to music folder'} />
      <span className='flex gap-3 fill-gray-300'>
        <button className='btn btn-sm px-1'>
          <MdRefresh data-tip="Refresh Files" size={25} onClick={() => window.Main.refreshDirectory()} className='fill-gray-300 hover:fill-primary cursor-pointer outline-none'/>
        </button>
        <button className='btn btn-sm px-1'>
          <VscFolderOpened data-tip="Reveal in Explorer" onClick={() => window.Main.revealInExplorer()} size={25} className='fill-gray-300 hover:fill-primary cursor-pointer outline-none'/>
        </button>
      </span>
      <button onClick={() => {window.Main.chooseFolder(); setIsSent(true)}} className='btn btn-sm hover:text-primary'>Browse</button>
      <ReactTooltip effect='solid' padding='10px'/>
    </div>
  )
}
