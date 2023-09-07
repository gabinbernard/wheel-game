import { Track, TrackVertexCoordinates } from "../types/track";
import * as THREE from "three";

function createCheckPointUV(width: number) {
    const uv: number[] = [];

    const l = 0.5 - width / 4; // Left UV
    const r = 0.5 + width / 4; // Right UV

    uv.push(0, 0, 0.1, 1, 0.1, 0, 0.1, 1, 0, 0, 0, 1);
    uv.push(0, 0, 0.1, 1, 0.1, 0, 0.1, 1, 0, 1, 0, 0);
    uv.push(r, 1, l, 1, r, 0, l, 0, r, 0, l, 1);
    uv.push(r, 1, l, 1, l, 0, l, 0, r, 0, r, 1);

    const uvTypedArray = new Float32Array(uv);
    return new THREE.Float32BufferAttribute(uvTypedArray, 2);
}

function createCheckPointGeometry(
    coord: TrackVertexCoordinates,
    w: number,
    h: number
) {
    const vertices: number[] = [];

    const t = 0.05;

    // Left face
    vertices.push(t, 0, w, -t, h, w, -t, 0, w);
    vertices.push(-t, h, w, t, 0, w, t, h, w);

    // Right face
    vertices.push(-t, 0, -w, -t, h, -w, t, 0, -w);
    vertices.push(-t, h, -w, t, h, -w, t, 0, -w);

    // Front face
    vertices.push(t, h, -w, t, h, w, t, 0, -w);
    vertices.push(t, 0, w, t, 0, -w, t, h, w);

    // Back face
    vertices.push(-t, h, w, -t, h, -w, -t, 0, -w);
    vertices.push(-t, 0, -w, -t, 0, w, -t, h, w);

    const trianglesCount = vertices.length / 3;

    for (let i = 0; i < trianglesCount; i++) {
        // Coordinates
        const isLeft = vertices[i * 3 + 2] === -w;

        // vertices[i * 3] += coord[0];
        // vertices[i * 3 + 1] += coord[1];
        // vertices[i * 3 + 2] += coord[2];

        // if (isLeft) {
        //     vertices[i * 3] += w * Math.sin(coord[3]);
        //     vertices[i * 3 + 2] -= w * (Math.cos(coord[3]) - 1);
        // } else {
        //     vertices[i * 3] += w * Math.sin(coord[3] + Math.PI);
        //     vertices[i * 3 + 2] += w * (Math.cos(coord[3]) - 1);
        // }
    }

    // Scaling up
    for (let i = 0; i < vertices.length; i++) {
        vertices[i] *= 8;
    }

    const verticesTypedArray = new Float32Array(vertices);
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(verticesTypedArray, 3)
    );
    geometry.setAttribute("uv", createCheckPointUV(w));

    return geometry;
}

function createCheckPoints(track: Track) {
    const checkPointMeshes: THREE.Mesh[] = [];

    const checkPointTexture = new THREE.TextureLoader().load(
        "/assets/images/checkpoint.png"
    );

    const checkPointMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        map: checkPointTexture,
        transparent: true,
    });

    for (const checkPoint of track.checkpoints) {
        const checkPointCoord = checkPoint[0];

        const checkPointGeometry = createCheckPointGeometry(
            checkPointCoord,
            checkPoint[1][0],
            checkPoint[1][1]
        );

        const checkPointMesh = new THREE.Mesh(
            checkPointGeometry,
            checkPointMaterial
        );
        checkPointMesh.position.set(
            checkPointCoord[0] * 8,
            checkPointCoord[1] * 8,
            checkPointCoord[2] * 8
        );
        checkPointMesh.rotation.y = checkPointCoord[3];
        checkPointMeshes.push(checkPointMesh);
    }

    return checkPointMeshes;
}

export { createCheckPoints };
