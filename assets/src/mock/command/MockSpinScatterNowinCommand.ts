import { SpinResponseCommand } from '../../sgv3/command/spin/SpinResponseCommand';
import { ScreenEvent } from '../../sgv3/util/Constant';
import { SpinGSResult } from '../../sgv3/vo/result/SpinResult';

export class MockSpinScatterResponseCommand extends SpinResponseCommand {
    public static ScatterId: string;

    public execute(notification: puremvc.INotification): void {
        const self = this;
        let mockData;
        switch (MockSpinScatterResponseCommand.ScatterId) {
            case '0':
                mockData = self.fullScatter();
                break;
            case '1':
                mockData = self.baseNoWinFreeNoWin();
                break;
            case '2':
                mockData = self.baseNoWinFreeWin();
                break;
            case '3':
                mockData = self.baseWinFreeNoWin();
                break;
            case '4':
                mockData = self.baseWinFreeWin();
                break;
            case '5':
                mockData = self.retrigerFreeNoWin();
                break;
            case '6':
                mockData = self.retrigerFreeWin();
                break;
        }

        if (mockData) {
            notification.setBody(mockData);
            super.execute(notification);
        }

        self.facade.removeCommand(MockSpinScatterResponseCommand.NAME);
        self.facade.registerCommand(SpinResponseCommand.NAME, SpinResponseCommand);
        MockSpinScatterResponseCommand.ScatterId = undefined;
    }

    /** 進 FG 滿Scatter */
    private fullScatter(): SpinGSResult {
        let origin = {
            balance: 289766.745,
            spinResult: {
                gameStateCount: 4,
                gameStateResult: [
                    { gameStateId: 0, currentState: 1, gameStateType: 'GS_001', roundCount: 0, stateWin: 0 },
                    {
                        gameStateId: 1,
                        currentState: 2,
                        gameStateType: 'GS_003',
                        roundCount: 1,
                        roundResult: [
                            {
                                roundWin: 0,
                                screenResult: {
                                    tableIndex: 0,
                                    screenSymbol: [
                                        [1, 1, 1, 1],
                                        [1, 1, 1, 1],
                                        [1, 1, 1, 1],
                                        [1, 1, 1, 1],
                                        [1, 1, 1, 1]
                                    ],
                                    dampInfo: [
                                        [9, 5],
                                        [10, 0],
                                        [10, 9],
                                        [11, 3],
                                        [5, 7]
                                    ]
                                },
                                specialFeatureResult: [
                                    {
                                        specialHitPattern: 'HP_05',
                                        triggerEvent: 'Trigger_01',
                                        specialScreenHitData: [
                                            [true, true, true, true],
                                            [true, true, true, true],
                                            [true, true, true, true],
                                            [true, true, true, true],
                                            [true, true, true, true]
                                        ],
                                        specialScreenWin: 60
                                    }
                                ],
                                progressResult: {
                                    maxTriggerFlag: true,
                                    stepInfo: { currentStep: 1, addStep: 0, totalStep: 1 },
                                    stageInfo: { currentStage: 1, totalStage: 1, addStage: 0 },
                                    roundInfo: { currentRound: 1, totalRound: 1, addRound: 0 }
                                },
                                displayResult: {
                                    accumulateWinResult: {
                                        beforeSpinFirstStateOnlyBasePayAccWin: 0,
                                        afterSpinFirstStateOnlyBasePayAccWin: 0,
                                        beforeSpinAccWin: 0,
                                        afterSpinAccWin: 0
                                    },
                                    readyHandResult: { displayMethod: [[false], [false], [true], [false], [false]] }
                                },
                                gameResult: { playerWin: 60, gameWinType: 'LineGame', lineWinResult: [] }
                            }
                        ],
                        stateWin: 0
                    },
                    {
                        gameStateId: 2,
                        currentState: 3,
                        gameStateType: 'GS_004',
                        roundCount: 1,
                        roundResult: [
                            {
                                roundWin: 0,
                                screenResult: {
                                    tableIndex: 0,
                                    screenSymbol: [
                                        [4, 8, 1, 11],
                                        [11, 2, 2, 2],
                                        [8, 6, 9, 3],
                                        [11, 9, 6, 8],
                                        [10, 11, 0, 0]
                                    ],
                                    dampInfo: [
                                        [10, 7],
                                        [10, 2],
                                        [5, 7],
                                        [3, 10],
                                        [3, 0]
                                    ]
                                },
                                extendGameStateResult: { extendWin: 0, haveAddedWildCount: 4 },
                                progressResult: {
                                    maxTriggerFlag: false,
                                    stepInfo: { currentStep: 1, addStep: 0, totalStep: 1 },
                                    stageInfo: { currentStage: 1, totalStage: 1, addStage: 0 },
                                    roundInfo: { currentRound: 1, totalRound: 1, addRound: 0 }
                                },
                                displayResult: {
                                    accumulateWinResult: {
                                        beforeSpinFirstStateOnlyBasePayAccWin: 60,
                                        afterSpinFirstStateOnlyBasePayAccWin: 60,
                                        beforeSpinAccWin: 60,
                                        afterSpinAccWin: 60
                                    },
                                    readyHandResult: { displayMethod: [[false], [false], [false], [false], [false]] }
                                },
                                gameResult: { playerWin: 0, gameWinType: 'LineGame', lineWinResult: [] }
                            }
                        ],
                        stateWin: 0
                    },
                    { gameStateId: 3, currentState: 4, gameStateType: 'GS_002', roundCount: 0, stateWin: 0 }
                ],
                totalWin: 60,
                boardDisplayResult: { winRankType: 'Nothing' },
                gameFlowResult: { IsBoardEndFlag: true, currentSystemStateId: 3, systemStateIdOptions: [0, 997] },
                probabilityDetail: {
                    reportDetail: {
                        reportFlagDetail: {
                            IsBaseGameFlag: true,
                            IsRespinFlag: false,
                            IsFreeGameFlag: true,
                            IsBonusGameFlag: false,
                            IsDoubleGameFlag: false,
                            IsExtraSpinFlag: false
                        }
                    },
                    randomUsedDetail: { randomNumberUsed: 112, rndId: 1 },
                    settingId: 'v3_14901_05_01_001'
                }
            },
            gameSeq: 5250158524343,
            ts: 1559030752160
        };

        let result = JSON.parse(JSON.stringify(origin)) as SpinGSResult;
        return result;
    }

