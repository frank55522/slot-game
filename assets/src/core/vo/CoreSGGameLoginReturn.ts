/**
 * @author Vince vinceyang
 */
export class CoreSGGameLoginReturn {
    protected params: SFS2X.SFSObject;
    public data: boolean;
    public ts: number;
    public balance: number;
    public loginRoom: string;
    public showName: string;
    public testMode: boolean;
    public constructor(params: SFS2X.SFSObject) {
        const self = this;
        self.params = params;
        self.data = params.getBool('data');
        self.ts = params.getLong('ts');
        self.balance = params.getDouble('balance');
        self.loginRoom = params.getUtfString('loginRoom');
        self.showName = params.getUtfString('showName');
        self.testMode = params.getBool('testMode');
    }
}
