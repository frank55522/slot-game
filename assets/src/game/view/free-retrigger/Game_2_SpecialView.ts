import { _decorator, Prefab, instantiate } from 'cc';
import { AudioManager } from '../../../audio/AudioManager';
import { AudioClipsEnum } from '../../vo/enum/SoundMap';
import { FreeGameSpecialInfo } from '../../vo/FreeGameSpecialInfo';
import { FreeC1SubOnPerform } from './free_c1sub_on_perform/FreeC1SubOnPerform';
import BaseView from 'src/base/BaseView';
const { ccclass, property } = _decorator;

@ccclass('Game_2_SpecialView')
export class Game_2_SpecialView extends BaseView {
    @property(FreeC1SubOnPerform)
    private freeC1SubOnPerform: FreeC1SubOnPerform | null = null;

    private onSpecialEndCallBack: Function = null;

    private onCollectCredit: Function = null;

    private freeGameSpecialInfo: FreeGameSpecialInfo;

    private language: string;

    public init(lang: string) {
        const self = this;

        self.language = lang;
    }

    public onLoad() {
        super.onLoad();
    }

    //** 出現角落球 */
    public showSideBall(freeGameSpecialInfo: FreeGameSpecialInfo, isFormatBalance: boolean) {
        let self = this;
        self.freeGameSpecialInfo = freeGameSpecialInfo;
        if (freeGameSpecialInfo.hitBall.isShowHitBall) {
            self.freeC1SubOnPerform.showSideBall(
                self.freeGameSpecialInfo.hitBall.sideCreditBall,
                self.freeGameSpecialInfo.hitBall.sideCreditBallPos,
                isFormatBalance
            );
        }
    }

    //** 角落球特色打擊 */
    public showSideBallScore(onCollectCredit: Function, onSpecialEnd: Function) {
        let self = this;
        self.onSpecialEndCallBack = onSpecialEnd;
        self.onCollectCredit = onCollectCredit;
        if (self.freeGameSpecialInfo.hitBall.isShowHitBall) {
            self.freeC1SubOnPerform.showSideBallScore(
                self.onCollectCredit.bind(self),
                self.showHitSideBallEnd.bind(self)
            );
        } else {
            self.showHitSideBallEnd();
        }
    }

    private showHitSideBallEnd() {
        this.onSpecialEndCallBack();
        this.clearCallback();
    }

    private clearCallback() {
        this.onSpecialEndCallBack = null;
        this.onCollectCredit = null;
        this.freeGameSpecialInfo = new FreeGameSpecialInfo();
    }
}
