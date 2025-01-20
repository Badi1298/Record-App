import { app, BrowserWindow } from 'electron';
import path from 'node:path';
import started from 'electron-squirrel-startup';

const WebSocket = require('ws');
const AudioRecorder = require('node-audiorecorder');

let recorder;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
	app.quit();
}

const createWindow = () => {
	// Create the browser window.
	const mainWindow = new BrowserWindow({
		width: 800,
		height: 600,
		webPreferences: {
			preload: path.join(__dirname, 'preload.js'),
		},
	});

	// and load the index.html of the app.
	if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
		mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
	} else {
		mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
	}

	// Open the DevTools.
	mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
	createWindow();

	const wss = new WebSocket.Server({ port: 8080 });

	wss.on('connection', (ws) => {
		console.log('Connection established');

		ws.on('message', (message) => {
			if (message === 'startRecording') {
				startAudioRecording(); // Trigger recording logic
			} else if (message === 'stopRecording') {
				stopAudioRecording(); // Stop recording logic
			}
		});
	});

	// On OS X it's common to re-create a window in the app when the
	// dock icon is clicked and there are no other windows open.
	app.on('activate', () => {
		if (BrowserWindow.getAllWindows().length === 0) {
			createWindow();
		}
	});
});

function startAudioRecording(ws) {
	console.log('Starting audio recording...');
	recorder = new AudioRecorder();
	recorder.start();
	ws.send('Recording started');
}

function stopAudioRecording() {
	if (recorder) {
		console.log('Stopping audio recording...');
		recorder.stop();
		ws.send('Recording stopped');
	} else {
		console.log('No recording to stop');
	}
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit();
	}
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
