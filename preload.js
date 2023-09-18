// Secure access of Node.js for the renderer process
const { contextBridge, ipcRenderer } = require("electron");

// Expose ipcRenderer to the window's global context
contextBridge.exposeInMainWorld("ipcRenderer", {
  // Send a message to the main process
  send: (channel, data) => {
    ipcRenderer.send(channel, data);
  },
  
  // Listen for messages from the main process
  on: (channel, callback) => {
    ipcRenderer.on(channel, (event, ...args) => callback(event, ...args));
  },
});
