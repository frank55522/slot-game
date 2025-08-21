import { _decorator, Node, EventTouch } from 'cc';
import BaseMediator from '../../base/BaseMediator';
import { Logger } from '../../core/utils/Logger';
import { SceneEvent } from '../../sgv3/util/Constant';
import { IWormHoleView, WormHoleView } from '../view/WormHoleView';
const { ccclass } = _decorator;

/**
 * @author Vince vinceyang
 *
 * mock tool啟動器
 */
@ccclass('WormHoleViewMediator')
export class WormHoleViewMediator extends BaseMediator<WormHoleView> implements IWormHoleView {
    public static readonly EV_DOUBlE_CLICK = 'EV_DOUBlE_CLICK';

    public static readonly EV_CHANG_COORDINATE = 'onChangeWormHoleViewCoordinate';

    private whView: WormHoleView;

    constructor(name?: string, component?: any) {
        super(name, component);
        WormHoleViewMediator.NAME = this.mediatorName;
    }

    public onRegister(): void {
        Logger.i('WormHoleViewMediator initial done');
    }

    protected lazyEventListener(): void {
        const self = this;
        self.whView = self.viewComponent;
        self.whView.initView(self);
        self.whView.registerTouchEvent();
    }

    public listNotificationInterests(): Array<any> {
        return [SceneEvent.LOAD_BASE_COMPLETE];
    }

    public handleNotification(notification: puremvc.INotification): void {
        const self = this;

        switch (notification.getName()) {
            case SceneEvent.LOAD_BASE_COMPLETE:
                break;
        }
    }

    public onDoubleClick(e: EventTouch) {
        const self = this;

        self.facade.sendNotification(WormHoleViewMediator.EV_DOUBlE_CLICK);
    }

    public reset(): void {
        const self = this;

        self.whView.enableClickedArea();
    }

    public setViewPosition(posData: number[]) {
        if (posData.length < 2) throw new Error('wormHoleView x or y no setting');
        const x = posData[0];
        const y = posData[1];

        const self = this;
        let wormHoleView = self.whView;
        wormHoleView.node.setPosition(x, y, 0);
    }
}
