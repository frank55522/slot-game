import { _decorator, Component, Node } from 'cc';
import { MultipleCalculateCommand } from '../byGame/MultipleCalculateCommand';
import { PrizePredictionHandleCommand } from '../byGame/PrizePredictionHandleCommand';
import { RespinHandleCommand } from '../byGame/RespinHandleCommand';
const { ccclass, property } = _decorator;

@ccclass('ByGameHandleCommand')
export class ByGameHandleCommand extends puremvc.MacroCommand {
    public static NAME: string = 'ByGameHandleCommand';
    public initializeMacroCommand() {
        this.addSubCommand(RespinHandleCommand);
        this.addSubCommand(PrizePredictionHandleCommand);
        this.addSubCommand(MultipleCalculateCommand);
    }

    public execute(notification: puremvc.INotification) {
        super.execute(notification);
    }
}
