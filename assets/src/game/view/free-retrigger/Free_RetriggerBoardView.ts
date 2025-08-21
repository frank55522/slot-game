import { _decorator } from 'cc';
import { AudioManager } from 'src/audio/AudioManager';
import BaseView from 'src/base/BaseView';
import { AudioClipsEnum } from 'src/game/vo/enum/SoundMap';
import { TimelineTool } from 'TimelineTool';
const { ccclass } = _decorator;

@ccclass('Free_RetriggerBoardView')
export class Free_RetriggerBoardView extends BaseView {
    private language: string;

    private _retriggerBoard: TimelineTool | null = null;
    public get retriggerBoard() {
        if (this._retriggerBoard == null) {
            this._retriggerBoard = this.node.getComponent(TimelineTool);
        }
        return this._retriggerBoard;
    }

    public init(lang: string) {
        const self = this;
        self.language = lang;
    }

    //** show retrigger board */
    public retriggerShow(addRound: number) {
        let self = this;
        self.retriggerBoard?.play('Show');

        AudioManager.Instance.play(AudioClipsEnum[`FreeRetrigger_${self.language}`]);
    }
}
