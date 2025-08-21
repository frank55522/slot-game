import { _decorator } from 'cc';
import BaseMediator from '../../base/BaseMediator';
import { Logger } from '../../core/utils/Logger';
import { SceneManager } from '../../core/utils/SceneManager';
import { GameDataProxy } from '../../sgv3/proxy/GameDataProxy';
import { JackpotPoolProxy } from '../../sgv3/proxy/JackpotPoolProxy';
import { GameStateProxyEvent, JackpotPool, SceneEvent, ScreenEvent, ViewMediatorEvent } from '../../sgv3/util/Constant';
import { GameScene } from '../../sgv3/vo/data/GameScene';
import { JackpotPoolObj } from '../../sgv3/vo/jackpot/JackpotPoolObj';
import { JackpotTypeObj } from '../../sgv3/vo/jackpot/JackpotTypeObj';
import { PoolHitInfo } from '../../sgv3/vo/result/PoolHitInfo';
import { GAME_JackpotPoolView } from '../view/GAME_JackpotPoolView';
import { JackpotPoolValueType } from '../../sgv3/vo/enum/JackpotPoolValueType';
import { UIEvent } from 'common-ui/proxy/UIEvent';
import { MathUtil } from 'src/core/utils/MathUtil';
const { ccclass } = _decorator;

@ccclass('GAME_JackpotPoolViewMediator')
export class GAME_JackpotPoolViewMediator extends BaseMediator<GAME_JackpotPoolView> {
    public static readonly NAME: string = 'GAME_JackpotPoolViewMediator';
    private curBonusMultiplier: number = 0;

    constructor(name?: string, component?: any) {
        super(name, component);
        Logger.i('[GAME_JackpotPoolViewMediator] constructor()');
    }

    protected lazyEventListener(): void {}

    public listNotificationInterests(): Array<any> {
        let eventList = [
            ScreenEvent.ON_BET_CHANGE,
            SceneManager.EV_ORIENTATION_VERTICAL,
            SceneManager.EV_ORIENTATION_HORIZONTAL,
            SceneEvent.LOAD_BASE_COMPLETE,
            JackpotPool.CHANGE_SCENE,
            JackpotPool.POOL_VALUE_UPDATE,
            JackpotPool.HIT_JACKPOT_TO_POOL_VALUE_INIT,
            JackpotPool.HIT_JACKPOT_TO_POOL_VALUE_UPDATE,
            GameStateProxyEvent.ON_SCENE_BEFORE_CHANGE,
            UIEvent.ON_CLICK_DENOM_BUTTON,
            ViewMediatorEvent.SHOW_FEATURE_SELECTION
        ];
        return eventList;
    }

    public handleNotification(notification: puremvc.INotification): void {
        let name = notification.getName();
        switch (name) {
            case SceneManager.EV_ORIENTATION_HORIZONTAL:
                this.onOrientationHorizontal();
                this.setJpPoolPos();
                break;
            case SceneManager.EV_ORIENTATION_VERTICAL:
                this.onOrientationVertical();
                this.setJpPoolPos();
                break;
            case ScreenEvent.ON_BET_CHANGE:
                this.onBetLevelChange();
                break;
            case SceneEvent.LOAD_BASE_COMPLETE:
                this.view.node.active = true;
                this.initView();
                break;
            case JackpotPool.CHANGE_SCENE:
                this.setJpPoolPos();
                break;
            case JackpotPool.POOL_VALUE_UPDATE:
                if (
                    this.gameDataProxy.curScene == GameScene.Init ||
                    (this.gameDataProxy.curScene == GameScene.Game_1 && this.gameDataProxy.canUpdateJackpotPool)
                ) {
                    this.updatePoolValue(notification.getBody(), false);
                }
                break;
            case JackpotPool.HIT_JACKPOT_TO_POOL_VALUE_INIT:
                this.hitJackpotToInitPoolValue();
                break;
            case JackpotPool.HIT_JACKPOT_TO_POOL_VALUE_UPDATE:
                this.hitJackpotToUpdatePoolValue(notification.getBody());
                break;
            case GameStateProxyEvent.ON_SCENE_BEFORE_CHANGE:
                this.view.changeOrientation(this.gameDataProxy.orientationEvent, this.gameDataProxy.curScene);
                break;
            case UIEvent.ON_CLICK_DENOM_BUTTON:
                this.onClickDenom(notification.getBody());
                break;
            case ViewMediatorEvent.SHOW_FEATURE_SELECTION:
                this.view.setLowerLayer();
                break;
        }
    }

