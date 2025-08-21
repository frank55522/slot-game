import { _decorator, Camera, Tween, tween, Label, Node } from 'cc';
import BaseView from 'src/base/BaseView';
import { ResManager } from 'src/core/utils/ResManager';
const { ccclass, property } = _decorator;

@ccclass('LoadingView')
export class LoadingView extends BaseView {
    public static readonly HORIZONTAL: string = 'horizontal';
    public static readonly VERTICAL: string = 'vertical';

    @property({ type: Node })
    public pending: Node;

    @property({ type: Camera })
    public mainCamera: Camera;

    public curProgress: number = 0;
    private targetProgress: number = 0;
    private progressDuration: number;
    private progressTween: Tween<LoadingView>;
    private isIntroBGLoadComplete = false;

    protected onLoad() {
        super.onLoad();
        this.pending.active = false;
        this.mainCamera.enabled = false;
    }

    start(): void {
        ResManager.instance.recordAssetByNode(this.node, false);
    }

    protected onDestroy(): void {
        super.onDestroy();
        ResManager.instance.releaseNodeAsset(this.node);
    }

    protected update() {
        if (this.isIntroBGLoadComplete == false) {
            // 通知 Container 關閉品牌載入頁面，並顯示遊戲畫面
            this.notifyParentLoadingComplete();
            this.isIntroBGLoadComplete = true;
        }
    }

    /**更改orientation mode */
    public changeOrientation(mode: string, scene: string) {
        let ishorizontal = mode == LoadingView.HORIZONTAL;
    }

    // 隱藏所有內容
    public hideContent(): void {
        this.mainCamera.enabled = true;
        this.selfDestruct();
    }

    // 設定進度
    public setProgress(position: number): void {
        this.targetProgress = position * 0.2 + 0.8;
        if (this.targetProgress < 1) {
            this.progressDuration = 1.5;
        } else {
            this.progressDuration = 0.2;
        }
        this.progressTween?.stop();
        this.progressTween = tween(<LoadingView>this)
            .to(
                this.progressDuration,
                { curProgress: this.targetProgress },
                {
                    onUpdate: (target: LoadingView) => this.onUpdateProgress(target)
                }
            )
            .start();
    }

    private onUpdateProgress(target: LoadingView) {
        // do nothing
    }

    // pending loading顯示
    public showPendingLoading() {
        this.pending.active = true;
        let loading = this.pending.getComponentInChildren(Label);
        tween(loading.color).to(0.75, { a: 150 }).to(0.75, { a: 255 }).union().repeatForever().start();
    }

    // extend 資源 loading 完畢
    public loadingComplete() {
        this.pending.destroy();
        this.pending = null;
        this.selfDestruct();
    }

    private selfDestruct() {
        if (!this.pending && this.mainCamera.enabled) {
            this.node.destroy();
        }
    }

    private notifyParentLoadingComplete() {
        // 通知 Container 關閉Loading頁面
        let url_string = window.location.href;
        let url = new URL(url_string);
        var cUrl = url.searchParams.get('curl');
        window.parent.postMessage(
            JSON.stringify({
                name: 'setLoading',
                data: false
            }),
            cUrl
        );
    }
}
