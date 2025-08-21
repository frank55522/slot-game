import { EventKeyboard, KeyCode, SystemEvent, systemEvent } from 'cc';
import { ServiceProvider } from '../vo/NetworkType';
import { DEBUG } from 'cc/env';
import { UIEvent } from 'common-ui/proxy/UIEvent';

export class KeyboardProxy extends puremvc.Proxy {
    public static readonly NAME: string = 'KeyboardProxy';
    public static readonly EV_KEY_DOWN: string = 'EV_KEY_DOWN';
    public constructor() {
        super(KeyboardProxy.NAME);

        // 連接 SFS 時監聽 Keyboard 事件
        if (window['serviceProvider'] === ServiceProvider.DEFAULT) {
            this.registerEvent();
        }
    }
    // global keyboard event
    private registerEvent() {
        systemEvent.on(SystemEvent.EventType.KEY_DOWN, this.handleKeyDownEvent, this);
    }

    private handleKeyDownEvent(event: EventKeyboard) {
        const self = this;
        if (event.keyCode == KeyCode.SPACE || event.keyCode == KeyCode.ENTER || event.keyCode == KeyCode.NUM_ENTER) {
            self.sendNotification(UIEvent.SPIN_KEY_DOWN);
        }

        if (DEBUG) {
            self.facade.sendNotification(KeyboardProxy.EV_KEY_DOWN, event);
        }
    }
}
