import { DEBUG } from 'cc/env';
import { Logger } from '../../core/utils/Logger';
import { MathUtil } from '../../core/utils/MathUtil';
import { GameDataProxy } from '../proxy/GameDataProxy';
import { WebBridgeProxy } from '../proxy/WebBridgeProxy';
import { CtrlPanelBtnState } from '../util/Constant';
import { UIEvent } from 'common-ui/proxy/UIEvent';

/**
 * 初始設定 line、bet、denom 等等
 */
export abstract class CoreDefaultSettingCommand extends puremvc.SimpleCommand {
    public static readonly NAME: string = 'DefaultSettingCommand';

    public execute(notification: puremvc.INotification) {
        Logger.i('[DefaultSettingCommand] 初始設定');
        // 設定千分位設定
        this.setDecimalPoint();
        // 設定featureCount
        this.setFeatureCount();
        // 設定初始化贏分線設定
        this.setInitHitPattern();
        // 設定Totalbet init列表，該值會隨line or way調整
        this.setTotalBetList();
        // 檢查是否有已經存在的組合
        this.resetStorageTotalBet();
        // 設定 Control Panel的Bet Menu
        this.sendNotification(UIEvent.CREATE_BET_MENU);
        // 設定 Bet Menu旁 切換 Bet會有 Bonus Upgrade的資訊
        this.sendNotification(CtrlPanelBtnState.CREATE_BONUS_UPGRADE_BET_RANGE_INFO);
    }

    public handleContainerMsg(e: MessageEvent) {
        if (JSON.parse(e.data).name === 'userInfo') {
            let userInfo = JSON.parse(e.data).data;
            // 如果decimal有值就將MathUtil設定decimalPoint
            if (!!userInfo && !!userInfo['decimalPoint']) {
                MathUtil.decimalPlace = +userInfo['decimalPoint'];
            } else {
                Logger.i('DecimalPoint is undefined');
            }
        }
    }

    /** 設定千分位設定 */
    protected setDecimalPoint() {
        if (!this.webBridgeProxy) return;

        if (DEBUG) {
            let userInfo = this.webBridgeProxy.getUserInfoObj();
            // 如果decimal有值就將MathUtil設定decimalPoint
            if (!!userInfo && !!userInfo['decimalPoint']) {
                MathUtil.decimalPlace = +userInfo['decimalPoint'];
            } else {
                Logger.i('DecimalPoint is undefined');
            }
        } else {
            this.webBridgeProxy.getWebObjRequest(this, 'userInfo');
        }
    }

    /** 設定試玩按鈕數量 */
    protected setFeatureCount() {
        if (!this.webBridgeProxy) return;

        this.webBridgeProxy.setFeatureCount(this.gameDataProxy.initEventData.gameFeatureCount);
    }

    protected getUserBet(bet: number, curDenom: number): number {
        return MathUtil.mul(bet, curDenom, 0.001);
    }
    /** 檢查是否有已經存在的組合*/
    protected resetStorageTotalBet(): boolean {
        if (this.gameDataProxy.totalBetList.length == 0) {
            Logger.w('totalbetList ie empty');
            return false;
        }
        // 取得押注預設值
        let _defaultIdx: number = 7;

        if (this.gameDataProxy.userSetting) {
            // 使用玩家上次使用的押注設定
            _defaultIdx = this.setBetAndLine(_defaultIdx); // 該值會隨line or way調整
        }
        this.gameDataProxy.curDenom = MathUtil.mul(this.gameDataProxy.initEventData.denoms[0], 0.001);

        if (this.gameDataProxy.isOmniChannel()) {
            this.checkBetInfo();
            this.gameDataProxy.resetBetInfo(
                this.gameDataProxy.curTotalBet,
                this.gameDataProxy.curDenomMultiplier,
                this.gameDataProxy.curBet,
                this.gameDataProxy.curFeatureBet
            );
        } else {
            // 確認是否有該 押注設定
            if (!this.gameDataProxy.totalBetList[_defaultIdx]) {
                _defaultIdx = 7;
            }
            this.gameDataProxy.totalBetIdx = _defaultIdx;
            // 初始化遊戲押注設定
            const curBet = this.gameDataProxy.totalBetList[_defaultIdx];
            this.gameDataProxy.resetBetInfo(curBet);
        }

        return true;
    }

    /**
     * 設定初始化 common feature type
     * 預設為game1資料
     * */
    protected setInitHitPattern() {
        if (
            !!this.gameDataProxy.initEventData &&
            !!this.gameDataProxy.initEventData.executeSetting &&
            this.gameDataProxy.initEventData.gameStateSettings.length > 0
        ) {
            let gameSceneId: string = this.gameDataProxy.initEventData.gameStateSettings[0].gameSceneId;
            this.gameDataProxy.initHitPattern = this.gameDataProxy.curHitPattern =
                this.gameDataProxy.getInitShowPatternById(gameSceneId);
        }
    }

    /**
     * 設定totalbetList
     */
    protected setTotalBetList() {}

    /**
     * 設定gamedataproxy betline and bet
     */
    protected abstract setBetAndLine(_val: number): number;

    protected abstract checkBetInfo(): void;

    // ======================== Get Set ========================
    protected _webBridgeProxy: WebBridgeProxy;
    protected get webBridgeProxy(): WebBridgeProxy {
        if (!this._webBridgeProxy) {
            this._webBridgeProxy = this.facade.retrieveProxy(WebBridgeProxy.NAME) as WebBridgeProxy;
        }
        return this._webBridgeProxy;
    }

    protected _gameDataProxy: GameDataProxy;
    protected get gameDataProxy(): GameDataProxy {
        if (!this._gameDataProxy) {
            this._gameDataProxy = this.facade.retrieveProxy(GameDataProxy.NAME) as GameDataProxy;
        }
        return this._gameDataProxy;
    }
}
