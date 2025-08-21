import { _decorator, resources, AudioClip, AudioSource } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('VisibilityChangeCommand')
export class VisibilityChangeCommand extends puremvc.SimpleCommand {
    public static readonly NAME: string = 'VisibilityChangeCommand';

    public execute(notification: puremvc.INotification): void {
        const isOpenSetting: boolean = notification.getBody() ? notification.getBody() : false;
        if (isOpenSetting) {
            this.addVisibilityChange();
        } else {
            this.removeVisibilityChange();
        }
    }

    private addVisibilityChange() {
        // 監聽遊戲切換分頁
        document.addEventListener("visibilitychange", this.onVisibilityChange);
    }

    private removeVisibilityChange() {
        // 取消監聽遊戲切換分頁
        document.removeEventListener("visibilitychange", this.onVisibilityChange);
    }

    private onVisibilityChange = () => {
        if (document.visibilityState === 'visible') {
            // 遊戲切換到前台
            try {
                resources.load('audio/music_logo', AudioClip, (err, audioClip) => {
                    var audioSource = new AudioSource();
                    audioSource.clip = audioClip;
                    audioSource.play();
                });
            } catch (ex) {
                console.error(ex);
            }
        }
    }
}

