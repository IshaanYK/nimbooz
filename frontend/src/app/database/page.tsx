// Database explorer has moved to the AASRA Admin Panel.
import { redirect } from "next/navigation";
export default function DatabasePage() {
  redirect("/dashboard");
}
