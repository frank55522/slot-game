import { WheelData } from '../data/WheelData';
import { SpecialHitInfo } from '../info/SpecialHitInfo';
import { BaseGameExtendSetting } from './BaseGameExtendSetting';
import { MixGroupSetting } from './MixGroupSetting';

export class CommonGameSetting {
    public screenRow: number; // 紀錄畫面列數
    public screenColumn: number; // 紀錄畫面行數
    public symbolCount: number; // 紀錄遊戲中的Symbol總類數
    public maxBetLine: number; // 紀錄遊戲的最大線數

    public specialFeatureCount: number; //紀錄遊戲中的特殊feature總數
    public payTable: Array<Array<number>>; // 紀錄賠率表 payTable[i][j] = k 表示第i個Symbol的(j+1)個連線賠率為k
    public lineTable: Array<Array<number>>; // 紀錄水平線型 lineTable[i][j] = k 表示第i條線第j行是k列。

    public symbolAttribute: Array<string>; //紀錄每個Symbol的屬性， symbolAttribute[i] 代表第i個Symbol屬性
    public gameHitPattern: string; // 紀錄遊戲兌獎方式
    public wheelUsePattern: string; // 紀錄遊戲產生畫面時的輪帶使用方式
    public specialHitInfo: Array<SpecialHitInfo>; //紀錄特殊feature的Pattern與發生時對應的動作。
    public mixGroupCount: number; // 紀錄混搭規則個數
    public mixGroupSetting: Array<MixGroupSetting>; // 紀錄混搭規則
    public tableCount: number; //紀錄表單總數
    public tableHitProbability: Array<number>; // 紀錄各表單的選擇機率
    public wheelData: Array<Array<WheelData>>; // 紀錄輪帶 WheelData[i][j]表示第i個Table的第j輪帶。
    public groupingWheelData: Array<Array<Array<WheelData>>>; // wheelData 外面多增加一層 group
    public fakeWheelData: Array<Array<WheelData>>; //紀錄假輪帶 fakeWheelData[i][j]，表示第i個Table的第j輪帶
    public baseGameExtendSetting: BaseGameExtendSetting;
}
