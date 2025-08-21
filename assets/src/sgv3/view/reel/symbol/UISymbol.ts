import { Vec3, _decorator, math, Material } from 'cc';
import { UIViewBase } from '../../../../core/uiview/UIViewBase';
import { TSMap } from '../../../../core/utils/TSMap';
import { Layer } from '../../../vo/enum/Layer';
import { SymbolPartType } from '../../../vo/enum/Reel';
import { SymbolContentBase } from './SymbolContentBase';
import { SymbolPart } from './SymbolPart';
import { OverlaySymbolContainer } from './OverlaySymbolContainer';
const { ccclass } = _decorator;

@ccclass('UISymbol')
export class UISymbol extends UIViewBase {
    //// Internal Member
    private _symbolContent: SymbolContentBase | null = null;
    ////

    //// property
    public get symbolContent() {
        if (this._symbolContent == null) {
            this._symbolContent = this.getComponent(SymbolContentBase);
        }
        return this._symbolContent;
    }

    public get symbolPos(){
        return this.node.position;
    }

    public set symbolPos(value: Vec3){
        this.setSymbolPos(value);
    }

    public getSymbolPosWithType(type: SymbolPartType) {
        if (this.symbolContent.parts.get(type)) return this.symbolContent.parts.get(type).node.worldPosition;
        else return this.node.worldPosition;
    }

    public getSymbolLocalPosWithType(type: SymbolPartType) {
        if (this.symbolContent.parts.get(type)) {
            return this.symbolContent.parts.get(type).node.position;
        } else {
            return this.node.position;
        }
    }
    ////

    //// API
    public init(){      
        if(this.symbolContent.parts == null){
            this.symbolContent.parts = new TSMap<SymbolPartType, SymbolPart>();
            let parts = this.node.getComponentsInChildren(SymbolPart);
            for(let i in parts){
                this.symbolContent.parts.set(parts[i].partType,parts[i]);      
            }
        }    
    }

    public recyclePart(){
        this.symbolContent.parts.forEach((part) => {
            part.node.setParent(this.node);
        })
    }

    public setSibling(index: number){
        this.symbolContent.parts.forEach((part) => {
            part.node.setSiblingIndex(index);
        })
    }

    public setSharedMaterial(material: Material){
        this.symbolContent.parts.forEach((part) => {
            part.renderable2D.customMaterial = material;
        })
    }

    public setColor(color: Readonly<math.Color>){
        this.symbolContent.parts.forEach((part) => {
            part.renderable2D.color = color;
        })
    }

    public setSymbolPos(movePos: Vec3){
        this.node.setPosition(movePos);
        this.symbolContent.parts.forEach((part) => {
            part.setPartPos(this.node.worldPosition);
        })
    }

    public setLayer(layer: Layer) {
        this.symbolContent.parts.forEach((part) => {
            part.node.layer = layer;
        })
    }

    public setOverlay(container: OverlaySymbolContainer) {
        this.symbolContent.parts.forEach((part) => {
            if (part.defaultParent == null) {
                part.defaultParent = part.node.parent;
                let partParent = container.getPartParent(part.partType);
                part.node.setParent(partParent, true);
            }
        });
    }

    public restoreParent() {
        this.symbolContent.parts.forEach((part) => {
            if (part.defaultParent) {
                part.node.setParent(part.defaultParent, true);
                part.defaultParent = null;
            }
        });
    }
    ////

    //// Hook
    ////

    ////Internal Method
    ////
}
