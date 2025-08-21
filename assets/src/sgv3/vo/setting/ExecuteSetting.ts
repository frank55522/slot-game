import { BaseGameSetting } from './BaseGameSetting';
import { DoubleGameSetting } from './DoubleGameSetting';
import { FreeGameSetting } from './FreeGameSetting';
import { BonusGameSetting } from './BonusGameSetting';
import { JackpotSetting } from './JackpotSetting';
import { TopUpGameSetting } from './TopUpGameSetting';

export class ExecuteSetting {
    public baseGameSetting: BaseGameSetting;

    public freeGameSetting: FreeGameSetting;

    public bonusGameSetting: BonusGameSetting;

    public topUpGameSetting: TopUpGameSetting;

    public doubleGameSetting: DoubleGameSetting;

    public jackpotSetting: JackpotSetting;
}
