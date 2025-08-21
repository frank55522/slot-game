import { _decorator, Component, Label, Sprite, sp } from 'cc';
import { LocalizedSprite } from './LocalizedSprite';
import { LocalizedLabel } from './LocalizedLabel';
import { LocalizedPosition } from './LocalizedPosition';
import { LocalizedSkeleton } from './LocalizedSkeleton';
const { ccclass, executeInEditMode, menu } = _decorator;

@ccclass('AddLocalizedScript')
@executeInEditMode
@menu('i18n/AddLocalizedScript')
export class AddLocalizedScript extends Component {
    async onEnable() {
        if(this.getComponent(Sprite)) {
            this.addComponent(LocalizedSprite);
        }
        else if(this.getComponent(Label)) {
            this.addComponent(LocalizedLabel);
        }
        else if(this.getComponent(sp.Skeleton)) {
            const skeleton = this.getComponent(sp.Skeleton);
            let dump = await Editor.Message.request('scene', 'query-component', skeleton.uuid);
            skeleton._destroyImmediate();
            let localizedSkeleton = this.addComponent(LocalizedSkeleton);
            await Editor.Message.request('scene', 'set-property', {
                uuid: this.node.uuid,
                path: `__comps__.${this.getComponents(Component).findIndex(val=>val == localizedSkeleton)}`,
                dump: dump
            });
        }
        else {
            this.addComponent(LocalizedPosition);
        }
        this.destroy();
    }
}