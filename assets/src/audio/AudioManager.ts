import { _decorator, Component, AudioClip, Prefab, resources } from 'cc';
import { PoolManager } from '../sgv3/PoolManager';
import { AudioContainer } from './AudioContainer';
import { AudioSourcePool } from './AudioSourcePool';
import * as i18n from '../../../extensions/i18n/assets/LanguageData';
import { Logger } from 'src/core/utils/Logger';
const { ccclass, property } = _decorator;

@ccclass('AudioManager')
export class AudioManager extends Component {
    private static _instance: AudioManager;

    public static get Instance(): AudioManager {
        return this._instance;
    }

    @property({ type: Prefab })
    private audioContainerPrefab: Prefab;
    //
    private activePool: Array<AudioContainer> = new Array();
    //
    private _audioClipsMap: Map<string, AudioClip>;
    private get audioClipsMap() {
        if (!this._audioClipsMap) {
            this._audioClipsMap = new Map<string, AudioClip>();
        }
        return this._audioClipsMap;
    }
    //
    private mute: boolean = false;
    //
    private audioSourcePool: AudioSourcePool;

    private preloadPromiseList = [];
    private loadPromiseList = [];
    private retryInterval: number = 500;

    onLoad() {
        AudioManager._instance = this;
    }

    setLoadList() {
        if (this.audioSourcePool) {
            //已進行載入
            return;
        }
        Logger.i('📢 [AudioManager] setLoadList');
        this.audioSourcePool = new AudioSourcePool();
        this.assignPromise();
        this.preloadAudio();
    }

    private assignPromise() {
        const unusedLanguages = this.getUnusedLanguages();
        resources.config.paths.forEach((val, key) => {
            if (this.checkUnused(unusedLanguages, key) == false) {
                if (/[aA]udio\/[pP]re[lL]oad\/\w+/.test(key)) {
                    this.preloadPromiseList.push(key);
                } else if (/[aA]udio\/\w+/.test(key)) {
                    this.loadPromiseList.push(key);
                }
            }
        });
    }

    private getUnusedLanguages() {
        let unused: string[] = [];
        JSON.stringify(window.languages, (key, value) => {
            if (typeof value !== 'string' && /\w+/.test(key) && key !== i18n._language) {
                unused.push(key);
            }
            return value;
        });
        return unused;
    }

    private checkUnused(filter: string[], url: string) {
        for (let i = 0; i < filter.length; i++) {
            if (url.endsWith('_' + filter[i])) {
                return true;
            }
        }
        return false;
    }

    private loadAudioClip(dir: string) {
        return new Promise((resolve, reject) => {
            resources.load<AudioClip>(dir, (error, audio) => {
                if (error) {
                    return reject(error);
                }
                this.audioClipsMap.set(audio.name, audio);
                resolve(`Success load ${audio.name}`);
            });
        });
    }

    private preloadAudio() {
        Promise.all(this.preloadPromiseList).catch((msg) => console.warn(msg));
        let promiseList = [];
        this.preloadPromiseList.forEach((dir) => promiseList.push(this.loadAudioClip(dir)));
        Promise.all(promiseList)
            .then(() => {
                Logger.i('📢 [AudioManager] preloadAudio success');
            })
            .catch((err) => {
            setTimeout(() => {
                this.preloadAudio();
            }, this.retryInterval);
        });
    }

    loadAudio() {
        let promiseList = [];
        this.loadPromiseList.forEach((dir) => promiseList.push(this.loadAudioClip(dir)));
        Promise.all(promiseList)
            .then((msg) => this.resumeClip())
            .catch((err) => {
                setTimeout(() => {
                    this.loadAudio();
                }, this.retryInterval);
            });
    }

    private resumeClip() {
        this.activePool
            .filter((audio) => audio.audioSource.clip == null)
            .forEach((audio) => {
                audio.audioSource.clip = this.audioClipsMap.get(audio.clipName);
                audio.audioSource.play();
            }, this);
    }

    play(clipName: string) {
        if (clipName == '') {
            return;
        }
        let audioContainer = this.createAudioContainerFromPool({ clipName: clipName });
        const options = {
            fade(vol: number, duration: number) {
                if (audioContainer) {
                    audioContainer.fade({ vol: vol, duration: duration });
                }
                return options;
            },
            volume(vol: number) {
                if (audioContainer) {
                    audioContainer.volume = vol;
                }
                return options;
            },
            loop(loop: boolean) {
                if (audioContainer) {
                    audioContainer.loop = loop;
                }
                return options;
            },
            callback(cb: () => void) {
                if (audioContainer) {
                    audioContainer.playCallback = cb;
                }
                return options;
            },
            replay() {
                if (audioContainer) {
                    audioContainer.replay();
                }
                return options;
            }
        };
        if (audioContainer != null) {
            audioContainer.play();
        }
        return options;
    }

    fade(clipName: string, volume: number, duration: number, endFn?: () => void) {
        let audioContainer = this.getAudioContainerInActivePool(clipName);
        audioContainer?.fade({ vol: volume, duration: duration, endFn: endFn });
    }

    stop(clipName: string, isImmediately: boolean = false) {
        let audioContainer = this.getAudioContainerInActivePool(clipName);

        const options = {
            fade(vol: number, duration: number) {
                if (!isImmediately) {
                    audioContainer?.fade({ vol: vol, duration: duration, completeThenStop: true });
                }
                return options;
            },
            callback(cb: () => void) {
                audioContainer.stopCallback = cb;
                return options;
            }
        };
        if (isImmediately) {
            audioContainer?.stop();
        } else {
            audioContainer?.fade({ vol: audioContainer.volume, duration: 0, completeThenStop: true });
        }
        return options;
    }

    private createAudioContainerFromPool({
        volume = 1,
        loop = false,
        clipName = null,
        mute = this.mute
    }: audioContainerPara): AudioContainer {
        let clip = this.audioClipsMap.get(clipName);
        if (clip == null) {
            return null;
        }
        let audioSourceContainerNode = PoolManager.instance.getNode(this.audioContainerPrefab, this.node);
        let audioSourceContainer = audioSourceContainerNode.getComponent(AudioContainer);

        audioSourceContainer.audioSource = this.audioSourcePool.getAudioSource(clip);
        audioSourceContainer.clipName = clipName;
        audioSourceContainer.volume = volume;
        audioSourceContainer.loop = loop;
        audioSourceContainer.mute = mute;

        this.activePool.push(audioSourceContainer);

        return audioSourceContainer;
    }

    returnToPool(audioContainer: AudioContainer) {
        let index = this.activePool.indexOf(audioContainer);
        if (index != -1) {
            this.activePool.splice(index, 1);
            this.audioSourcePool.returnAudioSource(audioContainer.audioSource);
            PoolManager.instance.putNode(audioContainer.node);
        }
    }

    //回傳activePool中對應名稱的單一AudioContainer
    private getAudioContainerInActivePool(clipName: string): AudioContainer {
        {
            let audioContanier: AudioContainer = this.activePool.find((x) => {
                return x.clipName == clipName;
            });
            return audioContanier;
        }
    }

    /**聲音總開關 */
    audioOnOff(onOff: boolean) {
        this.mute = !onOff;
        this.activePool.forEach((x) => {
            x.mute = this.mute;
        });
    }
}

export interface audioContainerPara {
    volume?: number;
    loop?: boolean;
    clipName: string;
    mute?: boolean;
}
