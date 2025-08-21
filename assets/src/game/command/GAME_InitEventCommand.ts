import { InitEventCommand } from '../../sgv3/command/InitEventCommand';

/** 覆寫 InitEventCommand方便初始化取得gamestate */
export class GAME_InitEventCommand extends InitEventCommand {
    public execute(notification: puremvc.INotification): void {
        super.execute(notification);
    }
}
