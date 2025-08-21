export interface IBaseUI {
    initData(data: any, ...params: any): void;

    refresh(data: any, ...params: any): void;

    onOpened?(): void;
}
