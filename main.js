const { app, BrowserWindow, ipcMain, desktopCapturer } = require('electron')
const { readFile, writeFile } = require('fs/promises')
const path = require('path')
const sharp = require('sharp')


let mainWindow = null
let isRecording = false
let recordingArea = null

const createWindow = async () => {
    mainWindow = new BrowserWindow({
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            devTools: true,
        }
    })

    mainWindow.maximize()
    mainWindow.loadURL('https://demo.bigbluebutton.org/')
    mainWindow.webContents.openDevTools()
    mainWindow.webContents.addListener('dom-ready', async () => {
        mainWindow.webContents.executeJavaScript(await readFile(path.join(__dirname, 'script.js')))
    })
}


const hsr = async () => {
    isRecording = true
    const w = new BrowserWindow({
        frame: false,
        transparent: true,
        resizable: false,
        roundedCorners: true,
        alwaysOnTop: true,

        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            devTools: true,
        },
    })


    w.maximize()

    await w.loadFile(path.join(__dirname, 'startRecording.html'))
    w.webContents.openDevTools()
    w.show()
    w.setBackgroundColor('rgba(255, 255, 255, .2)')
    ipcMain.handle('RECORDING_AREA', async (_, data) => {
        recordingArea = data
        const { x, y, width: selectedWith, height: selectedHeight } = data

        const [width, height] = w.getSize();

        const interval = setInterval(async () => {
            if (!isRecording) {
                return clearInterval(interval);
            }

            try {
                const ss = await desktopCapturer.getSources({ types: ['screen'], "thumbnailSize": { width, height } })
                const entire = ss.find(({ name }) => name === 'Entire screen')


                if (entire) {
                    const { thumbnail } = entire;
                    const data = `data:image/jpeg;base64, ${(await sharp(thumbnail.toJPEG(50)).extract({ left: x, top: y, width: selectedWith, height: selectedHeight }).toBuffer()).toString('base64')}`
                    mainWindow.webContents.send('NEW_FRAME', data)
                }
            } catch (e) {
                console.log({ e })
            }


        }, 1000 / 70);

        w.destroy()
    })

}

const htr = () => {
    isRecording = false
}



app.whenReady().then(() => {
    ipcMain.handle('START_RECORDING', hsr)
    ipcMain.handle('STOP_RECORDING', htr)

    createWindow()

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow()
        }
    })
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})