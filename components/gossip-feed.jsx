import { formatDateTime } from "@/lib/format";

export function GossipFeed({ posts }) {
  if (posts.length === 0) {
    return <p className="text-muted">Ingen har sladret her ennå. Først til mølla.</p>;
  }

  return (
    <ul className="space-y-4">
      {posts.map((post) => (
        <li key={post.id} className="paper-card p-4">
          <div className="flex items-baseline justify-between gap-3">
            <p className="font-medium">{post.nickname || "Anonym"}</p>
            <time className="text-xs text-muted" dateTime={post.created_at}>
              {formatDateTime(post.created_at)}
            </time>
          </div>
          <p className="mt-2 whitespace-pre-wrap text-[17px] leading-relaxed">{post.body}</p>
          {post.reply?.body ? (
            <div className="mt-4 border-t border-line pt-3">
              <p className="kicker">Verifisert arbeidsgiver</p>
              <p className="mt-2 whitespace-pre-wrap leading-relaxed">{post.reply.body}</p>
            </div>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
