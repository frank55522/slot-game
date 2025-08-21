import { _decorator, Enum, math, Node, SystemEvent, UITransform, Vec2 } from 'cc';
import BaseView from 'src/base/BaseView';
import { GameSceneOption } from 'src/sgv3/vo/data/GameScene';
import { SpinAreaViewMediator } from '../mediator/SpinAreaViewMediator';
const { ccclass, property } = _decorator;

@ccclass('SpinAreaSceneSetting')
export class SpinAreaSceneSetting {
    @property({ type: Enum(GameSceneOption) })
    public sceneName: GameSceneOption = GameSceneOption.Game_1;
    @property({ type: Vec2 })
    public pos: Vec2 = new Vec2();
    @property({ type: math.Size })
    public size: math.Size = new math.Size();
}

@ccclass('SpinAreaView')
export class SpinAreaView extends BaseView {
    @property({ type: Node })
    public spinButton: Node | null = null;
    @property({ type: [SpinAreaSceneSetting] })
    public spinAreaSceneSetting: Array<SpinAreaSceneSetting> = [];

    public buttonCallback: SpinAreaViewMediator;

    private _spinAreaSize: math.Size = null;
    private get spinAreaSize(): math.Size {
        if (this._spinAreaSize == null) {
            this._spinAreaSize = this.spinButton.getComponent(UITransform).contentSize;
        }
        return this._spinAreaSize;
    }

    onLoad() {
        super.onLoad();
        this.registerPanelButton();
    }

    private registerPanelButton() {
        this.spinButton.on(SystemEvent.EventType.TOUCH_END, this.buttonCallback.spin, this.buttonCallback);
    }

    public changeAreaSize(scene: string) {
        const setting = this.spinAreaSceneSetting.find((setting) => GameSceneOption[setting.sceneName] === scene);
        if (setting) {
            this.node.active = true;
            this.node.setPosition(setting.pos.x, setting.pos.y);
            this.spinAreaSize.set(setting.size);
        } else {
            this.node.active = false;
        }
    }
}
