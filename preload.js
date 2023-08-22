const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
    startRecording: () => ipcRenderer.invoke('START_RECORDING'),
    stopRecording: () => ipcRenderer.invoke('STOP_RECORDING'),
    recordingArea: (data) => ipcRenderer.invoke('RECORDING_AREA', data),
    screenSize: (dimensions) => ipcRenderer.invoke('SCREEN_SIZE', dimensions),
    handleNewFrame: cb => ipcRenderer.on('NEW_FRAME', (_, frame) => cb(frame)),
    sendMediaData: (data) => ipcRenderer.invoke('MEDIA_DATA', data),
    startShare: (link) => ipcRenderer.invoke('START_SHARE', link),

})




