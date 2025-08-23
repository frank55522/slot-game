/** LINE GAME 需要 import的元件 */
// import { LINE_RegisterStateCommand } from '../../sgv3line/command/LINE_RegisterStateCommand';

/** WAY GAME 需要 import的元件 */
import { WAY_RegisterStateCommand } from '../../sgv3way/command/WAY_RegisterStateCommand';
import { GAME_Game1CountdownCommand } from './state/GAME_Game1CountdownCommand';
import { GAME_Game1FeatureSelectionCommand } from './state/GAME_Game1FeatureSelectionCommand';
import { GAME_Game1HitSpecialCommand } from './state/GAME_Game1HitSpecialCommand';
import { GAME_Game1RollCompleteCommand } from './state/GAME_Game1RollCompleteCommand';
import { GAME_Game2BeforeShowCommand } from './state/GAME_Game2BeforeShowCommand';
import { GAME_Game2EndCommand } from './state/GAME_Game2EndCommand';
import { GAME_Game2HitSpecialCommand } from './state/GAME_Game2HitSpecialCommand';
import { GAME_Game2RollCompleteCommand } from './state/GAME_Game2RollCompleteCommand';
/** BY GAME 需要 import的元件 */
import { GAME_Game4EndCommand } from './state/GAME_Game4EndCommand';

/** 狀態command註冊 */
export class GAME_RegisterStateCommand extends WAY_RegisterStateCommand {
    public execute(notification: puremvc.INotification): void {
        super.execute(notification);

        /** Game1 */
        this.facade.registerCommand(GAME_Game1CountdownCommand.NAME, GAME_Game1CountdownCommand);
        this.facade.registerCommand(GAME_Game1RollCompleteCommand.NAME, GAME_Game1RollCompleteCommand);
        this.facade.registerCommand(GAME_Game1HitSpecialCommand.NAME, GAME_Game1HitSpecialCommand);
        this.facade.registerCommand(GAME_Game1FeatureSelectionCommand.NAME, GAME_Game1FeatureSelectionCommand);

        /** Game2 */
        this.facade.registerCommand(GAME_Game2RollCompleteCommand.NAME, GAME_Game2RollCompleteCommand);
        this.facade.registerCommand(GAME_Game2HitSpecialCommand.NAME, GAME_Game2HitSpecialCommand);
        this.facade.registerCommand(GAME_Game2EndCommand.NAME, GAME_Game2EndCommand);
        this.facade.registerCommand(GAME_Game2BeforeShowCommand.NAME, GAME_Game2BeforeShowCommand);

        this.facade.registerCommand(GAME_Game4EndCommand.NAME, GAME_Game4EndCommand);
    }
}
