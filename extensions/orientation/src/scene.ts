'use strict';

export function load() {}
export function unload() {}

export const methods = {
    queryCurrentOrientation() {
        const win = window as any;
        return win._orientation.orientation;
    },
    changeCurrentOrientation(orientation: string) {
        const win = window as any;
        debugger;
        win._orientation.init(orientation);
        win._orientation.updateResolution();
        // @ts-ignore
        cce.Engine.repaintInEditMode();
    },
};