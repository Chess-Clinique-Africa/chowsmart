import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { pageFade } from '@/utils/motion';

export function PageTransition() {
  const location = useLocation();
  const reduce = useReducedMotion();

  if (reduce) {
    return <Outlet />;
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        variants={pageFade}
        initial="initial"
        animate="animate"
        exit="exit"
        style={{ minHeight: '100%' }}
      >
        <Outlet />
      </motion.div>
    </AnimatePresence>
  );
}
