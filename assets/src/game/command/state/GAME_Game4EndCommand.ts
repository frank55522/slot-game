import { Game4EndCommand } from '../../../sgv3/command/state/Game4EndCommand';
import { GAME_4_CreditCollectResultCommand } from '../dragon-up/GAME_4_CreditCollectResultCommand';

export class GAME_Game4EndCommand extends Game4EndCommand {

   protected onBonusGameEnd(){
    super.onBonusGameEnd();
    this.sendNotification(GAME_4_CreditCollectResultCommand.NAME);  
   }
}
