@AGENTS.md

# CLAUDE.md (frontend)

Next.js 15 App Router / TypeScript の SPA。Laravel API（`../backend`）を消費する。
リポジトリ全体の概要・コマンドはルートの `../CLAUDE.md` を参照。
**上の AGENTS.md の警告は必読**: この Next.js は破壊的変更を含むため、Next.js のコードを書く前に `node_modules/next/dist/docs/` の該当ガイドを読み、訓練データの記憶に頼らない。

## アーキテクチャ（レイヤーと責務）

```
Server state:  API endpoint fn → React Query hook → Component
HTTP:          src/lib/api/client.ts (fetch ラッパ + Sanctum CSRF)
Types:         src/types/generated.d.ts （バックエンドから自動生成・編集禁止）
```

- **`src/lib/api/client.ts`** — 唯一の HTTP 層。薄い `fetch` ラッパで Sanctum の Cookie/CSRF フロー（`ensureCsrf()` → `X-XSRF-TOKEN`）を扱う。エラーは `ApiError`（`.status` と `.validationErrors`）で投げる。`fetch` を直接コンポーネントから呼ばない。
- **`src/lib/api/endpoints.ts`** — ドメインごとの型付き API 関数（`authApi.login(...)` 等）。`client.ts` の `apiFetch<T>` を使う。`transform.ts` はレスポンス整形。
- **`src/lib/auth.ts` / `src/lib/hooks.ts`** — React Query（`@tanstack/react-query`）の hook。サーバー状態は必ず React Query で扱い、`useQuery`/`useMutation` の `queryKey` を集約管理する。コンポーネントから endpoints を直接 await しない。
- **`src/components/`** — 表示。サーバー状態は hook 経由で受け取る。`Protected.tsx` で認証ガード、`ui.tsx` に共通プリミティブ。
- **`src/app/`** — App Router のルート（`layout.tsx` / `page.tsx` / `global-error.tsx`）。`providers.tsx` で React Query Provider を張る。
- **`src/types/generated.d.ts`** — **自動生成。手で編集しない**。バックエンドの spatie Data クラスから `make types`（リポジトリルートで実行）で再生成する。型は `App.Data.*`（例 `App.Data.UserData`）で参照する。新フィールドが必要なら backend の Data クラスを直してから `make types`。
- パスエイリアスは `@/*` → `src/*`。

## フォーマット / コーディング規約

- **Lint は ESLint flat config（`eslint.config.mjs`）に準拠**。`eslint-config-next` の `core-web-vitals` + `typescript` ルールセットを使う。実行: `docker compose run --rm --no-deps node npm run lint`。
- **Prettier は導入していない**。整形は ESLint と Next/エディタ既定（2 スペースインデント）に従い、勝手に別の整形ツールを足さない。
- TypeScript は `strict: true`。`any` を避け、API レスポンス型は生成された `App.Data.*` を使う。
- React は v19 / `react-jsx`。クライアント側 hook を使うファイルは `"use client"` を先頭に付ける。

## コードスタイル

- 関数型アプローチを優先し、副作用を最小化する
- 厳密な型付け（`any` は使わず `unknown` を使う）
- エラーは握りつぶさず、意味のあるメッセージ付きで処理する

## Git / ブランチ運用

- ブランチ戦略: `main`（本番）/ `develop`（統合）/ `feature/*`。`feature/*` は `develop` から切り、PR で `develop` へマージ。リリース時に `develop` → `main`。
- `main` / `develop` へ直接コミットしない（必ず `feature/*` で作業）。
- **コミット前に `npm run lint` / `npx tsc --noEmit` / `npm run test:run` / `NODE_ENV=production npm run build` が通ることを確認する**。

## テスト

- Vitest + Testing Library（jsdom）。`make front-test`（カバレッジ）または単体: `docker compose run --rm --no-deps node npm run test:run -- src/lib/gantt.test.ts`。
- 本番ビルドは `NODE_ENV=production` 必須（compose の node は dev）。`make front-build` を使う。
