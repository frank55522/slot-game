# Changelog

## Deprecated Features

## 1.1.5
- 固定package中vue的版本，避免新版不相容的問題
- LocalizedBrandSprite新增bundle載入失敗的重載功能

## 1.1.4
### Fix
- 修正多國語系移除圖檔判斷有誤，已經移除圖檔的物件會損壞
- 修正多國語系Spine檔runtime錯誤

## 1.1.3
### Added
- 加入build code hook，將自動刪除scene及prefab上LocalizedBrandSprite關聯圖檔資源

## 1.1.2
- 調整Sprite與Spine還原做法，改用直接Message去塞uuid達成不需要生成對應資源檔放入

## 1.1.1
- 增加menu分類
- 增加requireComponent

## 1.1.0
- 調整圖檔與spine方式，改用備份路徑來解決操作繁瑣問題
- 抽出界面方便擴充Localized系列（Skeleton無法取得更換SkeletonData時機故做法不同）
- 新增AddBrandLocalizedScript直接去辨識需要添加的多國語系元件
- 新增神奇按鈕去刷新畫面

## 1.0.2
- 修正LocalizedBrandSprite抓取圖檔方式會導致圖檔在auto-atlas但還是會另外下載並生成新小圖

## 1.0.1
- 增加介面按鈕說明
- 增加多國語系spine支援