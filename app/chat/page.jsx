import { ChatRoom } from "@/components/chat-room";
import { LoginForm } from "@/components/login-form";
import { PageShell } from "@/components/page-shell";
import { getChatMessages, getSessionUser } from "@/lib/data";

export const metadata = { title: "Chat" };

export default async function ChatPage() {
  const user = await getSessionUser();

  if (!user) {
    return (
      <PageShell>
        <div className="mx-auto max-w-lg">
          <p className="kicker">Sladderrommet</p>
          <h1 className="mt-2 font-serif text-3xl">Logg inn for å chatte</h1>
          <p className="mt-3 mb-8 text-muted">
            Ett felles rom. Innlogging holder de verste spøkelsene unna. Sladder på bedriftssiden er
            fortsatt anonym.
          </p>
          <LoginForm nextPath="/chat" />
        </div>
      </PageShell>
    );
  }

  const messages = await getChatMessages();

  return (
    <PageShell>
      <p className="kicker">Live</p>
      <h1 className="mt-2 font-serif text-4xl">Sladderrommet</h1>
      <p className="mt-3 mb-6 max-w-xl text-muted">
        Hele Norge i én tråd. Vær ærlig, vær voksen, og ikke dox kollegaene dine.
      </p>
      <ChatRoom initialMessages={messages} user={user} />
    </PageShell>
  );
}
