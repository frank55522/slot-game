import {
    _decorator,
    Component,
    director,
    CCString,
    Node,
    Label,
    EventTouch,
    EditBox,
    TweenEasing,
    Prefab,
    Button
} from 'cc';
import { GameScene } from '../../vo/data/GameScene';
import { MotionType } from '../../vo/enum/Reel';
import { ReelPasser } from '../../vo/match/ReelMatchInfo';
const { ccclass, property } = _decorator;

@ccclass('PassControllInfo')
export class PassControllInfo {
    @property({ type: CCString, visible: true })
    public gameName: string = String();
    @property({ type: [CCString], visible: true })
    public motionsName: Array<string> = [];
    @property({ type: [CCString], visible: true })
    public typesName: Array<string> = [];
}
@ccclass('Description')
export class Description {
    @property({ type: Label, visible: true })
    public startSpeedDescription: Label | null = null;
    @property({ type: Label, visible: true })
    public passDescription: Label | null = null;
    @property({ type: Label, visible: true })
    public durationDescription: Label | null = null;
    @property({ type: Label, visible: true })
    public speedDescription: Label | null = null;
    @property({ type: Label, visible: true })
    public forceDescription: Label | null = null;
}
@ccclass('ReelTestPasser')
export class ReelTestPasser extends Component {
    @property({ type: [PassControllInfo], visible: true })
    private infoArray: Array<PassControllInfo> = [];

    @property({ type: Node })
    private content: Node | null = null;

    @property({ type: [Prefab] })
    private prefabs: Array<Prefab> = [];

    @property({ type: Description, visible: true })
    private descriptionLabel: Description | null = null;

    @property({ type: Label, visible: true })
    private gameLabel: Label | null = null;

    @property({ type: Label, visible: true })
    private motionLabel: Label | null = null;

    @property({ type: Label, visible: true })
    private typeLabel: Label | null = null;

    @property({ type: EditBox, visible: true })
    private startSpeedEdit: EditBox | null = null;

    @property({ type: EditBox, visible: true })
    private passEdit: EditBox | null = null;

    @property({ type: EditBox, visible: true })
    private durationEdit: EditBox | null = null;

    @property({ type: EditBox, visible: true })
    private speedEdit: EditBox | null = null;

    @property({ type: EditBox, visible: true })
    private forceEdit: EditBox | null = null;

    private _pool: Map<string, ReelPasser> | null = null;

    private _isTriggerPoint: boolean = false;

    private _isInital: boolean = false;

    private _curGameIndex: number = 0;

    private _curMotionIndex: number = 0;

    private _curTypeIndex: number = 0;

    private _curReelPasser: ReelPasser | null = null;

    private _curGameName: string = GameScene.Game_1;

    private listener: ReelTestPasserListener;

    public onPointTouch() {
        this.content!.active = this._isTriggerPoint;
        this._isTriggerPoint = !this._isTriggerPoint;
    }

    public onApplyTouch() {
        this.getEditString();
        this.listener.applyReelPasser(this.getGameName(), this._curReelPasser);
    }

    public onNextGameTouch() {
        this._curGameIndex++;
        if (this._curGameIndex >= this.infoArray.length) {
            this._curGameIndex = 0;
        }
        this.resetLabel();
        this.gameLabel.string = this.infoArray[this._curGameIndex].gameName;
        this._curReelPasser = this._pool.get(this.gameLabel.string);
        this.setInitEditString();
    }

    public onNextMotionTouch() {
        this._curMotionIndex++;
        if (this._curMotionIndex >= this.infoArray[this._curGameIndex].motionsName.length) {
            this._curMotionIndex = 0;
        }
        this.motionLabel.string = this.infoArray[this._curGameIndex].motionsName[this._curMotionIndex];
        this.setInitEditString();
    }

