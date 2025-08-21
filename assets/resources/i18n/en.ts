const win = window as any;

export const languages = {
    // Data
    loading: 'LOADING ANOTHER SCENE ASSETS...',
    quickSpinEnabled: 'Quick Spin Enabled',
    quickSpinDisabled: 'Quick Spin Disabled',
    autospin: 'AUTO SPIN',
    autospinnumber: 'Number of Auto Spin',
    betoption: 'BET OPTIONS',
    autoStart: 'AUTO START IN:',
    quit: 'Quit',
    history: 'History',
    rules: 'Rules',
    sound: 'Sound',
    close: 'Close',
    betTitleInBetMenu: 'BET',
    totalBetInBetMenu: 'TOTAL BET : ',
    confirm: 'CONFIRM',
};

if (!win.languages) {
    win.languages = {};
}

win.languages.en = languages;
