import * as THREE from "three";
import * as BufferGeometryUtils from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { TrackTheme, TrackStyle, TrackVertexCoordinates } from "../types/track";

type BeamCoordinates = [number, number, number];

function createBeamUV() {
    const uv: number[] = [];

    uv.push(1, 0, 1, 0, 0, 0, 0, 0);
    for (let i = 0; i < 5; i++) {
        uv.push(1, 1, 0, 0, 1, 1, 0, 0, 0, 1, 0, 1);
    }

    const uvTypedArray = new Float32Array(uv);
    return new THREE.Float32BufferAttribute(uvTypedArray, 2);
}

function createBeamGeometry(pos: BeamCoordinates, theme: TrackTheme) {
    const vertices: number[] = [];

    const w = theme.roadHeight / 4 ?? 0.125;
    const groundHeight = -15;

    // Top face
    vertices.push(-w, 0, w, w, 0, w, w, 0, -w);
    vertices.push(-w, 0, -w, -w, 0, w, w, 0, -w);

    // Left face
    vertices.push(-w, 0, w, w, groundHeight, w, w, 0, w);
    vertices.push(-w, groundHeight, w, w, groundHeight, w, -w, 0, w);

    // Right face
    vertices.push(-w, 0, -w, w, 0, -w, w, groundHeight, -w);
    vertices.push(-w, 0, -w, w, groundHeight, -w, -w, groundHeight, -w);

    // Back face
    vertices.push(w, 0, w, w, groundHeight, -w, w, 0, -w);
    vertices.push(w, groundHeight, w, w, groundHeight, -w, w, 0, w);

    // Front face
    vertices.push(-w, 0, w, -w, 0, -w, -w, groundHeight, -w);
    vertices.push(-w, 0, w, -w, groundHeight, -w, -w, groundHeight, w);

    const trianglesCount = vertices.length / 3;

    for (let i = 0; i < trianglesCount; i++) {
        vertices[i * 3] += pos[0];
        vertices[i * 3 + 2] += pos[2];

        if (vertices[i * 3 + 1] !== groundHeight) {
            vertices[i * 3 + 1] += pos[1];
        }

        vertices[i * 3 + 1] -= 0.01;
    }

    // Scaling up
    for (let i = 0; i < vertices.length; i++) {
        vertices[i] *= 16;
    }

    const geometryPosition = new Float32Array(vertices);

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(geometryPosition, 3)
    );
    geometry.computeVertexNormals();
    geometry.setAttribute("uv", createBeamUV());

    return geometry;
}

export { createBeamGeometry };
