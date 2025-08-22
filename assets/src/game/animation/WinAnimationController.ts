import { _decorator, Component, Node, tween, Vec3 } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('WinAnimationController')
export class WinAnimationController extends Component {
    /**
     * 靜態方法：對任意 Node 播放勝利動畫
     * 不需要在編輯器中綁定，純程式碼調用
     */
    public static playWinAnimationOnNode(node: Node, delay: number = 0) {
        if (!node) return;

        const originalScale = node.scale.clone();

        tween(node)
            .delay(delay)
            .to(0.2, { scale: new Vec3(1.2, 1.2, 1) })
            .to(0.1, { scale: new Vec3(0.9, 0.9, 1) })
            .to(0.1, { scale: new Vec3(1.1, 1.1, 1) })
            .to(0.1, { scale: originalScale })
            .start();
    }

    /**
     * 靜態方法：對多個 Node 播放勝利動畫
     */
    public static playWinAnimationOnNodes(nodes: Node[]) {
        nodes.forEach((node, index) => {
            if (node) {
                const delay = index * 0.1; // 錯開動畫時間
                WinAnimationController.playWinAnimationOnNode(node, delay);
            }
        });
    }

    /**
     * 靜態方法：停止 Node 的動畫
     */
    public static stopAnimationOnNode(node: Node) {
        if (node) {
            tween(node).stop();
        }
    }

    /**
     * 靜態方法：停止多個 Node 的動畫
     */
    public static stopAnimationOnNodes(nodes: Node[]) {
        nodes.forEach(node => {
            WinAnimationController.stopAnimationOnNode(node);
        });
    }
}