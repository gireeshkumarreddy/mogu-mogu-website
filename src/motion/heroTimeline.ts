import { gsap } from './gsap';

export interface HandRig {
  intro: HTMLElement;

  layout: HTMLElement;
  pivot: HTMLElement;

  edge: HTMLElement;
  edgeB?: HTMLElement;
}

export interface HeroRig {
  hero: HTMLElement;
  centre: HandRig;
  left: HandRig;
  right: HandRig;
  lines: HTMLElement[];
  sub: HTMLElement;
  ctas: HTMLElement;
  extras: HTMLElement[];
  dropsLeft: HTMLElement;
  dropsRight: HTMLElement;
}

type Pt = { x: number; y: number };
const centreOf = (el: HTMLElement): Pt => {
  const r = el.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
};
const rot = (p: Pt, deg: number): Pt => {
  const a = (deg * Math.PI) / 180;
  return { x: p.x * Math.cos(a) - p.y * Math.sin(a), y: p.x * Math.sin(a) + p.y * Math.cos(a) };
};
const restAngle = (el: HTMLElement) => {
  const t = getComputedStyle(el).transform;
  if (!t || t === 'none') return 0;
  const m = new DOMMatrixReadOnly(t);
  return (Math.atan2(m.b, m.a) * 180) / Math.PI;
};

const toLocal = (rig: HandRig, v: Pt) => rot(v, -restAngle(rig.layout));

function contactOffset(rig: HandRig, target: Pt, deg: number, overlap: number, dir: 1 | -1): Pt {
  const P = centreOf(rig.pivot);
  const M = centreOf(rig.edge);
  const turned = rot({ x: M.x - P.x, y: M.y - P.y }, deg);
  const landed = { x: P.x + turned.x, y: P.y + turned.y };
  return { x: target.x - landed.x + overlap * dir, y: target.y - landed.y };
}

export function measureContact(rig: HeroRig) {
  gsap.set([rig.centre.intro, rig.left.intro, rig.right.intro], { clearProps: 'transform' });

  const heroRect = rig.dropsLeft.parentElement!.getBoundingClientRect();
  const W = heroRect.width;
  const H = heroRect.height;
  const tiltL = 6;
  const tiltR = -6;
  const cL = centreOf(rig.centre.edge);
  const cR = centreOf(rig.centre.edgeB ?? rig.centre.edge);
  const overlap = Math.max(2, W * 0.003);
  const hitL = contactOffset(rig.left, cL, tiltL, overlap, 1);
  const hitR = contactOffset(rig.right, cR, tiltR, overlap, -1);
  return {
    W,
    H,
    tiltL,
    tiltR,
    hitL,
    hitR,
    dropL: { x: cL.x - heroRect.left, y: cL.y - heroRect.top },
    dropR: { x: cR.x - heroRect.left, y: cR.y - heroRect.top },
  };
}

export const INTRO_DURATION = 4.0;

