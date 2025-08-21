import { _decorator, Node, Prefab, CCFloat, NodePool, Tween, Vec3, tween, instantiate } from 'cc';
import { BezierUtils } from '../../sgv3/util/BezierUtils';
import { CreditTweenObject } from './CreditTweenObject';
import BaseView from 'src/base/BaseView';
const { ccclass, property } = _decorator;

@ccclass('BallCreditTweenView')
export class BallCreditTweenView extends BaseView {
    @property({ type: Node })
    private effectTarget: Node | null = null;
    @property({ type: Prefab })
    private prefab: Prefab | null = null;

    @property({ type: CCFloat, visible: true })
    private accelerateTime: number = 0;

    private maxCount: number = 6;

    private isHorizontalMode: boolean = true;

    private prefabPool: NodePool | null = null;

    private callback: Function | null = null;

    public curTween: Tween<Node> | null = null;

    public curObject: CreditTweenObject | null = null;

    public clonePrefab() {
        this.curObject = this.clone(this.node).getComponent(CreditTweenObject);
    }

    public clearPool() {
        this.prefabPool.clear();
    }

    public onBaseCreditCollect(basePos: Vec3, callback: Function | null = null) {
        this.callback = () => callback();
        this.curObject.node.worldPosition = basePos;
        let axisX = (this.effectTarget.worldPosition.x - basePos.x) * 0.7 + basePos.x;
        let axisY = (this.effectTarget.worldPosition.y - basePos.y) * 0.3 + basePos.y;
        let convertPos = new Vec3(axisX, axisY);
        this.curTween = tween(this.curObject.node)
            .delay(this.curObject.delayTime)
            .then(
                this.getBezierToTween(
                    basePos,
                    convertPos,
                    this.effectTarget.worldPosition,
                    this.curObject.ptCount,
                    this.curObject.timeInterval
                )
            )
            .union()
            .call(() => {
                this.onObjectFinished();
            })
            .start();
    }

    /** 更改orientation mode */
    public changeOrientation(ishorizontal: boolean) {
        if (this.isHorizontalMode == ishorizontal) {
            return;
        }

        if (this.curTween != null) {
            this.curTween.stop();
            this.curTween.removeSelf();
        }

        this.isHorizontalMode = ishorizontal;
        if (this.curObject != null) {
            this.onObjectFinished();
        }
    }

    public onObjectFinished() {
        if (this.curObject != null) {
            this.recycled(this.curObject.node);
            this.curObject = null;
        }
        if (this.callback != null) {
            this.callback();
        }
    }

    onLoad() {
        super.onLoad();
        this.prefabPool = new NodePool();

        for (let i = 0; i < this.maxCount; i++) {
            let temp = instantiate(this.prefab);
            this.prefabPool.put(temp);
        }
    }

    private clone(parentNode: Node): Node {
        let temp = null;
        if (this.prefabPool.size() > 0) {
            temp = this.prefabPool.get();
        } else {
            temp = instantiate(this.prefab);
        }
        temp.parent = parentNode;
        return temp;
    }

    private recycled(prefab: Node) {
        this.prefabPool.put(prefab);
    }

    private getBezierToTween(
        startPos: Vec3,
        convertPos: Vec3,
        endPos: Vec3,
        segmentNum: number,
        timeParameter: number
    ) {
        let posArray = BezierUtils.GetBeizerList(startPos, convertPos, endPos, segmentNum);
        let tempTween = tween(this.curObject.node);
        for (let i = 0; i < posArray.length; i++) {
            let stTween = tween(this.curObject.node).to(timeParameter, {
                worldPosition: posArray[i]
            });
            tempTween.then(stTween);
        }
        return tempTween;
    }

    private getPtToPtTime(index: number, moveTime: number) {
        let tempTime = moveTime - index * this.accelerateTime;
        return tempTime > 0 ? tempTime : 0.01;
    }
}
