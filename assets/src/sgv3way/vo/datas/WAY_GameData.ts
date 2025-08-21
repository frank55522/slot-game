import { GameData } from '../../../sgv3/vo/config/GameData';
import { WAY_AllWinData } from './WAY_AllWinData';

export class WAY_GameData extends GameData {
    /** 當前贏分資料 */
    public curWindData: WAY_AllWinData = new WAY_AllWinData();
    /** 狀態贏分資料 */
    public stateWinData: WAY_AllWinData = new WAY_AllWinData();
}
