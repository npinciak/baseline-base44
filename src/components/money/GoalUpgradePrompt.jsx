import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export default function GoalUpgradePrompt({ onClose }) {
  return (
    <Dialog open onOpenChange={open => !open && onClose()}>
      <DialogContent className="bg-card text-card-foreground border-border">
        <DialogHeader><DialogTitle>More goals? Upgrade to grow.</DialogTitle></DialogHeader>
        <p className="text-muted-foreground">Your free plan includes one goal: your emergency fund. Additional savings goals require an active subscription. Your existing progress is preserved.</p>
        <p className="text-sm text-muted-foreground">Upgrades aren't available yet. You can continue tracking and editing your existing goals.</p>
        <Button onClick={onClose}>Back to my goals</Button>
      </DialogContent>
    </Dialog>
  );
}