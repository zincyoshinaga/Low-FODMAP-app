# おなかノート

スマートフォン・PCで使う低FODMAP食の試作Webアプリです。食品の分類と一食量の公開例を確認し、材料から献立を選び、食事・症状を記録できます。

GitHubから取得した場合は、[Codex引継ぎ・初回セットアップ](CODEX_HANDOFF.md) を先に読んでください。編集対象はリポジトリ直下の展開済みコードです。ZIPは初回アップロード時の控えです。

## 利用できる機能
- 7グループ、85の基本食材を複数選択。一覧にない食材は手入力し、自分の食材として本人ごとに保存できます。
- お気に入りと最近使った12食材を先頭に表示。分類未収録・量別情報未収録の印を選択前から表示します。
- 食材選択、献立の必須／希望／除外条件、各入力の下書きはタブ移動中も保持。いつも避けたい食材、お気に入り、最近使った食材は本人ごとに保存。未保存の下書きはページを閉じる・再読み込みすると失われます。
- 76食品の分類・条件と食品ごとの出典。分類と量の評価を分けます。
- Monash大学の2025年2月3日公開の買い物リストに明記された75gの一食例17件を収録。種類・部位と資料中の加工法を表示。調理状態の指定がない場合も明記します。収録例と一致する量だけを確認し、他の量へ推測で換算しません。
- 24の献立案。必須材料と除外条件を守り、希望材料の一致数で並べ替え。除外条件を自動で緩めません。
- 食材・献立から食事の下書きへ引き継ぎ。入力中の下書きがある場合は置換・追加・キャンセルを選べます。引き継ぎだけでは保存しません。
- 複数の食事の保存、コピー、編集、削除、削除の取り消し。
- 時刻別の腹痛・膨満感・便の形・切迫感・メモ。強さは選択ボタン、便の形は7種類の模式図から選択。時刻別記録も編集・削除・取り消しが可能です。
- 日付別の腹痛・膨満感・ストレス・便の形・排便回数・切迫感・睡眠・メモ。食事の保存時に体調の下書きを上書きしません。
- 食事と症状の共通時系列、直近7日間／暦月のグラフ、CSV出力、診察用印刷・ブラウザーのPDF保存。欠測値と0を区別。日別の腹痛・膨満感は記録した最大値、排便回数は日別の入力を優先し、未入力なら便形状を記録した件数を表示します。
- ChatGPTサインインによる本人ごとの読取・保存。ローカル確認ではスターターの模擬認証を使います。

## 判定の範囲
量別の公式アプリや検査データベースとの連携はありません。75gの例は上限量ではなく、ほかの量の閾値は未収録です。複数食材の累積量、料理全体のFODMAP含有量は計算しません。市販品・料理名だけ・根拠未収録の食材は判定保留です。レシピは独自の献立テンプレートで、認証レシピではありません。

低FODMAP候補は症状が出ない保証ではありません。医師・管理栄養士との食事調整を支える参考情報です。食事と症状の並びやグラフから原因を自動診断しません。

## 本格運用に向けた未実装事項
- 利用条件を確認した、更新可能な量別検査データとの連携。
- 日本の加工食品・品種・調理法の詳細なデータ、管理栄養士によるレビュー。
- 自由なレシピ生成、再導入計画や個別の耐容性評価。
- プライバシー文書、データ保持期間と永久削除の方針。
- 本番環境での医療的・運用的検証。現在の動作確認はローカル環境です。

## 構成・API
Vinext / React / TypeScript、Cloudflare Workers、D1、Drizzle、Shadcn / Radix、Recharts。

- `app/ui.tsx`：画面の切替と入力保持、記録への引き継ぎ。
- `app/food-picker-ui.tsx` / `app/preferences-ui.tsx`：グループ選択と個人設定。
- `app/portion-ui.tsx` / `lib/portions.ts`：出典のある一食量の例。
- `app/recipes-ui.tsx` / `lib/recipes.ts`：必須・希望・除外条件の献立。
- `app/diary-ui.tsx` / `app/symptom-controls.tsx`：食事と日別・時刻別の記録。
- `app/reports-ui.tsx` / `lib/diary.ts`：時系列・グラフ・CSV。
- `GET /api/diary?date=YYYY-MM-DD`：一日分の記録と削除済み記録。
- `GET /api/diary?from=YYYY-MM-DD&to=YYYY-MM-DD`：62日以内の範囲、削除済みは除外。
- `POST /api/diary`：食事・時刻別記録の作成、日別体調の更新。
- `PATCH /api/diary`：食事・時刻別記録の編集と復元。
- `DELETE /api/diary`：復元可能な削除。
- `GET /api/export?from=YYYY-MM-DD&to=YYYY-MM-DD`：本人のCSV出力。
- `GET/PATCH /api/preferences`：通常の除外条件・お気に入り・最近の食材。
- `GET/POST /api/foods`：自分で登録した食材。

サーバー側の本人IDで全操作を限定し、クライアントのユーザーIDを信頼しません。更新APIでは入力と同一オリジンを確認します。CSVは改行・引用符をエスケープし、表計算ソフトの数式として解釈される先頭文字を無効化します。実データ・秘密値はソースに含めません。

## 開発・データ移行
標準環境で `npm ci`、`npm run build`。初回の空のローカルDBへの移行手順は `CODEX_HANDOFF.md` を参照してください。`npm run db:generate` はスキーマを変更して新しい移行を作る場合に使います。

`drizzle/0000_needy_kingpin.sql`、`0001_whole_talkback.sql`、`0002_sparkling_unus.sql` を順にD1へ適用します。0002は既存の食事・体調・自分の食材を保持し、新しい記録項目とテーブルを追加します。既存環境には未適用分だけ実行してください。

ローカル適用例：
```
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0002_sparkling_unus.sql
```

`npm run dev` で確認。ローカルの模擬サインインは本番には適用しません。本番はSitesが認証とデータベースを管理します。公開用アーカイブはローカルデータを含みません。

## 参考資料
- https://www.monashfodmap.com/about-fodmap-and-ibs/high-and-low-fodmap-foods/
- https://www.monashfodmap.com/blog/traffic-light-system/
- https://www.monashfodmap.com/blog/low-fodmap-shopping-list/
- https://www.monashfodmap.com/blog/low-fodmap-meal-planning/
- https://www.monashfodmap.com/ibs-central/i-have-ibs/starting-the-low-fodmap-diet/
- https://www.niddk.nih.gov/health-information/digestive-diseases/irritable-bowel-syndrome/eating-diet-nutrition
- https://www.england.nhs.uk/publication/constipation-resources-for-carers/
- https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/kenkou_iryou/shokuhin/syokuchu/campylobacterqa.html

資料確認日：2026-10-07。


## ローカル試作を開き直す
PC再起動などで画面が開けなくなった場合は、`node scripts/start-preview.mjs` で起動し直せます。Windowsでは、アプリの `fodmap-app` フォルダーと同じ場所に保存した「おなかノートを開く.cmd」をダブルクリックします。起動中なら重複起動せず、停止中ならバックグラウンドで起動します。このPCが動作している間だけ利用するローカル試作です。
