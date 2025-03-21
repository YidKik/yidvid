
export class AudioRecorder {
  constructor(private onAudioData: (audioData: Float32Array) => void) {}

  async start() {
    console.log('Audio recording functionality has been disabled');
    return Promise.resolve();
  }

  stop() {
    console.log('Audio recording functionality has been disabled');
  }
}

export class RealtimeChat {
  constructor(private onMessage: (event: any) => void) {}

  async init() {
    console.log('Real-time chat functionality has been disabled');
    return Promise.resolve();
  }

  disconnect() {
    console.log('Real-time chat functionality has been disabled');
  }
}
