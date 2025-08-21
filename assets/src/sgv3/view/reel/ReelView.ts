import { Prefab, _decorator, Node, CCString, Sprite, SpriteFrame } from 'cc';
import { LayoutDisplayModeSetting, UILayout } from '../../../core/ui/UILayout';
import { UISlotMask } from '../../../core/ui/UISlotMask';
import { PoolManager } from '../../PoolManager';
import { GameScene } from '../../vo/data/GameScene';
import { ReelType } from '../../vo/enum/Reel';
import { ReelPasser } from '../../vo/match/ReelMatchInfo';
import { SingleReelView } from './single-reel/SingleReelView';
import { SymbolPartGroups } from './symbol/SymbolPartGroups';
import BaseView from 'src/base/BaseView';
import { OverlaySymbolContainer } from './symbol/OverlaySymbolContainer';
import { SceneManager } from 'src/core/utils/SceneManager';

const { ccclass, property } = _decorator;

@ccclass('ReelsScenesSetting')
export class ReelsScenesSetting {
    @property({ type: CCString, visible: true })
    public sceneName: String = GameScene.Game_1;
    @property({ type: Prefab, visible: true })
    public reelPrefab: Prefab | null = null;
    @property({ type: LayoutDisplayModeSetting, visible: true })
    public scenesDisplaySetting: LayoutDisplayModeSetting = new LayoutDisplayModeSetting();
    @property({ type: SpriteFrame, visible: true })
    public backgroundFrame: SpriteFrame | null = null;
}

/** 基本Reel View實作 */
@ccclass('ReelView')
export abstract class ReelView extends BaseView {
    //// Internal Member
    @property({ type: [ReelsScenesSetting], visible: true })
    private scenesSetting: Array<ReelsScenesSetting> = [];
    @property({ type: [SingleReelView], visible: true })
    private _reelsList: Array<SingleReelView> = [];
    @property({ type: Node, visible: true })
    private _reelsParent: Node | null = null;
    @property({ type: UILayout, visible: true })
    private _uiLayout: UILayout | null = null;
    @property({ type: Sprite, visible: true })
    private _backgroundSprite: Sprite | null = null;
    @property({ type: OverlaySymbolContainer })
    protected overlaySymbolContainer: OverlaySymbolContainer | null = null;

    private updateReelsIndex: Array<Array<number>> = [];

    private curSceneIndex: number = 0;

    private _symbolPartGroups: SymbolPartGroups | null = null;

    public get symbolPartGroups() {
        if (this._symbolPartGroups == null) {
            this._symbolPartGroups = this.getComponentInChildren(SymbolPartGroups);
        }
        return this._symbolPartGroups;
    }

    private _uiSlotMask: UISlotMask | null = null;

    public get uiSlotMask() {
        if (this._uiSlotMask == null) {
            this._uiSlotMask = SceneManager.instance.node.getComponentInChildren(UISlotMask);
        }
        return this._uiSlotMask;
    }

    private _reelsLayout: UILayout | null = null;

    public get reelsLayout() {
        if (this._reelsLayout == null) {
            this._reelsLayout = this.reelsParent.getComponent(UILayout);
        }
        return this._reelsLayout;
    }

    public isHideC1AndC2: boolean = false;
    ////

    //// property
    public mySceneName: string = '';

    public ishorizontalMode: boolean = false;

    public get reelsList() {
        return this._reelsList;
    }

    public get reelsParent() {
        return this._reelsParent;
    }
    ////

    //// API
    public onSceneChange() {
        this.recycleReels();
        for (let i = 0; i < this.scenesSetting.length; i++) {
            if (this.scenesSetting[i].sceneName == this.mySceneName) {
                this.curSceneIndex = i;
                this.reelsLayout.changeSetting(this.scenesSetting[i].scenesDisplaySetting);
                this._backgroundSprite.spriteFrame = this.scenesSetting[i].backgroundFrame;
                break;
            }
        }
    }

    public setStrip(index: number, strip: number[]) {
        this.reelsList[index].singleReelContent!.stripIndexer.strip = strip;
    }

    public setTargetRng(index: number, targetRng: number) {
        this.reelsList[index].singleReelContent!.stripIndexer.targetRng = targetRng;
    }

