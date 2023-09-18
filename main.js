"use strict"

const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
require("dotenv").config();

// Check the enviournment 
const isDev = process.env.NODE_ENV === "development";

let mainWindow;

// Create application window
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  // Handle page load failures
  mainWindow.webContents.on(
    "did-fail-load",
    (event, errorCode, errorDescription) => {
      console.error(
        `Page failed to load: ${errorDescription} (Error code: ${errorCode})`
      );
      // Handle the page load failure, e.g., show an error page or retry loading.
    }
  );

  mainWindow.loadFile(path.join(__dirname, "src", "index.html"));

  if (isDev) {
    mainWindow.webContents.openDevTools();
    // open dev tools if app running in dev enviournment
  }

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.on("ready", () => {
  try {
    createWindow();
    // Handle IPC request for the API key
    ipcMain.on("get-api-key", (event) => {
      const apiKey = process.env.API_KEY || '28a20c88541f7e9ccce82032';
      // Send the API key to the renderer process
      event.sender.send("api-key", apiKey);
    });
  } catch (error) {
    console.error(`App initialization error: ${error.message}`);
    // Handle the error or show an error message to the user.
  }
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("before-quit", () => {
  // Add your cleanup or confirmation logic here
});

process.on("uncaughtException", (error) => {
  console.error(`Uncaught Exception: ${error.message}`);
  // Handle the error gracefully or take appropriate action.
});
