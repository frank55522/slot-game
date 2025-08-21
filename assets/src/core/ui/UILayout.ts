import { _decorator, Layout, CCFloat, CCInteger, Enum } from 'cc';
const { ccclass, property } = _decorator;

export enum LayoutType {
   NONE,
   HORIZONTAL,
   VERTICAL,
   GRID,
}

export enum Constraint {
    NONE,
    FIXED_ROW,
    FIXED_COL,
 }

@ccclass('LayoutDisplayModeSetting')
export class LayoutDisplayModeSetting {
    @property({ type: Enum(LayoutType), visible: true })
    public type = 0;
    @property({ type: CCFloat, visible: true })
    public paddingLeft = 0;
    @property({ type: CCFloat, visible: true })
    public paddingRight = 0;
    @property({ type: CCFloat, visible: true })
    public paddingTop = 0;
    @property({ type: CCFloat, visible: true })
    public paddingBottom = 0;
    @property({ type: CCFloat, visible: true })
    public spacingX = 0;
    @property({ type: CCFloat, visible: true })
    public spacingY = 0;
    @property({ type: Enum(Constraint), visible: true })
    public constraint = 0;
    @property({ type: CCInteger, visible: true })
    public constraintNum = 0;
}

@ccclass('UILayout')
export class UILayout extends Layout {
    @property({ type: LayoutDisplayModeSetting, visible: true })
    private _horizontalDisplaySetting: LayoutDisplayModeSetting = new LayoutDisplayModeSetting();
    @property({ type: LayoutDisplayModeSetting, visible: true })
    private _verticalDisplaySetting: LayoutDisplayModeSetting = new LayoutDisplayModeSetting();

    public changeOrientation(isHorizontal: boolean) {
        this.paddingLeft = isHorizontal ? this._horizontalDisplaySetting.paddingLeft : this._verticalDisplaySetting.paddingLeft;
        this.paddingRight = isHorizontal ? this._horizontalDisplaySetting.paddingRight : this._verticalDisplaySetting.paddingRight;
        this.paddingTop = isHorizontal ? this._horizontalDisplaySetting.paddingTop : this._verticalDisplaySetting.paddingTop;
        this.paddingBottom = isHorizontal ? this._horizontalDisplaySetting.paddingBottom : this._verticalDisplaySetting.paddingBottom;
        
        this.spacingX = isHorizontal ? this._horizontalDisplaySetting.spacingX : this._verticalDisplaySetting.spacingX;
        this.spacingY = isHorizontal ? this._horizontalDisplaySetting.spacingY : this._verticalDisplaySetting.spacingY;
    }

    public changeSetting(setting: LayoutDisplayModeSetting){
        this.type = setting.type;
        this.paddingLeft = setting.paddingLeft;
        this.paddingRight = setting.paddingRight
        this.paddingTop = setting.paddingTop
        this.paddingBottom = setting.paddingBottom
        
        this.spacingX = setting.spacingX
        this.spacingY = setting.spacingY

        this.constraint = setting.constraint;
        this.constraintNum = setting.constraintNum;
    }
}
