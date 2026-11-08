import { toolAccess } from '@/lib/curriculum';
import LockedToolCard from '@/components/money/LockedToolCard';

export default function ToolGate({ tool, chapters, onCompleteMove, children }) {
  const access = toolAccess(tool, chapters);
  if (access.unlocked) return children;
  return <LockedToolCard access={access} onCompleteMove={onCompleteMove} />;
}