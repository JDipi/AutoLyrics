import React, { useEffect, useRef, useState, createContext } from 'react';
import Albumart from './components/Albumart';
import AppBar from './components/AppBar';
import FolderContents from './components/FolderContents';
import Lyrics from './components/Lyrics';
import Path from './components/Path';


interface Files {
  name: string;
  root: string;
  full: string;
  i: number
}

export const songContext = createContext<any>(null)

function App() {


  const [isSent, setSent] = useState(false);

  const [currentSong, setCurrentSong] = useState<Files>()
  const [allSongs, setAllSongs] = useState<Files[]>()

  const scrollRef = useRef<any>(null)


  return (
    <div className="flex flex-col bg-base-100 h-full">
      {window.Main && (
        <div className="flex-none">
          <AppBar />
        </div>
      )}
      <main className='flex flex-col flex-grow overflow-hidden'>
        <songContext.Provider value={{currentSong, setCurrentSong, allSongs, setAllSongs}}>
          <Path />
          <div className='flex overflow-hidden gap-3 m-3 h-full'>
            <FolderContents scrollRef={scrollRef} />
            {currentSong &&
              <>
                <Albumart />
                <Lyrics scrollRef={scrollRef}/>
              </>
            }
          </div>
        </songContext.Provider>
      </main>
    </div>
  );
}

export default App;