    /** 進 FG 一場 Base沒有任何連線 */
    private baseNoWinFreeNoWin(): SpinGSResult {
        let origin = {
            balance: 289766.745,
            spinResult: {
                gameStateCount: 4,
                gameStateResult: [
                    { gameStateId: 0, currentState: 1, gameStateType: 'GS_001', roundCount: 0, stateWin: 0 },
                    {
                        gameStateId: 1,
                        currentState: 2,
                        gameStateType: 'GS_003',
                        roundCount: 1,
                        roundResult: [
                            {
                                roundWin: 0,
                                screenResult: {
                                    tableIndex: 0,
                                    screenSymbol: [
                                        [1, 3, 5, 8],
                                        [1, 5, 6, 5],
                                        [1, 8, 9, 7],
                                        [8, 11, 0, 5],
                                        [5, 11, 6, 8]
                                    ],
                                    dampInfo: [
                                        [9, 5],
                                        [10, 0],
                                        [10, 9],
                                        [11, 3],
                                        [5, 7]
                                    ]
                                },
                                specialFeatureResult: [
                                    {
                                        specialHitPattern: 'HP_05',
                                        triggerEvent: 'Trigger_01',
                                        specialScreenHitData: [
                                            [true, false, false, false],
                                            [true, false, false, false],
                                            [true, false, false, false],
                                            [false, false, false, false],
                                            [false, false, false, false]
                                        ],
                                        specialScreenWin: 0
                                    }
                                ],
                                progressResult: {
                                    maxTriggerFlag: true,
                                    stepInfo: { currentStep: 1, addStep: 0, totalStep: 1 },
                                    stageInfo: { currentStage: 1, totalStage: 1, addStage: 0 },
                                    roundInfo: { currentRound: 1, totalRound: 1, addRound: 0 }
                                },
                                displayResult: {
                                    accumulateWinResult: {
                                        beforeSpinFirstStateOnlyBasePayAccWin: 0,
                                        afterSpinFirstStateOnlyBasePayAccWin: 0,
                                        beforeSpinAccWin: 0,
                                        afterSpinAccWin: 0
                                    },
                                    readyHandResult: { displayMethod: [[false], [false], [true], [false], [false]] }
                                },
                                gameResult: { playerWin: 0, lineWinResult: [], gameWinType: 'LineGame' }
                            }
                        ],
                        stateWin: 0
                    },
                    {
                        gameStateId: 2,
                        currentState: 3,
                        gameStateType: 'GS_004',
                        roundCount: 1,
                        roundResult: [
                            {
                                roundWin: 0,
                                screenResult: {
                                    tableIndex: 0,
                                    screenSymbol: [
                                        [4, 8, 1, 11],
                                        [11, 2, 2, 2],
                                        [8, 6, 9, 3],
                                        [11, 9, 6, 8],
                                        [10, 11, 0, 0]
                                    ],
                                    dampInfo: [
                                        [10, 7],
                                        [10, 2],
                                        [5, 7],
                                        [3, 10],
                                        [3, 0]
                                    ]
                                },
                                extendGameStateResult: { haveAddedWildCount: 4, extendWin: 0 },
                                progressResult: {
                                    maxTriggerFlag: false,
                                    stepInfo: { currentStep: 1, addStep: 0, totalStep: 1 },
                                    stageInfo: { currentStage: 1, totalStage: 1, addStage: 0 },
                                    roundInfo: { currentRound: 1, totalRound: 1, addRound: 0 }
                                },
                                displayResult: {
                                    accumulateWinResult: {
                                        beforeSpinFirstStateOnlyBasePayAccWin: 0,
                                        afterSpinFirstStateOnlyBasePayAccWin: 0,
                                        beforeSpinAccWin: 0,
                                        afterSpinAccWin: 0
                                    },
                                    readyHandResult: { displayMethod: [[false], [false], [false], [false], [false]] }
                                },
                                gameResult: { playerWin: 0, lineWinResult: [], gameWinType: 'LineGame' }
                            }
                        ],
                        stateWin: 0
                    },
                    { gameStateId: 3, currentState: 4, gameStateType: 'GS_002', roundCount: 0, stateWin: 0 }
                ],
                totalWin: 0,
                boardDisplayResult: { winRankType: 'Nothing' },
                gameFlowResult: { IsBoardEndFlag: true, currentSystemStateId: 3, systemStateIdOptions: [0, 997] },
                probabilityDetail: {
                    reportDetail: {
                        reportFlagDetail: {
                            IsBaseGameFlag: true,
                            IsRespinFlag: false,
                            IsFreeGameFlag: true,
                            IsBonusGameFlag: false,
                            IsDoubleGameFlag: false,
                            IsExtraSpinFlag: false
                        }
                    },
                    randomUsedDetail: { randomNumberUsed: 112, rndId: 1 },
                    settingId: 'v3_14901_05_01_001'
                }
            },
            gameSeq: 5250158524343,
            ts: 1559030752160
        };

        let result = JSON.parse(JSON.stringify(origin)) as SpinGSResult;
        return result;
    }

