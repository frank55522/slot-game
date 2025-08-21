/**
 * @author Vince vinceyang
 */
export interface ISFSProxyConfig extends SFS2X.IconfigObj {
    userName?: string;
    password?: string;
    clientType?: string;
    t?: string;
    uid?: string;
    gameType?: number;
    machineType?: number;
    gameName?: string;
    gameLoginName?: string;
    sessionID0?: string;
    sessionID1?: string;
    sessionID2?: string;
    sessionID3?: string;
    sessionID4?: string;
    gameUid?: string;
    gamePass?: string;
    logLevel?: number;
    jackpotGroup?: string;
}
