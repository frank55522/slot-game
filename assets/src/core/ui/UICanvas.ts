import { _decorator, Canvas, Camera, CCString } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('UICanvas')
export class UICanvas extends Canvas {
    @property({ type: [CCString], visible: true })
    private _filterCameraName: Array<string> = [];

    private _expansionCamera: Array<Camera> | null = null;

    private get expansionCamera() {
        if (this._expansionCamera == null) {
            this._expansionCamera = this.getComponentsInChildren(Camera);
            this.filterCamera();
        }
        return this._expansionCamera;
    }

    _onResizeCamera() {
        super._onResizeCamera();
        if (this._cameraComponent && this.expansionCamera && this._alignCanvasWithScreen) {
            for (let i = 0; i < this.expansionCamera.length; i++) {
                this.expansionCamera[i].orthoHeight = this._cameraComponent?.orthoHeight;
            }
        }
    }

    private filterCamera() {
        const self = this;
        const filterFunc = (camera: Camera) => self._filterCameraName.indexOf(camera.node.name) == -1;
        self._expansionCamera = self._expansionCamera.filter(filterFunc);
    }
}