    public onNextTypeTouch() {
        this._curTypeIndex++;
        if (this._curTypeIndex >= this.infoArray[this._curGameIndex].typesName.length) {
            this._curTypeIndex = 0;
        }
        this.typeLabel.string = this.infoArray[this._curGameIndex].typesName[this._curTypeIndex];
        this.setInitEditString();
    }
    private resetLabel() {
        this._curMotionIndex = 0;
        this._curTypeIndex = 0;
        this.motionLabel.string = this.infoArray[this._curGameIndex].motionsName[this._curMotionIndex];
        this.typeLabel.string = this.infoArray[this._curGameIndex].typesName[this._curTypeIndex];
    }
    public onInit(l: ReelTestPasserListener) {
        if (this._isInital) {
            return;
        }
        this.listener = l;
        this._pool = new Map<string, ReelPasser>();
        this.prefabs.forEach((prefab) => {
            let passer: ReelPasser = prefab.data.getComponent('SingleReelContentBase').ReelPasser;
            this._pool.set(prefab.data.name, passer);
        });
        this.gameLabel.string = this.infoArray[0].gameName;
        this.motionLabel.string = this.infoArray[0].motionsName[this._curMotionIndex];
        this.typeLabel.string = this.infoArray[0].typesName[this._curTypeIndex];
        this._curReelPasser = this._pool.get(this.gameLabel.string);
        this.setInitEditString();

        this._isInital = true;
    }
    private getGameName(): string {
        switch (this.gameLabel.string) {
            case this.infoArray[0].gameName:
                this._curGameName = GameScene.Game_1;
                break;
            case this.infoArray[1].gameName:
                this._curGameName = GameScene.Game_2;
                break;
            case this.infoArray[2].gameName:
                this._curGameName = GameScene.Game_4;
                break;
        }
        return this._curGameName;
    }
    private setInitEditString() {
        this.passEdit.node.active = true;
        this.durationEdit.node.active = true;
        this.speedEdit.node.active = true;
        this.forceEdit.node.active = false;
        this.descriptionLabel.passDescription.node.active = true;
        this.descriptionLabel.durationDescription.node.active = true;
        this.descriptionLabel.speedDescription.node.active = true;
        this.descriptionLabel.forceDescription.node.active = false;

        switch (this.motionLabel.string) {
            case MotionType.NORMAL:
                switch (this.typeLabel.string) {
                    case 'Roll':
                        this.passEdit.string = String(this._pool.get(this.gameLabel.string).normalRollMotion.pass);
                        this.durationEdit.string = String(
                            this._pool.get(this.gameLabel.string).normalRollMotion.duration
                        );
                        this.speedEdit.string = String(this._pool.get(this.gameLabel.string).normalRollMotion.value);
                        break;
                    case 'Stop':
                        this.passEdit.string = String(this._pool.get(this.gameLabel.string).normalStopMotion.pass);
                        this.durationEdit.string = String(
                            this._pool.get(this.gameLabel.string).normalStopMotion.duration
                        );
                        this.speedEdit.string = String(this._pool.get(this.gameLabel.string).normalStopMotion.value);
                        break;
                    case 'Damp':
                        this.passEdit.node.active = false;
                        this.descriptionLabel.passDescription.node.active = false;
                        this.speedEdit.node.active = false;
                        this.descriptionLabel.speedDescription.node.active = false;
                        this.forceEdit.node.active = true;
                        this.descriptionLabel.forceDescription.node.active = true;
                        this.forceEdit.string = String(this._pool.get(this.gameLabel.string).normalDampMotions.force);
                        this.durationEdit.string = String(
                            this._pool.get(this.gameLabel.string).normalDampMotions.duration
                        );
                        break;
                }
                break;
            case MotionType.QUICK:
                switch (this.typeLabel.string) {
                    case 'Roll':
                        this.passEdit.string = String(this._pool.get(this.gameLabel.string).quickRollMotion.pass);
                        this.durationEdit.string = String(
                            this._pool.get(this.gameLabel.string).quickRollMotion.duration
                        );
                        this.speedEdit.string = String(this._pool.get(this.gameLabel.string).quickRollMotion.value);
                        break;
                    case 'Stop':
                        this.passEdit.string = String(this._pool.get(this.gameLabel.string).quickStopMotion.pass);
                        this.durationEdit.string = String(
                            this._pool.get(this.gameLabel.string).quickStopMotion.duration
                        );
                        this.speedEdit.string = String(this._pool.get(this.gameLabel.string).quickStopMotion.value);
                        break;
                    case 'Damp':
                        this.passEdit.node.active = false;
                        this.descriptionLabel.passDescription.node.active = false;
                        this.speedEdit.node.active = false;
                        this.descriptionLabel.speedDescription.node.active = false;
                        this.forceEdit.node.active = true;
                        this.descriptionLabel.forceDescription.node.active = true;
                        this.forceEdit.string = String(this._pool.get(this.gameLabel.string).quickDampMotion.force);
                        this.durationEdit.string = String(
                            this._pool.get(this.gameLabel.string).quickDampMotion.duration
                        );
                        break;
                }
                break;
            case MotionType.EMERGENCY:
                switch (this.typeLabel.string) {
                    case 'Roll':
                        this.passEdit.node.active = false;
                        this.durationEdit.node.active = false;
                        this.speedEdit.node.active = false;
                        this.forceEdit.node.active = false;
                        this.descriptionLabel.passDescription.node.active = false;
                        this.descriptionLabel.durationDescription.node.active = false;
                        this.descriptionLabel.speedDescription.node.active = false;
                        this.descriptionLabel.forceDescription.node.active = false;
                        break;
                    case 'Stop':
                        this.passEdit.string = String(this._pool.get(this.gameLabel.string).emergencyStopMotion.pass);
                        this.durationEdit.string = String(
                            this._pool.get(this.gameLabel.string).emergencyStopMotion.duration
                        );
                        this.speedEdit.string = String(this._pool.get(this.gameLabel.string).emergencyStopMotion.value);
                        break;
                    case 'Damp':
                        this.passEdit.node.active = false;
                        this.descriptionLabel.passDescription.node.active = false;
                        this.speedEdit.node.active = false;
                        this.descriptionLabel.speedDescription.node.active = false;
                        this.forceEdit.node.active = true;
                        this.descriptionLabel.forceDescription.node.active = true;
                        this.forceEdit.string = String(this._pool.get(this.gameLabel.string).emergencyDampMotion.force);
                        this.durationEdit.string = String(
                            this._pool.get(this.gameLabel.string).emergencyDampMotion.duration
                        );
                        break;
                }
                break;
            case MotionType.SLOW:
                switch (this.typeLabel.string) {
                    case 'Roll':
                        this.passEdit.node.active = false;
                        this.durationEdit.node.active = false;
                        this.speedEdit.node.active = false;
                        this.forceEdit.node.active = false;
                        this.descriptionLabel.passDescription.node.active = false;
                        this.descriptionLabel.durationDescription.node.active = false;
                        this.descriptionLabel.speedDescription.node.active = false;
                        this.descriptionLabel.forceDescription.node.active = false;
                        break;
                    case 'Stop':
                        this.passEdit.string = String(this._pool.get(this.gameLabel.string).slowStopMotion.pass);
                        this.durationEdit.string = String(
                            this._pool.get(this.gameLabel.string).slowStopMotion.duration
                        );
                        this.speedEdit.string = String(this._pool.get(this.gameLabel.string).slowStopMotion.value);
                        break;
                    case 'Damp':
                        this.passEdit.node.active = false;
                        this.descriptionLabel.passDescription.node.active = false;
                        this.speedEdit.node.active = false;
                        this.descriptionLabel.speedDescription.node.active = false;
                        this.forceEdit.node.active = true;
                        this.descriptionLabel.forceDescription.node.active = true;
                        this.durationEdit.string = String(
                            this._pool.get(this.gameLabel.string).slowDampMotion.duration
                        );
                        this.forceEdit.string = String(this._pool.get(this.gameLabel.string).slowDampMotion.force);
                        break;
                }
                break;
        }
        this.startSpeedEdit.string = String(this._pool.get(this.gameLabel.string).startSpeed);
    }
    private getEditString() {
        switch (this.motionLabel.string) {
            case MotionType.NORMAL:
                switch (this.typeLabel.string) {
                    case 'Roll':
                        this._curReelPasser.normalRollMotion.pass = parseInt(this.passEdit.string);
                        this._curReelPasser.normalRollMotion.duration = parseFloat(this.durationEdit.string);
                        this._curReelPasser.normalRollMotion.value = parseInt(this.speedEdit.string);
                        break;
                    case 'Stop':
                        this._curReelPasser.normalStopMotion.pass = parseInt(this.passEdit.string);
                        this._curReelPasser.normalStopMotion.duration = parseFloat(this.durationEdit.string);
                        this._curReelPasser.normalStopMotion.value = parseInt(this.speedEdit.string);
                        break;
                    case 'Damp':
                        this._curReelPasser.normalDampMotions.duration = parseFloat(this.durationEdit.string);
                        this._curReelPasser.normalDampMotions.force = parseFloat(this.forceEdit.string);
                        break;
                }
                break;
            case MotionType.QUICK:
                switch (this.typeLabel.string) {
                    case 'Roll':
                        this._curReelPasser.quickRollMotion.pass = parseInt(this.passEdit.string);
                        this._curReelPasser.quickRollMotion.duration = parseFloat(this.durationEdit.string);
                        this._curReelPasser.quickRollMotion.value = parseInt(this.speedEdit.string);
                        break;
                    case 'Stop':
                        this._curReelPasser.quickStopMotion.pass = parseInt(this.passEdit.string);
                        this._curReelPasser.quickStopMotion.duration = parseFloat(this.durationEdit.string);
                        this._curReelPasser.quickStopMotion.value = parseInt(this.speedEdit.string);
                        break;
                    case 'Damp':
                        this._curReelPasser.quickDampMotion.duration = parseFloat(this.durationEdit.string);
                        this._curReelPasser.quickDampMotion.force = parseFloat(this.forceEdit.string);
                        break;
                }
                break;
            case MotionType.EMERGENCY:
                switch (this.typeLabel.string) {
                    case 'Stop':
                        this._curReelPasser.emergencyStopMotion.pass = parseInt(this.passEdit.string);
                        this._curReelPasser.emergencyStopMotion.duration = parseFloat(this.durationEdit.string);
                        this._curReelPasser.emergencyStopMotion.value = parseInt(this.speedEdit.string);
                        break;
                    case 'Damp':
                        this._curReelPasser.emergencyDampMotion.duration = parseFloat(this.durationEdit.string);
                        this._curReelPasser.emergencyDampMotion.force = parseFloat(this.forceEdit.string);
                        break;
                }
                break;
            case MotionType.SLOW:
                switch (this.typeLabel.string) {
                    case 'Stop':
                        this._curReelPasser.slowStopMotion.pass = parseInt(this.passEdit.string);
                        this._curReelPasser.slowStopMotion.duration = parseFloat(this.durationEdit.string);
                        this._curReelPasser.slowStopMotion.value = parseInt(this.speedEdit.string);
                        break;
                    case 'Damp':
                        this._curReelPasser.slowDampMotion.duration = parseFloat(this.durationEdit.string);
                        this._curReelPasser.slowDampMotion.force = parseFloat(this.forceEdit.string);
                        break;
                }
                break;
        }
        this._curReelPasser.startSpeed = parseInt(this.startSpeedEdit.string);
    }
}
export interface ReelTestPasserListener {
    applyReelPasser(sceneName: string, reelPasser: ReelPasser);
}