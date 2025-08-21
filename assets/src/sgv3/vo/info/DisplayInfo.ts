import { WinType } from '../enum/WinType';

export class DisplayInfo {
    public displayMethod: Array<Array<boolean>>; // displayMethod[i][j] = k，表示第i列第j欄表演第K個的模式
    public bigWinType: string; //記錄總贏分的表演方式
    public prizePredictionType: string; //紀錄大獎預告表演方式
    public fortuneLevelType: string; //發財樹金幣表演等級

    /** 紀錄目前遊戲畫面的前一列與後一列的圖示. 主要給Damp功能使用.
    假如為相依轉輪，遊戲為 4*5 的畫面，則dampInfo為 2*5 陣列，分別代表前後一列的畫面。
    假如無獨立轉輪，遊戲為 4*5 的畫面，則dampInfo為 8*5 的陣列，分別代表每一個轉輪的前後一列的畫面*/
    public dampInfo: Array<Array<number>>;

    public rngInfo: Array<Array<number>>;

    public scoringTime: number;
    public winType: WinType;
}
