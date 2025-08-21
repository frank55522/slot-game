import { _decorator, Component, Node, Label, Button, EventHandler } from "cc";
import { ComboBox } from "./ComboBox";
const { ccclass, property } = _decorator;

@ccclass("Item")
export class Item extends Component {
  cb: ComboBox = null;
  index: number = 0;
  itemButton: Button = null;

  initComboBox(cb: ComboBox) {
    this.cb = cb;
  }

  getItemButton() {
    if (this.itemButton === null) this.itemButton = this.getComponent(Button);
    return this.itemButton;
  }

  clearButtonEvent() {
    this.getItemButton().clickEvents = [];
  }

  setButtonEvent(event: EventHandler) {
    this.getItemButton().clickEvents.push(event);
  }

  timelineItemButton(event) {
    // 子项点击后改变下拉按钮上的文本
    this.cb.comboLabel.string = event.target.children[0].getComponent(Label).string;
    this.cb.changeTimelineIndex(this.index);
    this.cb.itemIndex = this.index;
    this.cb.updateComboBoxData();
    // 选择后改变小三角和下拉框显示
    this.cb.comboboxClicked();
  }

  timelineDataButton(event) {
    // 子项点击后改变下拉按钮上的文本
    this.cb.comboLabel.string = event.target.children[0].getComponent(Label).string;
    this.cb.changeTimelineDataIndex(this.index);
    this.cb.itemIndex = this.index;
    // 选择后改变小三角和下拉框显示
    this.cb.comboboxClicked();
  }
}