    /** 進 FG 一場 Base沒有任何連線 */
    private baseNoWinFreeWin(): SpinGSResult {
        let origin = {
            balance: 1994234.11,
            spinResult: {
                gameStateCount: 4,
                gameStateResult: [
                    { gameStateId: 0, currentState: 1, gameStateType: 'GS_001', roundCount: 0, stateWin: 0 },
                    {
                        gameStateId: 1,
                        currentState: 2,
                        gameStateType: 'GS_003',
                        roundCount: 1,
                        roundResult: [
                            {
                                roundWin: 0,
                                screenResult: {
                                    tableIndex: 0,
                                    screenSymbol: [
                                        [1, 3, 5, 8],
                                        [1, 5, 6, 5],
                                        [1, 8, 9, 7],
                                        [4, 11, 4, 10],
                                        [4, 7, 5, 11]
                                    ],
                                    dampInfo: [
                                        [9, 5],
                                        [10, 0],
                                        [10, 9],
                                        [10, 11],
                                        [10, 9]
                                    ]
                                },
                                specialFeatureResult: [
                                    {
                                        specialHitPattern: 'HP_05',
                                        triggerEvent: 'Trigger_01',
                                        specialScreenHitData: [
                                            [true, false, false, false],
                                            [true, false, false, false],
                                            [true, false, false, false],
                                            [false, false, false, false],
                                            [false, false, false, false]
                                        ],
                                        specialScreenWin: 0
                                    }
                                ],
                                progressResult: {
                                    maxTriggerFlag: true,
                                    stepInfo: { currentStep: 1, addStep: 0, totalStep: 1 },
                                    stageInfo: { currentStage: 1, totalStage: 1, addStage: 0 },
                                    roundInfo: { currentRound: 1, totalRound: 1, addRound: 0 }
                                },
                                displayResult: {
                                    accumulateWinResult: {
                                        beforeSpinFirstStateOnlyBasePayAccWin: 0,
                                        afterSpinFirstStateOnlyBasePayAccWin: 0,
                                        beforeSpinAccWin: 0,
                                        afterSpinAccWin: 0
                                    },
                                    readyHandResult: { displayMethod: [[false], [false], [true], [false], [false]] }
                                },
                                gameResult: { playerWin: 0, lineWinResult: [], gameWinType: 'LineGame' }
                            }
                        ],
                        stateWin: 0
                    },
                    {
                        gameStateId: 2,
                        currentState: 3,
                        gameStateType: 'GS_004',
                        roundCount: 3,
                        roundResult: [
                            {
                                roundWin: 500,
                                screenResult: {
                                    tableIndex: 0,
                                    screenSymbol: [
                                        [9, 2, 7, 4],
                                        [10, 2, 6, 8],
                                        [9, 2, 5, 8],
                                        [7, 2, 10, 2],
                                        [9, 2, 10, 2]
                                    ],
                                    dampInfo: [
                                        [10, 10],
                                        [8, 4],
                                        [8, 6],
                                        [0, 2],
                                        [0, 2]
                                    ]
                                },
                                extendGameStateResult: { haveAddedWildCount: 4, extendWin: 0 },
                                progressResult: {
                                    maxTriggerFlag: false,
                                    stepInfo: { currentStep: 1, addStep: 0, totalStep: 1 },
                                    stageInfo: { currentStage: 1, totalStage: 1, addStage: 0 },
                                    roundInfo: { currentRound: 1, totalRound: 1, addRound: 0 }
                                },
                                displayResult: {
                                    accumulateWinResult: {
                                        beforeSpinFirstStateOnlyBasePayAccWin: 500,
                                        afterSpinFirstStateOnlyBasePayAccWin: 500,
                                        beforeSpinAccWin: 500,
                                        afterSpinAccWin: 500
                                    },
                                    readyHandResult: { displayMethod: [[false], [false], [true], [false], [false]] }
                                },
                                gameResult: {
                                    playerWin: 500,
                                    lineWinResult: [
                                        {
                                            lineId: 0,
                                            hitDirection: 'LeftToRight',
                                            isMixGroupFlag: false,
                                            hitMixGroup: -1,
                                            hitSymbol: 2,
                                            hitWay: 5,
                                            hitOdds: 500,
                                            lineWin: 500,
                                            screenHitData: [
                                                [false, true, false, false],
                                                [false, true, false, false],
                                                [false, true, false, false],
                                                [false, true, false, false],
                                                [false, true, false, false]
                                            ]
                                        }
                                    ],
                                    gameWinType: 'LineGame'
                                }
                            }
                        ],
                        stateWin: 500
                    },
                    { gameStateId: 3, currentState: 4, gameStateType: 'GS_002', roundCount: 0, stateWin: 0 }
                ],
                totalWin: 500,
                boardDisplayResult: { winRankType: 'Nothing' },
                gameFlowResult: { IsBoardEndFlag: true, currentSystemStateId: 3, systemStateIdOptions: [0, 997] },
                probabilityDetail: {
                    reportDetail: {
                        reportFlagDetail: {
                            IsBaseGameFlag: true,
                            IsRespinFlag: false,
                            IsFreeGameFlag: true,
                            IsBonusGameFlag: false,
                            IsDoubleGameFlag: false,
                            IsExtraSpinFlag: false
                        }
                    },
                    randomUsedDetail: { randomNumberUsed: 184, rndId: 1 },
                    settingId: 'v3_14901_05_01_001'
                }
            },
            gameSeq: 5250158551305,
            ts: 1559180838773
        };

        let result = JSON.parse(JSON.stringify(origin)) as SpinGSResult;
        return result;
    }

