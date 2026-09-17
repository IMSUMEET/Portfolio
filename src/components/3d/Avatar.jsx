import React, { useEffect, useRef, useMemo } from "react";
import * as THREE from "three";
import { useGraph } from "@react-three/fiber";
import { useGLTF, useFBX, useAnimations } from "@react-three/drei";
import * as SkeletonUtils from "three/examples/jsm/utils/SkeletonUtils.js";

import avatarUrl from "../../assets/Avatar.glb";
import standingUrl from "../../assets/Standing.fbx";
import fallingUrl from "../../assets/Falling.fbx";
import typingUrl from "../../assets/Typing.fbx";
import sittingUrl from "../../assets/Sitting Idle.fbx";
import stretchingUrl from "../../assets/Arm Stretching.fbx";

useGLTF.preload(avatarUrl);
useFBX.preload(standingUrl);
useFBX.preload(fallingUrl);
useFBX.preload(typingUrl);
useFBX.preload(sittingUrl);
useFBX.preload(stretchingUrl);

// Lower-body bones (hips, legs, feet, root). Everything else is "upper body".
const LOWER_BODY =
  /^(Hips|LeftUpLeg|LeftLeg|LeftFoot|LeftToeBase|LeftToe_End|RightUpLeg|RightLeg|RightFoot|RightToeBase|RightToe_End|Armature)\./;

/**
 * Build a clip that keeps the UPPER-body motion of `upperClip` but drives the
 * LOWER body (hips + legs) from `lowerClip`. Used so the arm-stretch idle only
 * moves the torso/arms while the legs stay in the calm standing pose — no
 * lean, no weight shift.
 */
function mergeLowerBody(upperClip, lowerClip, name) {
  const tracks = [];
  for (const t of upperClip.tracks) {
    if (!LOWER_BODY.test(t.name)) tracks.push(t.clone());
  }
  for (const t of lowerClip.tracks) {
    if (LOWER_BODY.test(t.name)) tracks.push(t.clone());
  }
  return new THREE.AnimationClip(name, upperClip.duration, tracks);
}

function dampBoneTowardRest(clip, boneName, amount) {
  const tr = clip.tracks.find((t) => t.name === `${boneName}.quaternion`);
  if (!tr) return;
  const rest = new THREE.Quaternion(
    tr.values[0],
    tr.values[1],
    tr.values[2],
    tr.values[3],
  );
  const cur = new THREE.Quaternion();
  for (let i = 0; i < tr.values.length; i += 4) {
    cur.set(tr.values[i], tr.values[i + 1], tr.values[i + 2], tr.values[i + 3]);
    cur.slerp(rest, amount);
    tr.values[i] = cur.x;
    tr.values[i + 1] = cur.y;
    tr.values[i + 2] = cur.z;
    tr.values[i + 3] = cur.w;
  }
}

function fixMixamoClip(
  rawClip,
  name,
  { keepHipsPosition = false, alreadyYUp = false, dampHips = 0, dampSpine = 0 } = {},
) {
  const clip = rawClip.clone();
  clip.name = name;

  // Some FBX poses (e.g. the sitting pose) are exported Y-up already, so the
  // z-up → y-up correction would tip them over. Keep bone rotations verbatim,
  // but still strip Hips.position unless keepHipsPosition — root motion fights
  // the parent group transform and folds the sit pose.
  if (alreadyYUp) {
    if (!keepHipsPosition) {
      clip.tracks = clip.tracks.filter((t) => t.name !== "Hips.position");
    }
    return clip;
  }

  const zUpToYUp = new THREE.Quaternion().setFromAxisAngle(
    new THREE.Vector3(1, 0, 0),
    -Math.PI / 2,
  );

  const qTrack = clip.tracks.find((t) => t.name === "Hips.quaternion");
  if (qTrack) {
    const q = new THREE.Quaternion();
    for (let i = 0; i < qTrack.values.length; i += 4) {
      q.set(
        qTrack.values[i],
        qTrack.values[i + 1],
        qTrack.values[i + 2],
        qTrack.values[i + 3],
      );
      q.multiply(zUpToYUp);
      qTrack.values[i] = q.x;
      qTrack.values[i + 1] = q.y;
      qTrack.values[i + 2] = q.z;
      qTrack.values[i + 3] = q.w;
    }

    // Some Mixamo clips (e.g. Arm Stretching) lean the whole body back up to
    // ~28° as part of the motion. With hip position stripped that reads as the
    // avatar tipping over / floating. Pull each frame's hip rotation toward a
    // TRUE-vertical target (the first frame's heading with its pitch/roll
    // removed) so the body stays perfectly upright and planted while the arms
    // still do the full stretch. dampHips is the fraction pulled to upright.
    if (dampHips > 0) {
      const cur = new THREE.Quaternion(
        qTrack.values[0],
        qTrack.values[1],
        qTrack.values[2],
        qTrack.values[3],
      );
      // Keep only the yaw (heading) of frame 0; drop pitch/roll → straight up.
      const e0 = new THREE.Euler().setFromQuaternion(cur, "YXZ");
      const uprightRef = new THREE.Quaternion().setFromEuler(
        new THREE.Euler(0, e0.y, 0, "YXZ"),
      );
      for (let i = 0; i < qTrack.values.length; i += 4) {
        cur.set(
          qTrack.values[i],
          qTrack.values[i + 1],
          qTrack.values[i + 2],
          qTrack.values[i + 3],
        );
        cur.slerp(uprightRef, dampHips);
        qTrack.values[i] = cur.x;
        qTrack.values[i + 1] = cur.y;
        qTrack.values[i + 2] = cur.z;
        qTrack.values[i + 3] = cur.w;
      }
    }
  }

  // The stretch also curves the spine chain, tilting the torso even when the
  // hips are upright. Pull the spine bones back toward their rest pose so the
  // whole body stays vertical while the arms still do the full stretch.
  if (dampSpine > 0) {
    dampBoneTowardRest(clip, "Spine", dampSpine);
    dampBoneTowardRest(clip, "Spine1", dampSpine);
    dampBoneTowardRest(clip, "Spine2", dampSpine);
  }

  if (keepHipsPosition) {
    // Mixamo FBX hips height lives in Z — convert Z-up → Y-up: (x,y,z) → (x,z,-y)
    const pTrack = clip.tracks.find((t) => t.name === "Hips.position");
    if (pTrack) {
      for (let i = 0; i < pTrack.values.length; i += 3) {
        const x = pTrack.values[i];
        const y = pTrack.values[i + 1];
        const z = pTrack.values[i + 2];
        pTrack.values[i] = x;
        pTrack.values[i + 1] = z;
        pTrack.values[i + 2] = -y;
      }
    }
  } else {
    clip.tracks = clip.tracks.filter((t) => t.name !== "Hips.position");
  }

  return clip;
}

