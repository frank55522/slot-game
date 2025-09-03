import { Vec2 } from 'cc';
import { Game1FeatureSelectionCommand } from '../../../sgv3/command/state/Game1FeatureSelectionCommand';
import { ViewMediatorEvent } from '../../../sgv3/util/Constant';
import { UIEvent } from 'common-ui/proxy/UIEvent';
import { ButtonName, ButtonState } from 'common-ui/proxy/UIEnums';
import { SpeedMode } from 'src/game/vo/enum/Game_UIEnums';
import { setEngineTimeScale } from 'src/core/utils/SceneManager';
import { UIProxy } from 'common-ui/proxy/UIProxy';
import { BalanceUtil } from 'src/sgv3/util/BalanceUtil';

export class GAME_Game1FeatureSelectionCommand extends Game1FeatureSelectionCommand {
    public execute(notification: puremvc.INotification): void {
        this.gameDataProxy.hasSelectionResponse = false;
        
        // 檢查是否需要播放分數球表演
        let ballCount = this.gameDataProxy.spinEventData.baseGameResult.extendInfoForbaseGameResult.ballCount;
        if (ballCount >= 6) {
            // 先觸發分數球表演
            this.sendNotification(ViewMediatorEvent.BEFORE_COLLECT_BALL);
            // 延遲發送PREPARE_COLLECT_BALL
            setTimeout(() => {
                this.sendNotification(ViewMediatorEvent.PREPARE_COLLECT_BALL);
                this.endGame1FeatureSelection();
            }, 1200);
        } else {
            this.sendNotification(ViewMediatorEvent.PREPARE_COLLECT_BALL);
            this.endGame1FeatureSelection();
        }
    }

    private endGame1FeatureSelection() {
        let ballHitInfo = this.gameDataProxy.spinEventData.baseGameResult.extendInfoForbaseGameResult;
        let baseArray = new Array<Vec2>();
        for (let x = 0; x < ballHitInfo.ballScreenLabel.length; x++) {
            for (let y = 0; y < ballHitInfo.ballScreenLabel[x].length; y++) {
                if (ballHitInfo.ballScreenLabel[x][y] > 0) {
                    baseArray.push(new Vec2(x, y));
                }
            }
        }
        // Base game 龍珠分數收集
        this.sendNotification(ViewMediatorEvent.ON_CREDIT_BALL_COLLECT_START, {
            baseArray: baseArray,
            callback: this.showFeatureSelection.bind(this)
        });
    }

    public showFeatureSelection() {
        this.disableQuickSpin();
        let result = this.gameDataProxy.spinEventData.baseGameResult;
        let ballCash = this.gameDataProxy.convertCredit2Cash(result.extendInfoForbaseGameResult.ballTotalCredit); // 換算成錢
        let ballDisplay = this.gameDataProxy.isOmniChannel()
            ? this.gameDataProxy.getCreditByDenomMultiplier(ballCash).toString()
            : BalanceUtil.formatBalance(ballCash);
        this.sendNotification(ViewMediatorEvent.SHOW_FEATURE_SELECTION, [
            result.extendInfoForbaseGameResult.ballCount,
            ballDisplay
        ]);
    }

    private disableQuickSpin() {
        this.sendNotification(UIEvent.CHANGE_BUTTON_STATE, {
            name: ButtonName.QUICK_SPIN,
            state: ButtonState.DISABLED
        });
        this.UIProxy.isQuickSpin = false;
        //還原正常速度
        if (this.gameDataProxy.curSpeedMode === SpeedMode.STATUS_TURBO) {
            setEngineTimeScale(1);
        }
    }

    // ======================== Get Set ========================
    private _UIProxy: UIProxy;
    public get UIProxy(): UIProxy {
        if (!this._UIProxy) {
            this._UIProxy = this.facade.retrieveProxy(UIProxy.NAME) as UIProxy;
        }
        return this._UIProxy;
    }
}
