import Link from "next/link";
import { PageShell } from "@/components/page-shell";

export default function NotFound() {
  return (
    <PageShell className="text-center">
      <p className="kicker">404</p>
      <h1 className="mt-2 font-serif text-4xl">Siden finnes ikke</h1>
      <p className="mt-3 text-muted">Kanskje bedriften ikke er lagt inn ennå.</p>
      <Link href="/" className="mt-6 inline-block text-rust underline">
        Tilbake til forsiden
      </Link>
    </PageShell>
  );
}
