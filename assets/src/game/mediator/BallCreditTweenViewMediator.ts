import { _decorator, Vec2 } from 'cc';
import BaseMediator from '../../base/BaseMediator';
import { SceneManager } from '../../core/utils/SceneManager';
import { ReelDataProxy } from '../../sgv3/proxy/ReelDataProxy';
import { GameStateProxyEvent, ViewMediatorEvent } from '../../sgv3/util/Constant';
import { GlobalTimer } from '../../sgv3/util/GlobalTimer';
import { GameScene } from '../../sgv3/vo/data/GameScene';
import { AudioManager } from '../../audio/AudioManager';
import { GAME_GameDataProxy } from '../proxy/GAME_GameDataProxy';
import { BallCreditTweenView } from '../view/BallCreditTweenView';
import { AudioClipsEnum } from '../vo/enum/SoundMap';
import { SymbolPartType } from 'src/sgv3/vo/enum/Reel';
const { ccclass } = _decorator;

@ccclass('BallCreditTweenViewMediator')
export class BallCreditTweenViewMediator extends BaseMediator<BallCreditTweenView> {
    private baseCreditCollectSequence: Array<Vec2> | null = null;
    private curbaseSequenceIndex: number = 0;
    private timerKey = 'delayShowFeatureSelection';
    private featureSelectionCallback: Function = null;

    public constructor(name?: string, component?: any) {
        super(name, component);
    }

    protected lazyEventListener(): void {}

    public listNotificationInterests(): Array<any> {
        return [
            SceneManager.EV_ORIENTATION_VERTICAL,
            SceneManager.EV_ORIENTATION_HORIZONTAL,
            GameStateProxyEvent.ON_SCENE_BEFORE_CHANGE,
            ViewMediatorEvent.ON_CREDIT_BALL_COLLECT_START
        ];
    }

    public handleNotification(notification: puremvc.INotification): void {
        let name = notification.getName();
        if (this.gameDataProxy.curScene != GameScene.Game_1) return;
        switch (name) {
            case SceneManager.EV_ORIENTATION_VERTICAL:
                this.onOrientationVertical();
                break;
            case SceneManager.EV_ORIENTATION_HORIZONTAL:
                this.onOrientationHorizontal();
                break;
            case GameStateProxyEvent.ON_SCENE_BEFORE_CHANGE:
                if (this.gameDataProxy.orientationEvent === SceneManager.EV_ORIENTATION_HORIZONTAL) {
                    this.onOrientationHorizontal();
                } else {
                    this.onOrientationVertical();
                }
                break;
            case ViewMediatorEvent.ON_CREDIT_BALL_COLLECT_START:
                this.onBaseCreditCollectInit(notification.getBody());
                break;
        }
    }

    /** 執行橫式轉換 */
    protected onOrientationHorizontal(): void {
        this.view?.changeOrientation(true);
    }

    /** 執行直式轉換 */
    protected onOrientationVertical(): void {
        this.view?.changeOrientation(false);
    }

    /** 起始設定 處理參數Reset */
    private onBaseCreditCollectInit(data: { baseArray: Array<Vec2>; callback: Function }) {
        this.baseCreditCollectSequence = data.baseArray;
        this.featureSelectionCallback = data.callback;
        this.curbaseSequenceIndex = 0;
        this.onBaseCreditCollectStart();
    }

    /** 每顆 C1球要開始收集至龍珠上時 */
    private onBaseCreditCollectStart() {
        let basePos = this.reelDataProxy.getFovPos(
            this.curBaseSequence.x,
            this.curBaseSequence.y,
            SymbolPartType.LABEL
        );
        //設定資料
        this.view.clonePrefab();
        this.view.curObject.setBaseCreditSetting(
            this.reelDataProxy.symbolFeature[this.curBaseSequence.x][this.curBaseSequence.y].isSpecial,
            this.reelDataProxy.symbolFeature[this.curBaseSequence.x][this.curBaseSequence.y].creditCent,
            this.gameDataProxy.isOmniChannel()
        );
        AudioManager.Instance.play(AudioClipsEnum.Base_FeatureInitialCollect);
        //BaseCredit收集表演
        this.view.onBaseCreditCollect(basePos, () => this.onBaseCreditCollectEnd());
    }

    /** 每顆 C1球已經收集至龍珠上時  */
    private onBaseCreditCollectEnd() {
        let array = new Array<any>();
        array.push(this.curBaseSequence);
        array.push(this.reelDataProxy.symbolFeature[this.curBaseSequence.x][this.curBaseSequence.y].creditCent);
        this.sendNotification(ViewMediatorEvent.COLLECT_CREDIT_BALL, array);
        this.curbaseSequenceIndex++;
        let audioSequenceName: string = AudioClipsEnum.Base_FeatureInitialCollectHit01;
        audioSequenceName = audioSequenceName.slice(0, audioSequenceName.length - 2);

        if (this.curbaseSequenceIndex >= this.baseCreditCollectSequence.length) {
            audioSequenceName += 'Last';
            this.view.clearPool(); //物件池清除
            this.baseCreditCollectSequence = [];
            GlobalTimer.getInstance().registerTimer(this.timerKey, 1, this.delayShowFeatureSelection, this).start();
        } else {
            audioSequenceName += this.prefixInteger(this.curbaseSequenceIndex, 2);
            this.onBaseCreditCollectStart();
        }
        AudioManager.Instance.play(audioSequenceName);
    }
    // 數字左邊補零
    private prefixInteger(num: number, length: number): any {
        return (Array(length).join('0') + num).slice(-length);
    }

    private delayShowFeatureSelection() {
        GlobalTimer.getInstance().removeTimer(this.timerKey);
        this.featureSelectionCallback();
        this.featureSelectionCallback = null;
    }
    // ======================== Get Set ========================

    protected _reelDataProxy: ReelDataProxy;
    protected get reelDataProxy(): ReelDataProxy {
        if (!this._reelDataProxy) {
            this._reelDataProxy = this.facade.retrieveProxy(ReelDataProxy.NAME) as ReelDataProxy;
        }
        return this._reelDataProxy;
    }

    protected _gameDataProxy: GAME_GameDataProxy;
    protected get gameDataProxy(): GAME_GameDataProxy {
        if (!this._gameDataProxy) {
            this._gameDataProxy = this.facade.retrieveProxy(GAME_GameDataProxy.NAME) as GAME_GameDataProxy;
        }
        return this._gameDataProxy;
    }

    protected get curBaseSequence() {
        return this.baseCreditCollectSequence[this.curbaseSequenceIndex];
    }
}
