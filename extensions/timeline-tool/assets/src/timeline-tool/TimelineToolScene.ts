import {
  _decorator,
  Component,
  Node,
  Button,
  EventHandler,
  Label,
  Prefab,
  instantiate,
  assetManager,
  AssetManager,
} from "cc";
import { TimelineComboBox_Normal } from "./TimelineComboBox_Normal";
import { TimelineComboBox_Tandem } from "./TimelineComboBox_Tandem";
import { TimelineTool } from "./TimelineTool";
import { TimelineMode } from "./ToolData";

const { ccclass, property } = _decorator;

@ccclass("TimelineToolScene")
export class TimelineToolScene extends Component {
  isPlayingLabel: Label = null;
  modeLabel: Label = null;
  ButtonModeBtn: Button;
  ButtonGroup_Normal: TimelineComboBox_Normal | null = null;
  ButtonGroup_Tandem: TimelineComboBox_Tandem | null = null;
  timelineTool: TimelineTool[] = [];
  timelineIndex: number = 0;
  timelineCount: number = 0;
  timelineDataIndex: number = 0;
  timelineDataCount: number = 0;
  timelineMode: TimelineMode = TimelineMode.Normal;
  isPlaying: boolean = false;

  async start() {
    await this.createUILabel();
    await this.createButtonModeAndSetData();
    this.saveTimelineToolAndSaveTimelineToolCount();
    await this.createButtonGroup_NormalAndSetData();
    await this.createButtonGroup_TandemAndSetData();
    this.checkMode();
  }

  private instantiatePrefab(name: string) {
    return new Promise((resolve, reject) => {
      this.downloadBundle("timeline-tool")
        .then((bundle) => this.loadPrefab(bundle, name))
        .then((node) => resolve(node))
        .catch((err) => reject(err));
    });
  }

  private downloadBundle(bundleName) {
    return new Promise((resolve, reject) => {
      assetManager.loadBundle(bundleName, (error, bundle: AssetManager.Bundle) => {
        if (error) {
          return reject(error);
        }
        resolve(bundle);
      });
    });
  }

  private loadPrefab(bundle, name) {
    return new Promise((resolve, reject) => {
      bundle.load(name, Prefab, null, (error: Error, prefab: Prefab) => {
        if (error) {
          return reject(error);
        }
        let node = instantiate(prefab);
        resolve(node);
      });
    });
  }

  private saveTimelineToolAndSaveTimelineToolCount() {
    this.timelineTool = this.getComponentsInChildren(TimelineTool);
    this.timelineCount = this.timelineTool[this.timelineIndex]?.arrayTimelineData.length;
  }

  public async createUILabel() {
    let isPlyaingLabelNode = (await this.instantiatePrefab("IsPlaying")) as Node;
    this.isPlayingLabel = isPlyaingLabelNode.getComponent(Label);
    isPlyaingLabelNode.setParent(this.node);
    let modeLabelNode = (await this.instantiatePrefab("ModeLabel")) as Node;
    this.modeLabel = modeLabelNode.getComponent(Label);
    modeLabelNode.setParent(this.node);
    this.modeLabel.string = Object.keys(TimelineMode)[this.timelineMode + Object.keys(TimelineMode).length / 2];
  }

  public async createButtonGroup_NormalAndSetData() {
    let ButtonGroup_NormalNode = (await this.instantiatePrefab("ButtonGroup_Normal")) as Node;
    this.ButtonGroup_Normal = ButtonGroup_NormalNode.getComponent(TimelineComboBox_Normal);
    this.ButtonGroup_Normal.node.setParent(this.node);
    this.ButtonGroup_Normal.setAry_TimelineTool(this.timelineTool);
    this.ButtonGroup_Normal.register_ChangeTimelineIndexFuc(this.setTimelineIndex.bind(this));
    this.ButtonGroup_Normal.register_ChangeTimelineDataIndexFuc(this.setTimelineDataIndex.bind(this));
    this.ButtonGroup_Normal.register_UpdateComboBoxDataFuc(this.updateComboBoxData.bind(this));
    let btnPlayEventHandler: EventHandler = new EventHandler();
    btnPlayEventHandler.target = this.node;
    btnPlayEventHandler.component = "TimelineToolScene";
    btnPlayEventHandler.handler = "playTimelineTool";
    this.ButtonGroup_Normal.setPlayButton(btnPlayEventHandler);
    let btnStopEventHandler: EventHandler = new EventHandler();
    btnStopEventHandler.target = this.node;
    btnStopEventHandler.component = "TimelineToolScene";
    btnStopEventHandler.handler = "stopTimelineTool";
    this.ButtonGroup_Normal.setStopButton(btnStopEventHandler);
  }

