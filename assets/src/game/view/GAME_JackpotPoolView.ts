import { _decorator, Label, Node, tween, Vec3 } from 'cc';
import { Logger } from '../../core/utils/Logger';
import { SceneManager } from '../../core/utils/SceneManager';
import { BalanceUtil } from '../../sgv3/util/BalanceUtil';
import { JackpotPool } from '../../sgv3/util/Constant';
import { GameScene } from '../../sgv3/vo/data/GameScene';
import { GameUIOrientationSetting } from '../vo/GameUIOrientationSetting';
import BaseView from 'src/base/BaseView';
import { TimelineTool } from 'TimelineTool';
import { LayerManager } from 'src/core/utils/LayerManager';

const { ccclass, property } = _decorator;

@ccclass('GAME_JackpotPoolView')
export class GAME_JackpotPoolView extends BaseView {
    public static readonly HORIZONTAL: string = 'horizontal';
    public static readonly VERTICAL: string = 'vertical';
    private orientationState: string;

    @property({ type: Number })
    public anotherRenderOrder: number;
    @property({ type: Node })
    public jackpotPoolGrand: Node;
    @property({ type: Node })
    public jackpotPoolMajor: Node;
    @property({ type: Node })
    public jackpotPoolMinor: Node;
    @property({ type: Node })
    public jackpotPoolMini: Node;
    @property({ type: Node })
    public jackpotLogo: Node;

    // 彩金池 Label
    @property({ type: Label })
    public grandAmount: Label;
    @property({ type: Label })
    public majorAmount: Label;
    @property({ type: Label })
    public minorAmount: Label;
    @property({ type: Label })
    public miniAmount: Label;

    @property({ type: Label })
    public grandAmountInFreeGame: Label;

    // 加押特效
    @property({ type: TimelineTool })
    public raiseJackpotFX: TimelineTool;

    // 滾分 - 動畫用暫時分數
    public tempGrandAmount: number = 0;
    public tempMajorAmount: number = 0;
    public tempMinorAmount: number = 0;
    public tempMiniAmount: number = 0;

    public totalGrandAmount: number = 0;
    public totalMajorAmount: number = 0;
    public totalMinorAmount: number = 0;
    public totalMiniAmount: number = 0;

    public isOmniChannel: boolean = false;

    private timeoutMap: Map<number, number> = new Map<number, number>();
    private scaleUp: Vec3 = new Vec3(1.2, 1.2);

    // 直橫式轉換
    private _gameUIOrientation: Array<GameUIOrientationSetting> | null = null;

    private get gameUIOrientation() {
        if (this._gameUIOrientation == null) {
            this._gameUIOrientation = this.getComponentsInChildren(GameUIOrientationSetting);
        }
        return this._gameUIOrientation;
    }

    public changeOrientation(orientation: string, scene: string) {
        let ishorizontal = orientation == SceneManager.EV_ORIENTATION_HORIZONTAL;
        for (let i = 0; i < this.gameUIOrientation.length; i++) {
            this.gameUIOrientation[i].changeOrientation(ishorizontal, scene);
        }
    }

    /**更改語系 */
    public changeLocale(locale: string) {}

    public initBonusPool(poolResetValue: number[]) {
        this.clearAllTimeouts();
        // 給 pool 初始倍率
        for (let i = 0; i < poolResetValue.length; i++) {
            //let tempValue = poolResetValue[i] / 100;
            let tempValue = poolResetValue[i];
            switch (i + 1) {
                case JackpotPool.GRAND:
                    this.tempGrandAmount = tempValue;
                    this.totalGrandAmount = tempValue;
                    this.timeoutMap.set(JackpotPool.GRAND, null);
                    break;
                case JackpotPool.MAJOR:
                    this.tempMajorAmount = tempValue;
                    this.totalMajorAmount = tempValue;
                    this.timeoutMap.set(JackpotPool.MAJOR, null);
                    break;
                case JackpotPool.MINOR:
                    this.tempMinorAmount = tempValue;
                    this.totalMinorAmount = tempValue;
                    this.timeoutMap.set(JackpotPool.MINOR, null);
                    break;
                case JackpotPool.MINI:
                    this.tempMiniAmount = tempValue;
                    this.totalMiniAmount = tempValue;
                    this.timeoutMap.set(JackpotPool.MINI, null);
                    break;
            }
        }
        this.updateAllPoolAmount();
    }

