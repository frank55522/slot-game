import { Label, Vec3, _decorator, Node, Color, UIOpacity } from 'cc';
import { UIOrientation } from '../../core/ui/UIOrientation';
import { SymbolPosData } from '../../sgv3/proxy/ReelDataProxy';
import { ReelsEffectAnimManager } from '../../sgv3/view/reel/reel-effect/ReelsEffectAnimManager';
import { ReelView } from '../../sgv3/view/reel/ReelView';
import { SingleReelContent } from '../../sgv3/view/reel/single-reel/SingleReelContent';
import { UISymbol } from '../../sgv3/view/reel/symbol/UISymbol';
import { SymbolId, SymbolPerformType } from '../../sgv3/vo/enum/Reel';
import { SymbolInfo } from '../../sgv3/vo/info/SymbolInfo';
import { GAME_GameScene } from '../vo/data/GAME_GameScene';
import { Game_2_SymbolContent } from './symbol/Game_2_SymbolContent';
import { Game_4_SymbolContent } from './symbol/Game_4_SymbolContent';
import { SymbolFX } from './symbol/SymbolFX';

const { ccclass, property } = _decorator;
/** ByGame Win Reel View實作 */
@ccclass('GAME_ReelView')
export class GAME_ReelView extends ReelView {
    //// Internal Member
    @property({ type: ReelsEffectAnimManager, visible: true })
    private animManager: ReelsEffectAnimManager | null = null;
    @property({ type: Label, visible: true })
    private _winScoreText: Label | null = null;
    @property({ type: Node, visible: true })
    private _winMask: Node | null = null;
    @property({ type: UIOpacity, visible: true })
    private _uiOpacity: UIOpacity | null = null;

    private _uiOrientation: Array<UIOrientation> | null = null;

    private get uiOrientation() {
        if (this._uiOrientation == null) {
            this._uiOrientation = this.getComponentsInChildren(UIOrientation);
        }
        return this._uiOrientation;
    }
    ////

    //// property
    public get winScoreText() {
        return this._winScoreText;
    }
    public get winMask() {
        return this._winMask;
    }

    public isSymbolPlaying(): boolean {
        const self = this;
        if (self.animManager.isPlaying) {
            return true;
        }
        for (let i = 0; i < self.reelsList.length; i++) {
            let symbols = self.reelsList[i].singleReelContent.symbols;
            for (let j = 0; j < symbols.length; j++) {
                if (symbols[j].isPlaying) {
                    return true;
                }
            }
        }
        return false;
    }

    public checkNextLoopWin: Function | null = null;
    ////

    ////DragonUp API
    public dragonUpReSpinPerform(targert: SymbolInfo, featureInfo: SymbolPosData, callback: Function | null = null) {
        const self = this;
        let poolKey: number = targert.y * 5 + targert.x;
        self.createAnimSymbol(targert, true);
        let sub: SymbolFX = self.animManager.pool.get(poolKey + SymbolId.SUB);
        sub.node.setWorldPosition(self.getSymbolPosition(poolKey, 0));
        sub.setInfo(targert.sid, featureInfo);
        sub.node.active = true;
        sub.play(SymbolPerformType.SHOW_RESPIN, () => {
            self.animManager.putAnim(poolKey + SymbolId.SUB);
            callback();
        });
        if (featureInfo.creditCent > 0) {
            let symbol: SymbolFX = self.animManager.pool.get(poolKey);
            symbol.subHide();
        }
        let symbolContent = self.reelsList[poolKey].singleReelContent.symbols[1].symbolContent as Game_4_SymbolContent;
        symbolContent.reSpinSprite.enabled = false;
    }

    public dragonUpBaseCreditUpdate(reelIndex: number) {
        let anim: SymbolFX = this.animManager.pool.get(reelIndex);
        anim.play(SymbolPerformType.SHOW_BASE_CREDIT_COLLECT);
    }

    public dragonUpGetCreditResult(reelIndex: number, credit: string) {
        let anim: SymbolFX = this.animManager.pool.get(reelIndex);
        anim.play(SymbolPerformType.SHOW_TARGERT_CREDIT_RESULT);
        anim.setLabelText(credit);
    }

    public dragonUpTargertCreditUpdate(reelIndex: number, credit: string) {
        let anim: SymbolFX = this.animManager.pool.get(reelIndex);
        anim.play(SymbolPerformType.SHOW_TARGERT_CREDIT_COLLECT);
        anim.setLabelText(credit);
    }

    public dragonUpMultipleAccumulate(targertIndex: number) {
        let anim = this.animManager.pool.get(targertIndex);
        anim.setLabelText(String());
    }

