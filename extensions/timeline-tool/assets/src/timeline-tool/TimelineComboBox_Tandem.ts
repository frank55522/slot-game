import { _decorator, Component, Node, Prefab, Label, Button, instantiate, EventHandler, UITransform, math } from "cc";
import { ComboBox } from "./ComboBox";
import { TimelineTool } from "./TimelineTool";
import { TimelineMode } from "./ToolData";
const { ccclass, property } = _decorator;

@ccclass("TimelineComboBox_Tandem")
export class TimelineComboBox_Tandem extends Component {
  @property({ type: Prefab })
  timelinePrefab: Prefab;
  @property({ type: Prefab })
  timelineDataPrefab: Prefab;
  @property({ type: Node })
  timelineParent: Node;
  @property({ type: Button })
  playBtn: Button = null;
  @property({ type: Button })
  stopBtn: Button = null;
  @property({ type: Label })
  timelineCount: Label;
  @property({ type: Node })
  contentNode: Node;
  itemHeight = 40;
  itemWidth = 360;
  _timelineList: ComboBox[] = [];
  _timelineDataList: ComboBox[] = [];
  ary_TimelineTool: TimelineTool[] = [];
  timelineIndex: number = 0;

  public get timelineList() {
    return this._timelineList;
  }

  public get timelineDataList() {
    return this._timelineDataList;
  }

  private timelineChangeTimlineIndexFuc: Function = null;
  private timelineDataChangeTimlineIndexFuc: Function = null;
  private timelineChangeTimlineDataIndexFuc: Function = null;
  private timelineDataChangeTimlineDataIndexFuc: Function = null;
  private timelineUpdateComboBoxDataFuc: Function = null;
  private timelineDataUpdateComboBoxDataFuc: Function = null;

  register_ChangeTimelineIndexFuc(callback: Function) {
    this.timelineChangeTimlineIndexFuc = callback;
    this.timelineDataChangeTimlineIndexFuc = callback;
  }
  register_ChangeTimelineDataIndexFuc(callback: Function) {
    this.timelineChangeTimlineDataIndexFuc = callback;
    this.timelineDataChangeTimlineDataIndexFuc = callback;
  }
  register_UpdateComboBoxDataFuc(callback: Function) {
    this.timelineUpdateComboBoxDataFuc = callback;
    this.timelineDataUpdateComboBoxDataFuc = callback;
  }

  public setAry_TimelineTool(value: TimelineTool[]) {
    this.ary_TimelineTool = [];
    for (let i = 0; i < value.length; i++) {
      this.ary_TimelineTool.push(value[i]);
    }
  }

  public setTimelineIndex(value: number) {
    this.timelineIndex = value;
  }

  setPlayButton(btnEventHandler: EventHandler) {
    this.playBtn.clickEvents.push(btnEventHandler);
  }

  setStopButton(btnEventHandler: EventHandler) {
    this.stopBtn.clickEvents.push(btnEventHandler);
  }

  updateTimelineData(serialNumber: number) {
    let timelineDataCount = this.ary_TimelineTool[this.timelineList[serialNumber].itemIndex].arrayTimelineData.length;
    this._timelineDataList[serialNumber].itemArray = [];
    for (let i = 0; i < timelineDataCount; i++) {
      this._timelineDataList[serialNumber].itemArray.push(
        this.ary_TimelineTool[this.timelineList[serialNumber].itemIndex].arrayTimelineData[i].timelineName
      );
    }
    this._timelineDataList[serialNumber].updateTimelineDataItems();
  }

  checkTimelineCount() {
    let TimelineCount = parseInt(this.timelineCount.string);
    let timelineListIndex = this._timelineList.length - 1;
    this.closeTimelineListAndTimelineDataList();
    for (let i = 0; i < TimelineCount; i++) {
      if (timelineListIndex >= i) {
        this._timelineList[i].node.active = true;
        this._timelineDataList[i].node.active = true;
      } else {
        let Timeline = instantiate(this.timelinePrefab).getComponent(ComboBox);
        let TimelineData = instantiate(this.timelineDataPrefab).getComponent(ComboBox);
        Timeline.setChangeTimelineIndexFuc(this.timelineChangeTimlineIndexFuc);
        Timeline.setChangeTimelineDataIndexFuc(this.timelineChangeTimlineDataIndexFuc);
        Timeline.setUpdateComboBoxDataFuc(this.timelineUpdateComboBoxDataFuc);
        TimelineData.setChangeTimelineIndexFuc(this.timelineDataChangeTimlineIndexFuc);
        TimelineData.setChangeTimelineDataIndexFuc(this.timelineDataChangeTimlineDataIndexFuc);
        TimelineData.setUpdateComboBoxDataFuc(this.timelineDataUpdateComboBoxDataFuc);
        let firstTimelineIndex = 0;
        for (let j = 0; j < this.ary_TimelineTool.length; j++) {
          Timeline.itemArray.push(this.ary_TimelineTool[j].node.name);
        }
        for (let j = 0; j < this.ary_TimelineTool[firstTimelineIndex].arrayTimelineData.length; j++) {
          TimelineData.itemArray.push(this.ary_TimelineTool[firstTimelineIndex].arrayTimelineData[j].timelineName);
        }
        Timeline.setTimelineMode(TimelineMode.Tandem);
        TimelineData.setTimelineMode(TimelineMode.Tandem);
        Timeline.initTimelineItems();
        TimelineData.initTimelineDataItems();
        Timeline.serialNumber = i;
        TimelineData.serialNumber = i;
        Timeline.node.setParent(this.timelineParent);
        TimelineData.node.setParent(this.timelineParent);
        this._timelineList.push(Timeline);
        this._timelineDataList.push(TimelineData);
      }
    }
    let ContentHeight = this.itemHeight * TimelineCount;
    this.contentNode.getComponent(UITransform).contentSize = new math.Size(this.itemWidth, ContentHeight);
  }

  closeTimelineListAndTimelineDataList() {
    for (let i = 0; i < this._timelineList.length; i++) {
      this._timelineList[i].node.active = false;
      this._timelineDataList[i].node.active = false;
    }
  }
}
