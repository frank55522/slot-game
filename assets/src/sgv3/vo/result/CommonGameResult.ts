import { LINE_GameResult } from '../../../sgv3line/vo/result/LINE_GameResult';
import { WAY_GameResult } from '../../../sgv3way/vo/result/WAY_GameResult';
import { DisplayInfo } from '../info/DisplayInfo';
import { SpecialFeatureResult } from './SpecialFeatureResult';

export class CommonGameResult {
    usedTableIndex: number; // 紀錄每個Round中，Table使用哪一張
    screenSymbol: Array<Array<number>>; // 紀錄此Round的畫面結果 screenSymbol[i][j]第i列第j欄
    lineGameResult: LINE_GameResult; // 若為LineGame，則此Round的結果紀錄於此。否則為Null
    waysGameResult: WAY_GameResult; // 惹為WayGame，則此Round的結果紀錄於此。否則為Null
    specialFeatureResult: SpecialFeatureResult[]; // 紀錄特殊獎項的結果及其中獎座標資訊，specialFeatureResult[i] ，表示第i種Feature是否有中獎的資訊
    displayInfo: DisplayInfo; //紀錄遊戲表演資訊。
}
