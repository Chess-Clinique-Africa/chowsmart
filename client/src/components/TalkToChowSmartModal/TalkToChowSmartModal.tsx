import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { LoaderCircle, Mic, Send, X } from 'lucide-react';
import { unwrap, api } from '@/services/api';
import { backdrop, softSpring } from '@/utils/motion';

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
  const [message, setMessage] = useState('');
  const [reply, setReply] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const reduce = useReducedMotion();

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

  useEffect(() => {
    if (!open) {
      setMessage('');
      setReply('');
      setError('');
      setLoading(false);
    }
  }, [open]);

  async function sendMessage() {
    if (!message.trim() || loading) return;
    setLoading(true);
    setError('');
    try {
      const data = await unwrap<{ message: string }>(
        api.post('/ai/chat', {
          message,
          context: prefs,
        })
      );
      setReply(data.message);
      setMessage('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not reach the AI provider');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="talk-modal-backdrop"
          role="presentation"
          variants={backdrop}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.div
            className="talk-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="talk-modal-title"
            initial={reduce ? false : { opacity: 0, scale: 0.94, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={reduce ? undefined : { opacity: 0, scale: 0.97, y: 12 }}
            transition={reduce ? { duration: 0 } : softSpring}
            onClick={(e) => e.stopPropagation()}
          >
            <button type="button" className="talk-modal-close" aria-label="Close" onClick={onClose}>
              <X size={20} />
            </button>

            <h2 id="talk-modal-title">Let’s talk food.</h2>
            <p className="talk-modal-lead">
              A spoken conversation with ChowSmart’s AI-generated voice.
            </p>

            <div className="talk-modal-stage">
              <div className={`talk-modal-orb${loading ? ' live' : ''}`} aria-hidden>
                <Mic size={42} strokeWidth={1.75} />
              </div>
              <p className="talk-modal-status">
                {loading ? 'ChowSmart is thinking...' : 'Ready to help'}
              </p>
              <p className="talk-modal-meta">
                {prefs.destination} · {prefs.people} people · {prefs.diet}
              </p>
            </div>

            <AnimatePresence mode="wait">
              {reply ? (
                <motion.p
                  key={reply.slice(0, 48)}
                  className="talk-modal-reply"
                  role="status"
                  initial={reduce ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35 }}
                >
                  {reply}
                </motion.p>
              ) : null}
            </AnimatePresence>

            <form
              className="talk-modal-actions"
              onSubmit={(event) => {
                event.preventDefault();
                void sendMessage();
              }}
            >
              <input
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Ask about a dish or menu..."
                aria-label="Message ChowSmart"
                maxLength={4000}
              />
              <button
                type="submit"
                className="talk-modal-primary"
                disabled={loading || !message.trim()}
              >
                {loading ? <LoaderCircle size={18} className="animate-spin" /> : <Send size={18} />}
                Ask ChowSmart
              </button>
              <button type="button" className="talk-modal-secondary" onClick={onClose}>
                Cancel
              </button>
            </form>

            <AnimatePresence>
              {error ? (
                <motion.div
                  className="talk-modal-alert"
                  role="alert"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  {error}
                </motion.div>
              ) : null}
            </AnimatePresence>

            <p className="talk-modal-disclaimer">
              AI responses are generated by the configured provider. Check important dietary and
              allergy decisions with a qualified professional.
            </p>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
