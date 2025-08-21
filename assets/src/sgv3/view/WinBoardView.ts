import { _decorator, Tween, tween, Label, SystemEvent, Node } from 'cc';
import { TimelineTool } from 'TimelineTool';
import { BalanceUtil } from '../util/BalanceUtil';
import { LevelWinType, WinType } from '../vo/enum/WinType';
import BaseView from 'src/base/BaseView';
import { MathUtil } from 'src/core/utils/MathUtil';

const { ccclass, property } = _decorator;

@ccclass('WinBoardView')
export abstract class WinBoardView extends BaseView {
    public static readonly HORIZONTAL: string = 'horizontal';
    public static readonly VERTICAL: string = 'vertical';

    @property({ type: Label })
    public winBoardScore: Label;
    @property({ type: Node })
    public mask: Node;
    @property({ type: TimelineTool, visible: true })
    winBoardAnimationComponent: TimelineTool;

    public buttonCallback: IWinBoardViewMediator = null;

    // 滾分用暫存值
    public curAmount: number = 0;
    public curWinboardAmount: number = 0;
    public targetAmount: number;
    public targetWinboardAmount: number;
    public isFormatBalance: boolean = true;

    protected abstract stopParticleBigWin(): void;
    protected abstract playParticleBigWin(): void;
    public abstract onOrientationHorizontal(): void;
    public abstract onOrientationVertical(): void;

    protected textTween: Tween<WinBoardView> = undefined;
    protected winBoardTextTween: Tween<WinBoardView> = undefined;
    //將從Mediator中更新BBW的function存下來以在急停時更新數值，
    public BBWCompleteCallback: Function;
    public winboardCompleteCallback: () => void;
    private winType: LevelWinType = LevelWinType.NONE;
    private languageType: String = String();

    private startString: String = String('start');
    private stopString: String = String('stop');

    onLoad() {
        super.onLoad();
    }

    protected start(): void {
        this.node.active = false;
    }
    /**
     * 執行大獎面板且滾分
     * @param _type 面板類型
     */

    public startWinboard(winType: WinType, language: string) {
        if (!this.node.active) this.node.active = true;
        this.registerButton();
        this.languageType = language;
        switch (winType) {
            case WinType.bigWin:
                this.winType = LevelWinType.BIG_WIN;
                break;
            //MegaWin
            case WinType.megaWin:
                this.winType = LevelWinType.MEGA_WIN;
                break;
            //SuperWin
            case WinType.superWin:
                this.winType = LevelWinType.SUPER_WIN;
                break;
            //JumboWin
            case WinType.jumboWin:
                this.winType = LevelWinType.JUMBO_WIN;
                break;
            default:
                break;
        }
        if (this.winType != LevelWinType.NONE) {
            if (!this.node.active) {
                this.node.active = true;
            }
            if (!this.mask.active) {
                this.mask.active = true;
            }
            this.winBoardAnimationComponent.play(this.winType + '-win-' + this.startString);
        }
    }

    public registerButton() {
        this.mask.on(
            SystemEvent.EventType.TOUCH_END,
            () => {
                this.buttonCallback.onSkip();
            },
            this.buttonCallback
        );
    }

    public unregisterButton() {
        this.node.off(SystemEvent.EventType.TOUCH_END);
    }

    public stopWinboard() {
        this.unregisterButton();
        this.winBoardAnimationComponent.play(this.winType + '-win-' + this.stopString, () => {
            this.node.active = false;
        });
        this.winType = LevelWinType.NONE;
    }

    public runWinboardLabelComplete(targetAmount: number) {
        this.updateWinboardText(targetAmount);
        this.winboardCompleteCallback?.();
        this.winboardCompleteCallback = null;
    }

    /** 更新winboardText */
    public updateWinboardText(amount: number): void {
        this.winBoardScore.string = this.isFormatBalance
            ? BalanceUtil.formatBalance(amount)
            : MathUtil.floor(amount, 0).toString();
    }

    /**滾動並刷新BBW的顯示數值
     * @param targetAmount 滾分目標值
     * @param scoringTime 滾分時間
     * @param updateCallback tween中update的callback
     * @param completeCallback tween中complete的callback
     */
    public runBBWLabel(
        startAmount: number,
        targetAmount: number,
        scoringTime: number,
        updateCallback?: () => void,
        completeCallback?: Function
    ) {
        this.BBWCompleteCallback = completeCallback;
        this.curAmount = startAmount;
        this.targetAmount = targetAmount;
        this.textTween?.stop();
        this.textTween = tween(<WinBoardView>this)
            .to(
                scoringTime,
                { curAmount: this.targetAmount },
                {
                    onUpdate: () => {
                        updateCallback?.();
                    },
                    onComplete: () => {
                        completeCallback?.();
                    }
                }
            )
            .start();
    }
    /**滾動並刷新winboard的顯示數值 */
    public runWinboardLabel(
        curWinboardAmount: number,
        targetWinboardAmount: number,
        scoringTime: number,
        completeCallback?: () => void
    ) {
        this.curWinboardAmount = curWinboardAmount;
        this.targetWinboardAmount = targetWinboardAmount;
        this.winboardCompleteCallback = completeCallback;
        this.winBoardTextTween?.stop();
        this.winBoardTextTween = tween(<WinBoardView>this)
            .to(
                scoringTime,
                { curWinboardAmount: this.targetWinboardAmount },
                {
                    onUpdate: () => {
                        this.updateWinboardText(this.curWinboardAmount);
                    },
                    onComplete: () => {
                        this.updateWinboardText(this.targetWinboardAmount);
                        completeCallback?.();
                    }
                }
            )
            .start();
    }

    // 停止滾分動畫
    public stopWinTextTween() {
        this.textTween?.stop();
        this.textTween = null;
        this.winBoardTextTween?.stop();
        this.winBoardTextTween = null;
    }

    public forceBBWLabelComplete(targetAmount?: number) {
        this.textTween?.stop();
        this.textTween = null;
        this.BBWCompleteCallback?.(true);
        this.BBWCompleteCallback = null;
    }

    protected onDestroy() {
        super.onDestroy();
    }
}

export interface IWinBoardViewMediator {
    onSkip();
}
