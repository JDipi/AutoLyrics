import React, {useRef} from 'react'
import { IconType } from 'react-icons/lib';
import {useOnClickOutside} from '../hooks/useOnClickOutside.js'

interface Menu {
  icon: IconType;
  text: string;
  action: () => any;
}

interface ContextMenu {
  x: number;
  y: number;
  closeContextMenu: () => void;
  menu: Menu[]
}

const ContextMenu: React.FC<ContextMenu> = ({x, y, closeContextMenu}) => {
  const contextMenuRef = useRef<HTMLDivElement>(null)
  useOnClickOutside(contextMenuRef, closeContextMenu)

  return (
    <div ref={contextMenuRef} onClick={() => closeContextMenu()} className='absolute z-20 bg-gray/800 backdrop-blur-sm font-bold border w-30 h-fit text-gray-300 py-4 rounded-lg' style={{top: `${y}px`, left: `${x}px`}}>
      <div className="text-white cursor-pointer hover:bg-primary w-32 px-5 py-1 flex text-left">Rename</div>
    </div>
  )
}

export default ContextMenu