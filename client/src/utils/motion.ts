import type { Transition, Variants } from 'framer-motion';

export const easeOut: Transition['ease'] = [0.22, 1, 0.36, 1];

export const softSpring: Transition = {
  type: 'spring',
  stiffness: 380,
  damping: 32,
  mass: 0.9,
};

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: easeOut },
  },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.4, ease: easeOut },
  },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.96, y: 10 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: softSpring,
  },
  exit: {
    opacity: 0,
    scale: 0.98,
    y: 8,
    transition: { duration: 0.2, ease: easeOut },
  },
};

export const slideUpSheet: Variants = {
  hidden: { opacity: 0, y: '100%' },
  visible: {
    opacity: 1,
    y: 0,
    transition: softSpring,
  },
  exit: {
    opacity: 0,
    y: '40%',
    transition: { duration: 0.22, ease: easeOut },
  },
};

export const backdrop: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.25 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

export const staggerChildren = (stagger = 0.08, delayChildren = 0.06): Variants => ({
  hidden: {},
  visible: {
    transition: { staggerChildren: stagger, delayChildren },
  },
});

export const chatBubble: Variants = {
  hidden: { opacity: 0, y: 12, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.35, ease: easeOut },
  },
};

export const pageFade: Variants = {
  initial: { opacity: 0, y: 8 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: easeOut },
  },
  exit: {
    opacity: 0,
    y: -6,
    transition: { duration: 0.2, ease: easeOut },
  },
};

export const tabPanel: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.32, ease: easeOut },
  },
  exit: {
    opacity: 0,
    y: -6,
    transition: { duration: 0.18, ease: easeOut },
  },
};
