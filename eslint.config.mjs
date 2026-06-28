import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // 生成物（lint 対象外）
    "coverage/**",
    "src/types/generated.d.ts",
  ]),
  {
    rules: {
      // サーバ取得データでフォームを初期化する effect 内の同期 setState を許可
      "react-hooks/set-state-in-effect": "off",
      // アバターは外部(MinIO)URL のため next/image 最適化の対象外
      "@next/next/no-img-element": "off",
    },
  },
]);

export default eslintConfig;
