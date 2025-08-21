import { _decorator, Component, AudioSource, tween, Tween } from 'cc';
import { AudioManager } from './AudioManager';
const { ccclass } = _decorator;

@ccclass('AudioContainer')
export class AudioContainer extends Component {
    private _volume: number = 1;
    private _clipName: string;
    private _loop: boolean = false;
    private _mute: boolean = false;
    private _audioSource: AudioSource;

    private _playCallback: () => void = null;
    private _stopCallback: () => void = null;

    private fadeTween: Tween<AudioContainer>;

    get audioSource(): AudioSource {
        return this._audioSource;
    }

    set audioSource(value: AudioSource) {
        this._audioSource = value;
        this._audioSource.node = this.node;
    }
    //
    get loop(): boolean {
        return this._loop;
    }
    set loop(value: boolean) {
        this._loop = value;
        this.audioSource.loop = this._loop;
    }
    //
    get volume() {
        return this._volume;
    }
    //
    set volume(value: number) {
        value = (value > 1 ? 1 : value) || (value < 0 ? 0 : value);
        this._volume = value;
        let vol = this._mute == true ? 0 : this._volume;
        this.audioSource.volume = vol;
    }
    //
    get mute() {
        return this._mute;
    }
    set mute(value: boolean) {
        this._mute = value;
        let vol = this._mute == true ? 0 : this._volume;
        this.audioSource.volume = vol;
    }
    //
    get clipName() {
        return this._clipName;
    }

    set clipName(value: string) {
        this._clipName = value;
    }

    set playCallback(value: () => void) {
        this._playCallback = value;
    }

    set stopCallback(value: () => void) {
        this._stopCallback = value;
    }

    init() {
        this._playCallback = null;
        this._stopCallback = null;
        this.fadeTween?.stop();
        AudioManager.Instance.returnToPool(this);
    }

    play() {
        this.audioSource.node.once(
            AudioSource.EventType.ENDED,
            () => {
                this._playCallback?.();
                this.init();
            },
            this
        );
        this.audioSource.play();
    }

    replay() {
        this.audioSource.play();
    }

    stop() {
        this.audioSource.stop();
        this._stopCallback?.();
        this.init();
    }

    fade({ vol, duration, completeThenStop, startFn, updateFn, endFn }: fadePara) {
        let _duration = duration;
        this.fadeTween?.stop();
        this.fadeTween = tween<AudioContainer>(this)
            .to(
                _duration,
                { volume: vol },
                {
                    onStart: startFn,
                    onUpdate: updateFn,
                    onComplete: () => {
                        if (completeThenStop == true) {
                            this.stop();
                        }
                        endFn?.();
                    }
                }
            )
            .start();
    }
}

interface fadePara {
    vol: number;
    duration: number;
    completeThenStop?: boolean;
    startFn?: () => void;
    updateFn?: () => void;
    endFn?: () => void;
}
