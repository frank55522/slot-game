import { SpeedMode } from 'common-ui/proxy/UIEnums';
import { UIProxy } from 'common-ui/proxy/UIProxy';
import { setEngineTimeScale } from 'src/core/utils/SceneManager';
import { GameDataProxy } from 'src/sgv3/proxy/GameDataProxy';
export class MockChangeTimeScaleCommand extends puremvc.SimpleCommand {
    public static readonly NAME = 'MockChangeTimeScaleCommand';

    private readonly MIN_MULTIPLIER: number = 1;
    private readonly MAX_MULTIPLIER: number = 20;

    public execute(notification: puremvc.INotification): void {
        let multiplier: number = notification.getBody();
        if (!multiplier || isNaN(multiplier)) {
            alert(`Error : 請輸入數字 ${this.MIN_MULTIPLIER} ~ ${this.MAX_MULTIPLIER}`);
            return;
        }
        if (multiplier <= 1) {
            this.gameDataProxy.curSpeedMode = SpeedMode.STATUS_NORMAL;
            this.UIProxy.isQuickSpin = false;
            setEngineTimeScale(1);
            console.log(`[Debug 速度模式]:恢復一般模式(1倍速)，QuickSpin按鈕已啟用`);
            return;
        }
        //修改全局狀態
        this.gameDataProxy.curSpeedMode = 'DEBUG_SPEED_MODE';
        this.UIProxy.isQuickSpin = true;
        // 範圍限制
        multiplier = Math.max(this.MIN_MULTIPLIER, multiplier);
        multiplier = Math.min(this.MAX_MULTIPLIER, multiplier);
        setEngineTimeScale(multiplier);
        console.log(`[Debug 速度模式]: x${multiplier} 倍，QuickSpin按鈕已禁用`);
    }

    protected _gameDataProxy: GameDataProxy;
    protected get gameDataProxy(): GameDataProxy {
        if (!this._gameDataProxy) {
            this._gameDataProxy = this.facade.retrieveProxy(GameDataProxy.NAME) as GameDataProxy;
        }
        return this._gameDataProxy;
    }

    private _UIProxy: UIProxy;
    public get UIProxy(): UIProxy {
        if (!this._UIProxy) {
            this._UIProxy = this.facade.retrieveProxy(UIProxy.NAME) as UIProxy;
        }
        return this._UIProxy;
    }
}
