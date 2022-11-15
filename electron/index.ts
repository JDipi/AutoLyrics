// Native
import { join } from 'path';
const fs = require('fs')
const path = require('path')
const request = require('request')
// const id3 = require('node-id3')
var jsmediatags = require("jsmediatags");
const NodeID3 = require('node-id3')
import { parse } from 'node-html-parser'

require('electron-reload')(__dirname, {electron: require(`../node_modules/electron`)})

// Packages
import { BrowserWindow, app, ipcMain, IpcMainEvent, shell } from 'electron';
const { dialog } = require('electron')
import isDev from 'electron-is-dev';
var sanitize = require("sanitize-filename");

const height = 750;
const width = 1000;

let MUSIC: string = ""

let mainWindow: any

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width,
    height,
    //  change to false to use AppBar
    frame: false,
    show: true,
    resizable: true,
    fullscreenable: true,
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
      nodeIntegration: true,
    }
  });

  const port = process.env.PORT || 3000;
  const url = isDev ? `http://localhost:${port}` : join(__dirname, '../src/out/index.html');

  // and load the index.html of the app.
  if (isDev) {
    mainWindow?.loadURL(url);
  } else {
    mainWindow?.loadFile(url);
  }
  // Open the DevTools.
  mainWindow.webContents.openDevTools();

  // For AppBar
  ipcMain.on('minimize', () => {
    // eslint-disable-next-line no-unused-expressions
    mainWindow.isMinimized() ? mainWindow.restore() : mainWindow.minimize();
    // or alternatively: win.isVisible() ? win.hide() : win.show()
  });
  ipcMain.on('maximize', () => {
    // eslint-disable-next-line no-unused-expressions
    mainWindow.isMaximized() ? mainWindow.restore() : mainWindow.maximize();
  });

  ipcMain.on('close', () => {
    mainWindow.close();
  });


  interface Files {
    name: string;
    root: string;
    full: string;
  }

  function refreshDirectory(dir: string): Files[] {
    let files: Files[] = [];
    const items = fs.readdirSync(dir, { withFileTypes: true });
    
    items.forEach((item: any) => {
      if (item.isDirectory()) {
        files = [...files, ...refreshDirectory(path.join(dir, item.name))];
      } else {
          // makes it so that only mp3 files will show up
          if (item.name.split('.').pop() === 'mp3') {
            files.push({root: dir, name: item.name, full: path.join(dir,item.name)})
          }
        }
    })

    return files
  }

  ipcMain.on('refreshDirectory', (_evt: IpcMainEvent) => {if (MUSIC) mainWindow.webContents.send('files', refreshDirectory(MUSIC))})

  ipcMain.on('revealInExplorer', (_evt: IpcMainEvent) => {if (MUSIC) shell.openPath(MUSIC)})

  ipcMain.on('revealFile', (_evt: IpcMainEvent, path: string) => {shell.showItemInFolder(path)})

  ipcMain.on('chooseFolder', async (_evt: IpcMainEvent) => {
    dialog.showOpenDialog({ properties: ['openDirectory']}).then((res) => {
      if (res.canceled) return

      MUSIC = res.filePaths[0]
      mainWindow.webContents.send('files', refreshDirectory(res.filePaths[0]))
      _evt.sender.send('path', res.filePaths[0])
    })
  })

  
  ipcMain.on('rename', (_evt: IpcMainEvent, filePath: string, oldName: string, newName: string) => {
    let renamePath: string = path.join(filePath, oldName)

    // if the user includes ".mp3" when renaming the file, don't add the extension (avoids ".mp3.mp3")
    // let newPath: string = `${path.join(MUSIC, newName)}${newName.split('.').pop() === 'mp3' ? '' : '.mp3'}`
    let newPath: string = `${path.join(filePath, newName)}${newName.split('.').pop() === 'mp3' ? '' : '.mp3'}`
   
    fs.rename(renamePath, newPath, (error: Error) => {
      _evt.sender.send('files', refreshDirectory(MUSIC))
      if (!error) return
      console.log(error)
    })
  })

  ipcMain.on('deleteFile', (_evt: IpcMainEvent, filePath: string, fileName: string) => {
    let deletePath: string = path.join(filePath, fileName)
    fs.unlink(deletePath, (_err:any) => {
      if (_err) throw _err
      _evt.sender.send('files', refreshDirectory(MUSIC))
    })
  })

  ipcMain.on('toRenderer', (_evt: IpcMainEvent, data: any) => {
    mainWindow.webContents.send('fromRenderer', data)
  })

  ipcMain.on('getMetadata', (_evt: IpcMainEvent, filePath: string) => {
    jsmediatags.read(filePath, {
      onSuccess: (result: any) => {

        if (!result.tags.picture) {
          _evt.sender.send('metadata', {tags: result, src: ""})
        } else {

          let base64: string = btoa(
            new Uint8Array(result.tags.picture.data)
              .reduce((data, byte) => data + String.fromCharCode(byte), '')
          );
          
          let src: string = `data:image/png;base64,${base64}`


          _evt.sender.send('metadata', {tags: result, src})
        }
      },
      onError: (err: any) => {
        console.log(err)
      }
    })
  })

  ipcMain.on('sanitize', (_evt: IpcMainEvent, string: string) => {
    let sanitized: string = sanitize(string)
    _evt.sender.send('sanitized', sanitized)
  })
  
  
  ipcMain.on('getSongs', (_evt: IpcMainEvent, song: string, source: "genius"|"azlyrics") => {
    if (source === 'genius') {
      request(`https://genius.com/api/search/multi?q=${song}`, (_err: any, _res: any, _body: any) => {
        if (!_err && _res.statusCode === 200) {
          let res = JSON.parse(_body)
          _evt.sender.send('songs', res.response.sections[1].hits)
        }}
        )
      } else if (source === 'azlyrics') {
        request(`https://search.azlyrics.com/suggest.php?q=${song}`, (_err: any, _res: any, _body: any) => {
          if (!_err && _res.statusCode === 200) {
            let res = JSON.parse(_body)
            let data: {}[] = []
            res.songs.forEach((el: any) => {
              data.push({result: {url: el.url, full_title: el.autocomplete}})
            })
            _evt.sender.send('songs', data)
        }
      })
    }
  })

  ipcMain.on('getLyrics', (_evt: IpcMainEvent, url: string, source: "genius"|"azlyrics") => {
    if (source === 'genius') {
      request(url, (_err: any, _res: any, _body: any) => {
        let lyrics: string = ''
        const root = parse(_body)
        const lyricsContainer = root.querySelectorAll('div[data-lyrics-container]')
        lyricsContainer.forEach(el => {
          lyrics += el.structuredText
        })
        _evt.sender.send('lyrics', lyrics)
      })
    } else if (source === 'azlyrics') {
      request(url, (_err: any, _res: any, _body: any) => {
        const root = parse(_body)
        const lyricsContainer = root.querySelector('.ringtone ~ div:not([class])')
        _evt.sender.send('lyrics', lyricsContainer?.structuredText.trim())
      })

    }
  })

  ipcMain.on('writeTags', (_evt: IpcMainEvent, tags: any, filepath: string) => {
    NodeID3.update(tags, filepath, (err: Error) => {
      err ? _evt.sender.send('writeStatus', err) : _evt.sender.send('writeStatus', null) 
    })
    refreshDirectory(MUSIC)
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();


  app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

// listen the channel `message` and resend the received message to the renderer process
ipcMain.on('message', (event: IpcMainEvent, message: any) => {
  console.log(message);
  setTimeout(() => event.sender.send('message', 'hi from electron'), 500);
});