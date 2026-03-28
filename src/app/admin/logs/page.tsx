import { redirect } from "next/navigation";

export default function AdminLogsLegacyPage() {
  redirect("/admin/audit");
}