export function buildHeroTimeline(rig: HeroRig): gsap.core.Timeline {
  const g = measureContact(rig);
  const { W, H } = g;
  const small = W < 600;
  const L = rig.left.intro;
  const R = rig.right.intro;
  const C = rig.centre.intro;

  const local = (r: HandRig, x: number, y: number) => toLocal(r, { x, y });

  const enterL = local(rig.left, -W * (small ? 0.36 : 0.42), H * 0.2);
  const enterR = local(rig.right, W * (small ? 0.36 : 0.42), H * 0.2);
  const readyL = local(rig.left, -W * 0.012, H * 0.012);
  const readyR = local(rig.right, W * 0.012, H * 0.012);
  const hitL = toLocal(rig.left, g.hitL);
  const hitR = toLocal(rig.right, g.hitR);
  const recoil = W * 0.01;
  const recoilL = local(rig.left, g.hitL.x - recoil, g.hitL.y - recoil * 0.3);
  const recoilR = local(rig.right, g.hitR.x + recoil, g.hitR.y - recoil * 0.3);
  const reboundL = local(rig.left, -W * 0.014, H * 0.006);
  const reboundR = local(rig.right, W * 0.014, H * 0.006);

  gsap.set(C, { y: H * (small ? 0.5 : 0.7), rotation: 0, x: 0 });
  gsap.set(L, { x: enterL.x, y: enterL.y, rotation: -16 });
  gsap.set(R, { x: enterR.x, y: enterR.y, rotation: 16 });
  gsap.set(rig.lines, { yPercent: 45, scale: 0.35, autoAlpha: 0 });
  gsap.set([rig.sub, rig.ctas, ...rig.extras], { y: 14, autoAlpha: 0 });
  gsap.set([...rig.dropsLeft.children, ...rig.dropsRight.children], { autoAlpha: 0, scale: 0, x: 0, y: 0 });
  gsap.set(rig.dropsLeft, { x: g.dropL.x, y: g.dropL.y });
  gsap.set(rig.dropsRight, { x: g.dropR.x, y: g.dropR.y });

  const tl = gsap.timeline({ paused: true, defaults: { overwrite: false } });

  const T = { centre: 0.85, sides: 1.15, approach: 1.95, hitL: 2.35, hitR: 2.45, rebound: 2.55, settle: 3.15 };

  tl.to(rig.lines, { yPercent: 0, scale: 1, autoAlpha: 1, duration: 0.5, stagger: 0.15, ease: 'back.out(2.2)' }, 0)
    .to(rig.sub, { y: 0, autoAlpha: 1, duration: 0.4, ease: 'power2.out' }, 0.55)
    .to(rig.ctas, { y: 0, autoAlpha: 1, duration: 0.4, ease: 'power2.out' }, 0.65);

  tl.to(C, { y: 0, duration: 0.5, ease: small ? 'back.out(1.25)' : 'back.out(1.45)' }, T.centre);

  tl.to(L, { x: readyL.x, duration: 0.8, ease: 'power3.out' }, T.sides)
    .to(L, { y: readyL.y, rotation: -2, duration: 0.8, ease: 'sine.inOut' }, T.sides)
    .to(R, { x: readyR.x, duration: 0.8, ease: 'power3.out' }, T.sides + 0.02)
    .to(R, { y: readyR.y, rotation: 2, duration: 0.78, ease: 'sine.inOut' }, T.sides + 0.02);

  tl.to(
    L,
    { x: hitL.x, y: hitL.y, rotation: g.tiltL, duration: T.hitL - T.approach, ease: 'power2.in' },
    T.approach,
  ).to(R, { x: hitR.x, y: hitR.y, rotation: g.tiltR, duration: T.hitR - T.approach, ease: 'power2.in' }, T.approach);

  tl.to(L, { x: recoilL.x, y: recoilL.y, rotation: g.tiltL - 1.6, duration: 0.2, ease: 'power2.out' }, T.hitL)
    .to(C, { rotation: 1.3, x: W * 0.002, duration: 0.1, ease: 'power2.out' }, T.hitL)
    .to(R, { x: recoilR.x, y: recoilR.y, rotation: g.tiltR + 1.6, duration: 0.2, ease: 'power2.out' }, T.hitR)
    .to(C, { rotation: -0.9, x: -W * 0.0015, duration: 0.12, ease: 'power2.out' }, T.hitR);

  const burst = (group: HTMLElement, at: number, dir: 1 | -1) => {
    Array.from(group.children).forEach((d, i) => {
      const spread = [-0.55, -0.15, 0.25, 0.6][i % 4];
      tl.fromTo(
        d,
        { autoAlpha: 0, scale: 0.2, x: 0, y: 0 },
        {
          keyframes: [
            { autoAlpha: 1, scale: 1, duration: 0.12, ease: 'power2.out' },
            {
              x: dir * (6 + i * 7) * (small ? 0.7 : 1),
              y: -(16 + Math.abs(spread) * 22) * (small ? 0.7 : 1),
              duration: 0.32,
              ease: 'power2.out',
            },
            { autoAlpha: 0, y: '+=10', duration: 0.18, ease: 'power1.in' },
          ],
        },
        at + i * 0.02,
      );
    });
  };
  burst(rig.dropsLeft, T.hitL, -1);
  burst(rig.dropsRight, T.hitR, 1);

  tl.to(
    L,
    { x: reboundL.x, y: reboundL.y, rotation: -1.2, duration: T.settle - T.rebound, ease: 'sine.inOut' },
    T.rebound,
  )
    .to(
      R,
      { x: reboundR.x, y: reboundR.y, rotation: 1.2, duration: T.settle - T.rebound - 0.1, ease: 'sine.inOut' },
      T.rebound + 0.1,
    )
    .to(C, { rotation: 0.5, x: 0, y: H * 0.004, duration: T.settle - T.rebound, ease: 'sine.inOut' }, T.rebound + 0.02);

  tl.to([L, R], { x: 0, y: 0, rotation: 0, duration: INTRO_DURATION - T.settle, ease: 'power2.out' }, T.settle)
    .to(C, { x: 0, y: 0, rotation: 0, duration: 0.7, ease: 'sine.out' }, T.settle)
    .to(rig.extras, { y: 0, autoAlpha: 1, duration: 0.4, ease: 'power2.out' }, T.settle + 0.25);

  tl.set([L, R, C], { clearProps: 'transform' }, INTRO_DURATION);
  return tl;
}

export function settleHero(rig: HeroRig) {
  gsap.set([rig.centre.intro, rig.left.intro, rig.right.intro], { clearProps: 'transform,opacity,visibility' });
  gsap.set([...rig.lines, rig.sub, rig.ctas, ...rig.extras], { clearProps: 'transform,opacity,visibility' });
  gsap.set([...rig.dropsLeft.children, ...rig.dropsRight.children], { autoAlpha: 0 });
}
