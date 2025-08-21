import { _decorator, Component, sp } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('AnimTrackClearTools')
export class AnimTrackClearTools extends Component {
    private spine: sp.Skeleton;

    onLoad() {
        let self = this;
        self.spine = self.getComponent(sp.Skeleton);
    }

    onEnable() {}

    onDisable() {
        let self = this;
        self.spine.clearTracks();
        self.spine.setAnimation(0, '', false);
    }
}
