# URLsalvager

## これは何？

Web サイトリニューアルの際等に現行サイトに sitemap.xml が無く、サイト規模が全くわからない場合があります。そんな時に使うツール。
任意の URL から a タグ href 属性を辿り、存在する URL（a タグリンクが繋がっている URL） をリスト化します。

- puppeteer を使って a タグを巡り URL をリスト化、エクセルファイルとして出力
- title,description,charset 等基本的なページ情報もついでに取得してエクセルファイル内に出力
- クロールした際の HTML コードもついでにテキストファイルとして出力
- puppeteer 越しに headless chrome の描画結果 a タグを走査するので、js 等で出力されている a タグリンクも巡ることが可能

※対象 URL にはそれなりのアクセス負荷がかかるので、サイト管理者の許可なく本ツールを使用しないでください

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
  - 複数指定可能
- basicAuthentication
  - クロール対象サイトに BASIC 認証がかかっている際にコメントアウトを解除し使用
- loadBlockFileExtention
  - クロールをする際にロードをブロックするファイル
  - クロール速度を高速化するために画像等の読み込みをブロックすることを推奨
- emulateDevice
  - UA 判定等でスマホ UA を使いたい場合等はコメントアウトして使用
    https://github.com/puppeteer/puppeteer/blob/main/src/common/DeviceDescriptors.ts のデバイスを指定可能
  - コメントアウトした状態では puppeteer デフォルトの UA でアクセスする（chrome）
- interval
  - URLにアクセスする際のインターバル指定（Nミリ秒間隔でアクセスすることで負荷軽減させる）

## 結果出力

result ディレクトリ内に結果が出力されます

### 出力例

```
result
└── 20210407151539483
    ├── htmlcode
    │   ├── https:__example_com.txt
    │   ├── https:__example_com_business_html.txt
    │   ├── https:__example_com_en.txt
    │   ├── https:__example_com_en_business_html.txt
    │   ├── :
    │   └── https:__example_com_about_html.txt
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