    /** 進 FG 一場 Base有一條連線 */
    private baseWinFreeNoWin(): SpinGSResult {
        let origin = {
            balance: 289766.745,
            spinResult: {
                gameStateCount: 4,
                gameStateResult: [
                    { gameStateId: 0, currentState: 1, gameStateType: 'GS_001', roundCount: 0, stateWin: 0 },
                    {
                        gameStateId: 1,
                        currentState: 2,
                        gameStateType: 'GS_003',
                        roundCount: 1,
                        roundResult: [
                            {
                                roundWin: 500,
                                screenResult: {
                                    tableIndex: 0,
                                    screenSymbol: [
                                        [1, 2, 5, 8],
                                        [1, 2, 6, 5],
                                        [1, 2, 9, 7],
                                        [8, 2, 0, 5],
                                        [5, 2, 6, 8]
                                    ],
                                    dampInfo: [
                                        [9, 5],
                                        [10, 0],
                                        [10, 9],
                                        [11, 3],
                                        [5, 7]
                                    ]
                                },
                                specialFeatureResult: [
                                    {
                                        specialHitPattern: 'HP_05',
                                        triggerEvent: 'Trigger_01',
                                        specialScreenHitData: [
                                            [true, false, false, false],
                                            [true, false, false, false],
                                            [true, false, false, false],
                                            [false, false, false, false],
                                            [false, false, false, false]
                                        ],
                                        specialScreenWin: 0
                                    }
                                ],
                                progressResult: {
                                    maxTriggerFlag: true,
                                    stepInfo: { currentStep: 1, addStep: 0, totalStep: 1 },
                                    stageInfo: { currentStage: 1, totalStage: 1, addStage: 0 },
                                    roundInfo: { currentRound: 1, totalRound: 1, addRound: 0 }
                                },
                                displayResult: {
                                    accumulateWinResult: {
                                        beforeSpinFirstStateOnlyBasePayAccWin: 0,
                                        afterSpinFirstStateOnlyBasePayAccWin: 0,
                                        beforeSpinAccWin: 0,
                                        afterSpinAccWin: 0
                                    },
                                    readyHandResult: { displayMethod: [[false], [false], [true], [false], [false]] }
                                },
                                gameResult: {
                                    playerWin: 500,
                                    lineWinResult: [
                                        {
                                            lineId: 0,
                                            hitDirection: 'LeftToRight',
                                            isMixGroupFlag: false,
                                            hitMixGroup: -1,
                                            hitSymbol: 2,
                                            hitWay: 5,
                                            hitOdds: 500,
                                            lineWin: 500,
                                            screenHitData: [
                                                [false, true, false, false],
                                                [false, true, false, false],
                                                [false, true, false, false],
                                                [false, true, false, false],
                                                [false, true, false, false]
                                            ]
                                        }
                                    ],
                                    gameWinType: 'LineGame'
                                }
                            }
                        ],
                        stateWin: 500
                    },
                    {
                        gameStateId: 2,
                        currentState: 3,
                        gameStateType: 'GS_004',
                        roundCount: 1,
                        roundResult: [
                            {
                                roundWin: 0,
                                screenResult: {
                                    tableIndex: 0,
                                    screenSymbol: [
                                        [4, 8, 1, 11],
                                        [11, 2, 2, 2],
                                        [8, 6, 9, 3],
                                        [11, 9, 6, 8],
                                        [10, 11, 0, 0]
                                    ],
                                    dampInfo: [
                                        [10, 7],
                                        [10, 2],
                                        [5, 7],
                                        [3, 10],
                                        [3, 0]
                                    ]
                                },
                                extendGameStateResult: { haveAddedWildCount: 4, extendWin: 0 },
                                progressResult: {
                                    maxTriggerFlag: false,
                                    stepInfo: { currentStep: 1, addStep: 0, totalStep: 1 },
                                    stageInfo: { currentStage: 1, totalStage: 1, addStage: 0 },
                                    roundInfo: { currentRound: 1, totalRound: 1, addRound: 0 }
                                },
                                displayResult: {
                                    accumulateWinResult: {
                                        beforeSpinFirstStateOnlyBasePayAccWin: 0,
                                        afterSpinFirstStateOnlyBasePayAccWin: 0,
                                        beforeSpinAccWin: 0,
                                        afterSpinAccWin: 0
                                    },
                                    readyHandResult: { displayMethod: [[false], [false], [false], [false], [false]] }
                                },
                                gameResult: { playerWin: 0, lineWinResult: [], gameWinType: 'LineGame' }
                            }
                        ],
                        stateWin: 0
                    },
                    { gameStateId: 3, currentState: 4, gameStateType: 'GS_002', roundCount: 0, stateWin: 0 }
                ],
                totalWin: 0,
                boardDisplayResult: { winRankType: 'Nothing' },
                gameFlowResult: { IsBoardEndFlag: true, currentSystemStateId: 3, systemStateIdOptions: [0, 997] },
                probabilityDetail: {
                    reportDetail: {
                        reportFlagDetail: {
                            IsBaseGameFlag: true,
                            IsRespinFlag: false,
                            IsFreeGameFlag: true,
                            IsBonusGameFlag: false,
                            IsDoubleGameFlag: false,
                            IsExtraSpinFlag: false
                        }
                    },
                    randomUsedDetail: { randomNumberUsed: 112, rndId: 1 },
                    settingId: 'v3_14901_05_01_001'
                }
            },
            gameSeq: 5250158524343,
            ts: 1559030752160
        };

        let result = JSON.parse(JSON.stringify(origin)) as SpinGSResult;
        return result;
    }

