
const win = window as any;

export const orientation = {
    // Data
    'designResolution' : {
        'width': 900,
        'height': 1600
    }
};

if (CC_EDITOR) {

    if (!win.orientation) {
        win.orientation = {};
    }

    win.orientation['vertical'] = orientation;
}