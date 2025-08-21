import { _decorator, Component, Node, Vec3, math, UITransform, SpriteFrame, Sprite, Enum, CCBoolean } from 'cc';
import { OrientationSetting } from '../../core/ui/UIOrientation';
import { GameScene, GameSceneOption } from '../../sgv3/vo/data/GameScene';
const { ccclass, property } = _decorator;

@ccclass('OriSetting')
export class OriSetting extends OrientationSetting {
    @property({})
    public isChangeRotation: boolean = false;

    @property({})
    public isChangeSprite: boolean = false;

    @property({
        visible() {
            return this.isChangeRotation;
        }
    })
    public rotation: Vec3 = new Vec3();

    @property({
        type: SpriteFrame,
        visible() {
            return this.isChangeSprite;
        }
    })
    public sprite: SpriteFrame | null = null;
}

@ccclass('SceneOrientationSetting')
export class SceneOrientationSetting {
    @property({ type: Enum(GameSceneOption), visible: true })
    public _scene: GameSceneOption = GameSceneOption.Game_1;

    public get scene(): string {
        return GameSceneOption[this._scene];
    }

    @property({ type: OriSetting, visible: true })
    public _horizontalSetting: OriSetting = new OriSetting();
    @property({ type: OriSetting, visible: true })
    public _verticalSetting: OriSetting = new OriSetting();
}

@ccclass('GameUIOrientationSetting')
export class GameUIOrientationSetting extends Component {
    @property({ type: [SceneOrientationSetting], visible: true })
    public sceneOrientationSetting: Array<SceneOrientationSetting> = [];

    private _curSetting: OriSetting = new OriSetting();

    private _transform: UITransform | null = null;

    private _sprite: Sprite | null = null;

    private get uiTransform() {
        if (this._transform == null) {
            this._transform = this.getComponent(UITransform);
        }
        return this._transform;
    }

    private get sprite() {
        if (this._sprite == null) {
            this._sprite = this.getComponent(Sprite);
        }
        return this._sprite;
    }

    public changeOrientation(isHorizontal: boolean, curScene: string) {
        let self = this;
        let setting = self.sceneOrientationSetting.find((setting) => setting.scene == curScene);

        setting??=self.sceneOrientationSetting.find((setting) => setting.scene == GameScene.Game_1);
        if(!setting) return;

        self._curSetting = isHorizontal ? setting._horizontalSetting : setting._verticalSetting;

        if (self._curSetting.isChangeScale) self.node.scale = self._curSetting.scale;
        if (self._curSetting.isChangePosition) self.node.position = self._curSetting.position;
        if (self._curSetting.isChangeContentSize) self.uiTransform.setContentSize(self._curSetting.size);
        if (self._curSetting.isChangeSprite) self.sprite.spriteFrame = self._curSetting.sprite;
        if (self._curSetting.isChangeRotation) self.node.eulerAngles = self._curSetting.rotation;
    }
}
