import React, { useEffect, useState, useContext, useRef } from 'react'
import { GoChevronLeft, GoChevronRight } from 'react-icons/go'
import ReactTooltip from 'react-tooltip'
import { songContext } from '../App'

interface Files {
  name: string;
  root: string;
  full: string;
}


export default function Lyrics(props: any) {

  const [songs, setSongs] = useState<any>()
  const [sent, setSent] = useState<any>()

  const [metadata, setMetadata] = useState<any>()
  const [lyrics, setLyrics] = useState<string>('')
  const {currentSong, setCurrentSong, allSongs} = useContext(songContext)
  const [status, setStatus] = useState<boolean|null>(null)
  const [source, setSource] = useState<"genius"|"azlyrics"|undefined>()

  const searchRef = useRef<string>('')
  const clickOutsideRef = useRef<any>(null)
  
  useEffect(() => {
    window.Main.on('metadata', (data) => {
      setMetadata(data)
      setLyrics(data.tags.tags.lyrics.lyrics)
    })
    window.Main.on('lyrics', (data) => {
      setLyrics(data)
    })
    window.Main.on('songs', (data) => {
      setSongs(data)
      console.log(data)
    })
    window.Main.on('writeStatus', (err) => {
      if (err) console.log(err)
      setInterval(() => {
        setStatus(null)
      }, 2000)
      err ? setStatus(false) : setStatus(true)
    })
  }, [sent])

  useEffect(() => {
    setSongs('')
    setLyrics('')
  }, [currentSong, allSongs])

  useEffect(() => {
    ReactTooltip.rebuild()
  });

  function prevSong() {
    if (currentSong.i !== 0) {
      setCurrentSong(allSongs[currentSong.i - 1])
    }
    props.scrollRef.current?.scrollIntoView({behavior: 'smooth', alignToTop: true})

  }
  
  function nextSong() {
    if (currentSong.i !== allSongs.length - 1) {
      setCurrentSong(allSongs[currentSong.i + 1])
    }
    props.scrollRef.current?.scrollIntoView({behavior: 'smooth'})
  }

  function handleKey(_event: React.KeyboardEvent): void {
    if (_event.key === 'Enter') {
      _event.preventDefault()
      window.Main.getSongs(searchRef.current, source || "genius")
      clickOutsideRef.current?.click()
    }
  }

  return (
    <div className="scrollbar flex flex-col items-center-60 flex-1 p-5 h-fit max-h-full overflow-y-scroll gap-2 rounded-lg max-w-lg text-gray-300 font-bold bg-neutral">

      <input ref={clickOutsideRef} type="checkbox" id="search-modal" className="modal-toggle" />
      <label htmlFor="search-modal" className="modal cursor-pointer">
        <label className="modal-box relative flex gap-2 items-center">
          <input onChange={(e) => searchRef.current = e.target.value} onKeyDown={(e) => handleKey(e)} type="text" placeholder="Enter Custom Search Term" className="input input-bordered input-lg w-full" />
          <label htmlFor='search-modal' onClick={() => window.Main.getSongs(searchRef.current, source || "genius")} className="btn ml-2 border-primary h-full hover:btn-primary">Search</label>
        </label>
      </label>

        <div className={`alert ${status ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"} alert-success absolute w-1/6 bottom-3 right-3 shadow-lg transition-opacity duration-200`}>
          <div>
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span>Success!</span>
          </div>
        </div>
      
      {status == false &&
        <div className={`alert ${!status ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"} alert-error absolute w-1/6 bottom-3 right-3 shadow-lg transition-opacity duration-200`}>
          <div>
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span>Error writing lyrics!</span>
          </div>
        </div>
      }

      <textarea placeholder="Press Search to Start" className="scrollbar textarea textarea-primary box-border w-full min-h-[200px]" value={lyrics} />
      <span className='w-full flex-1'>
        <div className='flex flex-col gap-2 items-center'>
          <span className='flex w-full items-center'>
            <span className="flex flex-col items-start gap-1 my-1">
              <p>Choose Lyrics Source:</p>
              <span className="flex gap-2 items-center">
                <input onClick={() => setSource('genius')} type="radio" name="radio-2" id="g-radio" className="radio radio-primary w-[20px] h-[20px]" checked={source === 'genius' ? true : false} />
                <label onClick={() => setSource('genius')} className="cursor-pointer font-normal" htmlFor="g-radio">Genius</label>
              </span>
              <span className='flex gap-2 items-center'>
                <input onClick={() => setSource('azlyrics')} type="radio" name="radio-2" id="a-radio" className="radio radio-primary w-[20px] h-[20px]" checked={source === 'azlyrics' ? true : false}/>
                <label onClick={() => setSource('azlyrics')} className="cursor-pointer font-normal" htmlFor="a-radio">AZLyrics</label>
              </span>
            </span> 
            <span className='flex flex-1 justify-end'>
              <button onClick={() => window.Main.getSongs(metadata.tags.tags.title || '', source || "genius")} className="btn border-primary hover:btn-primary">Search</button>
            </span>
          </span>

          {songs &&
            <>
              <span className='flex items-start w-full mt-2'>
                <p>Songs Matching Title:</p>
              </span>
              <ul className='mt-[-10px] flex flex-col w-full items-start'>
                {songs.map((el: any, i: number) => (
                  <>
                    <input type="radio" className='hidden' name="songs" id={`${i}a`} />
                    <label onClick={() => window.Main.getLyrics(el.result.url, source || "genius")} htmlFor={`${i}a`} className='songResult border-b my-1 p-1 cursor-pointer w-fit font-normal transition-colors' key={i}>{el.result.full_title}</label>
                  </>
                ))}
              </ul>
              <label htmlFor="search-modal" className="mt-2 font-thin cursor-pointer hover:text-gray-200">No Results? Click here!</label>
            </>
          }
          <span className='flex w-full items-center gap-1'>
            <button onClick={() => prevSong()} data-tip="Previous file" className="btn btn-sm w-1/6 mt-2 border-primary hover:btn-primary"><GoChevronLeft size={25}/></button>
            <button onClick={() => {window.Main.writeTags({unsynchronisedLyrics: {language: "eng", text: lyrics}}, currentSong.full)}} className="btn btn-sm flex-1 mt-2 h-fit border-primary hover:btn-primary">Write Lyrics to File</button>
            <button onClick={() => nextSong()} data-tip="Next file" className="btn btn-sm w-1/6 mt-2 border-primary hover:btn-primary"><GoChevronRight size={25}/></button>
          </span>
        </div>
      </span>
      <ReactTooltip effect='solid' padding='10px'/>
    </div>
  )
}
