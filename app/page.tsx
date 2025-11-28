// app/page.tsx
import { redirect } from "next/navigation";

export default function Home() {
  // quando qualcuno va su "/", lo mandiamo direttamente su "/ai"
  redirect("/ai");
}
