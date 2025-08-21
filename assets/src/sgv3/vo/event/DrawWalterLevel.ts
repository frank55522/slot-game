export enum DrawWalterLevel {
    DrawWaterLevle_1,
    DrawWaterLevle_2,
    DrawWaterLevle_3,
    DrawWaterLevle_4,
    DrawWaterLevle_5,
    DrawWaterLevle_6,
    DrawWaterLevle_7,
    DrawWaterLevle_8,
    DrawWaterLevle_9,
    DrawWaterLevle_10,
    DrawWaterLevle_11,
    DrawWaterLevle_12,
    DrawWaterLevle_13,
    DrawWaterLevle_14
}

export class DrawWalterLevelUtil {
    public static toString(num: number) {
        return DrawWalterLevel[num];
    }
}