    public setHoldSpinSymbol(symbolInfo: SymbolInfo, featureInfo: SymbolPosData) {
        const self = this;

        let poolKey: number = symbolInfo.y * 5 + symbolInfo.x;
        let symbolFX: SymbolFX = self.animManager.pool.get(poolKey);
        symbolFX.node.setWorldPosition(self.getSymbolPosition(poolKey, 0));
        symbolFX.setInfo(symbolInfo.sid, featureInfo);
        self.animManager.sortAllAnim();
        symbolFX.node.active = true;
        symbolFX.play(SymbolPerformType.SHOW);
    }
    ////

    ////FreeGsme API
    public freeGameHideSideBall() {
        for (let i = 0; i < this.reelsList.length; i++) {
            for (let j = 0; j < this.reelsList[i].singleReelContent!.symbols!.length; j++) {
                let content = this.reelsList[i].singleReelContent!.symbols[j].symbolContent as Game_2_SymbolContent;
                content.freeC1.node.active = false;
            }
        }
    }
    ////

    ////Common API
    public setWinScoreInfo(symbolInfo: SymbolInfo, symbolWin: string) {
        const self = this;
        if (symbolInfo.sid < 0 || self._winScoreText == null) {
            return;
        }
        //設定贏分位置
        self._winScoreText.node.setWorldPosition(self.getScoreTextPosition(symbolInfo));
        //贏分資訊
        self._winScoreText.string = symbolWin;
        self._winScoreText.node.active = true;
    }

    public createAnimSymbols(symbolInfo: any) {
        const self = this;
        symbolInfo.forEach(function (value: SymbolInfo) {
            self.createAnimSymbol(value);
        });
    }

    public createAnimSymbol(value: SymbolInfo, isSubSymbol = false) {
        const self = this;
        let poolKey: number = isSubSymbol ? value.y * 5 + value.x + SymbolId.SUB : value.y * 5 + value.x;
        //避免同Key重複生成物件
        if (self.animManager.pool.has(poolKey)) {
            return;
        }
        let anim: Node = self.animManager.getAnim(value.sid, poolKey);
        anim.setParent(self.animManager.node);
    }

    public showAllWinSymbol(symbolInfo: SymbolInfo) {
        const self = this;
        self.setDefaultSymbolPlay(symbolInfo, SymbolPerformType.SHOW_ALL_WIN);
    }

    public skipShowAllWinSymbol(symbolInfo: SymbolInfo) {
        let symbol = this.getSymbol(symbolInfo);
        if (symbol.currentStateId == SymbolPerformType.SHOW_ALL_WIN) {
            symbol.skip();
        }
    }

    public showLoopWinSymbol(symbolInfo: SymbolInfo, featureInfo: SymbolPosData) {
        const self = this;
        switch (symbolInfo.sid) {
            case -1:
                //do nothing
                break;
            case SymbolId.WILD:
            case SymbolId.C1:
                self.setAnimSymbolPlay(symbolInfo, featureInfo);
                self.setDefaultSymbolPlay(symbolInfo, SymbolPerformType.HIDE);
                break;
            case SymbolId.M1:
            case SymbolId.M2:
            case SymbolId.M3:
            case SymbolId.M4:
            case SymbolId.M5:
            case SymbolId.M6:
            default:
                self.setDefaultSymbolPlay(symbolInfo, SymbolPerformType.SHOW_LOOP_WIN);
                break;
        }
    }

    public skipReelWin() {
        if (this.winScoreText != null) {
            this.winScoreText.node.active = false;
        }
        this.animManager.putAllAnims();
        this.setReelWinMask(false);
        for (let i = 0; i < this.reelsList.length; i++) {
            let symbols = this.reelsList[i].singleReelContent.symbols;
            symbols.forEach((symbol) => {
                symbol.skip();
                symbol.play(SymbolPerformType.SHOW);
            });
        }
    }

    public setReelWinMask(active: boolean) {
        this.winMask.active = active;
    }

    public changeOrientation() {
        for (let i = 0; i < this.reelsList.length; i++) {
            if (!this.reelsList[i]) {
                return;
            }
            this.reelsList[i].singleReelContent!.ishorizontalMode = this.ishorizontalMode;
            this.reelsList[i].rePosition();
        }
        for (let i = 0; i < this.uiOrientation.length; i++) {
            this.uiOrientation[i].changeOrientation(this.ishorizontalMode);
        }
    }
    public hideWildSymbol(symbolInfo: SymbolInfo) {
        this.setDefaultSymbolPlay(symbolInfo, SymbolPerformType.HIDE);
    }

    public hideC1AndC2Symbol(isHide : boolean) {
        this.isHideC1AndC2 = isHide;
        this._uiOpacity.enabled = isHide;
    }

    ////

