/** Shared physical rhythm; times are seconds for Motion / Web Animations. */
export const galleryMotion = {
  fast: .16,
  normal: .36,
  reveal: .72,
  stagger: .06,
  ease: [.16, 1, .3, 1] as const,
  spring: { type: 'spring' as const, stiffness: 380, damping: 36, mass: .8 },
};
