import { _decorator } from 'cc';
import BaseView from '../../base/BaseView';
import { TimelineTool } from 'TimelineTool';
import { SingleReelContent } from '../../sgv3/view/reel/single-reel/SingleReelContent';
const { ccclass, property } = _decorator;

@ccclass('AnimName')
export class AnimName {
    @property({ type: Number })
    public fovLength: number = 0;
    @property({ type: String })
    public showName: string = 'show';
    @property({ type: String })
    public hideName: string = 'hide';
}

@ccclass('ReelFXView')
export class ReelFXView extends BaseView {
    @property({ type: [AnimName] })
    private animNames: AnimName[] = [];
    @property(TimelineTool)
    private anim: TimelineTool;

    protected _isEmergencyStop: boolean = false;

    public set isEmergencyStop(val: boolean) {
        this._isEmergencyStop = val;
    }

    public get isEmergencyStop(): boolean {
        return this._isEmergencyStop;
    }
    protected _isStoping: boolean = false;

    public set isStoping(val: boolean) {
        this._isStoping = val;
    }

    public get isStoping(): boolean {
        return this._isStoping;
    }

    protected _isShowing: boolean = false;
    public get isShowing(): boolean {
        return this._isShowing;
    }

    onLoad() {
        super.onLoad();
    }

    public setAnimPosition(singleReelContent: SingleReelContent) {
        this.node.setWorldPosition(singleReelContent.node.worldPosition.x, singleReelContent.node.worldPosition.y, 0);
    }

    public playShow(singleReelContent: SingleReelContent): void {
        this._isShowing = true;
        let animName = this.getAnimName(singleReelContent.stripIndexer.fovLength);
        this.show();
        if (this.anim.isPlaying) {
            this.anim.play(animName.hideName, () => {
                this.setAnimPosition(singleReelContent);
                this.anim.play(animName.showName);
            });
        } else {
            this.setAnimPosition(singleReelContent);
            this.anim.play(animName.showName);
        }
    }

    public playEnd(fovLength: number) {
        this._isShowing = false;
        let animName = this.getAnimName(fovLength);
        this.anim.play(animName.hideName);
    }

    public stop() {
        this._isShowing = false;
        this.anim.stop();
        this.hide();
    }

    public getAnimName(fovLength: number): AnimName {
        try {
            for (let i = 0; i < this.animNames.length; i++) {
                if (this.animNames[i].fovLength === fovLength) {
                    return this.animNames[i];
                }
            }
            return null;
        }
        catch (error) {
            console.error('FX Error : ', error);
            return null;
        }
    }

    show() {
        this.anim.node.active = true;
    }

    hide() {
        this.anim.node.active = false;
    }
}
