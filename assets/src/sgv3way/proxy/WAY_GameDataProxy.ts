import { GameDataProxy } from '../../sgv3/proxy/GameDataProxy';
import { WebBridgeProxy } from '../../sgv3/proxy/WebBridgeProxy';
import { GameHitPattern } from '../../sgv3/vo/enum/GameHitPattern';
import { GameModule } from '../../sgv3/vo/enum/GameModule';
import { WAY_AllWinData } from '../vo/datas/WAY_AllWinData';
import { WAY_GameData } from '../vo/datas/WAY_GameData';

export class WAY_GameDataProxy extends GameDataProxy {
    protected _gameData: WAY_GameData;

    public constructor(gameData: WAY_GameData = new WAY_GameData()) {
        super(gameData);
        this._gameData = this.gameData as WAY_GameData;
    }

    /** 全贏線資料 */
    public get curWinData(): WAY_AllWinData {
        return this._gameData.curWindData;
    }
    public set curWinData(_val: WAY_AllWinData) {
        this._gameData.curWindData = _val;
    }

    /** 狀態贏線資料 */
    public get stateWinData(): WAY_AllWinData {
        return this._gameData.stateWinData;
    }
    public set stateWinData(_val: WAY_AllWinData) {
        this._gameData.stateWinData = _val;
    }

    /** 當前贏分模式 */
    public set curHitPattern(val: GameHitPattern) {
        this._curHitPattern = val;
        switch (+GameHitPattern[this._curHitPattern]) {
            case GameHitPattern.LeftToRight:
            case GameHitPattern.RightToLeft:
            case GameHitPattern.DoubleHit:
                this.gameModule = GameModule.WayGame;
                this.webBridgeProxy.setLineOrWayGame('Way');
                break;
        }
    }
    public get curHitPattern(): GameHitPattern {
        return this._curHitPattern;
    }

    // ======================== Get Set ========================
    protected _webBridgeProxy: WebBridgeProxy;
    protected get webBridgeProxy(): WebBridgeProxy {
        if (!this._webBridgeProxy) {
            this._webBridgeProxy = this.facade.retrieveProxy(WebBridgeProxy.NAME) as WebBridgeProxy;
        }
        return this._webBridgeProxy;
    }
}