    /** 進 FG 一場 Base有一條連線 */
    private baseWinFreeWin(): SpinGSResult {
        let origin = {
            balance: 289766.745,
            spinResult: {
                gameStateCount: 4,
                gameStateResult: [
                    { gameStateId: 0, currentState: 1, gameStateType: 'GS_001', roundCount: 0, stateWin: 0 },
                    {
                        gameStateId: 1,
                        currentState: 2,
                        gameStateType: 'GS_003',
                        roundCount: 1,
                        roundResult: [
                            {
                                roundWin: 500,
                                screenResult: {
                                    tableIndex: 0,
                                    screenSymbol: [
                                        [1, 2, 5, 8],
                                        [1, 2, 6, 5],
                                        [1, 2, 9, 7],
                                        [8, 2, 0, 5],
                                        [5, 2, 6, 8]
                                    ],
                                    dampInfo: [
                                        [9, 5],
                                        [10, 0],
                                        [10, 9],
                                        [11, 3],
                                        [5, 7]
                                    ]
                                },
                                specialFeatureResult: [
                                    {
                                        specialHitPattern: 'HP_05',
                                        triggerEvent: 'Trigger_01',
                                        specialScreenHitData: [
                                            [true, false, false, false],
                                            [true, false, false, false],
                                            [true, false, false, false],
                                            [false, false, false, false],
                                            [false, false, false, false]
                                        ],
                                        specialScreenWin: 0
                                    }
                                ],
                                progressResult: {
                                    maxTriggerFlag: true,
                                    stepInfo: { currentStep: 1, addStep: 0, totalStep: 1 },
                                    stageInfo: { currentStage: 1, totalStage: 1, addStage: 0 },
                                    roundInfo: { currentRound: 1, totalRound: 1, addRound: 0 }
                                },
                                displayResult: {
                                    accumulateWinResult: {
                                        beforeSpinFirstStateOnlyBasePayAccWin: 0,
                                        afterSpinFirstStateOnlyBasePayAccWin: 0,
                                        beforeSpinAccWin: 0,
                                        afterSpinAccWin: 0
                                    },
                                    readyHandResult: { displayMethod: [[false], [false], [true], [false], [false]] }
                                },
                                gameResult: {
                                    playerWin: 500,
                                    lineWinResult: [
                                        {
                                            lineId: 0,
                                            hitDirection: 'LeftToRight',
                                            isMixGroupFlag: false,
                                            hitMixGroup: -1,
                                            hitSymbol: 2,
                                            hitWay: 5,
                                            hitOdds: 500,
                                            lineWin: 500,
                                            screenHitData: [
                                                [false, true, false, false],
                                                [false, true, false, false],
                                                [false, true, false, false],
                                                [false, true, false, false],
                                                [false, true, false, false]
                                            ]
                                        }
                                    ],
                                    gameWinType: 'LineGame'
                                }
                            }
                        ],
                        stateWin: 500
                    },
                    {
                        gameStateId: 2,
                        currentState: 3,
                        gameStateType: 'GS_004',
                        roundCount: 1,
                        roundResult: [
                            {
                                roundWin: 500,
                                screenResult: {
                                    tableIndex: 0,
                                    screenSymbol: [
                                        [4, 2, 1, 11],
                                        [11, 2, 9, 2],
                                        [8, 2, 9, 3],
                                        [11, 2, 6, 8],
                                        [10, 2, 0, 0]
                                    ],
                                    dampInfo: [
                                        [10, 7],
                                        [10, 2],
                                        [5, 7],
                                        [3, 10],
                                        [3, 0]
                                    ]
                                },
                                extendGameStateResult: { haveAddedWildCount: 4, extendWin: 0 },
                                progressResult: {
                                    maxTriggerFlag: false,
                                    stepInfo: { currentStep: 1, addStep: 0, totalStep: 1 },
                                    stageInfo: { currentStage: 1, totalStage: 1, addStage: 0 },
                                    roundInfo: { currentRound: 1, totalRound: 1, addRound: 0 }
                                },
                                displayResult: {
                                    accumulateWinResult: {
                                        beforeSpinFirstStateOnlyBasePayAccWin: 0,
                                        afterSpinFirstStateOnlyBasePayAccWin: 500,
                                        beforeSpinAccWin: 0,
                                        afterSpinAccWin: 500
                                    },
                                    readyHandResult: { displayMethod: [[false], [false], [false], [false], [false]] }
                                },
                                gameResult: {
                                    playerWin: 500,
                                    lineWinResult: [
                                        {
                                            lineId: 0,
                                            hitDirection: 'LeftToRight',
                                            isMixGroupFlag: false,
                                            hitMixGroup: -1,
                                            hitSymbol: 2,
                                            hitWay: 5,
                                            hitOdds: 500,
                                            lineWin: 500,
                                            screenHitData: [
                                                [false, true, false, false],
                                                [false, true, false, false],
                                                [false, true, false, false],
                                                [false, true, false, false],
                                                [false, true, false, false]
                                            ]
                                        }
                                    ],
                                    gameWinType: 'LineGame'
                                }
                            }
                        ],
                        stateWin: 500
                    },
                    { gameStateId: 3, currentState: 4, gameStateType: 'GS_002', roundCount: 0, stateWin: 0 }
                ],
                totalWin: 1000,
                boardDisplayResult: { winRankType: 'Nothing' },
                gameFlowResult: { IsBoardEndFlag: true, currentSystemStateId: 3, systemStateIdOptions: [0, 997] },
                probabilityDetail: {
                    reportDetail: {
                        reportFlagDetail: {
                            IsBaseGameFlag: true,
                            IsRespinFlag: false,
                            IsFreeGameFlag: true,
                            IsBonusGameFlag: false,
                            IsDoubleGameFlag: false,
                            IsExtraSpinFlag: false
                        }
                    },
                    randomUsedDetail: { randomNumberUsed: 112, rndId: 1 },
                    settingId: 'v3_14901_05_01_001'
                }
            },
            gameSeq: 5250158524343,
            ts: 1559030752160
        };

        let result = JSON.parse(JSON.stringify(origin)) as SpinGSResult;
        return result;
    }

