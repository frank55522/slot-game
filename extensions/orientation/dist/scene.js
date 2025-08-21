'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.methods = exports.unload = exports.load = void 0;
function load() { }
exports.load = load;
function unload() { }
exports.unload = unload;
exports.methods = {
    queryCurrentOrientation() {
        const win = window;
        return win._orientation.orientation;
    },
    changeCurrentOrientation(orientation) {
        const win = window;
        debugger;
        win._orientation.init(orientation);
        win._orientation.updateResolution();
        // @ts-ignore
        cce.Engine.repaintInEditMode();
    },
};
