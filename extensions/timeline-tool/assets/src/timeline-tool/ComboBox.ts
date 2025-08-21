import { _decorator, Component, Node, Label, Prefab, instantiate, EventHandler, Vec3, UITransform, math } from "cc";
import { Item } from "./Item";
import { TimelineToolScene } from "./TimelineToolScene";
import { TimelineMode } from "./ToolData";
const { ccclass, property } = _decorator;

@ccclass("ComboBox")
export class ComboBox extends Component {
  @property({ type: Label })
  comboLabel: Label; // 下拉按钮上显示的文本
  @property({ type: Node })
  dropDown: Node; // 下拉框
  @property({ type: Node })
  vLayoutNode: Node; // 垂直布局
  @property({ type: Node })
  contentNode: Node; // 滚动视图内容
  @property({ type: Prefab })
  itemPrefab: Prefab; // 下拉框选项
  timelineDataList: Item[] = [];
  public itemArray: string[] = [];
  timelineManager: TimelineToolScene;
  timelineMode: TimelineMode = TimelineMode.Normal;
  itemHeight = 40;
  itemWidth = 200;
  _itemIndex: number = 0;
  _serialNumber: number = 0;
  public set serialNumber(value: number) {
    this._serialNumber = value;
  }
  public get serialNumber() {
    return this._serialNumber;
  }

  public set itemIndex(value: number) {
    this._itemIndex = value;
  }
  public get itemIndex(): number {
    return this._itemIndex;
  }

  public setTimelineMode(value: TimelineMode) {
    this.timelineMode = value;
  }

  public initTimelineItems() {
    // 根据数组初始化下拉框中的各个选项内容
    for (let i = 0; i < this.itemArray.length; i++) {
      let itemPrefab = instantiate(this.itemPrefab);
      itemPrefab.children[0].getComponent(Label).string = this.itemArray[i];
      let item = itemPrefab.getComponent(Item);
      item.initComboBox(this);
      item.index = i;
      let BtnEventHandler = new EventHandler();
      BtnEventHandler.target = itemPrefab;
      BtnEventHandler.component = "Item";
      BtnEventHandler.handler = "timelineItemButton";
      item.clearButtonEvent();
      item.setButtonEvent(BtnEventHandler);
      this.vLayoutNode.addChild(itemPrefab);
    }
    let ContentHeight = this.itemHeight * this.itemArray.length;
    this.contentNode.getComponent(UITransform).contentSize = new math.Size(this.itemWidth, ContentHeight);
    this.comboLabel.string = this.itemArray[0];
  }

  public initTimelineDataItems() {
    // 根据数组初始化下拉框中的各个选项内容
    for (let i = 0; i < this.itemArray.length; i++) {
      let itemPrefab = instantiate(this.itemPrefab);
      itemPrefab.children[0].getComponent(Label).string = this.itemArray[i];
      let item = itemPrefab.getComponent(Item);
      item.initComboBox(this);
      item.index = i;
      let BtnEventHandler = new EventHandler();
      BtnEventHandler.target = itemPrefab;
      BtnEventHandler.component = "Item";
      BtnEventHandler.handler = "timelineDataButton";
      item.clearButtonEvent();
      item.setButtonEvent(BtnEventHandler);
      this.vLayoutNode.addChild(itemPrefab);
      this.timelineDataList.push(item);
    }
    let ContentHeight = this.itemHeight * this.itemArray.length;
    this.contentNode.getComponent(UITransform).contentSize = new math.Size(this.itemWidth, ContentHeight);
    this.comboLabel.string = this.itemArray[0];
  }

  public updateTimelineDataItems() {
    let checkTImelineDataListCount = this.timelineDataList.length - 1;
    for (let i = 0; i < this.timelineDataList.length; i++) {
      this.timelineDataList[i].node.active = false;
    }
    for (let i = 0; i < this.itemArray.length; i++) {
      if (i <= checkTImelineDataListCount) {
        this.timelineDataList[i].node.active = true;
        this.timelineDataList[i].node.children[0].getComponent(Label).string = this.itemArray[i];
      } else {
        let itemPrefab = instantiate(this.itemPrefab);
        itemPrefab.children[0].getComponent(Label).string = this.itemArray[i];
        let item = itemPrefab.getComponent(Item);
        item.initComboBox(this);
        item.index = i;
        let BtnEventHandler = new EventHandler();
        BtnEventHandler.target = itemPrefab;
        BtnEventHandler.component = "Item";
        BtnEventHandler.handler = "timelineDataButton";
        item.clearButtonEvent();
        item.setButtonEvent(BtnEventHandler);
        this.vLayoutNode.addChild(itemPrefab);
        this.timelineDataList.push(item);
      }
    }
    let ContentHeight = this.itemHeight * this.itemArray.length;
    this.contentNode.getComponent(UITransform).contentSize = new math.Size(this.itemWidth, ContentHeight);
    this.itemIndex = 0;
    this.comboLabel.string = this.itemArray[0];
  }
  private setTimelineIndex: Function;
  private setTimelineDataIndex: Function; 
  private setUpdateComboBoxData: Function;

  public setChangeTimelineIndexFuc(callback: Function) {
    this.setTimelineIndex = callback;
  }

  public setChangeTimelineDataIndexFuc(callback: Function) {
    this.setTimelineDataIndex = callback;
  }
  public setUpdateComboBoxDataFuc(callback: Function) {
    this.setUpdateComboBoxData = callback;
  }

  changeTimelineIndex(value: number) {
    this.setTimelineIndex(value);
  }

  changeTimelineDataIndex(value: number) {
    this.setTimelineDataIndex(value);
  }

  updateComboBoxData() {
    this.setUpdateComboBoxData(this.serialNumber);
  }

  showHideDropDownBox() {
    // 下拉框显示与隐藏
    if (!this.dropDown.active) {
      if (this.timelineMode === TimelineMode.Tandem) {
        this.dropDown.setParent(this.node.parent.parent.parent.parent);
        this.dropDown.setPosition(new Vec3(this.node.position.x, this.node.position.y, this.node.position.z));
      }
      this.dropDown.active = true;
    } else {
      if (this.timelineMode === TimelineMode.Tandem) {
        this.dropDown.setParent(this.node);
        this.dropDown.setPosition(new Vec3(0, 0, 0));
      }
      this.dropDown.active = false;
    }
  }

  comboboxClicked() {
    // 下拉框显示与隐藏
    this.showHideDropDownBox();
  }
}