  public async createButtonGroup_TandemAndSetData() {
    let ButtonGroup_TandemNode = (await this.instantiatePrefab("ButtonGroup_Tandem")) as Node;
    this.ButtonGroup_Tandem = ButtonGroup_TandemNode.getComponent(TimelineComboBox_Tandem);
    this.ButtonGroup_Tandem.node.setParent(this.node);
    this.ButtonGroup_Tandem.setAry_TimelineTool(this.timelineTool);
    this.ButtonGroup_Tandem.register_ChangeTimelineIndexFuc(this.setTimelineIndex.bind(this));
    this.ButtonGroup_Tandem.register_ChangeTimelineDataIndexFuc(this.setTimelineDataIndex.bind(this));
    this.ButtonGroup_Tandem.register_UpdateComboBoxDataFuc(this.updateComboBoxData.bind(this));
    let btnPlayEventHandler: EventHandler = new EventHandler();
    btnPlayEventHandler.target = this.node;
    btnPlayEventHandler.component = "TimelineToolScene";
    btnPlayEventHandler.handler = "playTimelineTool";
    this.ButtonGroup_Tandem.setPlayButton(btnPlayEventHandler);
    let btnStopEventHandler: EventHandler = new EventHandler();
    btnStopEventHandler.target = this.node;
    btnStopEventHandler.component = "TimelineToolScene";
    btnStopEventHandler.handler = "stopTimelineTool";
    this.ButtonGroup_Tandem.setStopButton(btnStopEventHandler);
  }

  async createButtonModeAndSetData() {
    let ButtonModeNode = (await this.instantiatePrefab("ModeButton")) as Node;
    ButtonModeNode.setParent(this.node);
    this.ButtonModeBtn = ButtonModeNode.getComponent(Button);
    let btnModeEventHandler: EventHandler = new EventHandler();
    btnModeEventHandler.target = this.node;
    btnModeEventHandler.component = "TimelineToolScene";
    btnModeEventHandler.handler = "changeMode";
    this.ButtonModeBtn.clickEvents.push(btnModeEventHandler);
  }

  public setTimelineIndex(value: number) {
    this.timelineIndex = value;
    this.ButtonGroup_Normal.setTimelineIndex(this.timelineIndex);
    this.ButtonGroup_Tandem.setTimelineIndex(this.timelineIndex);
  }

  public setTimelineDataIndex(value: number) {
    this.timelineDataIndex = value;
  }

  public updateComboBoxData(serialNumber: number) {
    switch (this.timelineMode) {
      case TimelineMode.Normal:
        this.ButtonGroup_Normal.updateTimelineData();
        break;
      case TimelineMode.Tandem:
        this.ButtonGroup_Tandem.updateTimelineData(serialNumber);
        break;
    }
  }

  public playTimelineTool() {
    if (this.timelineMode === TimelineMode.Normal) {
      this.timelineTool[this.ButtonGroup_Normal.timeline.itemIndex].play(
        this.timelineTool[this.ButtonGroup_Normal.timeline.itemIndex].arrayTimelineData[
          this.ButtonGroup_Normal.timelineData.itemIndex
        ].timelineName
      );
    } else {
      let timelineIndexListIndex = parseInt(this.ButtonGroup_Tandem.timelineCount.string) - 1;
      let cb: Function = undefined;
      for (let i = timelineIndexListIndex; i >= 0; i--) {
        if (i === 0) {
          this.timelineTool[this.ButtonGroup_Tandem.timelineList[i].itemIndex].play(
            this.timelineTool[this.ButtonGroup_Tandem.timelineList[i].itemIndex].arrayTimelineData[
              this.ButtonGroup_Tandem.timelineDataList[i].itemIndex
            ].timelineName,
            cb
          );
        } else {
          if (cb === undefined) {
            cb = () =>
              this.timelineTool[this.ButtonGroup_Tandem.timelineList[i].itemIndex].play(
                this.timelineTool[this.ButtonGroup_Tandem.timelineList[i].itemIndex].arrayTimelineData[
                  this.ButtonGroup_Tandem.timelineDataList[i].itemIndex
                ].timelineName
              );
          } else {
            let preCB: Function = cb;
            cb = () => {
              this.timelineTool[this.ButtonGroup_Tandem.timelineList[i].itemIndex].play(
                this.timelineTool[this.ButtonGroup_Tandem.timelineList[i].itemIndex].arrayTimelineData[
                  this.ButtonGroup_Tandem.timelineDataList[i].itemIndex
                ].timelineName,
                preCB
              );
            };
          }
        }
      }
    }
  }

  public stopTimelineTool() {
    for (let i = 0; i < this.timelineTool.length; i++) {
      this.timelineTool[i].stop();
    }
  }

  public changeState() {
    this.timelineTool[this.timelineIndex].changeState(
      this.timelineTool[this.timelineIndex].arrayTimelineData[this.timelineDataIndex].timelineName
    );
  }

  public changeMode() {
    this.stopTimelineTool();
    this.timelineMode++;
    if (this.timelineMode >= Object.keys(TimelineMode).length / 2) this.timelineMode = TimelineMode.Normal;
    this.modeLabel.string = Object.keys(TimelineMode)[this.timelineMode + Object.keys(TimelineMode).length / 2];
    this.checkMode();
  }

  checkMode() {
    if (this.timelineMode === TimelineMode.Normal) {
      this.ButtonGroup_Normal.node.active = true;
      this.ButtonGroup_Tandem.node.active = false;
    } else {
      this.ButtonGroup_Normal.node.active = false;
      this.ButtonGroup_Tandem.node.active = true;
    }
  }

  update() {
    if (this.timelineTool.length > 0 && this.isPlaying !== this.timelineTool[this.timelineIndex].isPlaying) {
      if (this.timelineTool[this.timelineIndex].isPlaying === true) {
        this.isPlayingLabel.string = "Playing";
      } else {
        this.isPlayingLabel.string = "";
      }
      this.isPlaying = this.timelineTool[this.timelineIndex].isPlaying;
    }
  }
}
