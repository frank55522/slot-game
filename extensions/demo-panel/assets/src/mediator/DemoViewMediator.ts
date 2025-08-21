import { _decorator } from 'cc';
import BaseMediator from 'src/base/BaseMediator';
import { DemoView } from '../view/DemoView';
import { SceneEvent } from 'src/sgv3/util/Constant';
import { DemoProxy } from '../proxy/DemoProxy';
import { TakeWinCommand } from 'src/sgv3/command/balance/TakeWinCommand';
import { StateMachineProxy } from 'src/sgv3/proxy/StateMachineProxy';
import { DemoStartCommand } from '../command/DemoStartCommand';
import { DemoEndCommand } from '../command/DemoEndCommand';
import { UIEvent } from 'common-ui/proxy/UIEvent';
import { GameDataProxy } from 'src/sgv3/proxy/GameDataProxy';
const { ccclass } = _decorator;

@ccclass('DemoViewMediator')
export class DemoViewMediator extends BaseMediator<DemoView> {
    private objDemoProxy: DemoProxy;
    private clickDemo: boolean = true;

    protected lazyEventListener(): void {
        this.view.demoCallback = this;
        this.facade.registerCommand(DemoStartCommand.NAME, DemoStartCommand);
        this.facade.registerCommand(DemoEndCommand.NAME, DemoEndCommand);
        this.facade.registerProxy(new DemoProxy());
        this.view.gameId = this.gameDataProxy.machineType;
    }

    public listNotificationInterests(): Array<any> {
        return [
            SceneEvent.LOAD_BASE_COMPLETE,
            TakeWinCommand.NAME,
            StateMachineProxy.GAME1_EV_SPIN,
            DemoProxy.FEATURE_SELECT,
            UIEvent.SET_BBW_POSITION_TO_BOTTOM,
            UIEvent.RESTORE_BBW_POSITION
        ];
    }

    public handleNotification(notification: puremvc.INotification): void {
        let name = notification.getName();
        switch (name) {
            case StateMachineProxy.GAME1_EV_SPIN:
                this.clickDemo = false;
                this.view.setButtonState(false);
                break;
            case TakeWinCommand.NAME:
                if (this.clickDemo || this.gameDataProxy.curExtraBet != 'NoExtraBet') return;

                this.view.setButtonState(true);
                if (!this.demoProxy.isDemoed) return;

                this.sendNotification(DemoEndCommand.NAME);
                break;
            case DemoProxy.FEATURE_SELECT:
                this.clickDemo = true;
                this.view.featureSelect(notification.getBody());
                break;
            case UIEvent.SET_BBW_POSITION_TO_BOTTOM:
                this.hideView();
                break;
            case UIEvent.RESTORE_BBW_POSITION:
                this.showView();
                break;
        }
    }

    public onClickFeature(json: object): void {
        this.clickDemo = true;
        let obj = JSON.parse(JSON.stringify(json['data']));
        let rng = obj.randomDataUsed;
        let totalBet = json['totalBet'];
        if (this.gameDataProxy.isOmniChannel()) {
            let denom = json['denom'];
            let multiplier = json['multiplier'];
            let featureBet = json['featureBet'];
            this.sendNotification(DemoStartCommand.NAME, { totalBet, denom, multiplier, featureBet, rng });
        } else {
            this.sendNotification(DemoStartCommand.NAME, { totalBet, rng });
        }

        if (!rng) {
            this.demoProxy.onResponse('h5.spinResponse', obj);
        }
    }

    public setGroupingWheelData(groupingWheelData): void {
        this.demoProxy.demoGroupingWheelData = groupingWheelData;
    }

    public setWheelData(wheelData) {
        this.demoProxy.demoWheelData = wheelData;
    }

    private hideView(): void {
        this.view.node.active = false;
    }

    private showView(): void {
        this.view.node.active = true;
    }

    public selectFeature(json): void {
        this.clickDemo = true;
        let obj = JSON.parse(JSON.stringify(json.data));
        this.clickDemo = false;
        this.demoProxy.onResponse('h5.spinResponse', obj);
    }

    // ======================== Get Set ========================

    private get demoProxy(): DemoProxy {
        if (!this.objDemoProxy) {
            this.objDemoProxy = this.facade.retrieveProxy(DemoProxy.NAME) as DemoProxy;
        }
        return this.objDemoProxy;
    }

    protected _gameDataProxy: GameDataProxy;
    public get gameDataProxy(): GameDataProxy {
        if (!this._gameDataProxy) {
            this._gameDataProxy = this.facade.retrieveProxy(GameDataProxy.NAME) as GameDataProxy;
        }
        return this._gameDataProxy;
    }
}
