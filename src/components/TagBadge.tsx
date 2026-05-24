interface Props {
  tag: string;
  active?: boolean;
  onClick?: () => void;
}

export default function TagBadge({ tag, active, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 font-mono text-xs transition-colors ${
        active
          ? 'bg-primary text-primary-foreground'
          : 'bg-secondary text-muted-foreground hover:bg-primary/10 hover:text-primary'
      }`}
    >
      {tag}
    </button>
  );
}
