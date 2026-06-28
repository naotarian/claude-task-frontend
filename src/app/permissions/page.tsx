import Link from "next/link";

export const dynamic = "force-dynamic";

export default function PermissionsPage() {
  return (
    <main className="mx-auto max-w-2xl space-y-6 p-6">
      <div>
        <Link href="/dashboard" className="text-sm text-blue-600 hover:underline">
          ← ダッシュボード
        </Link>
        <h1 className="mt-1 text-xl font-semibold">権限について</h1>
      </div>

      <section className="space-y-2">
        <h2 className="text-base font-semibold">組織の権限</h2>
        <ul className="list-disc space-y-1 pl-5 text-sm text-gray-700">
          <li>
            <b>オーナー（owner）</b>：組織の全操作。メンバーの権限変更、オーナーの追加/移譲、組織の削除が可能。複数人を設定できます。
          </li>
          <li>
            <b>管理者（admin）</b>：メンバー招待・プロジェクト作成・役職管理などの管理操作。
          </li>
          <li>
            <b>メンバー（member）</b>：通常の利用。
          </li>
          <li>
            <b>役職（社長・部長 等）</b>：肩書きの表示ラベルです。<u>権限には影響しません</u>。
          </li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold">プロジェクトの権限（組織の権限とは別）</h2>
        <ul className="list-disc space-y-1 pl-5 text-sm text-gray-700">
          <li>
            <b>オーナー（owner）</b>：プロジェクトの全操作。メンバー招待、権限変更、ステータス/項目設定、アーカイブ（終了）が可能。
          </li>
          <li>
            <b>編集者（editor）</b>：<u>タスクの作成・編集</u>のみ可能。プロジェクト全体の設定は変更できません。
          </li>
          <li>
            <b>閲覧者（viewer）</b>：閲覧のみ。
          </li>
        </ul>
        <p className="text-xs text-gray-500">
          ※ 所有組織のオーナー/管理者は、その組織のプロジェクトを管理できます。
        </p>
      </section>
    </main>
  );
}