    /** 進 FG 一場 Base有一條連線 */
    private retrigerFreeNoWin(): SpinGSResult {
        let origin = {
            balance: 1994234.11,
            spinResult: {
                gameStateCount: 4,
                gameStateResult: [
                    { gameStateId: 0, currentState: 1, gameStateType: 'GS_001', roundCount: 0, stateWin: 0 },
                    {
                        gameStateId: 1,
                        currentState: 2,
                        gameStateType: 'GS_003',
                        roundCount: 1,
                        roundResult: [
                            {
                                roundWin: 0,
                                screenResult: {
                                    tableIndex: 0,
                                    screenSymbol: [
                                        [1, 3, 5, 8],
                                        [1, 5, 6, 5],
                                        [1, 8, 9, 7],
                                        [4, 11, 4, 10],
                                        [4, 7, 5, 11]
                                    ],
                                    dampInfo: [
                                        [9, 5],
                                        [10, 0],
                                        [10, 9],
                                        [10, 11],
                                        [10, 9]
                                    ]
                                },
                                specialFeatureResult: [
                                    {
                                        specialHitPattern: 'HP_05',
                                        triggerEvent: 'Trigger_01',
                                        specialScreenHitData: [
                                            [true, false, false, false],
                                            [true, false, false, false],
                                            [true, false, false, false],
                                            [false, false, false, false],
                                            [false, false, false, false]
                                        ],
                                        specialScreenWin: 0
                                    }
                                ],
                                progressResult: {
                                    maxTriggerFlag: true,
                                    stepInfo: { currentStep: 1, addStep: 0, totalStep: 1 },
                                    stageInfo: { currentStage: 1, totalStage: 1, addStage: 0 },
                                    roundInfo: { currentRound: 1, totalRound: 1, addRound: 0 }
                                },
                                displayResult: {
                                    accumulateWinResult: {
                                        beforeSpinFirstStateOnlyBasePayAccWin: 0,
                                        afterSpinFirstStateOnlyBasePayAccWin: 0,
                                        beforeSpinAccWin: 0,
                                        afterSpinAccWin: 0
                                    },
                                    readyHandResult: { displayMethod: [[false], [false], [true], [false], [false]] }
                                },
                                gameResult: { playerWin: 0, lineWinResult: [], gameWinType: 'LineGame' }
                            }
                        ],
                        stateWin: 0
                    },
                    {
                        gameStateId: 2,
                        currentState: 3,
                        gameStateType: 'GS_004',
                        roundCount: 2,
                        roundResult: [
                            {
                                roundWin: 0,
                                screenResult: {
                                    tableIndex: 0,
                                    screenSymbol: [
                                        [1, 11, 7, 4],
                                        [1, 10, 6, 8],
                                        [1, 11, 5, 8],
                                        [7, 11, 10, 2],
                                        [9, 11, 10, 2]
                                    ],
                                    dampInfo: [
                                        [10, 10],
                                        [8, 4],
                                        [8, 6],
                                        [0, 2],
                                        [0, 2]
                                    ]
                                },
                                extendGameStateResult: { haveAddedWildCount: 4, extendWin: 0 },
                                progressResult: {
                                    maxTriggerFlag: false,
                                    stepInfo: { currentStep: 1, addStep: 0, totalStep: 1 },
                                    stageInfo: { currentStage: 1, totalStage: 1, addStage: 0 },
                                    roundInfo: { currentRound: 1, totalRound: 1, addRound: 1 }
                                },
                                displayResult: {
                                    accumulateWinResult: {
                                        beforeSpinFirstStateOnlyBasePayAccWin: 0,
                                        afterSpinFirstStateOnlyBasePayAccWin: 0,
                                        beforeSpinAccWin: 0,
                                        afterSpinAccWin: 0
                                    },
                                    readyHandResult: { displayMethod: [[false], [false], [true], [false], [false]] }
                                },
                                gameResult: { playerWin: 0, lineWinResult: [], gameWinType: 'LineGame' },
                                specialFeatureResult: [
                                    {
                                        specialHitPattern: 'HP_05',
                                        triggerEvent: 'Trigger_01',
                                        specialScreenHitData: [
                                            [true, false, false, false],
                                            [true, false, false, false],
                                            [true, false, false, false],
                                            [false, false, false, false],
                                            [false, false, false, false]
                                        ],
                                        specialScreenWin: 0
                                    }
                                ]
                            },
                            {
                                roundWin: 0,
                                screenResult: {
                                    tableIndex: 0,
                                    screenSymbol: [
                                        [8, 1, 11, 7],
                                        [6, 1, 4, 9],
                                        [11, 1, 9, 8],
                                        [9, 11, 10, 5],
                                        [11, 9, 6, 10]
                                    ],
                                    dampInfo: [
                                        [4, 5],
                                        [10, 5],
                                        [9, 4],
                                        [2, 8],
                                        [5, 11]
                                    ]
                                },
                                extendGameStateResult: { haveAddedWildCount: 8, extendWin: 0 },
                                progressResult: {
                                    maxTriggerFlag: true,
                                    stepInfo: { currentStep: 1, addStep: 0, totalStep: 1 },
                                    stageInfo: { currentStage: 1, totalStage: 1, addStage: 0 },
                                    roundInfo: { currentRound: 2, totalRound: 2, addRound: 0 }
                                },
                                displayResult: {
                                    accumulateWinResult: {
                                        beforeSpinFirstStateOnlyBasePayAccWin: 0,
                                        afterSpinFirstStateOnlyBasePayAccWin: 0,
                                        beforeSpinAccWin: 0,
                                        afterSpinAccWin: 0
                                    },
                                    readyHandResult: { displayMethod: [[false], [false], [false], [false], [false]] }
                                },
                                gameResult: { playerWin: 0, lineWinResult: [], gameWinType: 'LineGame' }
                            }
                        ],
                        stateWin: 0
                    },
                    { gameStateId: 3, currentState: 4, gameStateType: 'GS_002', roundCount: 0, stateWin: 0 }
                ],
                totalWin: 0,
                boardDisplayResult: { winRankType: 'Nothing' },
                gameFlowResult: { IsBoardEndFlag: true, currentSystemStateId: 3, systemStateIdOptions: [0, 997] },
                probabilityDetail: {
                    reportDetail: {
                        reportFlagDetail: {
                            IsBaseGameFlag: true,
                            IsRespinFlag: false,
                            IsFreeGameFlag: true,
                            IsBonusGameFlag: false,
                            IsDoubleGameFlag: false,
                            IsExtraSpinFlag: false
                        }
                    },
                    randomUsedDetail: { randomNumberUsed: 184, rndId: 1 },
                    settingId: 'v3_14901_05_01_001'
                }
            },
            gameSeq: 5250158551305,
            ts: 1559180838773
        };

        let result = JSON.parse(JSON.stringify(origin)) as SpinGSResult;
        return result;
    }