    /** 執行橫式轉換 */
    protected onOrientationHorizontal(): void {
        let curScene = this.gameDataProxy.curScene;
        this.view?.changeOrientation(SceneManager.EV_ORIENTATION_HORIZONTAL, curScene);
    }

    /** 執行直式轉換 */
    protected onOrientationVertical(): void {
        let curScene = this.gameDataProxy.curScene;
        this.view?.changeOrientation(SceneManager.EV_ORIENTATION_VERTICAL, curScene);
    }

    private onBetLevelChange() {
        const first = 0;
        const jpPoolData = this.gameDataProxy.initEventData.executeSetting.jackpotSetting.jackpotPoolData[first];
        const betIndex = this.gameDataProxy.totalBetIdx;
        const betRangeMapIndex = this.gameDataProxy.getJackpotPoolRangeIndexWithBet();
        let poolFxList = [];
        let isBetMultiplier = false;
        for (let i = 0; i < jpPoolData.jackpotExtendSetting.poolInitValue[betRangeMapIndex].length; i++) {
            let jpType = jpPoolData.jackpotExtendSetting.poolInitValueType[i];
            let jpValue = jpPoolData.jackpotExtendSetting.poolInitValue[betRangeMapIndex][i];
            switch (jpType) {
                case JackpotPoolValueType.Multiplier:
                    let mulValue = MathUtil.mul(
                        this.gameDataProxy.totalBetList[this.gameDataProxy.totalBetIdx],
                        jpValue
                    );
                    this.view.updateBonusPoolByBetRange(i, mulValue);
                    isBetMultiplier = true;
                    poolFxList.push(i);
                    break;
            }
        }
        // Bonus 依照押注倍數更新才表演動畫
        if (isBetMultiplier && betIndex > this.curBonusMultiplier && this.gameDataProxy.curScene != GameScene.Init) {
            this.view.updateFortuneMultiplier(poolFxList); //依照 BetRange或 階層上升
        }
        this.curBonusMultiplier = betIndex;
    }

    private onClickDenom(denomMultiplier: number) {
        const first = 0;
        const jpPoolData = this.gameDataProxy.initEventData.executeSetting.jackpotSetting.jackpotPoolData[first];
        const betRangeMapIndex = this.gameDataProxy.getJackpotPoolRangeIndexWithBet();
        let poolFxList = [];
        for (let i = 0; i < jpPoolData.jackpotExtendSetting.poolInitValue[betRangeMapIndex].length; i++) {
            let jpType = jpPoolData.jackpotExtendSetting.poolInitValueType[i];
            let jpValue = jpPoolData.jackpotExtendSetting.poolInitValue[betRangeMapIndex][i];
            switch (jpType) {
                case JackpotPoolValueType.DenomMultiplier:
                    let bonusCredit = MathUtil.mul(denomMultiplier, jpValue);
                    this.view.updateBonusPoolByBetRange(i, bonusCredit);
                    poolFxList.push(i);
                    break;
            }
        }
        if (this.gameDataProxy.curScene != GameScene.Init) {
            this.view.updateFortuneMultiplier(poolFxList);
        }
    }

    protected initView(): void {
        this.view.isOmniChannel = this.gameDataProxy.isOmniChannel();
        this.initBonusPool();
        this.onBetLevelChange();
    }

    protected initBonusPool() {
        const jpPoolData = this.gameDataProxy.initEventData.executeSetting.jackpotSetting.jackpotPoolData[0];
        const betIndex = this.gameDataProxy.totalBetList.length - 1 - this.gameDataProxy.totalBetIdx;
        const betRangeMapIndex = jpPoolData.jackpotExtendSetting.betRangeMap[betIndex];

        let newPoolInitValue = [];
        for (let i = 0; i < jpPoolData.jackpotExtendSetting.poolInitValue[betRangeMapIndex].length; i++) {
            let jpType = jpPoolData.jackpotExtendSetting.poolInitValueType[i];
            let jpValue = jpPoolData.jackpotExtendSetting.poolInitValue[betRangeMapIndex][i];
            switch (jpType) {
                case JackpotPoolValueType.Credit:
                    newPoolInitValue.push(this.jackpotPoolProxy.jackpotTypeObj.typeItems[i].poolValue);
                    break;
                case JackpotPoolValueType.Multiplier:
                    let mulValue = MathUtil.mul(
                        this.gameDataProxy.totalBetList[this.gameDataProxy.totalBetIdx],
                        jpValue
                    );
                    newPoolInitValue.push(mulValue);
                    break;
                case JackpotPoolValueType.DenomMultiplier:
                    let bonusCredit = MathUtil.mul(this.getMultiplierOfDenom(), jpValue);
                    newPoolInitValue.push(bonusCredit);
                    break;
            }
        }

        // 做 Jackpot 則要抓取 jackpotSetting
        this.view.initBonusPool(newPoolInitValue);
    }

