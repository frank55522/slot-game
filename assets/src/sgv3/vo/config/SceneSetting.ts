import { TSMap } from '../../../core/utils/TSMap';
import { SceneData } from '../data/SceneData';
import { GameSceneData } from './GameSceneData';

/**
 * 提供給遊戲做場景相關基本資料做設定
 * @author luke
 */
export class SceneSetting extends SceneData {
    constructor() {
        super();
        this.setSceneMap();
    }

    /**
     * 每款遊戲都不一樣需要設定
     *
     * @protected
     * @memberof SceneSetting
     */
    protected setSceneMap() {}

    public setSceneResultMap_ByResult(gameScenes: string[]) {}

    public get gameScendMap(): TSMap<string, GameSceneData> {
        return this.sceneMap;
    }

    public get gameSceneResultMap(): TSMap<string, GameSceneData> {
        return this.sceneResultMap;
    }

    public get betCombinationsType(): BetCombinationsType {
        return new BetCombinationsType();
    }
}

export class BetCombinationsType {
    public NO_EXTRA_BET: string = 'NoExtraBet';
}