    public setOverlay(index: number[], isAllImprove = false) {
        for (let i = 0; i < index.length; i++) {
            this.reelsList[index[i]].singleReelContent.symbols.forEach((symbol, symbolIndex) => {
                if (
                    (symbol.symbolContent.symbolData.isImprovedFOV &&
                        symbolIndex >= this.reelsList[index[i]].singleReelContent.fovStartIndex &&
                        symbolIndex <= this.reelsList[index[i]].singleReelContent.fovEndIndex) ||
                    isAllImprove
                ) {
                    symbol.setOverlay(this.reelsList[index[i]].singleReelContent.overlaySymbolContainer);
                } else {
                    symbol.restoreParent();
                }
            });
        }
    }

    public reelsShow() {
        for (let i = 0; i < this.reelsList.length; i++) {
            if (this.reelsList[i].singleReelContent.isRolling) {
                return;
            }
            this.reelsList[i].play(ReelType.SHOW);
        }
    }

    public reelsInit(count: number, spinStopSequence: Array<Array<number>>, language: string) {
        if (this.curSceneIndex < 0 || this.reelsList!.length > 0) {
            return;
        }
        let curPrefab = this.scenesSetting[this.curSceneIndex].reelPrefab;
        for (let i = 0; i < count; i++) {
            let temp = PoolManager.instance.getNode(curPrefab, this._reelsParent);
            this.reelsList.push(temp.getComponent(SingleReelView)!);
            this.reelsList[i].singleReelContent.id = i;
            this.reelsList[i].singleReelContent.ishorizontalMode = this.ishorizontalMode;
            this.reelsList[i].singleReelContent.overlaySymbolContainer = this.overlaySymbolContainer;
            this.reelsList[i].singleReelContent.isHideC1AndC2 = this.isHideC1AndC2;
            this.reelsList[i].play(ReelType.INIT);
        }
        this._uiLayout.updateLayout();
        this.symbolPartGroups.init();
        this.symbolPartGroups.getAndSort();
        this.uiSlotMask.maskInit(this.symbolPartGroups.useSharedMaterial);
        this.updateReelsIndex = spinStopSequence;
    }

    public reelsRollStart(callback: Function | null = null) {
        for (let i = 0; i < this.reelsList.length; i++) {
            this.reelsList[i].play(ReelType.ROLL_START, callback);
        }
    }

    public reelRollStart(index: number) {
        this.reelsList[index].play(ReelType.ROLL_START);
    }

    public reelsRollAfter(callback: Function | null = null) {
        for (let i = 0; i < this.reelsList.length; i++) {
            this.reelsList[i].play(ReelType.ROLL_AFTER, callback);
        }
    }

    public reelsEmergencyStop(callback: Function | null = null) {
        for (let i = 0; i < this.reelsList.length; i++) {
            switch (this.reelsList[i].currentStateId) {
                case ReelType.SLOW_STOP:
                case ReelType.ROLL_AFTER:
                case ReelType.STOP:
                    this.reelsList[i].skip();
                    this.reelsList[i].play(ReelType.EMERGENCY_STOP, callback);
                    break;
            }
        }
    }

    public reelSlowStop(index: number[], callback: Function | null = null) {
        for (let i = 0; i < index.length; i++) {
            this.reelsList[index[i]].play(ReelType.SLOW_STOP, callback);
        }
    }

    public reelStop(index: number[], callback: Function | null = null) {
        for (let i = 0; i < index.length; i++) {
            this.reelsList[index[i]].play(ReelType.STOP, callback);
        }
    }

    public reelDamp(index: number, callback: Function | null = null) {
        this.reelsList[index].play(ReelType.DAMP, callback);
    }

    public changReelPasser(count: number, sceneName: string, reelPasser: ReelPasser) {
        if (this.mySceneName != sceneName) return;
        for (let i = 0; i < count; i++) {
            this.reelsList[i].singleReelContent.ReelPasser = reelPasser;
        }
    }

    public setReelPrefab(prefab: Prefab) {
        this.scenesSetting[this.curSceneIndex].reelPrefab = prefab;
    }
    ////

    //// Hook
    update(deltaTime: number) {
        deltaTime = Math.min(deltaTime, 1 / 30);
        for (let i = 0; i < this.updateReelsIndex.length; i++) {
            this.updateReelsIndex[i].forEach((sequenceIndex) => {
                this.reelsList[sequenceIndex].rollUpdate(deltaTime);
            });
        }
    }
    ////

    ////Internal Method
    protected recycleReels() {
        for (let i = 0; i < this.reelsList.length; i++) {
            let symbols = this.reelsList[i].singleReelContent.symbols;
            symbols.forEach((symbol) => {
                symbol.recyclePart();
            });
            let singleReel: Node = this._reelsList[i].node;
            PoolManager.instance.putNode(singleReel);
        }
        this._reelsList = [];
    }
    ////
}
