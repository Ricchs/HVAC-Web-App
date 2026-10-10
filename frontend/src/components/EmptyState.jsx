import { SearchX, Inbox } from "lucide-react";

function EmptyState({ search, label, icon: Icon = Inbox }) {
  const ResolvedIcon = search ? SearchX : Icon;

  return (
    <div className="empty-state">
      <ResolvedIcon />
      <p>{search ? `No ${label} match your search.` : `No ${label} found.`}</p>
    </div>
  );
}

export default EmptyState;
