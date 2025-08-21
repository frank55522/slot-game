export class SaveDataResponseObject {
    result: string; //if success the value is "OK"
    public constructor(params: SFS2X.SFSObject) {
        this.result = params.getUtfString('result');
    }
}
