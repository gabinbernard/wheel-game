import * as THREE from "three";
import * as BufferGeometryUtils from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { hexToRgb } from "./colors";

// import { extendMaterial, CustomMaterial } from "./extendMaterial";

// function createPlayerMaterial() {
//     const material = extendMaterial(THREE.MeshStandardMaterial, {
//         class: CustomMaterial, // In this case ShaderMaterial would be fine too, just for some features such as envMap this is required

//         vertexHeader: "uniform float offsetScale;",
//         vertex: {
//             transformEnd: "transformed += normal * offsetScale;",
//         },

//         uniforms: {
//             roughness: 0.75,
//             offsetScale: {
//                 mixed: true, // Uniform will be passed to a derivative material (MeshDepthMaterial below)
//                 linked: true, // Similar as shared, but only for derivative materials, so wavingMaterial will have it's own, but share with it's shadow material
//                 value: Math.random(),
//             },
//         },
//     });

//     return material;
// }

type WheelScheme = {
    colors: string;
    pattern: string;
};

function createPlayerWheelUV() {
    const xVerticesCount = 24;
    const yVerticesCount = 24;

    const uv: number[] = [];

    for (let x = 0; x < xVerticesCount; x++) {
        for (let y = 0; y <= yVerticesCount; y++) {
            uv.push(y / yVerticesCount, x / xVerticesCount);
        }
    }

    const finalUV = new Float32Array(uv);
    return finalUV;
}

const pattenrs = {
    classic: [50, 50],
};

function createPlayerWheelTexture(scheme: WheelScheme) {
    const textureWidth = 256;
    const textureHeight = 1024;

    const buffer = new Uint8ClampedArray(textureWidth * textureHeight * 4);

    for (let y = 0; y < textureHeight; y++) {
        for (let x = 0; x < textureWidth; x++) {
            const pos = (y * textureWidth + x) * 4;

            let color = hexToRgb(0x505060);

            const index = y + Math.abs(x - textureWidth / 2) / 4;

            const isSecondary = Math.floor(index / 128) % 2 === 0;

            if (isSecondary) {
                color = hexToRgb(0x303040);
            }

            buffer[pos] = color.r;
            buffer[pos + 1] = color.g;
            buffer[pos + 2] = color.b;
            buffer[pos + 3] = 255;
        }
    }

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = textureWidth;
    canvas.height = textureHeight;

    const imageData = ctx!.createImageData(textureWidth, textureHeight);
    imageData.data.set(buffer);
    ctx!.putImageData(imageData, 0, 0);

    const texture = canvas.toDataURL();
    return texture;
}

function createPlayerWheelGeometry(roundness: number) {
    const vertices: number[] = [];

    const xVerticesCount = 24;
    const yVerticesCount = 24;

    for (let x = 0; x < xVerticesCount; x++) {
        for (let y = 0; y < yVerticesCount; y++) {
            const aR = 1 - Math.abs(Math.pow((y - 12) / 12, roundness)) / 5;
            const bR = 1 - Math.abs(Math.pow((y - 11) / 12, roundness)) / 5;

            const aX = Math.cos((x / xVerticesCount) * Math.PI * 2);
            const bX = Math.cos(((x + 1) / xVerticesCount) * Math.PI * 2);

            const aY = Math.sin((x / xVerticesCount) * Math.PI * 2);
            const bY = Math.sin(((x + 1) / xVerticesCount) * Math.PI * 2);

            const aZ = (y - 12) * 0.03;
            const bZ = (y - 11) * 0.03;

            vertices.push(
                aX * bR,
                aY * bR,
                bZ,
                aX * aR,
                aY * aR,
                aZ,
                bX * aR,
                bY * aR,
                aZ
            );
            vertices.push(
                aX * bR,
                aY * bR,
                bZ,
                bX * aR,
                bY * aR,
                aZ,
                bX * bR,
                bY * bR,
                bZ
            );
        }
    }

    const verticesTypedArray = new Float32Array(vertices);
    let geometry = new THREE.BufferGeometry();

    geometry.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(verticesTypedArray, 3)
    );
    geometry = BufferGeometryUtils.mergeVertices(geometry, 0.01);
    geometry.computeVertexNormals();
    geometry.setAttribute(
        "uv",
        new THREE.Float32BufferAttribute(createPlayerWheelUV(), 2)
    );

    return geometry;
}

