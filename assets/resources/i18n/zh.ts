const win = window as any;

export const languages = {
    // Data
    loading: '场景资源载入中...',
    quickSpinEnabled: '快速旋转开启',
    quickSpinDisabled: '快速旋转关闭',
    autospin: '自动旋转',
    autospinnumber: '自动旋转次数',
    betoption: '投注选项',
    autoStart: '自动开始:',
    quit: '退出',
    history: '历史',
    rules: '规则',
    sound: '声音',
    close: '关闭',
    totalBetInBetMenu: '总投注：',
    confirm: '确定'
};

if (!win.languages) {
    win.languages = {};
}

win.languages.zh = languages;
