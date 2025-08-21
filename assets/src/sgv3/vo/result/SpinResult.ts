import { ProbabilityDetail } from '../ProbabilityDetail';
import { BaseGameResult } from './BaseGameResult';
import { BonusGameResult } from './BonusGameResult';
import { FreeGameResult } from './FreeGameResult';
import { GameStateResult } from './GameStateResult';
import { TopUpGameResult } from './TopUpGameResult';

export class SpinGSResult {
    gameSeq: number;
    spinResult: SpinResult;
    ts: number;
    balance: number;
}

export class SpinResult {
    constructor() {}
    playerTotalWin: number;
    baseGameResult: BaseGameResult;
    freeGameResult: FreeGameResult;
    bonusGameResult: BonusGameResult;
    topUpGameResult: TopUpGameResult;
    probabilityDetail: ProbabilityDetail;
    bigWinType: string;

    // 重新編排成GameState給流程用
    gameStateResult: Array<GameStateResult>;
}
