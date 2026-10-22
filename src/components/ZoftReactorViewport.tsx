import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { ZoftCircuitConfig } from '../utils/zoftProtocolLogic';

interface ZoftReactorViewportProps {
  config: ZoftCircuitConfig;
  simulationPulseCount: number;
  compactMode?: boolean;
  onSelectCoreComponent?: (part: 'core_chamber' | 'lzread_dvn' | 'output_settlement') => void;
}

function createRadialContactShadowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;
  const grad = ctx.createRadialGradient(64, 64, 4, 64, 64, 60);
  grad.addColorStop(0, 'rgba(0,0,0,0.85)');
  grad.addColorStop(0.55, 'rgba(0,0,0,0.35)');
  grad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 128, 128);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function createBrushedCarbonBumpTexture(renderer: THREE.WebGLRenderer): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, size, size);

  let s = 4096;
  const rand = () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };

  for (let i = 0; i < 600; i++) {
    const x = rand() * size;
    const y = rand() * size;
    const v = Math.floor(95 + rand() * 70);
    ctx.fillStyle = `rgba(${v},${v},${v},0.45)`;
    ctx.fillRect(x, y, 22 + rand() * 35, 1.5);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(3, 3);
  tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
  return tex;
}

const _pointerNdc = new THREE.Vector2();

