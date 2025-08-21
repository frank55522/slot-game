import { _decorator } from 'cc';
import { AudioClipsEnum } from '../game/vo/enum/SoundMap';
import { SoundEvent, WinEvent } from '../sgv3/util/Constant';
import { AudioManager } from './AudioManager';
const { ccclass } = _decorator;

@ccclass('AudioMediator')
export class AudioMediator extends puremvc.Mediator {
    protected lazyEventListener(): void {}

    public listNotificationInterests(): Array<any> {
        return [WinEvent.MULTIPLE_SET, SoundEvent.BUTTON_DOWN_SOUND, SoundEvent.SPIN_DOWN_SOUND];
    }
    public handleNotification(notification: puremvc.INotification): void {
        let name = notification.getName();
        switch (name) {
            case SoundEvent.BUTTON_DOWN_SOUND:
                AudioManager.Instance.play(AudioClipsEnum.Button_UI);
                break;
        }
    }
}
