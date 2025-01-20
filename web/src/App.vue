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
import { onMounted, ref } from 'vue';

const ws = ref<WebSocket | null>(null);

onMounted(() => {
	const socket = new WebSocket('ws://localhost:8080');

	socket.onopen = () => {
		console.log('WebSocket connection established');
	};

	socket.onmessage = (event) => {
		console.log(event.data);
	};

	socket.onclose = () => {
		console.log('WebSocket connection closed');
	};

	ws.value = socket;
});

const startAudioRecording = () => {
	console.log('startRecording');
	ws.value?.send('startRecording');
};

const stopAudioRecording = () => {
	console.log('stopRecording');
	ws.value?.send('stopRecording');
};
</script>

<style scoped></style>