export const ZoftReactorViewport: React.FC<ZoftReactorViewportProps> = ({
  config,
  simulationPulseCount,
  compactMode = false,
  onSelectCoreComponent,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const configRef = useRef<ZoftCircuitConfig>(config);
  configRef.current = config;

  const onSelectRef = useRef(onSelectCoreComponent);
  onSelectRef.current = onSelectCoreComponent;

  const pulseProgressRef = useRef<number>(0);

  useEffect(() => {
    if (simulationPulseCount > 0) {
      pulseProgressRef.current = 1.0;
    }
  }, [simulationPulseCount]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Software WebGL Guard
    const isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: true,
      preserveDrawingBuffer: true,
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth || 420, container.clientHeight || 300);
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x090a0d);
    scene.fog = new THREE.FogExp2(0x090a0d, 0.045);

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const envTexture = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTexture;
    pmremGenerator.dispose();

    const camera = new THREE.PerspectiveCamera(
      36,
      (container.clientWidth || 420) / (container.clientHeight || 300),
      0.1,
      60
    );
    camera.position.set(compactMode ? 4.4 : 5.2, compactMode ? 3.5 : 3.9, compactMode ? 4.8 : 5.6);
    camera.lookAt(0, 0.25, 0);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 0.25, 0);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.06;
    controls.enableZoom = !compactMode;
    controls.minDistance = 3.2;
    controls.maxDistance = 10.5;
    controls.maxPolarAngle = Math.PI * 0.48;
    controls.minPolarAngle = 0.25;
    controls.update();

    // 3-Point Studio Lighting Rig (Warm Stark White Key + Cool Graphite Hemisphere Fill)
    const keyLight = new THREE.DirectionalLight(0xfffbeb, 2.4);
    keyLight.position.set(5, 8, 5);
    keyLight.castShadow = !isSoftwareGl;
    keyLight.shadow.mapSize.set(1024, 1024);
    const d = 3.8;
    keyLight.shadow.camera.left = -d;
    keyLight.shadow.camera.right = d;
    keyLight.shadow.camera.top = d;
    keyLight.shadow.camera.bottom = -d;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
    scene.add(keyLight);

    const hemiLight = new THREE.HemisphereLight(0x94a3b8, 0x090a0d, 0.85);
    scene.add(hemiLight);

    const rimLight = new THREE.DirectionalLight(0xffffff, 1.35);
    rimLight.position.set(-5, 4, -5);
    scene.add(rimLight);

    const corePointLight = new THREE.PointLight(0xffffff, 1.8, 6, 1.6);
    corePointLight.position.set(0, 0.55, 0);
    scene.add(corePointLight);

    // Procedural Textures
    const shadowTex = createRadialContactShadowTexture();
    const carbonBump = createBrushedCarbonBumpTexture(renderer);

    // Shared PBR Materials (LayerZero Monochrome Palette: Obsidian, Gunmetal, Stark White, Emerald PoA)
    const obsidianHullMat = new THREE.MeshPhysicalMaterial({
      color: 0x14161c,
      metalness: 0.88,
      roughness: 0.24,
      anisotropy: 0.8,
      bumpMap: carbonBump,
      bumpScale: 0.015,
      clearcoat: 0.65,
    });

    const matteGraphiteMat = new THREE.MeshStandardMaterial({
      color: 0x22252e,
      metalness: 0.45,
      roughness: 0.62, // >= 0.25 roughness delta from obsidianHullMat
      bumpMap: carbonBump,
      bumpScale: 0.02,
    });

    const starkWhiteEmissiveMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: new THREE.Color(0xffffff),
      emissiveIntensity: 0.9,
      roughness: 0.15,
      metalness: 0.1,
    });

    const changeSilverMat = new THREE.MeshPhysicalMaterial({
      color: 0x71717a,
      emissive: new THREE.Color(0x3f3f46),
      emissiveIntensity: 0.35,
      roughness: 0.32,
      metalness: 0.65,
      clearcoat: 0.5,
    });

    const aspHaloMat = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      emissive: new THREE.Color(0x10b981),
      emissiveIntensity: 0.85,
      roughness: 0.2,
    });

    const lzReadRingMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: new THREE.Color(0xffffff),
      emissiveIntensity: 0.8,
      roughness: 0.2,
      metalness: 0.8,
    });

    const smokedGlassMat = new THREE.MeshPhysicalMaterial({
      color: 0xd4d4d8,
      metalness: 0.05,
      roughness: 0.08,
      transmission: isSoftwareGl ? 0 : 0.88,
      transparent: true,
      opacity: isSoftwareGl ? 0.26 : 1.0,
      ior: 1.52,
      thickness: 0.4,
      clearcoat: 1.0,
      depthWrite: false,
      side: THREE.DoubleSide,
    });

    // =========================================================================
    // COMPOSITE 10-PART 3D NOIR ZK JOIN-SPLIT CHAMBER & LAYERZERO V2 REACTOR
    // =========================================================================
    const reactorGroup = new THREE.Group();
    scene.add(reactorGroup);
    const interactables: THREE.Object3D[] = [];

    // Ground Contact Shadow Disc
    const shadowGeo = new THREE.CircleGeometry(2.8, 32);
    shadowGeo.rotateX(-Math.PI / 2);
    const shadowMesh = new THREE.Mesh(
      shadowGeo,
      new THREE.MeshBasicMaterial({
        map: shadowTex,
        transparent: true,
        opacity: 0.65,
        depthWrite: false,
      })
    );
    shadowMesh.position.y = -0.68;
    reactorGroup.add(shadowMesh);

    // Part 1: U-Shaped Architectural Basin (Hookr-inspired basin silhouette in Anodized Obsidian)
    const uShape = new THREE.Shape();
    uShape.moveTo(-1.55, -0.45);
    uShape.lineTo(1.55, -0.45);
    uShape.lineTo(1.55, 0.55);
    uShape.lineTo(1.18, 0.55);
    uShape.lineTo(1.18, -0.12);
    uShape.lineTo(-1.18, -0.12);
    uShape.lineTo(-1.18, 0.55);
    uShape.lineTo(-1.55, 0.55);
    uShape.closePath();

    const basinGeo = new THREE.ExtrudeGeometry(uShape, {
      depth: 1.75,
      bevelEnabled: true,
      bevelThickness: 0.06,
      bevelSize: 0.05,
      bevelSegments: 3,
    });
    basinGeo.center();
    const basinMesh = new THREE.Mesh(basinGeo, obsidianHullMat);
    basinMesh.position.set(0, -0.1, 0);
    basinMesh.castShadow = !isSoftwareGl;
    basinMesh.receiveShadow = true;
    basinMesh.userData.part = 'core_chamber';
    reactorGroup.add(basinMesh);
    interactables.push(basinMesh);

    // Part 2: Sub-Plinth Octagonal Pedestal Base
    const plinthGeo = new THREE.CylinderGeometry(1.85, 2.05, 0.24, 8);
    const plinthMesh = new THREE.Mesh(plinthGeo, matteGraphiteMat);
    plinthMesh.position.y = -0.55;
    plinthMesh.receiveShadow = true;
    reactorGroup.add(plinthMesh);

    // Part 3: 0xbow ASP Compliance Perimeter Halo Ring
    const aspRingGeo = new THREE.TorusGeometry(1.68, 0.028, 12, 48);
    aspRingGeo.rotateX(Math.PI / 2);
    const aspRingMesh = new THREE.Mesh(aspRingGeo, aspHaloMat);
    aspRingMesh.position.y = -0.41;
    reactorGroup.add(aspRingMesh);

    // Part 4 & 5: Dynamic Split Liquidity Bars inside the U-Basin
    // Left/Primary Bar = Cross-Chain Withdrawal Intent (Stark White)
    // Right/Secondary Bar = Shielded Change Note (Anodized Silver/Charcoal)
    const unitBoxGeo = new THREE.BoxGeometry(1, 0.44, 1.15);
    const withdrawSplitBar = new THREE.Mesh(unitBoxGeo, starkWhiteEmissiveMat);
    withdrawSplitBar.position.set(-0.35, 0.14, 0);
    withdrawSplitBar.castShadow = !isSoftwareGl;
    withdrawSplitBar.userData.part = 'output_settlement';
    reactorGroup.add(withdrawSplitBar);
    interactables.push(withdrawSplitBar);

    const changeSplitBar = new THREE.Mesh(unitBoxGeo, changeSilverMat);
    changeSplitBar.position.set(0.55, 0.12, 0);
    changeSplitBar.castShadow = !isSoftwareGl;
    changeSplitBar.userData.part = 'core_chamber';
    reactorGroup.add(changeSplitBar);
    interactables.push(changeSplitBar);

    // Part 6: Central Noir ZK-SNARK Octahedral Proof Crystal
    const zkCrystalGroup = new THREE.Group();
    zkCrystalGroup.position.set(0, 0.88, 0);
    const innerCoreMesh = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.32, 0),
      starkWhiteEmissiveMat
    );
    const outerGlassShell = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.46, 0),
      smokedGlassMat
    );
    outerGlassShell.renderOrder = 8;
    zkCrystalGroup.add(innerCoreMesh, outerGlassShell);
    innerCoreMesh.userData.part = 'core_chamber';
    interactables.push(innerCoreMesh);
    reactorGroup.add(zkCrystalGroup);

    // Part 7: LayerZero V2 `lzRead` & ZK-DVN Orbital Gyroscope Rings
    const dvnRingOuter = new THREE.Mesh(
      new THREE.TorusGeometry(0.68, 0.022, 12, 48),
      lzReadRingMat
    );
    dvnRingOuter.position.set(0, 0.88, 0);
    dvnRingOuter.userData.part = 'lzread_dvn';
    interactables.push(dvnRingOuter);
    reactorGroup.add(dvnRingOuter);

    const dvnRingInner = new THREE.Mesh(
      new THREE.TorusGeometry(0.54, 0.018, 10, 40),
      obsidianHullMat
    );
    dvnRingInner.position.set(0, 0.88, 0);
    reactorGroup.add(dvnRingInner);

    // Part 8: 3 Input UTXO Note Prisms hovering on the Left Port
    const noteMeshes: THREE.Mesh[] = [];
    const noteGeo = new THREE.BoxGeometry(0.26, 0.16, 0.36);
    for (let i = 0; i < 3; i++) {
      const m = new THREE.Mesh(noteGeo, starkWhiteEmissiveMat);
      m.position.set(-1.95, 0.35 + (i - 1) * 0.28, (i - 1) * 0.35);
      reactorGroup.add(m);
      noteMeshes.push(m);
    }

    // Part 9: LayerZero V2 `lzRead` Vertical State-Pull Beam
    const beamGeo = new THREE.CylinderGeometry(0.035, 0.035, 1.65, 12);
    const beamMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.35,
    });
    const lzReadBeam = new THREE.Mesh(beamGeo, beamMat);
    lzReadBeam.position.set(1.85, 0.65, 0);
    reactorGroup.add(lzReadBeam);

    // Part 10: Instanced Cryptographic Merkle Field & Solver Settlement Nodes (32 instances)
    const nodeCount = 32;
    const nodeGeo = new THREE.BoxGeometry(0.08, 0.08, 0.08);
    const nodeInstMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.3,
      metalness: 0.5,
    });
    const instancedNodes = new THREE.InstancedMesh(nodeGeo, nodeInstMat, nodeCount);
    const dummy = new THREE.Object3D();
    const nodeColor = new THREE.Color();

    for (let i = 0; i < nodeCount; i++) {
      const angle = (i / nodeCount) * Math.PI * 2;
      const radius = 2.15 + (i % 3) * 0.22;
      dummy.position.set(
        Math.cos(angle) * radius,
        -0.48 + (i % 4) * 0.08,
        Math.sin(angle) * radius
      );
      dummy.rotation.set(i * 0.3, angle, 0);
      dummy.scale.setScalar(0.75 + (i % 3) * 0.2);
      dummy.updateMatrix();
      instancedNodes.setMatrixAt(i, dummy.matrix);

      const shade = i % 4 === 0 ? 0.95 : 0.38;
      nodeColor.setRGB(shade, shade, shade * 1.04);
      instancedNodes.setColorAt(i, nodeColor);
    }
    instancedNodes.instanceMatrix.needsUpdate = true;
    if (instancedNodes.instanceColor) instancedNodes.instanceColor.needsUpdate = true;
    instancedNodes.computeBoundingSphere();
    reactorGroup.add(instancedNodes);

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    // Raycasting for clicking 3D reactor components
    const raycaster = new THREE.Raycaster();
    let downX = 0;
    let downY = 0;
    const onPointerDown = (e: PointerEvent) => {
      downX = e.clientX;
      downY = e.clientY;
    };
    const onPointerUp = (e: PointerEvent) => {
      if (Math.hypot(e.clientX - downX, e.clientY - downY) > 6) return;
      const rect = renderer.domElement.getBoundingClientRect();
      _pointerNdc.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      _pointerNdc.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(_pointerNdc, camera);
      const hits = raycaster.intersectObjects(interactables, false);
      if (hits.length > 0 && hits[0].object.userData.part) {
        onSelectRef.current?.(hits[0].object.userData.part);
      }
    };
    renderer.domElement.addEventListener('pointerdown', onPointerDown);
    renderer.domElement.addEventListener('pointerup', onPointerUp);

    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth || 420;
      const h = container.clientHeight || 300;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    // Animation & Software-WebGL Paced Render Loop
    let frameId = 0;
    let isDisposed = false;
    const clock = new THREE.Clock();

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      if (!gl || typeof gl.fenceSync !== 'function') {
        frameId = window.setTimeout(cb, 80);
        return;
      }
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        if (isDisposed) return;
        const status = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (status === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    function tick() {
      if (isDisposed) return;
      const dt = Math.min(clock.getDelta(), 0.1);
      const elapsed = clock.getElapsedTime();
      const cfg = configRef.current;
      const damp = 1 - Math.exp(-7 * dt);

      // 1. Dynamically scale the Join-Split bars inside the U-Basin according to withdrawalSplitPercent
      const totalWidth = 2.18;
      const gap = 0.08;
      const splitRatio = THREE.MathUtils.clamp(cfg.withdrawalSplitPercent / 100, 0.1, 1.0);
      const wWidth = Math.max(0.18, (totalWidth - gap) * splitRatio);
      const cWidth = Math.max(0.02, (totalWidth - gap) * (1 - splitRatio));

      withdrawSplitBar.scale.x = THREE.MathUtils.lerp(withdrawSplitBar.scale.x, wWidth, damp);
      withdrawSplitBar.position.x = THREE.MathUtils.lerp(
        withdrawSplitBar.position.x,
        -totalWidth / 2 + wWidth / 2,
        damp
      );

      if (splitRatio >= 0.99) {
        changeSplitBar.visible = false;
      } else {
        changeSplitBar.visible = true;
        changeSplitBar.scale.x = THREE.MathUtils.lerp(changeSplitBar.scale.x, cWidth, damp);
        changeSplitBar.position.x = THREE.MathUtils.lerp(
          changeSplitBar.position.x,
          totalWidth / 2 - cWidth / 2,
          damp
        );
      }

      // 2. Update 3 Input UTXO Note Prisms visibility & hover animation
      for (let i = 0; i < noteMeshes.length; i++) {
        const noteData = cfg.notes[i];
        const mesh = noteMeshes[i];
        const isSelected = noteData ? noteData.selected : false;
        mesh.visible = isSelected;
        if (isSelected) {
          mesh.position.y = 0.35 + (i - 1) * 0.28 + Math.sin(elapsed * 2.5 + i) * 0.04;
          mesh.rotation.y = elapsed * 0.7 + i;
        }
      }

      // 3. 0xbow ASP Compliance Halo Color (Emerald when enabled, Crimson when disabled)
      const targetAspHex = cfg.aspComplianceEnabled ? 0x10b981 : 0xef4444;
      aspHaloMat.color.setHex(targetAspHex);
      aspHaloMat.emissive.setHex(targetAspHex);

      // 4. LayerZero V2 `lzRead` Gyroscope & Beam State
      const dvnSpeed = cfg.lzReadEnabled ? 1.4 : 0.25;
      dvnRingOuter.rotation.x = elapsed * dvnSpeed;
      dvnRingOuter.rotation.y = elapsed * dvnSpeed * 0.7;
      dvnRingInner.rotation.z = -elapsed * dvnSpeed * 1.1;

      lzReadRingMat.color.setHex(cfg.lzReadEnabled ? 0xffffff : 0xf59e0b);
      lzReadRingMat.emissive.setHex(cfg.lzReadEnabled ? 0xffffff : 0xf59e0b);
      lzReadBeam.visible = cfg.lzReadEnabled;

      // 5. Simulation Pulse ("Play the Proof & Settlement")
      if (pulseProgressRef.current > 0) {
        pulseProgressRef.current = Math.max(0, pulseProgressRef.current - dt * 0.65);
      }
      const pulseBoost = Math.sin(pulseProgressRef.current * Math.PI) * 1.8;

      zkCrystalGroup.rotation.y = elapsed * (0.9 + pulseBoost * 2.5);
      zkCrystalGroup.position.y = 0.88 + Math.sin(elapsed * 2.2) * 0.05;
      starkWhiteEmissiveMat.emissiveIntensity = 0.85 + pulseBoost * 1.2;
      beamMat.opacity = 0.25 + (cfg.lzReadEnabled ? 0.2 : 0) + pulseBoost * 0.5;

      instancedNodes.rotation.y = elapsed * 0.12;

      controls.update();
      renderer.render(scene, camera);

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    }

    tick();

    return () => {
      isDisposed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      renderer.domElement.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('resize', onResize);
      controls.dispose();
      envTexture.dispose();
      shadowTex.dispose();
      carbonBump.dispose();
      renderer.dispose();
    };
  }, [compactMode]);

  return (
    <div
      ref={mountRef}
      data-testid="zoft-reactor-canvas"
      className="w-full h-full relative overflow-hidden cursor-grab active:cursor-grabbing select-none"
      aria-label="Interactive 3D Noir ZK Join-Split & LayerZero V2 Reactor"
    />
  );
};
