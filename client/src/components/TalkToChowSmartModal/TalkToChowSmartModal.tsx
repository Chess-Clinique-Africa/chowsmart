import { useEffect } from 'react';
import { Mic, X } from 'lucide-react';

export type TalkPrefs = {
  destination: string;
  people: number;
  diet: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  prefs: TalkPrefs;
};

export function TalkToChowSmartModal({ open, onClose, prefs }: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="talk-modal-backdrop"
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="talk-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="talk-modal-title"
      >
        <button type="button" className="talk-modal-close" aria-label="Close" onClick={onClose}>
          <X size={20} />
        </button>

        <h2 id="talk-modal-title">Let’s talk food.</h2>
        <p className="talk-modal-lead">
          A spoken conversation with ChowSmart’s AI-generated voice.
        </p>

        <div className="talk-modal-stage">
          <div className="talk-modal-orb" aria-hidden>
            <Mic size={42} strokeWidth={1.75} />
          </div>
          <p className="talk-modal-status">Conversation ended</p>
          <p className="talk-modal-meta">
            {prefs.destination} · {prefs.people} people · {prefs.diet}
          </p>
        </div>

        <div className="talk-modal-actions">
          <button type="button" className="talk-modal-primary" disabled>
            Start conversation
          </button>
          <button type="button" className="talk-modal-secondary" onClick={onClose}>
            Cancel
          </button>
        </div>

        <div className="talk-modal-alert" role="status">
          Connect the AI provider to enable spoken conversations.
        </div>

        <p className="talk-modal-disclaimer">
          Starting shares microphone audio with the AI speech provider. Sessions end after five
          minutes; closing this dialog stops the microphone. Language support and accuracy vary.
        </p>
      </div>
    </div>
  );
}
