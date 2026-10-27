import { tryOnPose } from './tryOnPose.js';
import { inspectGlb, isGlbAsset } from '../../../shared/tryOnAsset.js';

export async function loadTryOnFrame(url, signal) {
  if (!isGlbAsset(url)) {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.src = url;
    await image.decode();
    return {
      source: image,
      aspect: image.naturalWidth / image.naturalHeight,
      render() {},
      dispose() {},
    };
  }
  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error('Unable to load the try-on model.');
  const buffer = await response.arrayBuffer();
  inspectGlb(buffer);
  const [THREE, { GLTFLoader }] = await Promise.all([
    import('three'),
    import('three/addons/loaders/GLTFLoader.js'),
  ]);
  const gltf = await new GLTFLoader().parseAsync(buffer, '');
  const model = gltf.scene;
  let renderer;
  let occluder;
  const dispose = () => {
    const textures = new Set();
    model.traverse((object) => {
      object.geometry?.dispose();
      for (const material of Array.isArray(object.material) ? object.material : [object.material]) {
        if (!material) continue;
        for (const value of Object.values(material)) if (value?.isTexture) textures.add(value);
        material.dispose();
      }
    });
    textures.forEach((texture) => texture.dispose());
    occluder?.geometry.dispose();
    occluder?.material.dispose();
    renderer?.dispose();
    renderer?.forceContextLoss();
  };
  try {
    if (signal.aborted) throw new DOMException('Cancelled', 'AbortError');
    const bounds = new THREE.Box3().setFromObject(model);
    const size = bounds.getSize(new THREE.Vector3());
    const center = bounds.getCenter(new THREE.Vector3());
    if (![size.x, size.y, size.z].every(Number.isFinite) || size.x <= 0 || size.y <= 0)
      throw new Error('The GLB has no visible frame geometry.');
    // Rotate around the bridge/front plane rather than the middle of the arms.
    model.position.sub(new THREE.Vector3(center.x, center.y, bounds.max.z));
    const group = new THREE.Group();
    group.add(model);
    // A depth-only head hides rear geometry without painting over the camera.
    // The front surface sits just behind the rim; side arms remain visible
    // outside the head silhouette as the wearer turns.
    occluder = new THREE.Mesh(
      new THREE.SphereGeometry(1, 48, 32),
      new THREE.MeshBasicMaterial({ colorWrite: false, depthWrite: true }),
    );
    occluder.scale.set(size.x * 0.46, size.x * 0.66, size.x * 0.48);
    occluder.position.set(0, -size.x * 0.18, -size.x * 0.51);
    occluder.renderOrder = -1;
    group.add(occluder);
    const frontClip = new THREE.Plane(new THREE.Vector3(0, 0, 1), size.x * 0.09);
    model.traverse((object) => {
      for (const material of Array.isArray(object.material) ? object.material : [object.material]) {
        if (material) material.clippingPlanes = [frontClip];
      }
    });
    const scene = new THREE.Scene();
    scene.add(group, new THREE.HemisphereLight(0xffffff, 0x888888, 3));
    const light = new THREE.DirectionalLight(0xffffff, 4);
    light.position.set(1, 2, 4);
    scene.add(light);
    // GLB convention: front faces +Z and up is +Y. Leave a small edge margin.
    const width = Math.max(size.x, size.y * 2) * 1.08;
    const distance = Math.max(size.x, size.y, size.z) * 4;
    const camera = new THREE.OrthographicCamera(
      -width / 2,
      width / 2,
      width / 4,
      -width / 4,
      distance / 100,
      distance * 10,
    );
    camera.position.z = distance;
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.localClippingEnabled = true;
    renderer.setClearColor(0, 0);
    renderer.setSize(1024, 512, false);
    const frame = {
      source: renderer.domElement,
      aspect: 2,
      depthAware: true,
      dispose,
      render(landmarks, videoAspect) {
        const pose = tryOnPose(landmarks, videoAspect);
        group.rotation.set(pose.pitch, pose.yaw, 0, 'YXZ');
        group.updateMatrixWorld(true);
        // Front view must never show folded/rear temples through the lenses.
        // Relax the cut as the head turns; the head depth mask then hides the
        // far arm and the portion of the near arm behind the cheek.
        const turn = Math.abs(pose.yaw);
        frontClip.set(new THREE.Vector3(0, 0, 1), size.x * (0.09 + Math.max(0, turn - 0.12) * 3));
        frontClip.applyMatrix4(group.matrixWorld);
        renderer.render(scene, camera);
      },
    };
    frame.render();
    return frame;
  } catch (error) {
    dispose();
    throw error;
  }
}
