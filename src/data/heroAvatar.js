/**
 * Experience desk knobs.
 * Desktop values are locked for the avatar sit pose — don't change casually.
 * Mobile has no 3D avatar; desk just needs to fit the column cleanly.
 */
export const EXPERIENCE_DESK = {
  width: 560,
  translateX: -50,
  translateY: 100,
  scale: 1.4,
  /** Cap width on < lg viewports (no scale/translate). */
  mobileMaxWidth: 300,
};

export const HERO_AVATAR = {
  animation: "Standing",
  position: { x: 0, y: 0, z: 0 },
  rotation: { x: 0, y: 0, z: 0 },
  scale: 0.5,
  camera: {
    position: { x: 0, y: 0.5, z: 2.0 },
    fov: 32,
    target: { x: 0, y: 0.5, z: 0 },
  },
};

/** Pose while typing at the Experience desk. */
export const LANDING_AVATAR = {
  position: { x: 0.15, y: -0.08, z: 0 },
  rotation: { x: 0, y: -Math.PI / 3, z: 0 },
  scale: 0.5,
};

/**
 * About section — upright sitting-idle pose behind the glowing desk.
 * Sitting Idle.fbx defaults ~90° tipped forward on this rig, so a large negative X
 * (-1.38 ≈ -79°) uprights him with a slight lean back. Scale is intentionally unused in Phase 3
 * (HeroSection holds standing scale 0.5) — do not shrink here.
 * Yaw is applied before pitch in Avatar.jsx so Y never sideways-tilts.
 */
export const SITTING_AVATAR = {
  position: { x: -0.05, y: -0.12, z: -0.15 },
  rotation: { x: -1.38, y: 0.15, z: 0 },
  scale: 0.5,
};

/**
 * Contact section — avatar stands back up from the About desk and settles
 * centered on the stage, facing the viewer directly (a confident "let's talk"
 * pose) against a soft gradient backdrop.
 */
export const CONTACT_AVATAR = {
  position: { x: 0, y: 0, z: 0.1 },
  rotation: { x: 0, y: 0, z: 0 },
  scale: 0.5,
};
