import { _decorator, Component, Color, Sprite, SpriteFrame } from 'cc';
import { ParticleContentTool } from 'ParticleContentTool';
import { TimelineTool } from 'TimelineTool';

const { ccclass, property } = _decorator;

@ccclass('MiniIngot')
export class MiniIngot extends Component {
    @property(TimelineTool) private IngotAnimation: TimelineTool | null = null;

    @property(TimelineTool) private IconAnimation: TimelineTool | null = null;

    @property(Sprite) private IconSprite: Sprite | null = null;

    @property(Sprite) private TextSprite: Sprite | null = null;

    @property(Sprite) private IconSpriteLight: Sprite | null = null;

    @property(SpriteFrame) private SpriteIconFrame: SpriteFrame[] = [];

    @property(SpriteFrame) private IconSpriteLightFrame: SpriteFrame[] = [];

    @property(Sprite) private SpriteTextArray: Array<Sprite> = [];

    @property(ParticleContentTool) private Particle: ParticleContentTool | null = null;

    @property(Color) private Color: Color[] = [];

    @property(Color) private ParticleColor: Color[] = [];

    private ThisSingleJackPotType = 0;

    private CallBack: any = null;

    start() {
        this.IconSpriteLight.node.active = false;
    }

    public OnIngotShow() {
        this.IngotAnimation?.play('ShowImmediately');
        this.IconSpriteLight.node.active = false;
    }

    public OnIngotPlayShow() {
        this.scheduleOnce(() => this.IngotAnimation?.play('Show'), Math.random() * 0.2);
        this.IconSpriteLight.node.active = false;
    }

    public OnIngotPlaySelect(JackPotType: number = 0, LanguageType: number = 0, playAnim: boolean) {
        this.ThisSingleJackPotType = JackPotType;

        if (playAnim) {
            this.scheduleOnce(() => {
                this.IconSpriteLight.node.active = true;
                this.IconAnimation?.play('Select');
            }, 0.3);
        } else {
            this.IconSpriteLight.node.active = true;
            this.IconAnimation?.play('ShowImmediately');
        }

        this.IconSpriteLight.color = this.Color[this.ThisSingleJackPotType];

        this.IconSpriteLight.spriteFrame = this.IconSpriteLightFrame[this.ThisSingleJackPotType];

        this.IconSprite.spriteFrame = this.SpriteIconFrame[this.ThisSingleJackPotType];

        for (let i = 0; i < this.SpriteTextArray.length; i++) {
            this.SpriteTextArray[i].node.active = i == JackPotType;
        }

        if (playAnim) {
            this.IngotAnimation?.play('Select');
        } else {
            this.IngotAnimation?.play('Hide');
        }
    }

    public OnIconPlayPrepare() {
        this.IconSpriteLight.node.active = false;
        this.Particle.node.active = true;
        this.Particle?.SetParticleColor(this.ParticleColor[this.ThisSingleJackPotType]);

        this.IconAnimation?.play('PrepareLight');
    }

    public OnIconPlayWin(cb: any | null = null) {
        this.IconSpriteLight.node.active = false;
        this.Particle.node.active = true;
        this.Particle?.SetParticleColor(this.ParticleColor[this.ThisSingleJackPotType]);

        this.IconAnimation?.play('Win');
    }

    public OnIconPlayNoSelect() {
        this.IconSpriteLight.node.active = false;

        this.IconAnimation?.play('NoWin');
    }

    public OnIngotPlayNoSelect() {
        this.IngotAnimation?.play('NoSelect');
    }

    public OnIconHide() {
        this.IconSpriteLight.node.active = false;

        this.IngotAnimation?.play('Hide');

        this.IconAnimation?.play('Hide');
        this.Particle.node.active = false;
    }
}
