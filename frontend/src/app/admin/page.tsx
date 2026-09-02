// Admin panel has been moved to a separate admin website.
import { redirect } from "next/navigation";
export default function AdminPage() {
  redirect("/dashboard");
}