export default function Avatar({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = [1, 1, 1],
  animation = "Standing",
}) {
  const { scene } = useGLTF(avatarUrl);
  const { animations: standingClips } = useFBX(standingUrl);
  const { animations: fallingClips } = useFBX(fallingUrl);
  const { animations: typingClips } = useFBX(typingUrl);
  const { animations: sittingClips } = useFBX(sittingUrl);
  const { animations: stretchingClips } = useFBX(stretchingUrl);
  const animRef = useRef();
  const prevAnimRef = useRef(null);

  const clone = useMemo(() => SkeletonUtils.clone(scene), [scene]);
  const { nodes, materials } = useGraph(clone);

  const fixedClips = useMemo(() => {
    const standing = fixMixamoClip(standingClips[0], "Standing");
    const falling = fixMixamoClip(fallingClips[0], "Falling");
    const typing = fixMixamoClip(typingClips[0], "Typing");
    // Sitting Idle FBX is already Y-up; use verbatim (strip hips position)
    const sitting = fixMixamoClip(sittingClips[0], "Sitting", {
      alreadyYUp: true,
    });
    // The raw arm-stretch clip shifts the whole body weight to one side and
    // leans back, which reads as a tilt no matter how we damp the hips. Instead
    // we keep only its UPPER-body motion (torso + arms) and drive the lower
    // body (hips + legs) straight from the calm Standing pose, so the legs stay
    // perfectly grounded and upright while he stretches. A light spine damp
    // keeps the torso from leaning back too far.
    const stretchUpper = fixMixamoClip(stretchingClips[0], "StretchUpper", {
      dampSpine: 0.5,
    });
    const armStretch = mergeLowerBody(stretchUpper, standing, "ArmStretching");
    return [standing, falling, typing, sitting, armStretch];
  }, [standingClips, fallingClips, typingClips, sittingClips, stretchingClips]);

  const { actions } = useAnimations(fixedClips, animRef);

  useEffect(() => {
    const next = actions[animation];
    if (!next) return;

    const prev = prevAnimRef.current;

    // Sitting: smoothly cross-fade from the previous clip (e.g. Falling) into the
    // looping sit idle so there's no lie-down snap between Projects → About.
    if (animation === "Sitting") {
      const prevAction = prev && prev !== animation ? actions[prev] : null;

      // Clear any stale clips that aren't part of the crossfade.
      Object.values(actions).forEach((a) => {
        if (!a || a === next || a === prevAction) return;
        a.fadeOut(0.2);
      });

      next.reset();
      next.setLoop(THREE.LoopRepeat);
      next.clampWhenFinished = false;
      next.setEffectiveTimeScale(1);
      next.enabled = true;
      next.play();

      if (prevAction) {
        // Falling was LoopOnce+clamp; let it play out while sitting fades in.
        prevAction.clampWhenFinished = true;
        prevAction.crossFadeTo(next, 0.5, false);
      } else {
        next.setEffectiveWeight(1);
        next.fadeIn(0.3);
      }
      prevAnimRef.current = animation;
      return;
    }

    if (prev && prev !== animation && actions[prev]) {
      actions[prev].fadeOut(0.35);
    }

    if (animation === "Falling") {
      next.setLoop(THREE.LoopOnce, 1);
      next.clampWhenFinished = true;
      next.setEffectiveTimeScale(1);
      next.reset().fadeIn(0.35).play();
    } else {
      next.setLoop(THREE.LoopRepeat);
      next.clampWhenFinished = false;
      next.setEffectiveTimeScale(1);
      next.reset().fadeIn(0.35).play();
    }

    prevAnimRef.current = animation;
  }, [animation, actions]);

  // Lean around hips so reclining into the beanbag doesn't fling the body.
  // Yaw (Y) is applied OUTSIDE pitch (X) so turning left/right doesn't sideways-tilt.
  const sitPivot = animation === "Sitting" ? 0.55 : 0;
  const sx = Array.isArray(scale) ? scale[0] : scale;
  const sy = Array.isArray(scale) ? scale[1] : scale;
  const sz = Array.isArray(scale) ? scale[2] : scale;
  const [rx = 0, ry = 0, rz = 0] = Array.isArray(rotation)
    ? rotation
    : [0, 0, 0];

  return (
    <group position={position}>
      {/* Yaw first — turn to face the camera / sofa opening */}
      <group rotation={[0, ry, 0]}>
        <group scale={[sx, sy, sz]}>
          {/* Pitch around hips — recline into the beanbag */}
          <group position={[0, sitPivot, 0]} rotation={[rx, 0, rz]}>
            <group position={[0, -sitPivot, 0]} ref={animRef} dispose={null}>
              <primitive object={nodes.Hips} />
              <skinnedMesh
                geometry={nodes.Wolf3D_Hair.geometry}
                material={materials.Wolf3D_Hair}
                skeleton={nodes.Wolf3D_Hair.skeleton}
              />
              <skinnedMesh
                geometry={nodes.Wolf3D_Glasses.geometry}
                material={materials.Wolf3D_Glasses}
                skeleton={nodes.Wolf3D_Glasses.skeleton}
              />
              <skinnedMesh
                geometry={nodes.Wolf3D_Body.geometry}
                material={materials.Wolf3D_Body}
                skeleton={nodes.Wolf3D_Body.skeleton}
              />
              <skinnedMesh
                geometry={nodes.Wolf3D_Outfit_Bottom.geometry}
                material={materials.Wolf3D_Outfit_Bottom}
                skeleton={nodes.Wolf3D_Outfit_Bottom.skeleton}
              />
              <skinnedMesh
                geometry={nodes.Wolf3D_Outfit_Footwear.geometry}
                material={materials.Wolf3D_Outfit_Footwear}
                skeleton={nodes.Wolf3D_Outfit_Footwear.skeleton}
              />
              <skinnedMesh
                geometry={nodes.Wolf3D_Outfit_Top.geometry}
                material={materials.Wolf3D_Outfit_Top}
                skeleton={nodes.Wolf3D_Outfit_Top.skeleton}
              />
              <skinnedMesh
                name="EyeLeft"
                geometry={nodes.EyeLeft.geometry}
                material={materials.Wolf3D_Eye}
                skeleton={nodes.EyeLeft.skeleton}
                morphTargetDictionary={nodes.EyeLeft.morphTargetDictionary}
                morphTargetInfluences={nodes.EyeLeft.morphTargetInfluences}
              />
              <skinnedMesh
                name="EyeRight"
                geometry={nodes.EyeRight.geometry}
                material={materials.Wolf3D_Eye}
                skeleton={nodes.EyeRight.skeleton}
                morphTargetDictionary={nodes.EyeRight.morphTargetDictionary}
                morphTargetInfluences={nodes.EyeRight.morphTargetInfluences}
              />
              <skinnedMesh
                name="Wolf3D_Head"
                geometry={nodes.Wolf3D_Head.geometry}
                material={materials.Wolf3D_Skin}
                skeleton={nodes.Wolf3D_Head.skeleton}
                morphTargetDictionary={nodes.Wolf3D_Head.morphTargetDictionary}
                morphTargetInfluences={nodes.Wolf3D_Head.morphTargetInfluences}
              />
              <skinnedMesh
                name="Wolf3D_Teeth"
                geometry={nodes.Wolf3D_Teeth.geometry}
                material={materials.Wolf3D_Teeth}
                skeleton={nodes.Wolf3D_Teeth.skeleton}
                morphTargetDictionary={nodes.Wolf3D_Teeth.morphTargetDictionary}
                morphTargetInfluences={nodes.Wolf3D_Teeth.morphTargetInfluences}
              />
            </group>
          </group>
        </group>
      </group>
    </group>
  );
}
