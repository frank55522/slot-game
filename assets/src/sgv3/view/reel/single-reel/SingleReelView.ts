import { _decorator, Vec3 } from 'cc';
import { UIViewBase } from '../../../../core/uiview/UIViewBase';
import { UISymbol } from '../symbol/UISymbol';
import { SingleReelContentBase } from './SingleReelContentBase';
const { ccclass } = _decorator;

@ccclass('SingleReelView')
export class SingleReelView extends UIViewBase {
    //// Internal Member
    private _singleReelContent: SingleReelContentBase | null = null;
    ////

    //// property
    public get singleReelContent() {
        if (this._singleReelContent == null) {
            this._singleReelContent = this.getComponent(SingleReelContentBase);
        }
        return this._singleReelContent;
    }
    ////

    //// API
    public rePosition() {
        let height = 0;
        for (let i = 0; i < this.singleReelContent!.symbols.length; i++) {
            height = i * this.singleReelContent!.symbolHeight * -1;
            this.singleReelContent!.symbols[i].setSymbolPos(
                Vec3.set(this.singleReelContent!.symbols[i].node.position,0, this.singleReelContent!.startPosition + height, 0)
            );
        }
    }

    public rollUpdate(deltaTime: number) {
        if (this.singleReelContent.isRolling == false) {
            return;
        }
        this.move(deltaTime);
        this.checkObjectPosition();
    }

    public onBaseCycled(isStop: boolean){
        this.singleReelContent.passCounter++;
        this.singleReelContent.stripIndexer.next();
        let first = this.singleReelContent.first;
        first.symbolContent.symbolData = this.singleReelContent
        .getCurSymbolData(this.singleReelContent.firstIndex);
        
        first.symbolContent.fovIndex = (isStop) ? this.singleReelContent
        .getFOVIndex(this.singleReelContent.stopMotionData.pass) : -1;  
    }

    public symbolsCompare(){
        for(let i in this.singleReelContent.symbols){
            if(this.singleReelContent.symbols[i].symbolContent.symbolData.isImprovedFOV){
                this.singleReelContent.symbols[i].setSibling(100);
            }else{
                this.singleReelContent.symbols[i].setSibling(0);
            }
        } 
    }
    ////

    //// Hook
    ////

    ////Internal Method
    protected move(deltaTime: number) {
        for (let i in this.singleReelContent.symbols) {
            this.singleReelContent.symbols[i].setSymbolPos(
                Vec3.set(this.singleReelContent.symbols[i].node.position,0,this.singleReelContent.symbols[i].node.position.y -
                this.singleReelContent.speed * this.singleReelContent.ReelPasser.speedBase * deltaTime,
                0)
            );
        }
    }

    protected checkObjectPosition() {
        if (!this.singleReelContent.isOutOfEndPosition) {
            return;
        }

        this.singleReelContent.last.setSymbolPos(this.singleReelContent.startLinkPosition);
        this.singleReelContent.symbols.sort(this.positionCompare);
        this.symbolsCompare();
        this.rePosition();

        if (this._singleReelContent.onRollObjectCycled != null) {
            this._singleReelContent.onRollObjectCycled();
        }
    }

    protected positionCompare(s1: UISymbol, s2: UISymbol) {
        if (s1.node.position.y < s2.node.position.y) {
            return 1;
        } else if (s1.node.position.y > s2.node.position.y) {
            return -1;
        }
        return 0;
    }
    ////
}
