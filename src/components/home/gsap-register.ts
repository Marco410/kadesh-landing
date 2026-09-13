'use client';

import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(useGSAP, ScrollTrigger);

export { gsap, useGSAP, ScrollTrigger };

/** Premium arrival — confident deceleration, no bounce. */
export const HOME_EASE = 'cubic-bezier(0.16, 1, 0.3, 1)';