    protected hitJackpotToInitPoolValue() {
        const hitJackpotPoolTypes = this.gameDataProxy.hitJackpotPoolTypes;
        for (const type of hitJackpotPoolTypes) {
            const jpPoolData = this.gameDataProxy.initEventData.executeSetting.jackpotSetting.jackpotPoolData[0];
            const betRangeMapIndex = this.gameDataProxy.getJackpotPoolRangeIndexWithBet();
            let initJackpotValue: number = 0;

            let jpType = jpPoolData.jackpotExtendSetting.poolInitValueType[type - 1];
            let jpValue = jpPoolData.jackpotExtendSetting.poolInitValue[betRangeMapIndex][type - 1];
            switch (jpType) {
                case JackpotPoolValueType.Credit:
                    initJackpotValue = this.gameDataProxy.convertCredit2Cash(jpValue);
                    break;
                case JackpotPoolValueType.Multiplier:
                    initJackpotValue = MathUtil.mul(
                        this.gameDataProxy.totalBetList[this.gameDataProxy.totalBetIdx],
                        jpValue
                    );
                    break;
                case JackpotPoolValueType.DenomMultiplier:
                    let bonusCredit = MathUtil.mul(this.getMultiplierOfDenom(), jpValue);
                    initJackpotValue = bonusCredit;
                    break;
            }

            this.runPoolLabel(initJackpotValue, type, true);
        }
    }

    protected hitJackpotToUpdatePoolValue(hitInfos: PoolHitInfo[]) {
        const jpPoolData = this.gameDataProxy.initEventData.executeSetting.jackpotSetting.jackpotPoolData[0];
        let jpObject: JackpotTypeObj = new JackpotTypeObj();
        jpObject.typeItems = [];
        for (let i = 0; i < jpPoolData.jackpotExtendSetting.poolInitValueType.length; i++) {
            let jpType = jpPoolData.jackpotExtendSetting.poolInitValueType[i];
            if (jpType == JackpotPoolValueType.Credit) {
                let jackpotPoolObj: JackpotPoolObj = new JackpotPoolObj();
                jackpotPoolObj.poolId = hitInfos[i].hitPool;
                jackpotPoolObj.poolValue = hitInfos[i].hitAmount / 100;
                jpObject.typeItems.push(jackpotPoolObj);
            }
        }
        this.updatePoolValue(jpObject, true);
    }

    protected updatePoolValue(jpObject: JackpotTypeObj, forceUpdate: boolean) {
        for (let i = 0; i < jpObject.typeItems.length; i++) {
            let poolItem = jpObject.typeItems[i];
            this.runPoolLabel(poolItem.poolValue, poolItem.poolId, forceUpdate);
        }
    }

    /** 開始彩金滾分
    @_beginAmount 起始分數
    @_totalAmount 結束分數
    @poolId 彩金池id
    @isForce 是否強制更新值
    */
    protected runPoolLabel(_totalAmount: number, poolId: number, isForce: boolean): void {
        this.view.runAmount(_totalAmount, poolId, 3, isForce);
    }

    private setJpPoolPos() {
        this.view.enterGamePos(this.gameDataProxy.curScene);
        this.view.restoreLayer();
    }

    // 選擇Denom的倍數
    private getMultiplierOfDenom() {
        const minimumDenom = this.gameDataProxy.initEventData.denomMultiplier[0];
        const multiplierOfDenom = MathUtil.div(this.gameDataProxy.curDenomMultiplier, minimumDenom);
        return multiplierOfDenom;
    }

    // ======================== Get Set ========================
    private _gameDataProxy: GameDataProxy;
    public get gameDataProxy(): GameDataProxy {
        if (!this._gameDataProxy) {
            this._gameDataProxy = this.facade.retrieveProxy(GameDataProxy.NAME) as GameDataProxy;
        }

        return this._gameDataProxy;
    }

    private _jackpotPoolProxy: JackpotPoolProxy;
    public get jackpotPoolProxy(): JackpotPoolProxy {
        if (!this._jackpotPoolProxy) {
            this._jackpotPoolProxy = this.facade.retrieveProxy(JackpotPoolProxy.NAME) as JackpotPoolProxy;
        }

        return this._jackpotPoolProxy;
    }
}