function createPlayerWheelMaterial() {
    const texture = new THREE.TextureLoader().load(
        createPlayerWheelTexture({
            pattern: "default",
            colors: "default",
        })
    );
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;

    const bumpTexture = new THREE.TextureLoader().load(
        "/assets/images/bump.png"
    );

    const envMap = new THREE.TextureLoader().load("/assets/images/envmap.png");
    envMap.mapping = THREE.EquirectangularReflectionMapping;

    const material = new THREE.MeshPhongMaterial({
        color: 0xffffff,
        specular: 0x222224,
        shininess: 50,
        map: texture,
        bumpMap: bumpTexture,
        bumpScale: 0.01,
        side: THREE.DoubleSide,
        envMap,
        reflectivity: 0.2,
        combine: THREE.AddOperation,
    });

    return material;
}

function createPlayer() {
    const player = new THREE.Group();

    const playerGeometry = new THREE.CylinderGeometry(1, 10, 10);
    const playerMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff });

    const playerMeshes = new THREE.Group();

    const playerWheel = new THREE.Mesh(
        createPlayerWheelGeometry(16),
        createPlayerWheelMaterial()
    );

    const ringGeometry = new THREE.TorusGeometry(0.82, 0.04, 6, 32);
    const ringMaterial = new THREE.MeshBasicMaterial({ color: 0xeeeeff });

    const playerRightRing = new THREE.Mesh(ringGeometry, ringMaterial);
    playerRightRing.position.z = 0.34;

    const playerLeftRing = new THREE.Mesh(ringGeometry, ringMaterial);
    playerLeftRing.position.z = -0.34;

    playerMeshes.position.y = 0.48;
    playerMeshes.scale.x = 0.5;
    playerMeshes.scale.y = 0.5;
    playerMeshes.scale.z = 0.5;

    playerMeshes.add(playerWheel);
    // playerMeshes.add(playerMain);
    playerMeshes.add(playerRightRing);
    playerMeshes.add(playerLeftRing);

    const playerPivot = new THREE.Group();
    playerPivot.add(playerMeshes);
    player.add(playerPivot);

    player.userData = {
        isInAir: false,
        forward: false,
        backward: false,
        drift: false,
        left: false,
        right: false,
        speed: 0,
        rotationSpeed: 0,
        direction: 0,
        gravitySpeed: 0,
        driftAngle: 0,
        wheelSpeed: 0,
    };

    document.addEventListener("keydown", (event: KeyboardEvent) => {
        if (event.key === "ArrowUp") setProperty("forward", true, player);
        if (event.key === "ArrowDown") setProperty("backward", true, player);
        if (event.key === "ArrowRight") setProperty("right", true, player);
        if (event.key === "ArrowLeft") setProperty("left", true, player);
        if (event.key === "Shift") setProperty("drift", true, player);
    });

    document.addEventListener("keyup", (event: KeyboardEvent) => {
        if (event.key === "ArrowUp") setProperty("forward", false, player);
        if (event.key === "ArrowDown") setProperty("backward", false, player);
        if (event.key === "ArrowRight") setProperty("right", false, player);
        if (event.key === "ArrowLeft") setProperty("left", false, player);
        if (event.key === "Shift") setProperty("drift", false, player);
    });

    return player;
}

function setProperty(property: string, value: unknown, player: THREE.Object3D) {
    player.userData[property] = value;
}

export { createPlayer };
