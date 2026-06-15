import { motion } from 'framer-motion'

const variants = {
  initial: { opacity: 0, x: 24 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -24 },
}

export default function PageTransition({ children }) {
  return (
    <motion.div
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.22, ease: [0.32, 0, 0.67, 0] }}
      className="w-full"
    >
      {children}
    </motion.div>
  )
}
