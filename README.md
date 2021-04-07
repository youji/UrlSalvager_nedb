# URLsalvager

## これは何？

Web サイトリニューアルの際等に、現行サイトに sitemap.xml 無くサイト規模が全くわからない場合があります。そんな時に使うツール。
任意の URL から a タグを辿り、存在する（a タグリンクが繋がっている）URL をリスト化します。

- puppeteer を使って a タグを巡り URL をリスト化
- title,description,charset 等基本的なページ情報もついでに取得
- クロールした際の HTML コードもついでにテキストファイルとして出力

## 実行方法

下記で node パッケージインストール

```
npm i
```

conf.yaml を設定したうえで下記の様に実行

```
node salvage.js
```

conf.yaml に記載の startUrl を起点として a タグリンクを辿り、url リストを作成する。URL リストはエクセルファイルとして出力されます。

## conf.yaml 設定内容

- startUrl
  - クロールの起点となる URL の指定
  - 通常はサイトのトップページ等を指定する
  - 複数指定可能
- allowDomain
  - a タグを辿る際に許可するドメイン
  - 基本的には startUrl に指定した URL のドメインを指定する
- basicAuthentication
  - クロール対象サイトに BASIC 認証がかかっている際にコメントアウトを解除し使用
- loadBlockFileExtention
  - クロールをする際にロードをブロックするファイル
  - クロール速度を高速化するために画像等の読み込みをブロックすることを推奨
- emulateDevice
  - UA 判定等でスマホ UA を使いたい場合等はコメントアウトして使用
    https://github.com/puppeteer/puppeteer/blob/main/src/common/DeviceDescriptors.ts のデバイスを指定可能
  - コメントアウトした状態では puppeteer デフォルトの UA でアクセスする（chrome）

## 結果出力

result ディレクトリ内に結果が出力されまる

### 出力例

```
result
└── 20210407151539483
    ├── htmlcode
    │   ├── https:__example.com_.txt
    │   ├── https:__example.com_business.html.txt
    │   ├── https:__example.com_en_.txt
    │   ├── https:__example.com_en_business.html.txt
    │   ├── :
    │   └── https:__example.com_about.html.txt
    └── result.xlsx

```

### result.xlsx の出力内容

- url
  - URL
- status
  - クロールした際の HTTP ステータスコード
  - conf.yaml の loadBlockFileExtention に指定された拡張子の URL は"SKIP"として出力
- title
  - title タグ内文言
- description
  - meta[name="description"]の content 値
- keywords
  - meta[name="keywords"]の content 値
- canonical
  - link[rel="canonical"]の href 値
- viewport
  - viewport 指定
- charset
  - document.charset の値
