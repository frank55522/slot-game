# Changelog

## Deprecated Features

## 1.1.19
### Changed
- 支援ISO 639-1 多國語系帶區碼

## 1.1.18
### Add
- build game環節自動在各語系根目錄下補auto-atlas

## 1.1.17
### Changed
- build game補檔案忽略auto-atlas檔(.pac)
### Add
- 將spine圖檔設定不打包，避免spine載入資源失敗


## 1.1.16
### Fixed
- 修正build game 清除sprite資源時，如果LocalizedSprite目標是Prefab導致錯誤卡死

## 1.1.15
### Fixed
- 修正移除LocalizedSkeleton卡無限循環
- 修正i18n.t變數改成字串避免無法正常運作
- 修正build game補資源的時機，提前至before build

## 1.1.14
### Fixed
- 處理1.1.13 build game 補資源時，spine各語系檔案數量不一致會照成浪費的疑慮

## 1.1.13
### Fixed
- 修正hook失效
### Changed
- 預設語系設定為 en
### Added
- 新增build code 時把各語系缺漏的圖用預設語系資源補齊

## 1.1.12
### Added
- LocalizedSprite支援JPG
### Changed
- 移除沒在使用的build config參數及沒在使用的hooks function
- LocalizedPosition menu選單移至i18n內
- 調整路徑處理方式，不在綁定在language下(但各語系仍需要在同個資料夾下且都打包bundle，且不支援複數bundle)


## 1.1.11
- 更改 updateRenderer 為泛用的 localize
- 增加 i18n.t 用 Template string 可以把參數帶入

## 1.1.10
### Added
- 加入LocalizedPosition擴增功能，在上面可做node座標的即時編輯，並且加入存檔功能

## 1.1.9
### Changed
- 優化用AddLocalizedScript掛載LocalizedSkeleton變數只有保留SkeletonData改成全部
### Fixed
- 修正Component順序會導致set-property取直錯誤，改由動態去取得順序在塞值

## 1.1.8
### Fixed
- 修正 LocalizedPosition 新增語系會清空原先設定問題

## 1.1.7
- 提供查詢語系是否支援，如不支援回傳default語系（目前設為en）
- 初始語系直接更新場上語系資源

## 1.1.6
- 如果帶入語系不支援改採用預設"en"
### Fixed
- 修正空場景報錯
- 修正LocalizedPosition 警告

## 1.1.5
- 固定package中vue的版本，避免新版不相容的問題
- LocalizedSprite新增bundle載入失敗的重載功能

## 1.1.4
### Fixed
- 修正多國語系移除圖檔判斷有誤，已經移除圖檔的物件會損壞
- 修正多國語系Spine檔runtime錯誤

## 1.1.3
### Added
- 加入build code hook，將自動刪除scene及prefab上LocalizedSprite關聯圖檔資源

## 1.1.2
- 調整Sprite與Spine還原做法，改用直接Message去塞uuid達成不需要生成對應資源檔放入

## 1.1.1
- 增加menu分類
- 增加requireComponent

## 1.1.0
- 調整圖檔與spine方式，改用備份路徑來解決操作繁瑣問題
- 抽出界面方便擴充Localized系列（Skeleton無法取得更換SkeletonData時機故做法不同）
- 新增AddLocalizedScript直接去辨識需要添加的多國語系元件
- 新增神奇按鈕去刷新畫面

## 1.0.2
- 修正LocalizedSprite抓取圖檔方式會導致圖檔在auto-atlas但還是會另外下載並生成新小圖

## 1.0.1
- 增加介面按鈕說明
- 增加多國語系spine支援