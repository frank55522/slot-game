import { _decorator } from 'cc';
import BaseMediator from '../../base/BaseMediator';
import { Logger } from '../../core/utils/Logger';
import { SceneManager } from '../../core/utils/SceneManager';
import { StateWinEvent, ViewMediatorEvent } from '../../sgv3/util/Constant';
import { GlobalTimer } from '../../sgv3/util/GlobalTimer';
import { GAME_TransitionView } from '../view/GAME_TransitionView';
const { ccclass } = _decorator;

@ccclass('TransitionViewMediator')
export class TransitionViewMediator extends BaseMediator<GAME_TransitionView> {
    public static readonly NAME: string = 'TransitionViewMediator';

    public transitionView: GAME_TransitionView = null;

    constructor(name?: string, component?: any) {
        super(TransitionViewMediator.NAME, component);
        Logger.i('[TransitionMediator] constructor()');
    }

    protected lazyEventListener(): void {
        this.transitionView = this.viewComponent;
    }

    public listNotificationInterests(): Array<any> {
        let eventList = [
            SceneManager.EV_ORIENTATION_VERTICAL,
            SceneManager.EV_ORIENTATION_HORIZONTAL,
            StateWinEvent.ON_GAME2_TRANSITIONS,
            StateWinEvent.ON_GAME4_TRANSITIONS,
            ViewMediatorEvent.CHANGE_DISPLAY_CONTAINER
        ];
        return eventList;
    }

    public handleNotification(notification: puremvc.INotification) {
        const self = this;
        let name = notification.getName();

        switch (name) {
            case SceneManager.EV_ORIENTATION_VERTICAL:
                self.onOrientationVertical();
                break;
            case SceneManager.EV_ORIENTATION_HORIZONTAL:
                self.onOrientationHorizontal();
                break;
            case StateWinEvent.ON_GAME2_TRANSITIONS:
            case StateWinEvent.ON_GAME4_TRANSITIONS:
                if (notification.getBody() == true) self.onTransitionBGEffect();
                break;
        }
    }

    /** 執行橫式轉換 */
    protected onOrientationHorizontal(): void {
        if (this.transitionView) {
            this.transitionView.changeOrientation(GAME_TransitionView.HORIZONTAL);
        }
    }

    /** 執行直式轉換 */
    protected onOrientationVertical(): void {
        if (this.transitionView) {
            this.transitionView.changeOrientation(GAME_TransitionView.VERTICAL);
        }
    }

    /** 開啟 轉場動畫*/
    protected onTransitionBGEffect() {
        GlobalTimer.getInstance()
            .registerTimer(
                'onTransitionBGEffect',
                1.3,
                () => {
                    GlobalTimer.getInstance().removeTimer('onTransitionBGEffect');
                    this.transitionView.showTransition();
                },
                this
            )
            .start();
    }
}