    public updateBonusPoolByBetRange(poolId: number, poolValue: number) {
        // 給 pool 更新倍率，Grand 與 Major 連結 Jackpot，不做更新
        switch (poolId + 1) {
            case JackpotPool.GRAND:
                this.tempGrandAmount = poolValue;
                this.updateGrandAmount();
                break;
            case JackpotPool.MAJOR:
                this.tempMajorAmount = poolValue;
                this.updateMajorAmount();
                break;
            case JackpotPool.MINOR:
                this.tempMinorAmount = poolValue;
                this.updateMinorAmount();
                break;
            case JackpotPool.MINI:
                this.tempMiniAmount = poolValue;
                this.updateMiniAmount();
                break;
        }
    }

    public runAmount(_endAmount: number, _poolId: number, _runningTime: number, isForce: boolean): void {
        Logger.i(
            '[JackpotPoolView] runPoolAmount poolId ' +
                _poolId +
                ': ' +
                ' to ' +
                _endAmount +
                ' ,runningTime:' +
                _runningTime
        );

        //開始實作跑分
        //指定跑表時間採固定時間跑表
        switch (_poolId) {
            case JackpotPool.GRAND:
                // Grand
                this.tempGrandAmount = this.totalGrandAmount;
                this.totalGrandAmount = _endAmount;
                if (this.totalGrandAmount < this.tempGrandAmount || isForce) {
                    this.runGrandAmountComplete();
                } else if (this.totalGrandAmount > this.tempGrandAmount) {
                    this.runAmountToTarget(
                        JackpotPool.GRAND,
                        this.tempGrandAmount,
                        this.totalGrandAmount,
                        _runningTime,
                        (currentAmount) => {
                            this.tempGrandAmount = currentAmount;
                            this.updateGrandAmount();
                        },
                        () => {
                            this.runGrandAmountComplete();
                        }
                    );
                }
                break;
            case JackpotPool.MAJOR:
                // Major
                this.tempMajorAmount = this.totalMajorAmount;
                this.totalMajorAmount = _endAmount;
                if (this.totalMajorAmount < this.tempMajorAmount || isForce) {
                    this.runMajorAmountComplete();
                } else if (this.totalMajorAmount > this.tempMajorAmount) {
                    this.runAmountToTarget(
                        JackpotPool.MAJOR,
                        this.tempMajorAmount,
                        this.totalMajorAmount,
                        _runningTime,
                        (currentAmount) => {
                            this.tempMajorAmount = currentAmount;
                            this.updateMajorAmount();
                        },
                        () => {
                            this.runMajorAmountComplete();
                        }
                    );
                }
                break;
            case JackpotPool.MINOR:
                // Minor
                this.tempMinorAmount = this.totalMinorAmount;
                this.totalMinorAmount = _endAmount;
                if (this.totalMinorAmount < this.tempMinorAmount || isForce) {
                    this.runMinorAmountComplete();
                } else if (this.totalMinorAmount > this.tempMinorAmount) {
                    this.runAmountToTarget(
                        JackpotPool.MINOR,
                        this.tempMinorAmount,
                        this.totalMinorAmount,
                        _runningTime,
                        (currentAmount) => {
                            this.tempMinorAmount = currentAmount;
                            this.updateMinorAmount();
                        },
                        () => {
                            this.runMinorAmountComplete();
                        }
                    );
                }
                break;
            case JackpotPool.MINI:
                // Mini
                this.tempMiniAmount = this.totalMiniAmount;
                this.totalMiniAmount = _endAmount;
                if (this.totalMiniAmount < this.tempMiniAmount || isForce) {
                    this.runMiniAmountComplete();
                } else if (this.totalMiniAmount > this.tempMiniAmount) {
                    this.runAmountToTarget(
                        JackpotPool.MINI,
                        this.tempMiniAmount,
                        this.totalMiniAmount,
                        _runningTime,
                        (currentAmount) => {
                            this.tempMiniAmount = currentAmount;
                            this.updateMiniAmount();
                        },
                        () => {
                            this.runMiniAmountComplete();
                        }
                    );
                }
                break;
        }
    }

    public updateFortuneMultiplier(poolFxList: Array<number>) {
        for (let i = 0; i < poolFxList.length; i++) {
            this.playJackpotFX(poolFxList[i]);
        }
    }

    private playJackpotFX(poolId: number) {
        let animName: string = '';
        switch (poolId + 1) {
            case JackpotPool.MAJOR:
                animName = 'Major';
                this.playScaleTween(this.majorAmount.node);
                break;
            case JackpotPool.MINOR:
                animName = 'Minor';
                this.playScaleTween(this.minorAmount.node);
                break;
            case JackpotPool.MINI:
                animName = 'Mini';
                this.playScaleTween(this.miniAmount.node);
                break;
        }
        if (animName != '') {
            this.raiseJackpotFX.play(animName);
        }
    }

