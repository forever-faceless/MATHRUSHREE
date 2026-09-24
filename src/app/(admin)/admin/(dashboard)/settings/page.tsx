import { SettingsForm } from "@/components/admin/SettingsForm";
import { PageHeader } from "@/components/admin/ui";
import { updateSettings } from "@/lib/actions/settings";
import { getSettings } from "@/lib/db/queries";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  const settings = await getSettings();
  return (
    <>
      <PageHeader title="Society settings" description="Contact numbers, address, registration details and the home page hero." />
      <div className="card p-5 sm:p-8">
        <SettingsForm settings={settings} action={updateSettings} />
      </div>
    </>
  );
}
