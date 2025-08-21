import { _decorator } from 'cc';
import BaseMediator from '../../base/BaseMediator';
import { Logger } from '../../core/utils/Logger';
import { SceneManager } from '../../core/utils/SceneManager';
import { ClearRecoveryDataCommand } from '../../sgv3/command/recovery/ClearRecoveryDataCommand';
import { SpinRequestCommand } from '../../sgv3/command/spin/SpinRequestCommand';
import { GameDataProxy } from '../../sgv3/proxy/GameDataProxy';
import { ViewMediatorEvent } from '../../sgv3/util/Constant';
import { GameSceneData } from '../../sgv3/vo/config/GameSceneData';
import { GameScene } from '../../sgv3/vo/data/GameScene';
import { AudioManager } from '../../audio/AudioManager';
import { FeatureSelectionView } from '../view/FeatureSelectionView';
import { BGMClipsEnum } from '../vo/enum/SoundMap';
const { ccclass } = _decorator;

@ccclass('FeatureSelectionViewMediator')
export class FeatureSelectionViewMediator extends BaseMediator<FeatureSelectionView> {
    protected mySceneData: GameSceneData = null;

    constructor(name?: string, component?: any) {
        super(name, component);
        Logger.i('[FeatureSelectionViewMediator] constructor()');
        FeatureSelectionViewMediator.NAME = this.mediatorName;
    }

    protected lazyEventListener(): void {
        this.mySceneData = this.gameDataProxy.getSceneDataByName(GameScene.Game_1);
        this.view = this.viewComponent;
        this.view.callBack = (val: string) => this.featureSelect(val);

        this.view.initView();
        this.view.initTween(this.mySceneData.featureSelectionShowTime);
    }

    public listNotificationInterests(): string[] {
        return [
            SceneManager.EV_ORIENTATION_VERTICAL,
            SceneManager.EV_ORIENTATION_HORIZONTAL,
            ViewMediatorEvent.SHOW_FEATURE_SELECTION,
            ViewMediatorEvent.ENTER
        ];
    }

    public handleNotification(notification: puremvc.INotification): void {
        let name = notification.getName();
        switch (name) {
            case ViewMediatorEvent.SHOW_FEATURE_SELECTION:
                this.view.showFeatureSelection(notification.getBody());
                break;
            case ViewMediatorEvent.ENTER:
                this.enterMediator();
                break;
        }
    }

    protected enterMediator() {
        if (this.gameDataProxy.curScene != GameScene.Game_1) this.view.hideFeatureSelection();
    }

    protected onOrientation(orientation: string) {
        this.view?.setButtonParticlePos(this.gameDataProxy.curGameOperation);
    }

    public featureSelect(operation: string) {
        if (this.view.isShowComplete) {
            this.gameDataProxy.curGameOperation = operation;
            this.view.onFeatureSelect(operation);
            this.sendNotification(SpinRequestCommand.NAME);
            if (this.gameDataProxy.reStateResult != undefined) {
                this.sendNotification(ClearRecoveryDataCommand.NAME);
            }
            AudioManager.Instance.stop(BGMClipsEnum.BGM_FeatureSelection).fade(0, 1);
        }
    }

    // ======================== Get Set ========================
    private _gameDataProxy: GameDataProxy;
    public get gameDataProxy(): GameDataProxy {
        if (!this._gameDataProxy) {
            this._gameDataProxy = this.facade.retrieveProxy(GameDataProxy.NAME) as GameDataProxy;
        }

        return this._gameDataProxy;
    }
}
