import { CommonGameSetting } from './CommonGameSetting';

export class GameStateSetting extends CommonGameSetting {
    constructor(baseSetting: CommonGameSetting) {
        super();
        this.screenRow = baseSetting.screenRow;
        this.screenColumn = baseSetting.screenColumn;
        this.wheelUsePattern = baseSetting.wheelUsePattern;
        this.tableCount = baseSetting.tableCount;
        this.tableHitProbability = baseSetting.tableHitProbability;
        this.wheelData = baseSetting.wheelData;
        this.maxBetLine = baseSetting.maxBetLine;
        this.lineTable = baseSetting.lineTable;
        this.gameHitPattern = baseSetting.gameHitPattern;
        if (baseSetting.groupingWheelData) {
            this.groupingWheelData = baseSetting.groupingWheelData;
        }
    }
    /** 遊戲狀態id */
    public gameSceneId: string;
    /**每次改 group 重新設定wheelData */
    public setWheelData(group: number) {
        if (this.groupingWheelData && group >= 0) {
            this.wheelData = this.groupingWheelData[group];
        }
    }
}
