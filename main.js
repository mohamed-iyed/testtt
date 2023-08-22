const { app, BrowserWindow, ipcMain, desktopCapturer } = require('electron')
const child_process = require('child_process');
const { readFile, writeFile } = require('fs/promises')
const path = require('path')
// const sharp = require('sharp')
const { createCanvas, Image } = require('canvas')


// mohamediyedta@gmail.com

// 123456789Loyds..

let mainWindow = null
let isRecording = false
let recordingArea = null
let isSharing = false;
let ffmpeg;
let ctx;
let canvas;

const createWindow = async () => {
    mainWindow = new BrowserWindow({
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            devTools: true,
        }
    })

    mainWindow.maximize()
    mainWindow.loadURL('https://bbb.mbkwork.tech')
    mainWindow.webContents.openDevTools()
    mainWindow.webContents.addListener('dom-ready', async () => {
        mainWindow.webContents.executeJavaScript(await readFile(path.join(__dirname, 'script.js')))
    })

}

const hsr = async () => {
    if (isRecording) return isRecording = false;
    isRecording = true
    const w = new BrowserWindow({
        width: 1920,
        height: 1080,
        frame: false,
        transparent: true,
        resizable: false,
        alwaysOnTop: true,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            devTools: true,
        },
    })


    // w.maximize()

    await w.loadFile(path.join(__dirname, 'startRecording.html'))
    // w.webContents.openDevTools()
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
                    // const data = `data:image/jpeg;base64, ${(await sharp(thumbnail).extract({ left: x, top: y, width: selectedWith, height: selectedHeight }).toBuffer())}`
                    // mainWindow.webContents.send('NEW_FRAME', )
                    const data = thumbnail.crop({ x, y, width: selectedWith, height: selectedHeight }).toJPEG(50).toString('base64');

                    mainWindow.webContents.send('NEW_FRAME', `data:image/jpeg;base64, ${data}`);

                    if (isSharing && ctx) {
                        const image = new Image()
                        image.src = `data:image/jpeg;base64, ${data}`;

                        image.onload = () => ctx.drawImage(image, 0, 0)
                    }
                }
            } catch (e) {
                console.log({ e })
            }
        }, 1000 / 60);

        w.destroy()
    })

}

const htr = () => {
    isRecording = false
}




function ssy(_, link) {
    const { width: selectedWith, height: selectedHeight } = recordingArea;
    canvas = createCanvas(selectedWith, selectedHeight)
    canvas.toB
    ctx = canvas.getContext('2d')
    console.log('start streaming...', { link })
    isSharing = true;

    ffmpeg = child_process.spawn('ffmpeg', [
        // '-f', 'lavfi', '-i', 'anullsrc',

        // FFmpeg will read input video from STDIN
        // '-i', '-',

        // // Because we're using a generated audio source which never ends,
        // // specify that we'll stop at end of other input.  Remove this line if you
        // // send audio from the browser.
        // // '-shortest',

        // // If we're encoding H.264 in-browser, we can set the video codec to 'copy'
        // // so that we don't waste any CPU and quality with unnecessary transcoding.
        // // If the browser doesn't support H.264, set the video codec to 'libx264'
        // // or similar to transcode it to H.264 here on the server.
        // // '-vcodec', 'copy',

        // // AAC audio is required for Facebook Live.  No browser currently supports
        // // encoding AAC, so we must transcode the audio to AAC here on the server.
        // '-acodec', 'aac',

        // // FLV is the container format used in conjunction with RTMP
        // '-vcodec', 'mjpeg',
        // '-f', 'flv',
        // '-f', 'png',
        '-i', '-',
        '-c:v', 'libvpx-vp9',
        '-pix_fmt', 'yuva420p',
        // '-c:v', 'png',
        '-preset', 'ultrafast',
        // '-tune', 'zerolatency',
        '-crf', '23',
        '-b:v', '2000k',
        '-maxrate', '2500k',
        '-bufsize', '4000k',
        '-g', '30',
        // '-f', 'flv',
        // '-c:v', 'mjpeg',
        'test1.webm'
    ]);

    // rtmp://a.rtmp.youtube.com/live2/zamp-bwsu-f8t6-k9vf-b0bg

    ffmpeg.on('close', (code, signal) => {
        console.log('FFmpeg child process closed, code ' + code + ', signal ' + signal);
    });

    // Handle STDIN pipe errors by logging to the console.
    // These errors most commonly occur when FFmpeg closes and there is still
    // data to write.  If left unhandled, the server will crash.
    ffmpeg.stdin.on('error', (e) => {
        console.log('FFmpeg STDIN Error', e);
    });

    // FFmpeg outputs all of its messages to STDERR.  Let's log them to the console.
    ffmpeg.stderr.on('data', (data) => {
        console.log('FFmpeg STDERR:', data.toString());
    });


    const send = () => {
        if (canvas && ffmpeg && isSharing) {
            ffmpeg.stdin.write(canvas.toBuffer('image/png', { 'quality': .5 }));
        }

        setTimeout(() => send(), 50)
    }

    send();
}


// const st = (_, data) => {
//     if (isSharing && ffmpeg) {
//         console.log('wrting data...')
//         if (data.length === 0) return;
//         ffmpeg.stdin.write(Buffer.from(data));
//     }
// }


app.whenReady().then(() => {
    ipcMain.handle('START_RECORDING', hsr)
    ipcMain.handle('STOP_RECORDING', htr)
    ipcMain.handle('START_SHARE', ssy)
    // ipcMain.handle('MEDIA_DATA', st)

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