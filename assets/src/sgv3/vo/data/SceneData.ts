import { Logger } from '../../../core/utils/Logger';
import { TSMap } from '../../../core/utils/TSMap';
import { GameSceneData, ShakeInfo } from '../config/GameSceneData';

export class SceneData {
    /** gameSceneMap */
    protected sceneMap: TSMap<string, GameSceneData>;
    protected sceneResultMap: TSMap<string, GameSceneData>;

    /** 視窗晃動參數 */
    public shakeInfo: ShakeInfo = { repeat: 10, range: 40, frequency: 10 };
    /** 預設使用的MathTableIndex */
    public defaultMathTableIndex: number = 0;
    /** 可觸發分級贏分面板 */
    public triggerWinBoard: boolean = true;
    /** 手機直式寬度 */
    public portraitWidth: number = 990;

    public constructor() {
        this.sceneMap = new TSMap<string, GameSceneData>();
        this.sceneResultMap = new TSMap<string, GameSceneData>();
    }

    /**
     * 用遊戲場景取得遊戲場景資料
     * @param sceneName 場景名稱，如Game_1
     */
    public getGameSceneDataByName(_val: string): GameSceneData {
        let result;
        result = this.sceneMap.get(_val);
        if (result == undefined) {
            Logger.w(_val + ' is not exist!!');
        }
        return result;
    }

    /**
     * 由遊戲狀態取得遊戲名稱
     * @param gameStateId 數學狀態id
     */
    public getSceneNameById(_gameStateId: number): string {
        let result;
        let entity: GameSceneData;
        for (let key of this.sceneResultMap.keys()) {
            entity = this.sceneResultMap.get(key);
            if (entity.gameStateIds.indexOf(_gameStateId) != -1) {
                result = key;
                return result;
            }
        }
        if (result == undefined) {
            Logger.w("GameSceneData's gameStateId occur Error plz check ");
        }
    }
}
