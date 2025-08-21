
import { _decorator, Label, Node, tween } from 'cc';
import BaseView from 'src/base/BaseView';
import { RemainSpinInfo } from './dragon-up/RemainSpinInfo';
import { GlobalTimer } from 'src/sgv3/util/GlobalTimer';
const { ccclass, property } = _decorator;
 
@ccclass('SpinInfoView')
export class SpinInfoView extends BaseView {
    @property({ type: Node })
    public freeSpinInfo: Node;

    @property({ type: RemainSpinInfo })
    public remainSpinInfo: RemainSpinInfo;

    @property({ type: Label })
    public curFreeSpinTimes: Label;

    @property({ type: Label })
    public maxFreeSpinTimes: Label;

    @property({ type: Node })
    public maxSpin: Node;
    
    public spinTotalTimes: number = 0;
    private isSpinMax: boolean = false;

    /** free game相關UI顯示API */
    public showFreeInfoMsg(): void {
        this.freeSpinInfo.active = true;
        this.maxSpin.active = this.isSpinMax;
    }

    public showRemainInfoMsg(): void {
        this.remainSpinInfo.node.active = true;
        this.maxSpin.active = this.isSpinMax;
    }

    public showMaxSpinInfo(isMax: boolean) {
        this.isSpinMax = isMax;
        this.maxSpin.active = this.isSpinMax;
    }

    public closeFreeInfoMsg(): void {
        this.remainSpinInfo.node.active = false;
        this.freeSpinInfo.active = false;
        this.maxSpin.active = false;
    }

    /** 更新 free game次數 資訊 */
    public updateMsgContent(_curTimes: number, _maxTimes: number): void {
        if (_curTimes != null) {
            this.curFreeSpinTimes.string = '' + _curTimes;
        }
        this.maxFreeSpinTimes.string = '' + _maxTimes;
        if (_curTimes == 1) {
            this.showMaxSpinInfo(false);
        }
    }

    public addMsgContent(data: any, isMax: boolean): void {
        let retriggerTime: number[] = data as number[];
        this.isSpinMax = isMax;
        this.changeRetriggerTotalTimes(retriggerTime[0], retriggerTime[1], retriggerTime[2]);
    }

    private changeRetriggerTotalTimes(_readyAddTimes: number, _curTotalTimes: number, _runningTimer: number): void {
        this.spinTotalTimes = _curTotalTimes;
        tween(<SpinInfoView>this)
            .to(
                _runningTimer - 0.5, // 0.5 秒，停頓時間.
                { spinTotalTimes: _curTotalTimes + _readyAddTimes },
                {
                    onUpdate: (target) => {
                        (target as SpinInfoView).onChangeTotalTimes();
                    }
                }
            )
            .start();

        GlobalTimer.getInstance()
            .registerTimer('addSpinTimes', _runningTimer, this.changeTotalTimesFinish, this)
            .start();
    }

    private onChangeTotalTimes(): void {
        this.updateMsgContent(null, Math.round(this.spinTotalTimes));
    }

    private changeTotalTimesFinish(): void {
        GlobalTimer.getInstance().removeTimer('addSpinTimes');
        this.maxSpin.active = this.isSpinMax; //依據資料，決定是否顯示MaxSpin UI.
    }
}