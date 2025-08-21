import { _decorator, AudioSource, AudioClip } from 'cc';
const { ccclass } = _decorator;

@ccclass('AudioSourcePool')
export class AudioSourcePool {
    private reservedPool: Array<AudioSource> = new Array();

    private getNewAudioSource(audioClip: AudioClip): AudioSource {
        const audioSource = new AudioSource();
        audioSource.clip = audioClip;
        audioSource.playOnAwake = false;
        return audioSource;
    }

    getAudioSource(clip: AudioClip): AudioSource {
        let audioSource =
            this.reservedPool.find((audioSource) => audioSource && audioSource.clip == clip) ??
            this.getNewAudioSource(clip);
        let index = this.reservedPool.indexOf(audioSource);
        if (index != -1) {
            this.reservedPool.splice(index, 1);
        }
        return audioSource;
    }

    returnAudioSource(audioSource: AudioSource) {
        this.reservedPool.push(audioSource);
    }
}
