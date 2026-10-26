import { SettingsForm } from "@/components/admin/SettingsForm";
import { getSettings } from "@/lib/content";
import { requirePage } from "@/lib/guard";

export const metadata = { title: "Textos do site" };
export const dynamic = "force-dynamic";

export default async function Page() {
  await requirePage(["ADMIN", "EDITOR"]);
  return (
    <>
      <div className="adm-head">
        <h1>Textos do site</h1>
      </div>
      <SettingsForm initial={await getSettings()} />
    </>
  );
}
