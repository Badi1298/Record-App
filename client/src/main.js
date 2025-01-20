import { app, BrowserWindow } from 'electron';
import path from 'node:path';
import started from 'electron-squirrel-startup';

const WebSocket = require('ws');
const AudioRecorder = require('node-audiorecorder');
const fs = require('fs');

let recorder;
let audioFileStream;

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
			console.log(message);

			if (message.toString() === 'startRecording') {
				startAudioRecording(ws); // Trigger recording logic
			} else if (message.toString() === 'stopRecording') {
				stopAudioRecording(ws); // Stop recording logic
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

	// File to save audio
	const fileName = `recording_${Date.now()}.wav`; // Name the file with a timestamp
	audioFileStream = fs.createWriteStream(fileName);

	// Recorder options
	const options = {
		program: 'sox', // Use 'arecord' or 'sox', depending on the platform
		bits: 16,
		channels: 1,
		encoding: 'signed-integer',
		format: 'S16_LE',
		rate: 16000,
		type: 'wav', // Output file type
	};

	// Initialize the recorder
	recorder = new AudioRecorder(options, console);

	// Start recording and pipe the audio data to the file
	recorder.start().stream().pipe(audioFileStream);

	ws.send(`Recording started, saving to ${fileName}`);

	// Handle errors
	recorder.stream().on('error', (err) => {
		console.error('Recording error:', err);
		ws.send(`Recording error: ${err.message}`);
	});
}

function stopAudioRecording(ws) {
	if (recorder) {
		console.log('Stopping audio recording...');
		recorder.stop(); // Stop the recorder
		audioFileStream.end(); // Close the file stream
		ws.send('Recording stopped and saved');
	} else {
		ws.send('No active recording to stop');
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
