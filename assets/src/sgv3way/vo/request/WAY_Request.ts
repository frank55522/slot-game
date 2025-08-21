import { GameModule } from '../../../sgv3/vo/enum/GameModule';

export class WAY_Request extends SFS2X.SFSObject {
    static betType: string = GameModule[GameModule.WayGame];
    static typeName: string = 'betType';
    static wayBet: string = 'waysBet';
    static betColumn: string = 'wayGameBetColumn';

    constructor() {
        super();
        this.putUtfString(WAY_Request.typeName, GameModule[GameModule.WayGame]);
    }

    public getWayBet(): number {
        return this.getInt(WAY_Request.wayBet);
    }

    public setWayBet(wayBet: number): WAY_Request {
        this.putInt(WAY_Request.wayBet, wayBet);
        return this;
    }

    public getBetColumn(): number {
        return this.getInt(WAY_Request.betColumn);
    }

    public setBetColumn(wayGameBetColumn: number): WAY_Request {
        this.putInt(WAY_Request.betColumn, wayGameBetColumn);
        return this;
    }
}
