<template>
    <canvas class="overlay" id="particles"></canvas>
    <div id="speed" class="overlay"></div>
    <div id="vignette" class="overlay"></div>
    <canvas id="canvas"></canvas>
    <div class="overlay-info">
        <h1>
            {{ state.lapCount }}
        </h1>
    </div>
</template>

<script setup lang="ts">
import { onMounted, reactive } from "vue";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { settings } from "./settings";
import { createSky } from "./utils/sky";
import { createSun } from "./utils/sun";
import { Lensflare, LensflareElement } from "./Lensflare.js";
import { initParticles, renderParticles } from "./utils/particles";
import { initLighting } from "./utils/lighting";
import { TrackBody } from "./modules/TrackBody";

import { SavePass } from "three/examples/jsm/postprocessing/SavePass";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass";
import { GlitchPass } from "three/addons/postprocessing/GlitchPass.js";
import { BlendShader } from "three/examples/jsm/shaders/BlendShader";
import { createTrack, parseTrack } from "./track.ts";
import { createPlayer } from "./utils/player";
import { createTrackBody } from "./utils/trackBody";
import { Track } from "./types/track";
import { createCheckPoints } from "./utils/checkpoints";

import track from "./lowTrick";

const state = reactive({
    lapCount: 0,
});

onMounted(() => {
    const race = new RollesiaRace(settings);
});

type RaceSettings = any;

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

class RollesiaRace {
    private canvas: HTMLCanvasElement;
    private camera: THREE.PerspectiveCamera;
    private scene: THREE.Scene;
    private renderer;
    private controls;
    private sun!: THREE.Mesh;
    private sky!: THREE.Mesh;
    private composer!: EffectComposer;
    private settings;
    private player;
    private trackBody: TrackBody;
    private track: Track;
    private cameraGroup: THREE.Group;
    private checkPoints: THREE.Mesh[];
    private isRunning = true;

