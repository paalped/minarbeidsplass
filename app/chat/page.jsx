import { ChatRoom } from "@/components/chat-room";
import { LoginGate } from "@/components/login-gate";
import { PageShell } from "@/components/page-shell";
import { getChatMessages, getSessionUser } from "@/lib/data";

export const metadata = { title: "Chat" };

export default async function ChatPage() {
  const user = await getSessionUser();

  if (!user) {
    return (
      <LoginGate
        kicker="Sladderrommet"
        title="Logg inn for å chatte"
        description="Chat er for innloggede. Sladder på bedriftssiden er fortsatt åpent og anonymt."
        nextPath="/chat"
      />
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
