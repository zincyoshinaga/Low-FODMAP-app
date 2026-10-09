# Codex引継ぎ：おなかノート

2026年10月9日。IBS向け低FODMAP食の日本語Webアプリの試作です。既存コードを修正するための資料です。

## リポジトリと構成

このリポジトリのルートに `package.json`、`app/`、`lib/`、`db/` があります。`fodmap-app-source.zip` は最初にアップロードしたソースの控えで、今後の編集対象は展開済みファイルです。

Vinext（Next.js互換）、React 19、TypeScript 5.9、Vite 8、Cloudflare Workers、D1/SQLite、Drizzleを使用。グラフはRechartsです。Sitesの登録済み設定 `.openai/hosting.json` は保持してください。実際のサイト公開は未実施です。

## 新しい環境のセットアップ

Node.js 22.13以上が必要です。リポジトリ直下で実行します。

```sh
npm ci
node node_modules/typescript/bin/tsc --noEmit
npm run build
```

新しくクローンした環境には利用者のDBはありません。**新規の空のローカルDBだけ**に、以下を順番に適用します。`dist/server/wrangler.json` を作るため、先にビルドしてください。

```sh
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_needy_kingpin.sql
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0001_whole_talkback.sql
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0002_sparkling_unus.sql
npm run dev -- --hostname 0.0.0.0
```

開発ポートは5173です。通常のローカルアクセスは `http://127.0.0.1:5173/`。クラウド環境ではその環境のポート転送を使います。サーバー停止とともにアクセスできなくなるローカル試作です。

実行プロファイルのファイルがない新規クローンでは `portable` が選ばれます。Sites専用の `managed-linux` に自動で切り替える必要はありません。

模擬サインインはlocalhostからのアクセスだけに限定されています。外部のプレビューURLでは同じ認証が動くとは限りません。画面表示と認証付き記録機能の確認を区別し、公開プレビューで模擬認証を無制限に有効化しないでください。

既存PCの環境では移行0000〜0002は適用済みです。既存DBへ上記を再実行しないでください。新規のDB変更は新しい移行を追加し、未適用分だけ適用します。`--remote` は使用しません。

## 実装済み機能

- 5タブ：食材を調べる、レシピを考える、食事・体調の記録、振り返り、情報の出典。
- 7グループ・85の基本食材、複数選択、手入力、本人ごとの追加食材。
- お気に入り・最近使った12食材、分類未収録・量別未収録の印。
- 76食品の分類、条件、出典。分類と量の評価を分けて表示。
- 種類・部位・加工法と75gの出典例17件。一致する種類と量だけ参照可能。
- 献立24案。「必ず使う」は全て含む、「できれば使う」は順位付け、「避けたい」は除外。除外条件を自動で緩めない。
- 通常の除外条件の保存、タブ移動で選択・下書きを保持。
- 食材・献立から食事下書きへ引き継ぎ。既存下書きへの置換・追加・キャンセル。保存は別途明示操作。
- 食事のコピー・編集・復元可能な削除。
- 日別体調と時刻別症状。腹痛・膨満感などのボタン、便形状7種類の模式図、切迫感・排便回数。
- 共通時系列、直近7日・暦月グラフ、CSV、診察用印刷。
- 0と未記録を区別。日別腹痛・膨満感は最大値。排便回数は日別入力を優先し、未入力時は便形状を記録した件数。

未保存下書きは再読み込みで失われます。ブラウザーの印刷からPDF保存する形式で、専用PDF生成機能はありません。

## 修正する主なファイル

| ファイル | 役割 |
| --- | --- |
| `app/ui.tsx` / `app/globals.css` | タブ、入力保持、記録への引き継ぎ、レスポンシブ表示 |
| `app/food-picker-ui.tsx` / `app/preferences-ui.tsx` | 食材選択と本人設定 |
| `lib/food-picker.ts` / `lib/foods.ts` | 選択肢、別名、分類と出典 |
| `lib/portions.ts` / `app/portion-ui.tsx` | 量別例と照合 |
| `lib/recipes.ts` / `app/recipes-ui.tsx` | 24献立と材料条件 |
| `app/diary-ui.tsx` / `app/symptom-controls.tsx` | 食事と症状の入力・変更 |
| `lib/diary.ts` / `app/reports-ui.tsx` | JST日付、範囲、CSV、振り返り |
| `app/api/` / `lib/api-validation.ts` | 保存・出力・本人制御・入力検証 |
| `db/schema.ts` / `drizzle/` | 保存構造と移行 |

## データと認証を保持すること

`meals`、`symptoms`、`symptom_events`、`user_foods`、`preferences` に本人ごとのデータを保存します。APIはサーバーが認証から得た本人IDを使用し、更新で同一オリジン・入力を検証します。クライアントのユーザーIDを信用しないでください。

`.wrangler/state` がローカルDBです。GitHubには含めていません。既存環境の記録を削除・初期化しないでください。認証・本人ID制御を外して動作確認を通さないでください。

## 食品データの制約

資料確認日：2026年10月7日。主な資料はREADMEと情報の出典画面を参照してください。

量別例の出典はMonashの買い物リスト（2025年2月3日公開）：
https://www.monashfodmap.com/blog/low-fodmap-shopping-list/

- 75gの例は上限量ではありません。他の量へ推測で換算しません。
- 17件には品種違いの例を含みます。資料に調理状態の指定がない場合も明示しています。
- Monash公式アプリの検査データベースとは連携していません。
- 料理全体・複数食品の累積FODMAP量を計算しません。
- 未収録食品、配合不明な市販品、料理名だけの入力は判定保留。
- 献立は独自の固定テンプレートで、認証レシピや自由なAI生成ではありません。
- 症状が出ない保証・食事と症状の原因の自動診断はしません。
- データ追加時は現行の一次資料を再確認し、古い検索抜粋を根拠にしないでください。

## 検証と未実装事項

元のWindows環境では型チェック・ビルド、レシピ条件・量照合・日付・CSV、本人限定API、コピー／編集／削除／復元、タブ下書き保持、スマホ幅を確認済みです。元環境のDBや状態に依存する検証用スクリプトは、このリポジトリへ移していません。

本番の複数利用者運用、医療的妥当性、実際のPDF出力は未検証。量別データの正式連携、日本の加工食品の詳細、個人の耐容性・再導入支援、下書きの再読み込み復元、プライバシー文書・保持期間・永久削除は未実装です。今後の変更範囲はユーザーの指示に従ってください。
