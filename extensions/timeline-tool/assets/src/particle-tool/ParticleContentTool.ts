import { _decorator, Component, ParticleSystem, Color, UIMeshRenderer } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('ParticleContentTool')
export class ParticleContentTool extends Component {
    private ParticleList: ParticleSystem[] = [];
    private uiMeshRenderer: UIMeshRenderer[] = [];

    private needUpdate: boolean = false;

    private ParticleRateOverTime: number[] = [];

    private isStopEmitting: boolean = false;

    @property({
        tooltip: '勾起時為循環粒子模式,註:子物件的ParticleSystem的粒子如需循環還是需開啟Loop',
        displayName: '粒子循環設定'
    })
    public IsLoop: boolean = false;

    @property({ tooltip: '子物件的ParticleSystem的粒子初始填色', displayName: '初始粒子填色' })
    public InitColor: Color = new Color(255, 255, 255, 255);

    @property({
        tooltip: '如有循環狀態,0為無限循環時間,直到等待關閉為止,接續數字為持續秒數,註:填1為1秒',
        displayName: '循環時間'
    })
    public LoopOverTime: number = 0;

    @property({ tooltip: '將會在設定的秒數之後清除相關表現', displayName: '清除物件時間' })
    public ClearObjectTime: number = 4;

    //粒子抓取資訊-----------------------------------------------------------------------------------------------------------------------------
    onLoad() {
        this.ParticleList = this.getComponentsInChildren(ParticleSystem);
        this.uiMeshRenderer = this.getComponentsInChildren(UIMeshRenderer);
    }

    //清除粒子抓取資訊-----------------------------------------------------------------------------------------------------------------------------
    start() {
        this.ParticleClear();
    }

    //粒子播放-----------------------------------------------------------------------------------------------------------------------------
    public ParticlePlay(DelayTime: number = 0, color: Color = null) {
        if (this.needUpdate) {
            for (let i = 0; i < this.ParticleList.length; i++) {
                this.ParticleList[i].rateOverTime.constant = this.ParticleRateOverTime[i];
            }
            this.needUpdate = false;
        }
        if (color != null) {
            this.SetParticleAlpha(color);
        }

        if (color != null) {
            this.SetParticleColor(color);
        }
        this.unscheduleAllCallbacks();
        this.scheduleOnce(this.particlePlay.bind(this), DelayTime);
    }

    //設置粒子透明度-----------------------------------------------------------------------------------------------------------------------------
    public SetParticleAlpha(color: Color = this.InitColor) {
        for (let i = 0; i < this.ParticleList.length; i++) {
            let Proportion = color.a / 255;
            if (
                this.ParticleList[i].startColor.color.r == 255 &&
                this.ParticleList[i].startColor.color.g == 255 &&
                this.ParticleList[i].startColor.color.b == 255
            ) {
                this.ParticleList[i].startColor.color = new Color(
                    color.r,
                    color.g,
                    color.b,
                    this.ParticleList[i].startColor.color.a * Proportion
                );
            } else {
                this.ParticleList[i].startColor.color.a = this.ParticleList[i].startColor.color.a * Proportion;
            }
        }
    }

    //設置粒子顏色-----------------------------------------------------------------------------------------------------------------------------
    public SetParticleColor(color: Color = null) {
        if (color != null) {
            for (let i = 0; i < this.ParticleList.length; i++) {
                this.ParticleList[i].startColor.color = new Color(color.r, color.g, color.b, color.a);
            }
        }
    }

    //粒子暫停-----------------------------------------------------------------------------------------------------------------------------
    public ParticlePause() {
        for (let i = 0; i < this.ParticleList.length; i++) {
            this.ParticleList[i].pause();
        }
    }

    //粒子停止發射-----------------------------------------------------------------------------------------------------------------------------
    public ParticleStopEmit() {
        this.isStopEmitting = true;
        this.resetParticleRate();
    }

    //粒子停止發射，並清除粒子-----------------------------------------------------------------------------------------------------------------------------
    public ParticleStop() {
        this.resetParticleRate();
        this.scheduleOnce(this.ParticleClear, this.ClearObjectTime);
    }

    private resetParticleRate() {
        if (this.needUpdate == false) {
            this.needUpdate = true;
            for (let i = 0; i < this.ParticleList.length; i++) {
                this.ParticleRateOverTime[i] = this.ParticleList[i].rateOverTime.constant;
                this.ParticleList[i].rateOverTime.constant = 0;
            }
        }
    }

    //清除粒子-----------------------------------------------------------------------------------------------------------------------------
    public ParticleClear() {
        for (let i = 0; i < this.ParticleList.length; i++) {
            this.ParticleList[i].stop();
            this.ParticleList[i].clear();
            this.ParticleList[i].node.active = false;
        }
    }

    //初始透明度-----------------------------------------------------------------------------------------------------------------------------
    public InitAlpha() {
        for (let i = 0; i < this.ParticleList.length; i++) {
            if (this.ParticleList[i].startColor.color.a != 255) {
                this.ParticleList[i].startColor.color.a = 255;
            } else if (
                this.ParticleList[i].startColor.color.r != 255 &&
                this.ParticleList[i].startColor.color.g != 255 &&
                this.ParticleList[i].startColor.color.b != 255 &&
                this.ParticleList[i].startColor.color.a != 255
            ) {
                this.ParticleList[i].startColor.color = Color.WHITE;
            }
        }
    }

    //粒子播放設定-----------------------------------------------------------------------------------------------------------------------------
    private particlePlay() {
        if (this.isStopEmitting == false) {
            this.toggleUIMeshRenderer();
            this.particleListPlay(true);
        } else {
            this.particleListPlay(false);
        }
        this.isStopEmitting = false;

        if (this.IsLoop == true) {
            if (this.LoopOverTime != 0) {
                this.scheduleOnce(this.ParticleStop.bind(this), this.LoopOverTime);
            }
        } else if (this.IsLoop == false) {
            this.scheduleOnce(this.ParticleStop.bind(this), this.ClearObjectTime);
        }
    }

    // 播放粒子之前先關閉UIMeshRenderer一幀再開啟，避免粒子第一幀會有舊的粒子殘留問題
    private toggleUIMeshRenderer() {
        for (let i = 0; i < this.uiMeshRenderer.length; i++) {
            this.uiMeshRenderer[i].enabled = false;
            this.scheduleOnce(() => {
                this.uiMeshRenderer[i].enabled = true;
            }, 0.02);
        }
    }

    private particleListPlay(isClear: boolean) {
        for (let i = 0; i < this.ParticleList.length; i++) {
            this.ParticleList[i].node.active = true;
            if (isClear) {
                this.ParticleList[i].clear();
            }
            this.ParticleList[i].play();
        }
    }
}
