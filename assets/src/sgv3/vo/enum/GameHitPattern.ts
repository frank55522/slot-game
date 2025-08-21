export enum GameHitPattern {
    LeftToRight, // 代表為LineGame，且兌獎方式為由左至右
    RightToLeft, // 代表為LineGame，且兌獎方式為由右至左
    DoubleHit, // 代表為LineGame，且兌獎方式為雙邊對獎
    WaysGame, // 代表為WaysGame
    WaysGame_DoubleHit, // 代表為WaysGame，且兌獎方式為雙邊對獎
    SLOT_777, // 代表為類似777Game，且兌獎方式為由左至右與由上至下
    GameHitPatternCount
}
