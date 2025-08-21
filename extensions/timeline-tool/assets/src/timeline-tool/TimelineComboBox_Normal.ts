import { _decorator, Component, Node, EventHandler, Button } from "cc";
import { ComboBox } from "./ComboBox";
import { TimelineTool } from "./TimelineTool";
import { TimelineMode } from "./ToolData";
const { ccclass, property } = _decorator;

@ccclass("TimelineComboBox_Normal")
export class TimelineComboBox_Normal extends Component {
  @property({ type: ComboBox })
  timeline: ComboBox = null;
  @property({ type: ComboBox })
  timelineData: ComboBox = null;
  @property({ type: Button })
  playBtn: Button = null;
  @property({ type: Button })
  stopBtn: Button = null;
  ary_TimelineTool: TimelineTool[] = [];
  timelineIndex: number = 0;

  register_ChangeTimelineIndexFuc(callback: Function) {
    this.timeline.setChangeTimelineIndexFuc(callback);
    this.timelineData.setChangeTimelineIndexFuc(callback);
  }
  register_ChangeTimelineDataIndexFuc(callback: Function) {
    this.timeline.setChangeTimelineDataIndexFuc(callback);
    this.timelineData.setChangeTimelineDataIndexFuc(callback);
  }
  register_UpdateComboBoxDataFuc(callback: Function) {
    this.timeline.setUpdateComboBoxDataFuc(callback);
    this.timelineData.setUpdateComboBoxDataFuc(callback);
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

  start() {
    this.init();
  }

  init() {
    this.setTimeline();
    this.setTimelineData();
    this.timeline.initTimelineItems();
    this.timelineData.initTimelineDataItems();
    this.timeline.setTimelineMode(TimelineMode.Normal);
    this.timelineData.setTimelineMode(TimelineMode.Normal);
  }

  setTimeline() {
    // 下拉框选项内容
    for (let i = 0; i < this.ary_TimelineTool.length; i++) {
      this.timeline.itemArray.push(this.ary_TimelineTool[i].node.name);
    }
  }

  setTimelineData() {
    // 下拉框选项内容
    for (let i = 0; i < this.ary_TimelineTool[this.timelineIndex].arrayTimelineData.length; i++) {
      this.timelineData.itemArray.push(this.ary_TimelineTool[this.timelineIndex].arrayTimelineData[i].timelineName);
    }
  }

  setPlayButton(btnEventHandler: EventHandler) {
    this.playBtn.clickEvents.push(btnEventHandler);
  }

  setStopButton(btnEventHandler: EventHandler) {
    this.stopBtn.clickEvents.push(btnEventHandler);
  }

  updateTimelineData() {
    let NewTimelineDataCount = this.ary_TimelineTool[this.timelineIndex].arrayTimelineData.length;
    this.timelineData.itemArray = [];
    for (let i = 0; i < NewTimelineDataCount; i++) {
      this.timelineData.itemArray.push(this.ary_TimelineTool[this.timelineIndex].arrayTimelineData[i].timelineName);
    }
    this.timelineData.updateTimelineDataItems();
  }
}
