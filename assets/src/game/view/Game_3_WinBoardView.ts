import { _decorator, Label, SystemEvent, tween, Tween } from 'cc';
import { BalanceUtil } from '../../sgv3/util/BalanceUtil';
import { MiniResultBoard } from '../../ta/mini-result-board/MiniResultBoard';
import BaseView from 'src/base/BaseView';
const { ccclass, property } = _decorator;

@ccclass('Game_3_WinBoardView')
export class Game_3_WinBoardView extends BaseView {
    public callback: IGame_3_WinBoardViewMediator;

    @property(MiniResultBoard)
    public miniResultBoard: MiniResultBoard;

    // 結算畫面的總分數字
    @property({ type: Label })
    public wonCreditsLabel: Label;

    private targetCredits: number;

    public targetNum: number = 0;

    private bRunCredits: boolean = false;
    private bCanSkipRunCredits: boolean = false;

    protected onLoad() {
        super.onLoad();
    }

    /**更改語系 */
    public changeLocale(locale: string) {}

    public showWonBoard_byBonusGameOneRoundResult(
        credit: number,
        runTimer: number,
        hitPool: number[],
        canSkipRunCreditsTime: number,
        lang: string
    ) {
        const self = this;
        self.registerButton();
        self.showOneWonBoard(credit, runTimer, hitPool[0] - 1, lang);

        if (runTimer > canSkipRunCreditsTime) {
            self.bCanSkipRunCredits = true;
        }
        self.bRunCredits = true;
    }

    public showOneWonBoard(credit: number, runTimer: number, wonType1: number, _lang: string): void {
        const self = this;
        let lang = _lang == 'en' ? 0 : 1;

        self.miniResultBoard.OnBoardPlay(wonType1, lang);
        self.miniResultBoard.playWinCoinFall();
        self.showWonCreditBoard(credit / 100, runTimer);
    }

    public hideWonBoard() {
        const self = this;
        self.miniResultBoard.OnBoardClose();
    }

    /** 贏分結算面板 */
    public showWonCreditBoard(credit: number, runTimer: number): void {
        const self = this;
        self.runCredits(credit, runTimer);
    }

    public stopWinCoinFall() {
        this.miniResultBoard.stopWinCoinFall();
    }

    public runCreditsCompleted() {
        const self = this;
        self.unregisterButton();
        self.callback.playRunCreditsCompletedSound();
        Tween.stopAllByTarget(self);
        self.targetNum = self.targetCredits;
        self.bRunCredits = false;
        self.bCanSkipRunCredits = false;
    }

    /** won credits 滾分效果 */
    public runCredits(credits: number, _runTime: number): void {
        const self = this;
        self.targetNum = 0;
        self.targetCredits = credits;
        tween(<Game_3_WinBoardView>self)
            .to(
                _runTime,
                { targetNum: credits },
                {
                    onUpdate: (target) => {
                        (target as Game_3_WinBoardView).onChange();
                    },
                    onComplete: (target) => {
                        (target as Game_3_WinBoardView).runCreditsCompleted();
                    }
                }
            )
            .start();
    }

    /** 此處必須先用無條件捨去處理，再轉為字串顯示 */
    private onChange(): void {
        const self = this;
        self.wonCreditsLabel.string = BalanceUtil.formatBalanceWithDollarSign(self.targetNum);
    }

    private checkIsRunCredits(): boolean {
        return this.bRunCredits;
    }

    public checkCanSkipRunCredit(): boolean {
        return this.bCanSkipRunCredits;
    }

    public skipRunCredit(): boolean {
        const self = this;
        if (!self.checkIsRunCredits()) {
            return false;
        }
        if (!self.checkCanSkipRunCredit()) {
            return false;
        }
        self.runCreditsCompleted();
        self.onChange();
        return true;
    }

    public registerButton() {
        this.node.on(
            SystemEvent.EventType.TOUCH_END,
            () => {
                this.callback.onSkip();
            },
            this.callback
        );
    }

    public unregisterButton() {
        this.node.off(SystemEvent.EventType.TOUCH_END);
    }
}

export interface IGame_3_WinBoardViewMediator {
    playRunCreditsCompletedSound(): void;
    playSoundEND01(): void;
    playSoundEND02(): void;
    playSoundEND03(): void;
    onSkip(): void;
}
