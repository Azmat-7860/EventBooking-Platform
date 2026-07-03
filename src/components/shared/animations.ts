import { Variants, Transition } from "framer-motion"

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
}

export const scaleIn: Variants = {
  hidden: { scale: 0.95, opacity: 0 },
  visible: { scale: 1, opacity: 1 },
}

export const staggerContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
}

export const slideLeft: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 },
}

export const slideRight: Variants = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0 },
}

export const cardHover = {
  rest: {
    scale: 1,
    borderColor: "var(--border)",
    boxShadow: "0 0 0px var(--accent-glow)",
    transition: { duration: 0.3, ease: "easeOut" },
  },
  hover: {
    scale: 1.02,
    borderColor: "rgba(0, 212, 255, 0.3)",
    boxShadow: "0 0 30px var(--accent-glow)",
    transition: { duration: 0.3, ease: "easeOut" },
  },
}

export const pageTransition: Transition = {
  duration: 0.3,
  ease: "easeOut",
}
