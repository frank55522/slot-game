
import { _decorator, Component, Node, Label, CCFloat, tween } from 'cc';
import { TimelineTool } from 'TimelineTool';

const { ccclass, property } = _decorator;
 
@ccclass('MultipleBoard')
export class MultipleBoard extends Component {
    @property({ type: Label, visible: true })
    public labelText: Label | null = null;
    @property({ type: CCFloat, visible: true })
    public _runningTime: number = 0;
    @property({type: TimelineTool})
    public Animation: TimelineTool |null =null;

    public multiple: number = 100;// TO DO: Init set Value

    public rollMultiple(targertMultiple: number,callback: Function | null = null){
        //開始滾動
        this.Animation?.play('ScaleMultiple');
        tween(this as MultipleBoard)
        .by(
        this._runningTime,
        { multiple: targertMultiple },
                {
                    onUpdate: (target) => {
                        (target as MultipleBoard).updateLabelText();
                    }
                }
            )
        .call(() => {
            callback();
        })
        .start();
    }

    public updateLabelText(){
        this.labelText.string = String(Math.round(this.multiple)+"%");
    }
}