    /** 進 FG 一場 Free 一條連鍊 */
    private retrigerFreeWin(): SpinGSResult {
        let origin = {
            balance: 1994234.11,
            spinResult: {
                gameStateCount: 4,
                gameStateResult: [
                    { gameStateId: 0, currentState: 1, gameStateType: 'GS_001', roundCount: 0, stateWin: 0 },
                    {
                        gameStateId: 1,
                        currentState: 2,
                        gameStateType: 'GS_003',
                        roundCount: 1,
                        roundResult: [
                            {
                                roundWin: 0,
                                screenResult: {
                                    tableIndex: 0,
                                    screenSymbol: [
                                        [1, 3, 5, 8],
                                        [1, 5, 6, 5],
                                        [1, 8, 9, 7],
                                        [4, 11, 4, 10],
                                        [4, 7, 5, 11]
                                    ],
                                    dampInfo: [
                                        [9, 5],
                                        [10, 0],
                                        [10, 9],
                                        [10, 11],
                                        [10, 9]
                                    ]
                                },
                                specialFeatureResult: [
                                    {
                                        specialHitPattern: 'HP_05',
                                        triggerEvent: 'Trigger_01',
                                        specialScreenHitData: [
                                            [true, false, false, false],
                                            [true, false, false, false],
                                            [true, false, false, false],
                                            [false, false, false, false],
                                            [false, false, false, false]
                                        ],
                                        specialScreenWin: 0
                                    }
                                ],
                                progressResult: {
                                    maxTriggerFlag: true,
                                    stepInfo: { currentStep: 1, addStep: 0, totalStep: 1 },
                                    stageInfo: { currentStage: 1, totalStage: 1, addStage: 0 },
                                    roundInfo: { currentRound: 1, totalRound: 1, addRound: 0 }
                                },
                                displayResult: {
                                    accumulateWinResult: {
                                        beforeSpinFirstStateOnlyBasePayAccWin: 0,
                                        afterSpinFirstStateOnlyBasePayAccWin: 0,
                                        beforeSpinAccWin: 0,
                                        afterSpinAccWin: 0
                                    },
                                    readyHandResult: { displayMethod: [[false], [false], [true], [false], [false]] }
                                },
                                gameResult: { playerWin: 0, lineWinResult: [], gameWinType: 'LineGame' }
                            }
                        ],
                        stateWin: 0
                    },
                    {
                        gameStateId: 2,
                        currentState: 3,
                        gameStateType: 'GS_004',
                        roundCount: 3,
                        roundResult: [
                            {
                                roundWin: 500,
                                screenResult: {
                                    tableIndex: 0,
                                    screenSymbol: [
                                        [1, 2, 7, 4],
                                        [1, 2, 6, 8],
                                        [1, 2, 5, 8],
                                        [7, 2, 10, 2],
                                        [9, 2, 10, 2]
                                    ],
                                    dampInfo: [
                                        [10, 10],
                                        [8, 4],
                                        [8, 6],
                                        [0, 2],
                                        [0, 2]
                                    ]
                                },
                                extendGameStateResult: { haveAddedWildCount: 4, extendWin: 0 },
                                progressResult: {
                                    maxTriggerFlag: false,
                                    stepInfo: { currentStep: 1, addStep: 0, totalStep: 1 },
                                    stageInfo: { currentStage: 1, totalStage: 1, addStage: 0 },
                                    roundInfo: { currentRound: 1, totalRound: 1, addRound: 2 }
                                },
                                displayResult: {
                                    accumulateWinResult: {
                                        beforeSpinFirstStateOnlyBasePayAccWin: 0,
                                        afterSpinFirstStateOnlyBasePayAccWin: 500,
                                        beforeSpinAccWin: 0,
                                        afterSpinAccWin: 500
                                    },
                                    readyHandResult: { displayMethod: [[false], [false], [true], [false], [false]] }
                                },
                                gameResult: {
                                    playerWin: 500,
                                    lineWinResult: [
                                        {
                                            lineId: 0,
                                            hitDirection: 'LeftToRight',
                                            isMixGroupFlag: false,
                                            hitMixGroup: -1,
                                            hitSymbol: 2,
                                            hitWay: 5,
                                            hitOdds: 500,
                                            lineWin: 500,
                                            screenHitData: [
                                                [false, true, false, false],
                                                [false, true, false, false],
                                                [false, true, false, false],
                                                [false, true, false, false],
                                                [false, true, false, false]
                                            ]
                                        }
                                    ],
                                    gameWinType: 'LineGame'
                                },
                                specialFeatureResult: [
                                    {
                                        specialHitPattern: 'HP_05',
                                        triggerEvent: 'Trigger_01',
                                        specialScreenHitData: [
                                            [true, false, false, false],
                                            [true, false, false, false],
                                            [true, false, false, false],
                                            [false, false, false, false],
                                            [false, false, false, false]
                                        ],
                                        specialScreenWin: 0
                                    }
                                ]
                            },
                            {
                                roundWin: 0,
                                screenResult: {
                                    tableIndex: 0,
                                    screenSymbol: [
                                        [1, 3, 5, 8],
                                        [1, 5, 6, 5],
                                        [1, 8, 9, 7],
                                        [4, 11, 4, 10],
                                        [4, 7, 5, 11]
                                    ],
                                    dampInfo: [
                                        [10, 10],
                                        [8, 4],
                                        [8, 6],
                                        [0, 2],
                                        [0, 2]
                                    ]
                                },
                                extendGameStateResult: { haveAddedWildCount: 4, extendWin: 0 },
                                progressResult: {
                                    maxTriggerFlag: true,
                                    stepInfo: { currentStep: 1, addStep: 0, totalStep: 1 },
                                    stageInfo: { currentStage: 1, totalStage: 1, addStage: 0 },
                                    roundInfo: { currentRound: 2, totalRound: 3, addRound: 0 }
                                },
                                displayResult: {
                                    accumulateWinResult: {
                                        beforeSpinFirstStateOnlyBasePayAccWin: 500,
                                        afterSpinFirstStateOnlyBasePayAccWin: 500,
                                        beforeSpinAccWin: 500,
                                        afterSpinAccWin: 500
                                    },
                                    readyHandResult: { displayMethod: [[false], [false], [true], [false], [false]] }
                                },
                                gameResult: { playerWin: 0, lineWinResult: [], gameWinType: 'LineGame' },
                                specialFeatureResult: [
                                    {
                                        specialHitPattern: 'HP_05',
                                        triggerEvent: 'Trigger_01',
                                        specialScreenHitData: [
                                            [true, false, false, false],
                                            [true, false, false, false],
                                            [true, false, false, false],
                                            [false, false, false, false],
                                            [false, false, false, false]
                                        ],
                                        specialScreenWin: 0
                                    }
                                ]
                            },
                            {
                                roundWin: 500,
                                screenResult: {
                                    tableIndex: 0,
                                    screenSymbol: [
                                        [1, 2, 7, 4],
                                        [1, 2, 6, 8],
                                        [1, 2, 5, 8],
                                        [7, 2, 10, 2],
                                        [9, 2, 10, 2]
                                    ],
                                    dampInfo: [
                                        [10, 10],
                                        [8, 4],
                                        [8, 6],
                                        [0, 2],
                                        [0, 2]
                                    ]
                                },
                                extendGameStateResult: { haveAddedWildCount: 4, extendWin: 0 },
                                progressResult: {
                                    maxTriggerFlag: true,
                                    stepInfo: { currentStep: 1, addStep: 0, totalStep: 1 },
                                    stageInfo: { currentStage: 1, totalStage: 1, addStage: 0 },
                                    roundInfo: { currentRound: 3, totalRound: 3, addRound: 0 }
                                },
                                displayResult: {
                                    accumulateWinResult: {
                                        beforeSpinFirstStateOnlyBasePayAccWin: 500,
                                        afterSpinFirstStateOnlyBasePayAccWin: 1000,
                                        beforeSpinAccWin: 500,
                                        afterSpinAccWin: 1000
                                    },
                                    readyHandResult: { displayMethod: [[false], [false], [true], [false], [false]] }
                                },
                                gameResult: {
                                    playerWin: 500,
                                    lineWinResult: [
                                        {
                                            lineId: 0,
                                            hitDirection: 'LeftToRight',
                                            isMixGroupFlag: false,
                                            hitMixGroup: -1,
                                            hitSymbol: 2,
                                            hitWay: 5,
                                            hitOdds: 500,
                                            lineWin: 500,
                                            screenHitData: [
                                                [false, true, false, false],
                                                [false, true, false, false],
                                                [false, true, false, false],
                                                [false, true, false, false],
                                                [false, true, false, false]
                                            ]
                                        }
                                    ],
                                    gameWinType: 'LineGame'
                                }
                            }
                        ],
                        stateWin: 1000
                    },
                    { gameStateId: 3, currentState: 4, gameStateType: 'GS_002', roundCount: 0, stateWin: 0 }
                ],
                totalWin: 0,
                boardDisplayResult: { winRankType: 'Nothing' },
                gameFlowResult: { IsBoardEndFlag: true, currentSystemStateId: 3, systemStateIdOptions: [0, 997] },
                probabilityDetail: {
                    reportDetail: {
                        reportFlagDetail: {
                            IsBaseGameFlag: true,
                            IsRespinFlag: false,
                            IsFreeGameFlag: true,
                            IsBonusGameFlag: false,
                            IsDoubleGameFlag: false,
                            IsExtraSpinFlag: false
                        }
                    },
                    randomUsedDetail: { randomNumberUsed: 184, rndId: 1 },
                    settingId: 'v3_14901_05_01_001'
                }
            },
            gameSeq: 5250158551305,
            ts: 1559180838773
        };

        let result = JSON.parse(JSON.stringify(origin)) as SpinGSResult;
        return result;
    }
}

export class MockSpinScatterNowinCommand extends puremvc.SimpleCommand {
    public static readonly NAME = 'MockScatterNoWinCommand';

    public execute(notification: puremvc.INotification): void {
        if (notification.getBody()) {
            MockSpinScatterResponseCommand.ScatterId = notification.getBody();
        }

        const self = this;
        self.facade.removeCommand(SpinResponseCommand.NAME);
        self.facade.registerCommand(MockSpinScatterResponseCommand.NAME, MockSpinScatterResponseCommand);
        self.sendNotification(ScreenEvent.ON_SPIN_DOWN);
    }
}
