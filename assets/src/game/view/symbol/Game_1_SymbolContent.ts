import { Font, Label, Prefab, _decorator } from 'cc';
import { PoolManager } from '../../../sgv3/PoolManager';
import { SymbolContentBase } from '../../../sgv3/view/reel/symbol/SymbolContentBase';
import { ParticleContentTool } from 'ParticleContentTool';
import { SymbolPartType } from 'src/sgv3/vo/enum/Reel';
import { TimelineTool } from 'TimelineTool';
const { ccclass, property } = _decorator;

@ccclass('Game_1_SymbolContent')
export class Game_1_SymbolContent extends SymbolContentBase {
    @property({ type: Label, visible: true })
    public labelText: Label | null = null;
    @property({ type: Font, visible: true })
    public baseFont: Font | null = null;
    @property({ type: Font, visible: true })
    public specialFont: Font | null = null;
    @property({ type: Prefab, visible: true })
    public particlePrefab: Prefab | null = null;
    @property({ type: TimelineTool, visible: true })
    public timelineTool: TimelineTool | null = null;

    public credit: number = 0;
    public creditDisplay: string = '';

    public isSpecialFont: boolean = false;

    private particleContent: ParticleContentTool;
    private recycleParticleCallback: Function;

    public createParticlePrefab() {
        const self = this;
        let symbolPart = self.parts.get(SymbolPartType.MAIN);
        self.particleContent = PoolManager.instance
            .getNode(self.particlePrefab, symbolPart.node)
            .getComponent(ParticleContentTool);

        self.particleContent.ParticlePlay();
        self.recycleParticleCallback = self.recycleParticlePrefab;
        self.scheduleOnce(self.recycleParticleCallback, 0.8);
    }

    public recycleParticlePrefab() {
        const self = this;
        if (self.particleContent) {
            self.particleContent.ParticleClear();
            self.particleContent.ParticleStop();
            PoolManager.instance.putNode(self.particleContent.node);
            self.particleContent = null;
        }
    }

    public forceRecycleParticlePrefab() {
        this.unschedule(this.recycleParticleCallback);
        this.recycleParticlePrefab();
    }
}
