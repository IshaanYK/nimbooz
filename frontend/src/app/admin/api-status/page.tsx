// Admin API status page has moved to the separate admin panel.
import { redirect } from "next/navigation";
export default function AdminApiStatusPage() {
  redirect("/dashboard");
}
