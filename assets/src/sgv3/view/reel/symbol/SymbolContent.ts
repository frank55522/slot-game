
import { _decorator, Label, Font } from 'cc';
import { SymbolContentBase } from './SymbolContentBase';
const { ccclass, property } = _decorator;
 
@ccclass('SymbolContent')
export class SymbolContent extends SymbolContentBase {  
    @property({ type: Label, visible: true })
    public labelText: Label | null = null;
    @property({ type: Font, visible: true })
    public baseFont: Font | null = null;
    @property({ type: Font, visible: true })
    public specialFont: Font | null = null;

    public credit: number = 0;
    public creditDisplay: string = '';

    public isSpecialFont: boolean = false;

    updateLayer(layer: number){
        this.labelText!.node.layer = layer;
    }
}
