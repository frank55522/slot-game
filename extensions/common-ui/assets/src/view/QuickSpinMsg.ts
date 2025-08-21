import { _decorator, Component, UIOpacity, Tween, tween } from 'cc';
import { LocalizedLabel } from 'i18n/LocalizedLabel';
const { ccclass } = _decorator;

@ccclass('QuickSpinMsg')
export class QuickSpinMsg extends Component {
    private uiOpacity: UIOpacity;
    private showTween: Tween<UIOpacity>;

    private _localizedLabel: LocalizedLabel;
    private get localizedLabel(): LocalizedLabel {
        if (this._localizedLabel == null) {
            this._localizedLabel = this.getComponentInChildren(LocalizedLabel);
        }
        return this._localizedLabel;
    }

    onLoad() {
        this.uiOpacity = this.getComponent(UIOpacity);
        this.initTween();
    }

    private initTween() {
        this.showTween = tween(this.uiOpacity)
            .to(0.5, { opacity: 255 })
            .delay(1)
            .to(
                0.5,
                { opacity: 0 },
                {
                    onComplete: (target) => {
                        (target as UIOpacity).node.active = false;
                    }
                }
            )
            .union();
    }

    public showMsg(state: boolean, isShow: boolean) {
        if (!isShow) return;
        this.node.active = true;
        this.uiOpacity.opacity = 0;
        this.localizedLabel._key = state ? 'quickSpinEnabled' : 'quickSpinDisabled';

        this.showTween.stop();
        this.showTween.start();
    }
}
