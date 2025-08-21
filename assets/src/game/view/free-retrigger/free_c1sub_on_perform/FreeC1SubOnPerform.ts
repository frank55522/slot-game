import { _decorator, Component, Label, Vec2, Prefab, Vec3 } from 'cc';
import { PoolManager } from '../../../../sgv3/PoolManager';
import { BalanceUtil } from '../../../../sgv3/util/BalanceUtil';
import { GlobalTimer } from '../../../../sgv3/util/GlobalTimer';
import { AudioManager } from '../../../../audio/AudioManager';
import { ParticleContentTool } from 'ParticleContentTool';
import { AudioClipsEnum } from '../../../vo/enum/SoundMap';
import { TimelineTool } from 'TimelineTool';

const { ccclass, property } = _decorator;

// RD 可變動

@ccclass('FreeC1SubOnPerform')
export class FreeC1SubOnPerform extends Component {
    @property(Prefab)
    private c1SubOn: Prefab | null = null;

    private CallBack: any = null;

    private hitTotalCount: number = 0;

    private hitSpecialInfo: Array<HitSpecialInfo> = new Array();

    private onCollectCredit: Function = null;

    readonly SPECIAL_HIT_END: string = 'sprcialHitEnd';

    readonly SPECIAL_HIT_END_TIMEOUT = 1;

    private sideBallCount = 0;

    private removeSideBallCount = 0;

    private intervalTime = 1.2;

    // 出現角落球 燃燒
    public showSideBall(sideCredit: Array<Array<number>>, symbolFeature: Array<Array<Vec3>>, isFormatBalance: boolean) {
        let self = this;

        self.hitSpecialInfo = self.getC1SubOn(sideCredit, symbolFeature);
        self.hitTotalCount = 0;

        for (let i = 0; i < self.hitSpecialInfo.length; i++) {
            let label = self.hitSpecialInfo[i].c1Sub.node
                .getChildByName('C1')
                .getChildByName('Num')
                .getComponent(Label);

            label.string = isFormatBalance
                ? BalanceUtil.formatBalanceWithExpressingUnits(self.hitSpecialInfo[i].Score)
                : self.hitSpecialInfo[i].Score.toString();

            self.hitSpecialInfo[i].c1Sub?.play('Hit');
        }

        self.hitTotalCount = self.hitSpecialInfo.length;
    }

    // 結束 callback
    public ShowSideBallEnd() {
        let self = this;
        for (let i = 0; i < self.hitSpecialInfo.length; i++) {
            if (i < self.hitSpecialInfo.length - 1) {
                self.hitSpecialInfo[i]?.c1Sub.play('Show');
            } else {
                self.hitSpecialInfo[i]?.c1Sub.play('Show', () => self.CallBack());
            }
        }
    }

    // show 贏分 連接 打擊效果
    public showSideBallScore(onCollectCredit: Function, callback: Function) {
        let self = this;
        self.onCollectCredit = onCollectCredit;
        self.CallBack = callback;

        for (let i = 0; i < self.hitSpecialInfo.length; i++) {
            if (i > 0) {
                self.hitSpecialInfo[i]?.c1Sub.play('IncreaseShowLoop');
            } else {
                self.hitSpecialInfo[i]?.c1Sub.play('IncreaseShow', () => this.showSideBallFly());
            }
        }

        AudioManager.Instance.play(AudioClipsEnum.Free_C1GrowUp);
    }
    // 暫時保留 工具callback出問題時使用
    private showScoreEnd() {
        let self = this;
        GlobalTimer.getInstance().removeTimer('showScoreEnd');
        GlobalTimer.getInstance()
            .registerTimer(
                'showScoreEnd',
                0.3,
                () => {
                    GlobalTimer.getInstance().removeTimer('showScoreEnd');
                    self.showSideBallFly();
                },
                self
            )
            .start();
    }

    private showSideBallFly() {
        let self = this;
        self.sideBallCount = 0;
        self.removeSideBallCount = 0;
        for (let i = 0; i < self.hitSpecialInfo.length; i++) {
            self.showFlyStart([self.hitSpecialInfo[i].pos, self.hitSpecialInfo[i].Score]);
        }
    }

    private showFlyStart(array: any) {
        let self = this;
        GlobalTimer.getInstance()
            .registerTimer(
                'CreditCollect' + self.sideBallCount,
                self.intervalTime * self.sideBallCount,
                () => {
                    GlobalTimer.getInstance().removeTimer('CreditCollect' + self.removeSideBallCount);

                    let callback = null;
                    if (self.removeSideBallCount >= self.sideBallCount - 1) {
                        callback = self.specialEnd();
                    }
                    self.hitSpecialInfo[self.removeSideBallCount]?.c1Sub.play('Fly', callback);
                    self.onCollectCredit([
                        self.hitSpecialInfo[self.removeSideBallCount].pos,
                        self.hitSpecialInfo[self.removeSideBallCount].Score
                    ]);
                    self.removeSideBallCount++;
                },
                self
            )
            .start();
        self.sideBallCount++;
    }
    // 表演結束確認
    private specialEnd() {
        let self = this;

        GlobalTimer.getInstance()
            .registerTimer(
                self.SPECIAL_HIT_END,
                self.SPECIAL_HIT_END_TIMEOUT,
                () => {
                    for (let i = 0; i < self.hitSpecialInfo.length; i++) {
                        PoolManager.instance.putNode(self.hitSpecialInfo[i].c1Sub.node);
                    }
                    self.hitSpecialInfo = new Array();
                    self.CallBack();
                    GlobalTimer.getInstance().removeTimer(this.SPECIAL_HIT_END);
                },
                self
            )
            .start();
    }

    //** 取得 C1Sub_on 物件 */
    private getC1SubOn(sideCredit: Array<Array<number>>, symbolFeature: Array<Array<Vec3>>) {
        let hitSpecialInfo: Array<HitSpecialInfo> = new Array();
        for (let i = 0; i < sideCredit.length; i++) {
            for (let j = 0; j < sideCredit[i].length; j++) {
                if (sideCredit[i][j] > 0) {
                    let c1 = PoolManager.instance.getNode(this.c1SubOn, this.node);

                    c1.setPosition(symbolFeature[i][j]);
                    c1.getComponentsInChildren(ParticleContentTool).forEach((element) => {
                        element.ParticleClear();
                    });

                    let _hitSpecialInfo: HitSpecialInfo = new HitSpecialInfo();
                    _hitSpecialInfo.ID = i * 3 + j;
                    _hitSpecialInfo.Score = sideCredit[i][j];
                    _hitSpecialInfo.pos = new Vec2(i, j);
                    _hitSpecialInfo.c1Sub = c1.getComponent(TimelineTool);
                    hitSpecialInfo.push(_hitSpecialInfo);
                }
            }
        }
        return hitSpecialInfo;
    }
}

export class HitSpecialInfo {
    public ID: number = 0;
    public Score: number = 0;
    public pos: Vec2 = new Vec2();
    public c1Sub: TimelineTool | null = null;
}
