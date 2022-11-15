import React, { useState } from 'react';

import Icon from '../assets/icons/Icon-Electron.png';

function AppBar() {
  const [isMaximize, setMaximize] = useState(false);

  const handleToggle = () => {
    if (isMaximize) {
      setMaximize(false);
    } else {
      setMaximize(true);
    }
    window.Main.Maximize();
  };

  return (
    <>
      <div className="py-0.5 flex justify-between center draggable">
        <div className="flex items-center">
          <img className="h-6 lg:-ml-2" src={Icon} alt="Icon of Electron" />
          <p className="text-md font-bold text-gray-300">MP3 AutoLyrics</p>
        </div>
        <div className="flex gap-5 mx-2 items-baseline">
          <button onClick={window.Main.Minimize} className="undraggable hover:bg-gray-700 hover:text-white">
            &#8211;
          </button>
          <button onClick={handleToggle} className="undraggable hover:bg-gray-700 hover:text-white">
            {isMaximize ? '\u2752' : '⃞'}
          </button>
          <button onClick={window.Main.Close} className="undraggable hover:bg-gray-700 hover:text-white">
            &#10005;
          </button>
        </div>
      </div>
      <div className="bg-gray-900 text-white undraggable">
        <div className="flex ml-2 text-center py-1 gap-1">
          <div className="text-sm rounded-lg p-1 hover:bg-gray-700 cursor:pointer">File</div>
          <div className="text-sm rounded-lg p-1 hover:bg-gray-700 cursor:pointer">Edit</div>
          <div className="text-sm rounded-lg p-1 hover:bg-gray-700 cursor:pointer">View</div>
          <div className="text-sm rounded-lg p-1 hover:bg-gray-700 cursor:pointer">Window</div>
          <div className="text-sm rounded-lg p-1 hover:bg-gray-700 cursor:pointer">Help</div>
        </div>
      </div>
    </>
  );
}

export default AppBar;
