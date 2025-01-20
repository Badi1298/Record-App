<template>
	<main>
		<button @click="startAudioRecording">Start audio recording</button>
		<button
			@click="stopAudioRecording"
			style="margin-left: 20px"
		>
			Stop audio recording
		</button>
	</main>
</template>

<script setup lang="ts">
const socket = new WebSocket('ws://localhost:8080');

const startAudioRecording = () => {
	socket.send('startRecording');
};

const stopAudioRecording = () => {
	socket.send('stopRecording');
};
</script>

<style scoped></style>
