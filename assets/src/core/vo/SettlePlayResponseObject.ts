export class SettlePlayResponseObject {
    result: string; //if success the value is "OK"
    balance: number;
    public constructor(params: SFS2X.SFSObject) {
        this.result = params.getUtfString('result');
        this.balance = params.getLong('balance');
    }
}