    constructor(settings: RaceSettings) {
        this.settings = settings;

        this.canvas = document.getElementById("canvas")! as HTMLCanvasElement;

        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true,
        });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);

        if (settings.shadows) {
            this.renderer.shadowMap.enabled = true;
            this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        }

        this.scene = new THREE.Scene();

        this.track = parseTrack(track);

        this.player = createPlayer(this.camera);
        this.scene.add(this.player);

        this.initCamera();
        this.initLighting();
        this.initSun();
        this.initSky();
        this.initLensFlare();
        this.initPostProcessing();
        this.initTrack();
        this.initCheckPoints();

        this.trackBody = new TrackBody(this.track);

        // const particlesCanvas = document.getElementById(
        //     "particles"
        // ) as HTMLCanvasElement;
        // initParticles(particlesCanvas);

        const startingPointPosition = track.segments[0].vertices[0];

        this.player.position.x = startingPointPosition[0] * 8;
        this.player.position.y = startingPointPosition[1] * 8;
        this.player.position.z = startingPointPosition[2] * 8;

        this.startScene();
    }

    private initCheckPoints() {
        const checkPoints = createCheckPoints(this.track);

        for (const checkPoint of checkPoints) {
            this.scene.add(checkPoint);
        }
    }

    private initCamera() {
        this.camera = new THREE.PerspectiveCamera(
            settings.cameraFov,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.set(-2, 1.2, 0);
        this.camera.rotation.x = -Math.PI / 2;
        this.camera.rotation.y = -Math.PI / 2.25;
        this.camera.rotation.z = -Math.PI / 2;

        // this.camera.position.set(-2.5, 1.4, 0);
        // this.camera.rotation.y = -Math.PI / 2.1;

        this.scene.add(this.camera);

        this.cameraGroup = new THREE.Group();
        this.cameraGroup.add(this.camera);

        this.scene.add(this.cameraGroup);
    }

    private initLighting() {
        const hemisphereLight = new THREE.HemisphereLight(
            0x708090,
            0x506070,
            1
        );
        this.scene.add(hemisphereLight);
        const light = new THREE.PointLight(0xddeeff, 0.15);
        light.position.set(-250, 400, -200);
        this.scene.add(light);

        for (let i = 0; i < this.settings.lightCount; i++) {
            const light = new THREE.PointLight(
                0xffffff,
                0.35 / this.settings.lightCount
            );
            const xRandom = Math.random() * this.settings.lightRadius;
            const yRandom = Math.random() * this.settings.lightRadius;
            const zRandom = Math.random() * this.settings.lightRadius;
            light.position.set(100 + xRandom, 220 + yRandom, 200 + zRandom);
            light.shadow.radius = this.settings.lightRadius;
            light.castShadow = true;
            light.shadow.mapSize.width = this.settings.shadowMapRes;
            light.shadow.mapSize.height = this.settings.shadowMapRes;
            // light.shadow.bias = -0.005;
            this.scene.add(light);
        }
    }

    private initSun() {
        this.sun = createSun(track.theme);
        this.sun.position.set(120, 260, 220);
        this.sun.scale.x = 500;
        this.sun.scale.y = 500;
        this.scene.add(this.sun);
    }

    private initSky() {
        this.sky = createSky(track.theme);
        this.sky.scale.x = 600;
        this.sky.scale.y = 600;
        this.sky.scale.z = 600;
        this.scene.add(this.sky);
    }

    private initPostProcessing() {
        const renderScene = new RenderPass(this.scene, this.camera);

        this.composer = new EffectComposer(this.renderer);
        this.composer.addPass(renderScene);

        // const glitchPass = new GlitchPass(8);
        // this.composer.addPass(glitchPass);

        if (!settings.bloom) return;
        const bloomPass = new UnrealBloomPass(
            new THREE.Vector2(window.innerWidth, window.innerHeight),
            0.075,
            1.25,
            0.6
        );
        this.composer.addPass(bloomPass);
        const bloomPass2 = new UnrealBloomPass(
            new THREE.Vector2(window.innerWidth, window.innerHeight),
            0.175,
            1.25,
            0.85
        );
        this.composer.addPass(bloomPass2);
        if (track.theme.sky === "night") {
            const bloomPass3 = new UnrealBloomPass(
                new THREE.Vector2(window.innerWidth, window.innerHeight),
                0.5,
                1,
                0.98
            );
            this.composer.addPass(bloomPass3);
        }
    }

    private initLensFlare() {
        const light = new THREE.PointLight(0x000000, 0);
        light.position.set(80, 150, 180);

        const textureLoader = new THREE.TextureLoader();
        const textureFlare = textureLoader.load("/assets/images/lens.png");
        const lensflare = new Lensflare(
            parseFloat(track.theme.lensFlareOpacity)
        );
        lensflare.addElement(new LensflareElement(textureFlare, 75, 0.2));
        lensflare.addElement(new LensflareElement(textureFlare, 256, 0.5));
        lensflare.addElement(new LensflareElement(textureFlare, 512, 0.7));
        lensflare.addElement(new LensflareElement(textureFlare, 100, 1));
        light.add(lensflare);
        this.scene.add(light);
    }

    public async startScene() {
        this.animate();
        // this.renderer.shadowMap.autoUpdate = false;

        document.addEventListener(
            "visibilitychange",
            () => {
                this.isRunning = true;
            },
            false
        );
    }

    private animate() {
        requestAnimationFrame(() => this.animate.call(this));
        if (this.isRunning) {
            this.updatePlayer();
            this.updateCamera();
            // renderParticles(this.player.userData.speed * 0.1);
            this.render();
        }
    }

    private lerp(a: number, b: number, index: number) {
        return a * (1 - index) + b * index;
    }

    private updatePlayer() {
        const data = this.player.userData;
        const playerPivot = this.player.children[0];
        const playerMesh = playerPivot.children[0];
        const playerWheel = playerMesh.children[0];

        const lastUpdate = data.lastUpdate;
        const currentUpdate = Date.now();
        data.lastUpdate = currentUpdate;

        const deltaT = Math.floor((currentUpdate - lastUpdate) / 2);
        const deltaTMaxed = Math.min(deltaT, 10000);
        for (let i = 0; i < deltaTMaxed; i++) {
            const inAirSpeedIndex = data.isInAir ? 0.8 : 1;
            if (data.forward) {
                let maxSpeed = 0.85;
                if (data.left || data.right) {
                    let maxSpeedBoost = Math.min(
                        0.15,
                        8 * Math.abs(data.rotationSpeed)
                    );
                    maxSpeedBoost *= data.drift && !data.isInAir ? 2 : 1;
                    maxSpeed += maxSpeedBoost;
                    maxSpeed *= inAirSpeedIndex;
                }
                data.speed = this.lerp(data.speed, maxSpeed, 0.002);
            } else if (data.backward) {
                data.speed = this.lerp(data.speed, -0.5, 0.002);
            } else {
                const slowDownSpeed = data.isInAir ? 0.0005 : 0.001;
                data.speed = this.lerp(data.speed, 0, slowDownSpeed);
            }

            const inAirRotationIndex = data.isInAir ? 0.6 : 1;
            const isDriftingRotationINdex = data.drift ? 0.5 : 1;
            const maxRotationSpeed = (isDriftingRotationINdex * Math.PI) / 40;
            if (data.left && !data.right) {
                data.rotationSpeed = this.lerp(
                    data.rotationSpeed,
                    maxRotationSpeed,
                    0.004 * inAirRotationIndex
                );
                if (data.drift) {
                    data.driftAngle = this.lerp(
                        data.driftAngle,
                        -data.rotationSpeed * 20,
                        0.01
                    );
                }
            } else if (data.right && !data.left) {
                data.rotationSpeed = this.lerp(
                    data.rotationSpeed,
                    -maxRotationSpeed,
                    0.004 * inAirRotationIndex
                );
                if (data.drift) {
                    data.driftAngle = this.lerp(
                        data.driftAngle,
                        -data.rotationSpeed * 20,
                        0.01
                    );
                }
            } else {
                data.rotationSpeed = this.lerp(data.rotationSpeed, 0, 0.01);
            }
            if (!data.drift) {
                data.driftAngle = this.lerp(data.driftAngle, 0, 0.01);
            }

            const xLambda = 0.1 * data.speed * Math.cos(-data.direction);
            const zLambda = 0.1 * data.speed * Math.sin(-data.direction);

            const rotLambda =
                0.1 *
                (Math.sign(data.speed + 0.05) * 0.45 + data.speed / 3.5) *
                data.rotationSpeed;

            data.direction += rotLambda;
            this.player.position.x += xLambda;
            this.player.position.z += zLambda;
            this.player.rotation.y = data.direction;
            playerMesh.rotation.y = -data.driftAngle;

            const intersection = this.trackBody.isIntersecting(
                this.player.position.x,
                this.player.position.z
            );

            let currentLevel = -50;
            if (intersection) {
                for (const level of intersection) {
                    const yPos = this.player.position.y;
                    const deltaY = level[0] - yPos;

                    const deltaRY = data.direction - level[1];

                    if (deltaY > 4) continue;
                    if (deltaY > 1) {
                        this.player.position.x -= xLambda;
                        this.player.position.z -= zLambda;

                        continue;
                    }
                    currentLevel = level[0];

                    break;
                }
            }
            let deltaY = currentLevel - this.player.position.y;

            let newDeltaY = 0;

            if (currentLevel === -50) {
                data.gravitySpeed -= 0.0001;
                newDeltaY = data.gravitySpeed;
                data.isInAir = true;
            } else if (deltaY > 0) {
                data.gravitySpeed = deltaY * 0.2;
                data.gravitySpeed = Math.min(data.gravitySpeed, 0.02);
                newDeltaY = Math.max(data.gravitySpeed, deltaY);
                data.isInAir = false;
                data.speed = this.lerp(data.speed, 0.25, newDeltaY / 80);
            } else if (deltaY >= -0.05 && deltaY <= 0) {
                // data.gravitySpeed = 0;
                newDeltaY = data.gravitySpeed;
                data.isInAir = false;
            } else if (deltaY < -0.05) {
                data.gravitySpeed -= 0.0001;
                if (data.gravitySpeed > 0) {
                    newDeltaY = data.gravitySpeed;
                } else {
                    newDeltaY = Math.max(data.gravitySpeed, deltaY * 1.2);
                }
                data.isInAir = true;
            }

            this.player.position.y += newDeltaY;
        }

        this.camera.fov = 75 + data.speed * 40;

        this.camera.fov = this.lerp(
            this.camera.fov,
            this.camera.fov + 10 * data.isInAir,
            0.05
        );

        this.camera.rotation.x = this.lerp(
            this.camera.rotation.x,
            data.speed * -data.rotationSpeed * 12 - Math.PI / 2,
            0.016
        );

        playerPivot.rotation.x = this.lerp(
            playerPivot.rotation.x,
            -data.rotationSpeed * 10 * data.speed,
            0.1
        );

        if (data.isInAir) {
            data.wheelSpeed = this.lerp(data.wheelSpeed, 0, 0.01);
        } else {
            data.wheelSpeed = this.lerp(data.wheelSpeed, data.speed * 0.06, 1);
        }

        playerWheel.material.map.offset.y =
            (playerWheel.material.map.offset.y + data.wheelSpeed) % 1;
    }

    private updateCamera() {
        this.cameraGroup.position.x = this.player.position.x;
        this.cameraGroup.position.y = this.player.position.y;
        this.cameraGroup.position.z = this.player.position.z;

        this.cameraGroup.rotation.y = this.lerp(
            this.cameraGroup.rotation.y,
            this.player.rotation.y,
            1
        );
    }

    private render() {
        this.sun.lookAt(this.camera.position);

        this.camera.updateProjectionMatrix();

        // this.controls.update();
        this.composer.render();
    }

    private initTrack() {
        const trackMeshes = createTrack(this.track);

        for (const mesh in trackMeshes) {
            trackMeshes[mesh].castShadow = true;
            trackMeshes[mesh].receiveShadow = true;
            this.scene.add(trackMeshes[mesh]);
        }
    }

    private onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
}
</script>

<style lang="scss">
.overlay-info {
    position: absolute;
    top: 0;
    left: 0;
    margin: 2rem;
}

body {
    margin: 0;
    background-color: #000;
    color: #fff;
    font-family: Monospace;
    font-size: 13px;
    line-height: 24px;
    overscroll-behavior: none;
    overflow: hidden;
    filter: saturate(1.1);
}

.overlay {
    pointer-events: none;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100vh;
    background-size: cover;
    background-position: center;
}

#particles {
    mix-blend-mode: overlay;
}

#vignette {
    background-image: url("../public/assets/images/overlays/vignette.png");
    mix-blend-mode: multiply;
}

#speed {
    mix-blend-mode: overlay;
    // background-image: url("/assets/images/overlays/speed.png");
}
</style>
