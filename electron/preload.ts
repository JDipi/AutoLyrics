import { ipcRenderer, contextBridge } from 'electron';

declare global {
  interface Window {
    Main: typeof api;
    ipcRenderer: typeof ipcRenderer;
  }
}

const api = {
  /**
   * Here you can expose functions to the renderer process
   * so they can interact with the main (electron) side
   * without security problems.
   *
   * The function below can accessed using `window.Main.sayHello`
   */
  sendMessage: (message: string) => {
    ipcRenderer.send('message', message);
  },
  /**
    Here function for AppBar
   */
  Minimize: () => {
    ipcRenderer.send('minimize');
  },
  Maximize: () => {
    ipcRenderer.send('maximize');
  },
  Close: () => {
    ipcRenderer.send('close');
  },
  
  chooseFolder: () => {
    ipcRenderer.send('chooseFolder')
  },

  deleteFile: (filePath: string, fileName: string) => {
    ipcRenderer.send('deleteFile', filePath, fileName)
  },

  rename: (filePath: string, oldName: string, newName: string) => {
    ipcRenderer.send('rename', filePath, oldName, newName)
  },

  refreshDirectory: () => {
    ipcRenderer.send('refreshDirectory')
  },

  revealInExplorer: () => {
    ipcRenderer.send('revealInExplorer')
  },

  revealFile: (path: string) => {
    ipcRenderer.send('revealFile', path)
  },

  toRenderer: (data: any) => {
    ipcRenderer.send('toRenderer', data)
  },

  getMetadata: (filePath: string) => {
    ipcRenderer.send('getMetadata', filePath)
  },

  sanitize: (string: string): any => {
    ipcRenderer.send('sanitize', string)
  },

  getSongs: (song: string, source: "genius"|"azlyrics") => {
    ipcRenderer.send('getSongs', song, source)
  },

  getLyrics: (url: string, source: "genius"|"azlyrics") => {
    ipcRenderer.send('getLyrics', url, source)
  },

  writeTags: (tags: any, filepath: string) => {
    ipcRenderer.send('writeTags', tags, filepath)
  },


  // changeSelected: (song: number) => {
  //   ipcRenderer.send('changeSelected', song)
  // },
  
  /**
   * Provide an easier way to listen to events
   */

  on: (channel: string, callback: (data: any) => void) => {
    ipcRenderer.on(channel, (_, data) => callback(data));
  },

};
contextBridge.exposeInMainWorld('Main', api);
/**
 * Using the ipcRenderer directly in the browser through the contextBridge ist not really secure.
 * I advise using the Main/api way !!
 */
contextBridge.exposeInMainWorld('ipcRenderer', ipcRenderer);
