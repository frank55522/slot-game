import { _decorator, Node, UIOpacity, Tween, tween, Label } from 'cc';
import { TSMap } from '../../core/utils/TSMap';
import { GAME_GameScene } from '../vo/data/GAME_GameScene';
import { MiniGameSelectPerform } from '../../ta/mini-ingot/MiniGameSelectPerform';
import { AudioClipsEnum } from '../vo/enum/SoundMap';
import { AudioManager } from '../../audio/AudioManager';
import { MiniIngot } from '../../ta/mini-ingot/MiniIngot';
import BaseView from 'src/base/BaseView';
const { ccclass, property } = _decorator;

@ccclass('Game_3_View')
export class Game_3_View extends BaseView {
    public static readonly HORIZONTAL: string = 'horizontal';
    public static readonly VERTICAL: string = 'vertical';
    /** 是否為贏分面板時間 */
    private creditBoardTime: boolean = false;

    /* 記錄獎項按鈕是否已按 */
    public clickData: TSMap<string, boolean>;

    @property({ type: Node })
    public miniGameInfo: Node;

    @property({ type: MiniGameSelectPerform })
    public selectPerform: MiniGameSelectPerform;

    public mySceneName: string;

    public uiOpacity: UIOpacity;

    @property({ type: Label })
    public countdown: Label | null = null;

    @property({ type: Number })
    public autoStartTime: number | null = null;

    @property({ type: Number })
    public countdownLastTime: number | null = null;

    private showTween: Tween<UIOpacity>;

    private hideTween: Tween<UIOpacity>;

    protected onLoad() {
        super.onLoad();

        this.mySceneName = GAME_GameScene.Game_3;
    }

    public init(lang: string) {
        const self = this;

        self.clickData = new TSMap<string, boolean>();

        self.changeLocale(lang);
        self.showMiniGameInfo(false);
        this.uiOpacity = this.getComponent(UIOpacity);
        self.showTween = tween(self.uiOpacity).to(1.0, { opacity: 255 });
        self.hideTween = tween(self.uiOpacity).to(1.0, { opacity: 0 });
    }

    /**更改語系 */
    public changeLocale(locale: string) {}

    /**
     * 進入Game 3 場景(初始化各物件)
     */
    public enterView() {
        const self = this;
        self.clearClickData();

        self.showContent();

        self.creditBoardTime = false;
        self.countdown.string = self.autoStartTime.toString();
    }

    public hideAllBoard(): void {
        const self = this;
        self.hideClickSymbol();
    }

    /**
     * 元寶出現
     * @param playAnim true: 播放元寶出現動畫, false: 直接出現元寶
     */
    public showClickSymbol(playAnim: boolean) {
        const self = this;
        if (playAnim) {
            self.selectPerform.OnIngotPerformPlayShow();
        } else {
            self.selectPerform.OnIngotPerformShow();
        }
        AudioManager.Instance.play(AudioClipsEnum.Mini_SymbolLocate);
    }

    private hideClickSymbol() {
        const self = this;
        self.selectPerform.OnIconHide();
    }

    /** 控制提示框 */
    public showMiniGameInfo(show: boolean): void {
        const self = this;
        self.miniGameInfo.active = show;
    }

    /** 贏分結算面板 */
    public showWonCreditBoard(): void {
        const self = this;
        this.creditBoardTime = true;
        // self.hideAllBoard();
    }

    /**
     * 元寶轉成 Symbol
     * @param ingotIndex    元寶位置
     * @param resultID      獎項 Symbol ID
     * @param language      語言
     * @param playAnim      true: 播放元寶選擇與 Symbol 出現動畫, false: 直接顯示 Symbol
     */
    public ingotChangeToSymbol(ingotIndex: number, resultID: number, language: string, playAnim: boolean) {
        const self = this;
        let lang = language == 'en' ? 0 : 1;
        self.selectPerform.OnIngotPlaySelect(ingotIndex, resultID, lang, playAnim);
        AudioManager.Instance.play(AudioClipsEnum.Mini_Open);
    }

    public highLightWinSymbol(
        winType: number,
        openingSeqArr: { symbolShowObj: any; btnIdx: number }[],
        noSelectIdx: number[]
    ) {
        const self = this;
        for (let i = 0; i < openingSeqArr.length; i++) {
            if (winType == openingSeqArr[i].symbolShowObj) {
                self.selectPerform.OnIconPlayWin(openingSeqArr[i].btnIdx);
            } else {
                self.selectPerform.OnIconPlayNoSelect(openingSeqArr[i].btnIdx);
            }
        }

        for (let i = 0; i < noSelectIdx.length; i++) {
            self.selectPerform.OnIngotPlayNoSelect(noSelectIdx[i]);
        }
    }

    public expectationSymbol(symbolType: number, openingSeqArr: { symbolShowObj: any; btnIdx: number }[]) {
        const self = this;
        for (let i = 0; i < openingSeqArr.length; i++) {
            if (symbolType == openingSeqArr[i].symbolShowObj) {
                self.selectPerform.OnIconPlayPrepare(openingSeqArr[i].btnIdx);
            }
        }
    }

    public getAllSymbolButton(): MiniIngot[] {
        return this.selectPerform.getAllMiniIngot();
    }

    /** 顯示進場動畫 */
    public showContent() {
        const self = this;
        self.uiOpacity.opacity = 0;
        self.showTween.start();
    }

    /**
     * 清除按鈕記錄資料
     */
    private clearClickData() {
        const self = this;
        self.clickData.clear();
    }

    public hideContent() {
        const self = this;
        self.hideAllBoard();
        self.uiOpacity.opacity = 255;
        self.hideTween.start();
    }

    public enableCountdown(enable: boolean) {
        this.countdown.node.parent.active = enable;
    }
}
