import { _decorator, SystemEvent, Tween, UIOpacity, tween, Label, Animation, Node } from 'cc';
import { ParticleContentTool } from 'ParticleContentTool';
import { BalanceUtil } from '../../sgv3/util/BalanceUtil';
import { FeatureSelectButton } from '../../sgv3/view/feature-selection/FeatureSelectButton';
import { GameOperation } from '../../sgv3/vo/enum/GameOperation';
import { AudioManager } from '../../audio/AudioManager';
import { AudioClipsEnum, BGMClipsEnum } from '../vo/enum/SoundMap';
import BaseView from 'src/base/BaseView';
const { ccclass, property } = _decorator;

@ccclass('FeatureSelectionView')
export class FeatureSelectionView extends BaseView {
    public static readonly HORIZONTAL: string = 'horizontal';
    public static readonly VERTICAL: string = 'vertical';
    private showTween: Tween<UIOpacity>;
    private _isShowComplete: boolean;

    public callBack: Function | null = null;
    public uiOpacity: UIOpacity;

    @property({ type: FeatureSelectButton })
    public featureButtons: Array<FeatureSelectButton> = [];

    private occupiedButtons: Array<FeatureSelectButton> = [];

    @property({ type: [Node] })
    public buttonFXNode: Array<Node> = [];

    @property({ type: Animation })
    public AnimBlackBG: Animation | null = null;

    @property({ type: Label })
    public ballCount: Label;

    @property({ type: Label })
    public ballTotalCredit: Label;

    @property({ type: Label, visible: true })
    public autoStart: Label | null = null;

    @property({ type: Number, visible: true })
    public autoStartTime: number;

    public autoStartCallBack: Function | null = null;

    private autoStartTimerId: number;

    public initView() {
        const self = this;

        self.isShowComplete = false;
        self.uiOpacity = self.getComponent(UIOpacity);
        self.node.active = false;
        self.registerButton();
        self.hide();
        self.featureButtons.forEach((featureBtn) => {
            featureBtn.node.active = false;
        });
        self.autoStartCallBack = () => {
            self.callBack(GameOperation[GameOperation.freeGame_01]);
        };
    }

    public initTween(duration: number) {
        this.showTween = tween(this.uiOpacity).to(
            duration,
            { opacity: 255 },
            {
                onComplete: (target) => {
                    this.isShowComplete = true;
                    this.registerAutoStart();
                }
            }
        );
    }

    private registerButton() {
        const self = this;

        self.featureButtons.forEach((featureBtn) => {
            featureBtn.node.on(
                SystemEvent.EventType.TOUCH_END,
                () => self.callBack(featureBtn.operation),
                self.callBack
            );
        });
    }

    public showFeatureSelection(data: any) {
        let ballCount: number = data[0];
        let ballTotalCredit: number = data[1];
        this.ballCount.string = ballCount.toString();
        this.ballTotalCredit.string = BalanceUtil.formatBalance(ballTotalCredit);

        this.occupiedButtons = this.featureButtons.filter(this.getFilter(ballCount == 15));
        this.uiOpacity.opacity = 0;
        this.node.active = true;
        this.occupiedButtons.forEach((featureBtn) => featureBtn.showButton());
        this.showTween.start();
        AudioManager.Instance.play(AudioClipsEnum.FeatureSelection_TransitionDragonUp);
    }

    private getFilter(onlyFreeGame: boolean) {
        return onlyFreeGame
            ? (freeBtn: FeatureSelectButton) =>
                  GameOperation[freeBtn.operation] >= GameOperation.freeGame_01 &&
                  GameOperation[freeBtn.operation] <= GameOperation.freeGame_10
            : (freeBtn: FeatureSelectButton) =>
                  GameOperation[freeBtn.operation] == GameOperation.topUpGame_01 ||
                  (GameOperation[freeBtn.operation] >= GameOperation.freeGame_01 &&
                      GameOperation[freeBtn.operation] <= GameOperation.freeGame_10);
    }

    public hideFeatureSelection() {
        if (!this.node.active) {
            return;
        }
        this.occupiedButtons.forEach((featureBtn, index, arr) =>
            featureBtn.hideButton(index == arr.length - 1 ? this.hide.bind(this) : null)
        );
        this.AnimBlackBG.play('BlackBG_Hide');

        // this.uiOpacity.opacity = 0;
        // this.node.active = false;
    }

    hide() {
        this.uiOpacity.opacity = 0;
        this.resetAutoStart();
        this.scheduleOnce(() => {
            this.node.active = false;
        }, 2);
    }

    public onFeatureSelect(operation: string) {
        const self = this;
        self.isShowComplete = false;
        self.occupiedButtons.forEach((freeBtn) => freeBtn.selectOperation(operation));
        self.AnimBlackBG.play('BlackBG_PlayShow');
        self.setButtonParticlePos(operation);
        AudioManager.Instance.play(AudioClipsEnum.FeatureSelection_BestChoice);

        this.stopAutoStartTimer();
    }

    public setButtonParticlePos(operation: string) {
        const self = this;

        const featureBtn = self.featureButtons.find((element) => element.operation == operation);
        for (let i in this.buttonFXNode) {
            this.buttonFXNode[i].setWorldPosition(featureBtn?.node.worldPosition);
        }
    }

    public get isShowComplete(): boolean {
        return this._isShowComplete;
    }

    private set isShowComplete(isComplete: boolean) {
        this._isShowComplete = isComplete;
    }

    public registerAutoStart() {
        const self = this;

        clearInterval(self.autoStartTimerId);
        self.autoStartTimerId = setInterval(() => {
            self.autoStart.string = String(parseInt(self.autoStart.string) - 1);
            if (self.autoStart.string == '0') {
                clearInterval(self.autoStartTimerId);
                self.autoStartTimerId = null;
                self.autoStartCallBack();
            }
        }, 1000);
    }
    public resetAutoStart() {
        this.autoStart.string = this.autoStartTime.toString();
        this.stopAutoStartTimer();
    }

    private stopAutoStartTimer() {
        clearTimeout(this.autoStartTimerId);
        this.autoStartTimerId = null;
    }
}
