const win = globalThis as any;

export const orientation = {
    // Data
    designResolution: {
        width: 1600,
        height: 900
    }
};

if (CC_EDITOR) {

    if (!win.orientation) {
        win.orientation = {};
    }

    win.orientation['horizontal'] = orientation;
}