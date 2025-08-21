
import { _decorator } from 'cc';
import BaseView from 'src/base/BaseView';
import { ParticleContentTool } from 'ParticleContentTool';
const { ccclass, property } = _decorator;

@ccclass('WinSumFXView')
export class WinSumFXView extends BaseView {
    @property({ type: ParticleContentTool })
    public winSumAnim: ParticleContentTool;
}