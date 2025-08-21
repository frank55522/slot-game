import { _decorator, Prefab } from 'cc';
import { SceneManager } from '../../core/utils/SceneManager';
import { GameUIOrientationSetting } from '../vo/GameUIOrientationSetting';
import { PosTweenView } from './dragon-up/PosTweenView';
import BaseView from 'src/base/BaseView';
const { ccclass, property } = _decorator;

@ccclass('Game_4_View')
export class Game_4_View extends BaseView {
    public static readonly HORIZONTAL: string = 'horizontal';
    public static readonly VERTICAL: string = 'vertical';

    @property({ type: Prefab})
    public reelPrefab: Prefab | null = null;

    @property({ type: PosTweenView })
    private posTweenView: PosTweenView | null = null;

    private _gameUIOrientation: Array<GameUIOrientationSetting> | null = null;

    private get gameUIOrientation() {
        if (this._gameUIOrientation == null) {
            this._gameUIOrientation = this.getComponentsInChildren(GameUIOrientationSetting);
        }
        return this._gameUIOrientation;
    }

    protected onLoad() {
        super.onLoad();
    }

    public init(accMultiple: number) {
        this.posTweenView.init(accMultiple);
    }

    public togglePosTweenView(enabled: boolean) {
        this.posTweenView.node.active = enabled;
    }

    public changeOrientation(orientation: string, scene: string) {
        let ishorizontal = orientation == SceneManager.EV_ORIENTATION_HORIZONTAL;

        for (let i = 0; i < this.gameUIOrientation.length; i++) {
            this.gameUIOrientation[i].changeOrientation(ishorizontal, scene);
        }
    }
}
