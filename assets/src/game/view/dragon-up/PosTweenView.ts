import { instantiate, NodePool, Prefab, Vec3, _decorator, Node, tween, CCFloat, Tween } from 'cc';
import { PoolManager } from '../../../sgv3/PoolManager';
import { BezierUtils } from '../../../sgv3/util/BezierUtils';
import { ParticleContentTool } from 'ParticleContentTool';
import { MultipleBoard } from './MultipleBoard';
import { PosTweenObject } from './PosTweenObject';
import BaseView from 'src/base/BaseView';
const { ccclass, property } = _decorator;

@ccclass('PosTweenView')
export class PosTweenView extends BaseView {
    @property({ type: MultipleBoard, visible: true })
    private _multipleBoard: MultipleBoard | null = null;
    @property({ type: Prefab, visible: true })
    private prefab: Prefab | null = null;
    @property({ type: Prefab, visible: true })
    private particlePrefab: Prefab | null = null;

    @property({ type: CCFloat, visible: true })
    private accelerateTime: number = 0;

    private defaultMultiple: number = 100;

    private prefabPool: NodePool | null = null;

    private callback: Function | null = null;

    public curTween: Tween<Node> | null = null;

    public curObject: PosTweenObject | null = null;

    public arrayObject: Array<PosTweenObject> = new Array<PosTweenObject>();

    private arrayIndex: Array<number> = new Array<number>();

    public get multipleBoard() {
        return this._multipleBoard;
    }

    public init(accMultiple: number) {
        this.multipleBoard.multiple = accMultiple > 0 ? accMultiple : this.defaultMultiple;
        this.multipleBoard.updateLabelText();
    }

    public clonePrefab() {
        this.curObject = this.clone(this.node).getComponent(PosTweenObject);
    }

    public cloneArrayPrefab() {
        this.arrayObject.push(this.clone(this.node).getComponent(PosTweenObject));
    }

    public clearPool() {
        this.prefabPool.clear();
    }

    public onCollectCredit2Ball(targertPos: Vec3) {
        let particleResult: ParticleContentTool = PoolManager.instance
            .getNode(this.particlePrefab, this.node)
            .getComponent(ParticleContentTool);

        particleResult.node.worldPosition = targertPos;
        particleResult.node.active = true;
        particleResult.ParticlePlay();

        this.scheduleOnce(() => {
            particleResult.ParticleClear();
            particleResult.ParticleStop();
            PoolManager.instance.putNode(particleResult.node);
        }, 0.6);
    }

    public onMultipleAccumulate(targertPos: Vec3, hasRespin: boolean, callback: Function | null = null) {
        this.callback = () => callback();
        this.curObject.node.worldPosition = hasRespin
            ? new Vec3(targertPos.x, targertPos.y - 10, 0)
            : new Vec3(targertPos.x, targertPos.y - 10, 0);
        let convertPos = new Vec3(targertPos.x, this.multipleBoard.node.worldPosition.y);
        this.curTween = tween(this.curObject.node)
            .delay(this.curObject.accelerateDelayTime)
            .then(
                this.getBezierToTween(
                    targertPos,
                    convertPos,
                    this.multipleBoard.node.worldPosition,
                    this.curObject.acceleratePtCount,
                    this.curObject.accelerateTimeBase
                )
            )
            .union()
            .call(() => {
                this.onObjectFinished();
            })
            .start();
    }

    public BoardmultipleRoll(multiple: number, callback: Function | null = null) {
        this.multipleBoard.rollMultiple(multiple, () => callback());
    }

    public onBaseCreditCollect(
        sequenceIndex: number,
        basePos: Vec3,
        targertPos: Vec3,
        callback: Function | null = null
    ) {
        this.arrayIndex.push(sequenceIndex);
        this.callback = (idx) => callback(idx);
        let curObject = this.arrayObject[sequenceIndex];
        curObject.node.worldPosition = basePos;
        tween(curObject.node)
            .to(curObject.baseCreditTime, { worldPosition: targertPos }, { easing: curObject.baseCreditEasing })
            .union()
            .call(() => {
                if (this.callback != null) {
                    this.callback(this.arrayIndex[sequenceIndex]);
                }
            })
            .delay(0.5)
            .call(() => {
                this.onBaseCreditObjectFinished(curObject);
            })
            .start();
    }

    private onBaseCreditObjectFinished(creditObject: PosTweenObject) {
        for (let i in creditObject.Particle) {
            creditObject.Particle[i].ParticleClear();
            creditObject.Particle[i].ParticleStop();
        }
        creditObject.labelText.string = String();
        this.recycled(creditObject.node);
    }

    public onGetMultipleResult(targertPos: Vec3, callback: Function | null = null) {
        this.callback = () => callback();
        this.curObject.node.worldPosition = new Vec3(
            this.multipleBoard.node.worldPosition.x,
            this.multipleBoard.node.worldPosition.y,
            this.multipleBoard.node.worldPosition.z
        );
        let convertPos = new Vec3(this.multipleBoard.node.worldPosition.x, targertPos.y);
        this.scheduleOnce(() => {
            this.multipleBoard.labelText.enabled = false;
        }, 0.01);
        this.curTween = tween(this.curObject.node)
            .delay(this.curObject.accelerateDelayTime)
            .call(() => {
                this.multipleBoard.labelText.enabled = true;
            })
            .then(
                this.getBezierToTween(
                    this.multipleBoard.node.worldPosition,
                    convertPos,
                    targertPos,
                    this.curObject.getResultPtCount,
                    this.curObject.getResultTimeBase
                )
            )
            .union()
            .call(() => {
                this.onObjectFinished();
            })
            .start();
    }

    public onObjectFinished() {
        if (this.curObject != null) {
            this.curObject.labelText.string = String();
            this.recycled(this.curObject.node);
            this.curObject = null;
        }
        if (this.callback != null) {
            this.callback();
        }
    }

    clearArray() {
        if (this.arrayIndex.length > 0) {
            this.arrayIndex = [];
        }
        if (this.arrayObject.length > 0) {
            this.arrayObject = [];
        }
    }

    onLoad() {
        super.onLoad();
        this.prefabPool = new NodePool();
        let temp = instantiate(this.prefab);
        this.prefabPool.put(temp);
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
            let stTween = tween(this.curObject.node).to(this.getPtToPtTime(i, timeParameter), {
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
