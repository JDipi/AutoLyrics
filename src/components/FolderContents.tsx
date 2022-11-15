import React, { useState, useEffect, useRef, useContext } from 'react'
import { BiRename, RiDeleteBin6Line, FaCheck, IoClose, VscFolderOpened } from 'react-icons/all'
import ReactTooltip from 'react-tooltip'
import {useOnClickOutside} from '../hooks/useOnClickOutside.js'
import { songContext } from '../App'

interface ctx {
  show: boolean;
  x: number;
  y: number;
  el: any;
  i: number
}

const initialContextMenu: ctx = {
  show: false,
  x: 0,
  y: 0,
  el: '',
  i: 0,
}

 interface Files {
    name: string;
    root: string;
    full: string;
    i: number
  }

export default function FolderContents(props: any) {

  const [originalSongs, setOriginalSongs] = useState<Files[]>()
  const [isRenaming, setIsRenaming] = useState<number|null>(null)
  const [renamedValue, setRenamedValue] = useState<string>()

  const [isSent, setIsSent] = useState<boolean>(false)
  const [searched, setSearched] = useState<Files[]>()
  const [searchTerm, setSearchTerm] = useState<string>('')

  const [contextMenu, setContextMenu] = useState(initialContextMenu)

  const {currentSong, setCurrentSong, allSongs, setAllSongs} = useContext(songContext)


  useEffect(() => {
    window.Main.on('files', (msg: Files[]) => {
      // give each element in the array an i value so that the forward / next buttons in the lyrics component can navigate properly
      msg.forEach((el, i) => el.i = i)
      setAllSongs(msg)
      setOriginalSongs(msg)
      setSearched(msg)
      setSearchTerm('')
  })}, [isSent])
    
  useEffect(() => {
    ReactTooltip.rebuild()
  });
  
  useEffect(() => {
    if (allSongs) {
      // the files state will never be mutated here, the value will only change in the 1st useEffect
      //if search is '', set to original files
      if (searchTerm === '') {setSearched(originalSongs); setAllSongs(originalSongs)}
      //if search has a value, make new file object
      let filesCopy: any = [...[originalSongs]]
      let result = filesCopy[0].filter((el: any) => {
        if (el.name.toLowerCase().includes(searchTerm.toLowerCase())) {
          return el
        }
      })
      // give each element in the array an i value so that the forward / next buttons in the lyrics component can navigate properly
      result.forEach((el: any, i: number) => el.i = i)
      setSearched(result)
      setAllSongs(result)
    }
  }, [searchTerm])

  function rename(el: Files): void {
    setIsRenaming(null)
    if (renamedValue) window.Main.rename(el.root, el.name, renamedValue)
  }

  function handleKey(_event: React.KeyboardEvent, el: Files): void {
    if (_event.key === 'Enter') {
      _event.preventDefault()
      rename(el)
    }
    if (_event.key === 'Escape') {
      _event.preventDefault()
      setIsRenaming(null)
    }
  }

  function handleContextMenu(e: React.MouseEvent<HTMLDivElement, MouseEvent>, el: any, i: number) {
    e.preventDefault()
    const {pageX, pageY} = e
    setContextMenu({show: true, x: pageX, y:pageY, el, i})
  }

  return (
    <>
      {searched && 
      <>
        <div className='p-4 rounded-lg text-gray-300 w-1/3 bg-neutral overflow-scroll scrollbar'>
          <input value={searchTerm} onChange={(e) => {setSearchTerm(e.target.value)}} type="text" className='input input-sm w-full' placeholder='Search'/>
          <div className='divider my-1' />
          <>
          {contextMenu.show && <ContextMenu />}
            {searched.map((el, i) => (
              <div ref={currentSong?.i === i ? props.scrollRef : null} onContextMenu={(e) => {handleContextMenu(e, el, i)}} key={i}>
                <input checked={currentSong?.i === i ? true : false} className='hidden' type="radio" name='file' id={`${i}`} />
                <label className='flex w-[99%] flex-row gap-2 items-center justify-between' htmlFor={`${i}`}>
                  {isRenaming == i ?
                    <>
                      <input type="text" autoFocus onChange={(e) => setRenamedValue(e.target.value)} onKeyDown={(e) => {handleKey(e, el)}} placeholder={el.name} className='my-1 w-full bg-transparent outline-primary cursor-pointer hover:bg-base-100 p-1 rounded-md' />
                      <span className='flex mr-2 items-center'>
                        <IoClose data-tip="Cancel" size={30} onClick={() => {setIsRenaming(null)}} className="hover:fill-primary cursor-pointer"/>
                        <FaCheck data-tip="Confirm" onClick={() => {rename(el)}} size={20} className="hover:fill-primary cursor-pointer"/>
                      </span>
                    </>
                  :
                    <p className='my-1 w-full bg-transparent outline-none cursor-pointer hover:bg-base-100 p-1 rounded-md' onClick={() => {setCurrentSong({name: el.name, root: el.root, full: el.full, i: i})}}>{el.name}</p>
                  }
                </label>
              </div>
            ))}
          </>
        </div>
      </>
      }
      <ReactTooltip effect='solid' padding='10px'/>
    </>
  )


  function ContextMenu() {
    const contextMenuRef = useRef<HTMLDivElement>(null)
    useOnClickOutside(contextMenuRef, () => setContextMenu(initialContextMenu))
  
    return (
      <div ref={contextMenuRef} onClick={() => setContextMenu(initialContextMenu)} className='absolute w-44 bg-white rounded divide-y divide-gray-100 dark:bg-gray-700 z-10' style={{top: `${contextMenu.y}px`, left: `${contextMenu.x}px`}}>
        <ul className="py-1 text-sm text-gray-700 dark:text-gray-200 cursor-pointer" aria-labelledby="dropdownDefault">
          <li>
            <p onClick={() => setIsRenaming(contextMenu.i)} className="flex items-center gap-2 py-2 px-4 dark:hover:bg-primary dark:hover:text-white"><BiRename size={20}/>Rename</p>
          </li>
          <li>
            <p onClick={() => {window.Main.revealFile(contextMenu.el.full)}} className="flex items-center gap-2 py-2 px-4 dark:hover:bg-primary dark:hover:text-white"><VscFolderOpened size={20}/>Reveal in Explorer</p>
          </li>
          <li>
            <p onClick={() => window.Main.deleteFile(contextMenu.el.root, contextMenu.el.name)} className="flex items-center gap-2 py-2 px-4 hover:bg-gray-100 dark:hover:bg-primary dark:hover:text-white"><RiDeleteBin6Line size={20}/>Delete</p>
          </li>
        </ul>
      </div>
    )
  }
}