    //// Hook
    protected onLoad() {
        if (this.winScoreText != null) {
            this.winScoreText.node.active = false;
        }
        super.onLoad('ReelViewMediator', `ReelViewMediator`);
    }

    update(deltaTime: number) {
        super.update(deltaTime);
        if (this.checkNextLoopWin != null) {
            this.checkNextLoopWin();
        }
    }
    ////

    ////Internal Method
    public setAnimSymbolHide(symbolInfo: SymbolInfo) {
        const self = this;
        let anim: SymbolFX = self.getSymbolAnim(symbolInfo);
        let symbol = self.getSymbol(symbolInfo);

        if (anim) anim.node.active = false;
        symbol.play(SymbolPerformType.SHOW);
        this.restoreSymbolParent(symbol, symbolInfo.x);
    }

    protected setAnimSymbolPlay(symbolInfo: SymbolInfo, featureInfo: SymbolPosData) {
        const self = this;
        let poolKey: number = symbolInfo.y * self.reelsList.length + symbolInfo.x;
        let anim: SymbolFX = self.animManager.pool.get(poolKey);

        anim.node.setWorldPosition(self.getSymbolPosition(symbolInfo.x, symbolInfo.y));
        anim.setInfo(symbolInfo.sid, featureInfo);
        anim.node.active = true;
        anim.play(SymbolPerformType.SHOW);
    }

    protected setDefaultSymbolPlay(symbolInfo: SymbolInfo, type: SymbolPerformType) {
        let symbol = this.getSymbol(symbolInfo);
        switch (type) {
            case SymbolPerformType.HIDE:
                this.restoreSymbolParent(symbol, symbolInfo.x);
                break;
            case SymbolPerformType.SHOW_ALL_WIN:
            case SymbolPerformType.SHOW_LOOP_WIN:
                this.setOverlaySymbol(symbol, symbolInfo.x);
                break;
        }
        symbol.play(type);
    }

    protected getScoreTextPosition(symbolInfo: SymbolInfo): Vec3 {
        let reelContent = this.reelsList[symbolInfo.x].singleReelContent;
        let scorePos = reelContent.symbols[reelContent.getSymbolIndex(symbolInfo.y)].node.worldPosition;
        return symbolInfo.sid == SymbolId.C1
            ? new Vec3(scorePos.x, scorePos.y - this.scoreTextPosSubtract, scorePos.z)
            : scorePos;
    }

    protected get scoreTextPosSubtract() {
        let sub: number = 53;
        if (!this.reelsList[0].singleReelContent.ishorizontalMode) {
            sub = 40;
        }
        return sub;
    }

    protected getSymbolAnim(symbolInfo: SymbolInfo): SymbolFX {
        let poolKey: number = symbolInfo.y * this.reelsList.length + symbolInfo.x;
        let anim: SymbolFX = this.animManager.pool.get(poolKey);
        return anim;
    }

    protected getSymbol(symbolInfo: SymbolInfo): UISymbol {
        let reelContent = this.reelsList[symbolInfo.x].singleReelContent;
        let symbol = reelContent.symbols[reelContent.getSymbolIndex(symbolInfo.y)];
        return symbol;
    }

    protected getSymbolPosition(reelIndex: number, fovIndex: number): Vec3 {
        let reelContent = this.reelsList[reelIndex].singleReelContent;
        return reelContent.symbols[reelContent.getSymbolIndex(fovIndex)].node.worldPosition;
    }

    protected setOverlaySymbol(symbol: UISymbol, reelIndex: number) {
        symbol.setOverlay(this.overlaySymbolContainer);
        symbol.setColor(Color.WHITE);
        this.reelsList[reelIndex].singleReelContent.singleReelView!.symbolsCompare();
    }

    protected restoreSymbolParent(symbol: UISymbol, reelIndex: number) {
        symbol.restoreParent();
        symbol.setColor(this.reelsList[reelIndex].singleReelContent.shaderColor);
        this.reelsList[reelIndex].singleReelContent.singleReelView!.symbolsCompare();
    }

    /**
     * 練習2: 播放收集分數球前的表演動畫
     */
    public showBeforeCollectBallAnimation(symbolInfo: SymbolInfo, featureInfo: SymbolPosData) {
        const self = this;
        let poolKey: number = symbolInfo.y * self.reelsList.length + symbolInfo.x;
        let anim: SymbolFX = self.animManager.pool.get(poolKey);

        if (anim) {
            anim.node.setWorldPosition(self.getSymbolPosition(symbolInfo.x, symbolInfo.y));
            anim.setInfo(symbolInfo.sid, featureInfo);
            anim.node.active = true;
            // 播放BEFORE_COLLECT表演動畫
            anim.play(SymbolPerformType.BEFORE_COLLECT);
        }
    }
    ////
}
