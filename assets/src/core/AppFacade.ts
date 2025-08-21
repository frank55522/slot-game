import { GAME_StartupGameCommand } from '../game/command/GAME_StartupGameCommand';

export class AppFacade extends puremvc.Facade implements puremvc.IFacade {
    constructor() {
        super();
    }

    public static getInstance(): AppFacade {
        if (!this.instance) this.instance = new AppFacade();
        return <AppFacade>this.instance;
    }

    public initializeFacade(): void {
        super.initializeFacade();
        this.registerCommand(GAME_StartupGameCommand.NAME, GAME_StartupGameCommand);
    }

    public startup(stage?: any): void {
        this.sendNotification(GAME_StartupGameCommand.NAME, stage);
        this.removeCommand(GAME_StartupGameCommand.NAME);
    }
}