    private playScaleTween(target: Node) {
        tween(target).to(0.1, { scale: this.scaleUp }).to(0.1, { scale: Vec3.ONE }).start();
    }

    public updateAllPoolAmount() {
        this.updateGrandAmount();
        this.updateMajorAmount();
        this.updateMinorAmount();
        this.updateMiniAmount();
    }

    public updateGrandAmount() {
        if (!this.tempGrandAmount) return;
        this.grandAmount.string = BalanceUtil.formatBalanceWithDollarSign(this.tempGrandAmount);
        this.grandAmountInFreeGame.string = this.grandAmount.string;
        // 強制更新Label，並同步Grand和Major的字體大小
        this.grandAmount.updateRenderData(true);
        this.majorAmount.fontSize = this.grandAmount.actualFontSize;
    }

    public updateMajorAmount() {
        if (!this.tempMajorAmount) return;
        this.majorAmount.string = BalanceUtil.formatBalanceWithDollarSign(this.tempMajorAmount);
    }

    public updateMinorAmount() {
        if (!this.tempMinorAmount) return;
        this.minorAmount.string = BalanceUtil.formatBalanceWithDollarSign(this.tempMinorAmount, !this.isOmniChannel);
        // 強制更新Label，同步Minor和Mini的字體大小
        this.minorAmount.updateRenderData(true);
        this.miniAmount.fontSize = this.minorAmount.actualFontSize;
    }

    public updateMiniAmount() {
        if (!this.tempMiniAmount) return;
        this.miniAmount.string = BalanceUtil.formatBalanceWithDollarSign(this.tempMiniAmount, !this.isOmniChannel);
    }

    private runGrandAmountComplete() {
        this.grandAmount.string = BalanceUtil.formatBalanceWithDollarSign(this.totalGrandAmount);
        this.grandAmountInFreeGame.string = this.grandAmount.string;
    }

    private runMajorAmountComplete() {
        this.majorAmount.string = BalanceUtil.formatBalanceWithDollarSign(this.totalMajorAmount);
    }

    private runMinorAmountComplete() {
        this.minorAmount.string = BalanceUtil.formatBalanceWithDollarSign(this.totalMinorAmount, !this.isOmniChannel);
    }

    private runMiniAmountComplete() {
        this.miniAmount.string = BalanceUtil.formatBalanceWithDollarSign(this.totalMiniAmount, !this.isOmniChannel);
    }

    public enterGamePos(scene: string) {
        this.setPoolPosByOri(scene, this.orientationState);
    }

    private setPoolPosByOri(gameScene: string, orientation: string) {
        switch (gameScene) {
            case GameScene.Game_1:
            case GameScene.Game_3:
                this.jackpotLogo.active = true;
                this.jackpotPoolGrand.active = true;
                this.jackpotPoolMajor.active = true;
                this.jackpotPoolMinor.active = true;
                this.jackpotPoolMini.active = true;
                break;
            case GameScene.Game_2:
            case GameScene.Game_4:
                this.jackpotLogo.active = false;
                this.jackpotPoolGrand.active = false;
                this.jackpotPoolMajor.active = false;
                this.jackpotPoolMinor.active = false;
                this.jackpotPoolMini.active = false;
                break;
        }
    }
    // 改用 Timeout 來實作滾動彩金池，避免 Turbo mode 引擎加速時，數值滾動太快
    private runAmountToTarget(
        poolId: number,
        start: number,
        target: number,
        duration: number,
        onUpdate: (currentAmount: number) => void,
        onComplete: () => void
    ) {
        const self = this;
        const startTime = performance.now();
        const change = target - start;
        const interval = 33; // ms, 約30FPS

        const updateAmount = () => {
            const currentTime = performance.now();
            const elapsedTime = (currentTime - startTime) / 1000;
            const progress = Math.min(elapsedTime / duration, 1); // 確保進度不超過1

            const currentAmount = start + change * progress;
            onUpdate(currentAmount);

            if (progress < 1) {
                let timeoutId = self.timeoutMap.get(poolId);
                clearTimeout(timeoutId);
                timeoutId = setTimeout(updateAmount, interval);
                self.timeoutMap.set(poolId, timeoutId);
            } else {
                onComplete();
            }
        };

        updateAmount();
    }

    public clearAllTimeouts() {
        this.timeoutMap.forEach((timeoutId, poolId) => {
            clearTimeout(timeoutId);
        });
        this.timeoutMap.clear();
    }

    public setLowerLayer() {
        LayerManager.setLayer(this, this.anotherRenderOrder);
    }

    public restoreLayer() {
        LayerManager.setLayer(this, this.getRenderOrder());
    }
}
