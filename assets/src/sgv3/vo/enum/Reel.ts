export enum ReelType {
    INIT = 0,
    ROLL_START = 1,
    ROLL_AFTER = 2,
    STOP = 3,
    EMERGENCY_STOP = 4,
    SLOW_STOP = 5,
    DAMP = 6,
    SHOW = 7,
    HIDE = 8,
    BLACK_SHOW = 9 // ByGame
}

export enum MotionType {
    NORMAL = 'Normal',
    QUICK = 'Quick',
    EMERGENCY = 'Emergency',
    SLOW = 'Slow'
}

export enum SymbolPerformType {
    SHOW = 0,
    HIDE = 1,
    ROLL_CYCLED = 2,
    SHOW_ALL_WIN = 3,
    SHOW_LOOP_WIN = 4,
    SHOW_BONUS_WIN = 5,

    DAMPING = 10, //Damping 特殊表演
    SHOW_RESPIN = 11, //升龍賞 RESPIN 表演
    SHOW_BASE_CREDIT_COLLECT = 12, //升龍賞 C1 球 收集 表演
    SHOW_TARGERT_CREDIT_COLLECT = 13, //升龍賞 C2 球 收集 表演
    SHOW_TARGERT_CREDIT_RESULT = 14 //升龍賞 C2 球 最終結果 表演
}

export enum SymbolId {
    WILD = 0,
    C1 = 1,
    M1 = 2,
    M2 = 3,
    M3 = 4,
    M4 = 5,
    M5 = 6,
    M6 = 7,
    C2 = 14,

    SUB = 20
}

export enum SymbolPartType {
    BACKGROUND,
    MAIN,
    LABEL,
    SUB
}

export enum LockType {
    NONE = 0,
    BASE_LOCK = 1,
    OLD_LOCK = 2,
    NEW_LOCK = 3
}
