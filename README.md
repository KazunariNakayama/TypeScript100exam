# TypeScript 100本ノック

TypeScriptの学習用Webアプリケーション。Monaco Editorを使用して、TypeScriptのコーディング問題を解くことができます。

## 機能

- Monaco Editorを使用したTypeScriptコード編集
- 問題文の表示
- コードの実行とテスト結果の表示
- Docker環境での開発

## 技術スタック

- フロントエンド: React + TypeScript + @monaco-editor/react
- バックエンド: Node.js + Express + ts-node
- コンテナ: Docker / Docker Compose

## セットアップ

1. リポジトリをクローン
```bash
git clone [repository-url]
cd ts-knock-app
```

2. Docker Composeで起動
```bash
docker-compose up
```

3. ブラウザでアクセス
- フロントエンド: http://localhost:3000
- バックエンド: http://localhost:4000

## 開発

### フロントエンド
```bash
cd frontend
npm install
npm run dev
```

### バックエンド
```bash
cd backend
npm install
npm run dev
```

## ライセンス

MIT # TypeScript100exam
