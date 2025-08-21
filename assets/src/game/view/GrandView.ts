import { _decorator, Label, SystemEvent, tween } from 'cc';
import { TimelineTool } from 'TimelineTool';
import { BalanceUtil } from '../../sgv3/util/BalanceUtil';
import { GlobalTimer } from '../../sgv3/util/GlobalTimer';
import { MiniGameSymbol } from '../../sgv3/vo/enum/MiniGameSymbolType';
import { MiniResultBoard } from '../../ta/mini-result-board/MiniResultBoard';
import { AudioManager } from '../../audio/AudioManager';
import { AudioClipsEnum, ScoringClipsEnum } from '../vo/enum/SoundMap';
import BaseView from 'src/base/BaseView';
const { ccclass, property } = _decorator;

@ccclass('GrandView')
export class GrandView extends BaseView {
    @property(TimelineTool)
    private anim: TimelineTool;
    @property(MiniResultBoard)
    public miniResultBoard: MiniResultBoard;
    @property(Label)
    private scoreTxt: Label;
    private _score = 0;
    private canSkip = false;
    private skipFunction: Function;
    private canSkipScoringGrandTimerKey: string = 'canSkipScoringGrand';
    private callBackFunction: Function;
    public buttonCallback: IGrandViewMediator = null;

    public get score(): number {
        return this._score;
    }

    private set score(value: number) {
        this._score = value;
        this.scoreTxt.string = BalanceUtil.formatBalanceWithDollarSign(value);
    }
    private grandTime = 50.993;

    onLoad() {
        super.onLoad('GrandViewMediator', `${this.node.parent.name}_GrandViewMediator`);
    }

    public showUp(_lang: string, callBack?: Function): void {
        let lang = _lang == 'en' ? 0 : 1;
        this.callBackFunction = callBack;

        this.score = 0;
        AudioManager.Instance.play(AudioClipsEnum.JP_GrandHit);
        this.scheduleOnce(() => {}, 0.75);

        this.anim.play('Show');
        this.miniResultBoard.OnBoardDelayPlay();
        this.miniResultBoard.SetEffectType(MiniGameSymbol.Grand, lang);
        GlobalTimer.getInstance()
            .registerTimer(
                'showUpTimer',
                4.3,
                () => {
                    GlobalTimer.getInstance().removeTimer('showUpTimer');
                    this.showMiniResultBoard();
                    this.callBackFunction?.();
                },
                this
            )
            .start();
    }

    private showMiniResultBoard() {
        let audio = AudioManager.Instance.play(ScoringClipsEnum.Scoring_JPWinLoop).volume(0).loop(true);
        AudioManager.Instance.play(ScoringClipsEnum.Scoring_JPWinIntro).callback(() => {
            audio.volume(1).replay();
        });
        this.miniResultBoard.playWinCoinFall();
    }

    public scoringGrand(grand: number = 10000, callBack?: Function): void {
        const scoringTween = tween<GrandView>(this)
            .to(
                this.grandTime,
                { score: grand },
                {
                    onComplete: () => this.skipFunction()
                }
            )
            .start();
        this.skipFunction = () => {
            scoringTween.stop();
            this.score = grand;
            GlobalTimer.getInstance().removeTimer('showUpTimer');
            this.miniResultBoard.stopWinCoinFall();
            AudioManager.Instance.stop(ScoringClipsEnum.Scoring_JPWinIntro);
            AudioManager.Instance.stop(ScoringClipsEnum.Scoring_JPWinLoop);
            AudioManager.Instance.play(ScoringClipsEnum.Scoring_JPWinEnd);
            callBack?.();
            this.skipFunction = null;
        };
        this.registerButton();
    }

    public closeBoard(callBack?: Function): void {
        this.unregisterButton();
        GlobalTimer.getInstance()
            .registerTimer(
                'closeBoardTimer',
                2,
                () => {
                    GlobalTimer.getInstance().removeTimer('closeBoardTimer');
                    this.miniResultBoard.OnBoardClose();
                    callBack?.();
                },
                this
            )
            .start();
    }

    public skipScoring() {
        this.skipFunction?.();
    }

    show() {
        this.anim.node.active = true;
    }

    hide() {
        this.anim.node.active = false;
    }

    public registerButton() {
        this.node.on(
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
}
export interface IGrandViewMediator {
    onSkip();
}
