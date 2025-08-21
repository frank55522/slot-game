import { BonusGameExtendSetting } from './BonusGameExtendSetting';
import { GameStateSetting } from './GameStateSetting';

export class BonusGameSetting extends GameStateSetting {
    public poolCount: number;
    public poolResetValue: number[];
    public poolMaxValue: number[];
    public poolWeight: number;
    public sppoolWeight: number;
    public superbonusTriggerCollection: number;
    public bonusGameExtendSetting: BonusGameExtendSetting;
}
