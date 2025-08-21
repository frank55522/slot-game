import { JackpotPoolData } from '../jackpot/JackpotPoolData';

export class JackpotSetting {
    public version: string;
    public jackpotType: string;
    public poolcount: number;
    public jackpotPoolData: JackpotPoolData[];
}
