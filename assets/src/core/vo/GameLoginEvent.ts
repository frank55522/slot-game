/**
 * @author Vince vinceyang
 */
export class GameLoginEvent {
    data: boolean;
    loginRoom: string;
    code: number;
    message: string;
    public constructor(params: SFS2X.SFSObject) {
        this.data = params.getBool('data');
        this.loginRoom = params.getUtfString('loginRoom');
        this.code = params.getInt('code');
        this.message = params.getUtfString('message');
    }
}
