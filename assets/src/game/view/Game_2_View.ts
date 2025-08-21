import { director, instantiate, Prefab, _decorator } from 'cc';
import { SceneManager } from '../../core/utils/SceneManager';
import { GameUIOrientationSetting } from '../vo/GameUIOrientationSetting';
import BaseView from 'src/base/BaseView';
const { ccclass, property } = _decorator;

@ccclass('Game_2_View')
export class Game_2_View extends BaseView {
    public static readonly HORIZONTAL: string = 'horizontal';
    public static readonly VERTICAL: string = 'vertical';

    @property({ type: Prefab})
    public reelPrefab: Prefab | null = null;
    @property({ type: [Prefab], visible: true })
    private loadPrefab: Array<Prefab> | null = [];

    private _gameUIOrientation: Array<GameUIOrientationSetting> | null = null;

    private get gameUIOrientation() {
        if (this._gameUIOrientation == null) {
            this._gameUIOrientation = this.getComponentsInChildren(GameUIOrientationSetting);
        }
        return this._gameUIOrientation;
    }

    protected onLoad() {
        super.onLoad();
        for (let i = 0; i < this.loadPrefab.length; i++) {
            let loadPrefab = instantiate(this.loadPrefab[i]);
            director.getScene().addChild(loadPrefab);
            loadPrefab.parent = this.node;
        }
    }

    public changeOrientation(orientation: string, scene: string) {
        let ishorizontal = orientation == SceneManager.EV_ORIENTATION_HORIZONTAL;
        for (let i = 0; i < this.gameUIOrientation.length; i++) {
            this.gameUIOrientation[i].changeOrientation(ishorizontal, scene);
        }
    }
}
