import { _decorator, Component, Color, Sprite, SpriteFrame, Prefab, Vec3 } from 'cc';
import { PoolManager } from '../../sgv3/PoolManager';
import { ParticleContentTool } from 'ParticleContentTool';
import { TimelineTool } from 'TimelineTool';

const { ccclass, property } = _decorator;

@ccclass('ParticleEffect')
export class ParticleEffect {
    @property(ParticleContentTool)
    public Particle: ParticleContentTool | null = null;
    @property(Color)
    public Color: Color[] = [];
}

@ccclass('MiniResultBoard')
export class MiniResultBoard extends Component {
    @property(TimelineTool) private BoardAnimation: TimelineTool | null = null;

    @property(Sprite) private BoardSprite: Sprite[] = [];

    @property(Sprite) private TextSprite: Sprite | null = null;

    @property(Sprite) private SpriteLight: Sprite | null = null;

    @property(SpriteFrame) private SpriteBoardFrame: SpriteFrame[] = [];

    @property(Sprite) private SpriteTextArray: Array<Sprite> = [];

    @property(Color) private SpriteLightColor: Color[] = [];

    @property({ type: ParticleEffect })
    public ParticleEffects: ParticleEffect[] = [];

    @property({ type: Prefab })
    public particlePrefab: Prefab | null = null;
    private winCoinFall: ParticleContentTool;

    //播放板子(彩金狀態0~4為mini到grand,語系:0為中文1為英文)
    public OnBoardPlay(JackPotType: number = 0, LanguageType: number = 0) {
        this.SetEffectType(JackPotType, LanguageType);
        this.node.active = true;
        this.BoardAnimation?.play('Show');
    }

    public OnBoardDelayPlay(callBack?: Function) {
        this.node.active = true;
        this.BoardAnimation?.play('DelayShow');
    }

    public OnBoardClose() {
        this.BoardAnimation?.play('Hide');
        this.scheduleOnce(() => {
            this.recycleParticle();
            this.node.active = false;
        }, 3);
    }

    //設定JackPotType對應的美術資源(彩金狀態0~4為mini到grand,語系:0為中文1為英文)
    public SetEffectType(JackPotType: number = 0, LanguageType: number = 0) {
        this.setParitcleEffects(JackPotType);

        for (let i = 0; i < this.BoardSprite.length; i++) {
            this.BoardSprite[i].spriteFrame = this.SpriteBoardFrame[JackPotType];
        }

        for (let i = 0; i < this.SpriteTextArray.length; i++) {
            this.SpriteTextArray[i].node.active = i == JackPotType;
        }

        this.SpriteLight.color = this.SpriteLightColor[JackPotType];
    }

    public playWinCoinFall() {
        this.winCoinFall = PoolManager.instance
            .getNode(this.particlePrefab, this.BoardAnimation.node)
            .getComponent(ParticleContentTool);
        this.winCoinFall.node.position = new Vec3(0, 540, 0);
        this.winCoinFall.node.setSiblingIndex(1);
        this.winCoinFall.ParticlePlay(0.5);
    }

    public stopWinCoinFall() {
        this.winCoinFall.ParticleStop();
    }

    public recycleParticle() {
        PoolManager.instance.putNode(this.winCoinFall.node);
        this.winCoinFall = null;
    }

    setParitcleEffects(JackPotType: number = 0) {
        this.ParticleEffects?.forEach((value) => {
            value.Particle?.SetParticleColor(value.Color[JackPotType]);
        });
    }
}
