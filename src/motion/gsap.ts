import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);
gsap.defaults({ overwrite: 'auto' });

export { gsap, ScrollTrigger };

export const isMotionOn = () => document.documentElement.dataset.motion !== 'off';
export const isSmallScreen = () => window.matchMedia('(max-width: 767px)').matches;
export const canHover = () => window.matchMedia('(hover: hover) and (pointer: fine)').matches;
