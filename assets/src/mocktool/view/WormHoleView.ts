import {
    _decorator,
    EventTouch,
    SystemEvent,
    Vec3,
    Vec2,
    systemEvent,
    UITransform,
    math,
    tween,
    Tween,
    Camera,
    UIOpacity
} from 'cc';
import BaseView from 'src/base/BaseView';
const { ccclass } = _decorator;

@ccclass('WormHoleView')
export class WormHoleView extends BaseView {
    private listener: IWormHoleView;

    private clickedCount: number;
    private holeRadius: number;
    private holeTween: Tween<UIOpacity>;
    private holeOpacity: UIOpacity;
    private camera: Camera;

    private opacityOpaque: number = 255;
    private opacityTransparent: number = 0;
    private timeoutId: number = 0;

    protected onLoad() {
        super.onLoad();
    }

    public initView(l: IWormHoleView) {
        const self = this;

        self.listener = l;
        self.clickedCount = 0;
    }

    start() {
        const self = this;

        self.camera = self.node.parent.getComponentInChildren(Camera);
        self.holeRadius = self.node.getComponent(UITransform).contentSize.width * 0.5;
        self.holeOpacity = self.node.getComponentInChildren(UIOpacity);
        self.holeOpacity.opacity = this.opacityTransparent;
    }

    private onMove(evt?: any): void {
        const self = this;
        const parentNode = self.node.parent;

        let touchPos = self.camera.screenToWorld(new Vec3(evt.getLocationX(), evt.getLocationY(), -0.5));
        let holePos = self.node.worldPosition;
        const distance = Vec2.distance(new Vec2(touchPos.x, touchPos.y), new Vec2(holePos.x, holePos.y));
        // 以觸控位置和目標位置之間的距離來判斷是否接觸到目標
        if (distance < self.holeRadius) {
            let pos = new Vec3();
            pos.x = touchPos.x - parentNode.position.x;
            pos.y = touchPos.y - parentNode.position.y;

            self.node.setWorldPosition(pos);
            self.holeOpacity.opacity = this.opacityOpaque;
        }
    }

    private onClick(evt: EventTouch): void {
        const self = this;

        self.holeOpacity.opacity = this.opacityOpaque;

        if (self.holeTween == null) {
            self.holeTween = tween(self.holeOpacity).to(0.5, { opacity: 0 }).union();
        }
        self.holeTween.stop();
        self.holeTween.start();
        if (self.timeoutId) {
            clearTimeout(self.timeoutId);
        }
        self.timeoutId = setTimeout(self.resetClickedCount.bind(self), 600);
        self.clickedCount++;

        if (self.clickedCount >= 2) {
            self.node.pauseSystemEvents(true);
            if (systemEvent.hasEventListener(SystemEvent.EventType.TOUCH_MOVE, self.onMove, self))
                systemEvent.off(SystemEvent.EventType.TOUCH_MOVE, self.onMove, self);
            self.resetClickedCount();
            self.listener.onDoubleClick(evt);
        }
    }

    private resetClickedCount(): void {
        this.clickedCount = 0;
    }

    public enableClickedArea(): void {
        const self = this;

        self.node.resumeSystemEvents(true);
        if (systemEvent.hasEventListener(SystemEvent.EventType.TOUCH_MOVE, self.onMove, self) == false)
            systemEvent.on(SystemEvent.EventType.TOUCH_MOVE, self.onMove, self);
    }

    public registerTouchEvent() {
        const self = this;

        self.node.on(SystemEvent.EventType.TOUCH_END, self.onClick, self);
        self.node.on(SystemEvent.EventType.TOUCH_MOVE, self.onMove, self); // 不註冊這個，在 node 上會偵測不到 touch move
        systemEvent.on(SystemEvent.EventType.TOUCH_MOVE, self.onMove, self); // 為了實現 touch move enter
    }
}

export interface IWormHoleView {
    onDoubleClick(evt: EventTouch);
}
