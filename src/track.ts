import * as THREE from "three";
import * as BufferGeometryUtils from "three/examples/jsm/utils/BufferGeometryUtils.js";
import {
    Track,
    TrackVertexCoordinates,
    TrackSegment,
    TrackMaterials,
    TrackMaterialType,
} from "./types/track";
import { createInterpolatedGeometryPosition } from "./utils/trackGeometry";
import { getTrackMaterials } from "./utils/trackMaterials";
import { createBeamGeometry } from "./utils/beam";

function createSideUV(length: number) {
    const uv: number[] = [];

    for (let i = 0; i < length; i++) {
        uv.push(1, 0.0001, 0, 0, 1, 0, 0, 0.0001);
    }

    const uvTypedArray = new Float32Array(uv);
    return new THREE.Float32BufferAttribute(uvTypedArray, 2);
}
function createEdgeUV() {
    const uv = [0, 0, 1, 0, 1, 1, 0, 1];

    const uvTypedArray = new Float32Array(uv);
    return new THREE.Float32BufferAttribute(uvTypedArray, 2);
}

function createRoadUV(length: number) {
    const uv: number[] = [];

    for (let i = 0; i < length; i++) {
        uv.push(1, 0.0001, 0, 0, 1, 0, 0, 0.0001);
    }

    const uvTypedArray = new Float32Array(uv);
    return new THREE.Float32BufferAttribute(uvTypedArray, 2);
}

function getTrackSegmentInterpolationCount(
    a: TrackVertexCoordinates,
    b: TrackVertexCoordinates
) {
    let interpolationCount = 1;

    const xDiff = Math.abs(a[0] - b[0]);
    const yDiff = Math.abs(a[1] - b[1]);
    const zDiff = Math.abs(a[2] - b[2]);
    const angleDiff =
        Math.min(Math.abs(a[3] - b[3]), Math.abs(a[3] - Math.PI - b[3])) /
        (Math.PI / 2);

    interpolationCount +=
        12 * Math.ceil(yDiff) +
        12 * Math.ceil(angleDiff) * Math.ceil(xDiff + zDiff);
    interpolationCount += 12;

    return interpolationCount;
}

function getObjectCoordinates(coord: TrackVertexCoordinates) {
    return {
        x: coord[0],
        y: coord[1],
        z: coord[2],
        ry: coord[3],
        rx: coord[4],
    };
}

function createTrackSegment(
    track: Track,
    materials: TrackMaterials,
    segment: TrackSegment
) {
    const meshes: THREE.Mesh[] = [];

    const vertices: { [key: string]: number[] } = {};

    const verticesCount = segment.vertices.length;
    for (let i = 0; i < verticesCount - 1; i++) {
        const a = segment.vertices[i];
        const b = segment.vertices[i + 1];

        if (Math.abs(a[3] - b[3]) % (Math.PI * 2) === 0) {
            a[3] = b[3];
        }

        const aLegacy = getObjectCoordinates(a);
        const bLegacy = getObjectCoordinates(b);

        const interpolationCount = getTrackSegmentInterpolationCount(a, b);

        const newVertices = createInterpolatedGeometryPosition(
            aLegacy,
            bLegacy,
            interpolationCount,
            track.theme,
            {
                width: segment.width,
                isFirst: i === 0,
                isLast: i === verticesCount - 2,
            }
        );

        for (const part in newVertices) {
            if (!vertices[part]) {
                vertices[part] = [];
            }
            vertices[part].push(...newVertices[part]);
        }
    }

    for (const part in vertices) {
        const geometryPosition = new Float32Array(vertices[part]);

        let geometry = new THREE.BufferGeometry();
        geometry.setAttribute(
            "position",
            new THREE.Float32BufferAttribute(geometryPosition, 3)
        );
        geometry = BufferGeometryUtils.mergeVertices(geometry, 0.0025);
        geometry.computeVertexNormals();

        let uv: THREE.Float32BufferAttribute = createRoadUV(2000);
        if (part === "back" || part === "front") uv = createEdgeUV();
        if (part === "left" || part === "right") uv = createSideUV(2000);

        geometry.setAttribute("uv", uv);

        let materialPart: TrackMaterialType = "side";
        if (part === "top") materialPart = "road";
        if (
            track.theme.isRoadDoubleSided &&
            (part === "bottom" || part === "front" || part === "back")
        )
            materialPart = "road";
        if (segment.styleType === "glass") {
            materialPart = `glass_${materialPart}`;
        }

        const mesh = new THREE.Mesh(
            geometry,
            materials[segment.style][materialPart]
        );
        meshes.push(mesh);
    }

    for (const element of track.environment) {
        const geometry = createBeamGeometry(element.pos, track.theme);

        const mesh = new THREE.Mesh(geometry, materials[element.style]["side"]);
        meshes.push(mesh);
    }

    return meshes;
}

function createTrack(track: Track) {
    const meshes = [];

    const materials = getTrackMaterials(track.theme, track.styles);

    for (const segment of track.segments) {
        const segmentMeshes = createTrackSegment(track, materials, segment);
        meshes.push(...segmentMeshes);
    }

    return meshes;
}

function parseTrack(track: Track) {
    const newTrack: Track = JSON.parse(JSON.stringify(track));
    for (const segment in newTrack.segments) {
        for (const vertex in newTrack.segments[segment].vertices) {
            newTrack.segments[segment].vertices[vertex][3] /= 180;
            newTrack.segments[segment].vertices[vertex][3] *= Math.PI;

            newTrack.segments[segment].vertices[vertex][4] /= 180;
            newTrack.segments[segment].vertices[vertex][4] *= Math.PI;
        }
    }

    for (const checkpoint in newTrack.checkpoints) {
        newTrack.checkpoints[checkpoint][0][3] /= 180;
        newTrack.checkpoints[checkpoint][0][3] *= Math.PI;

        newTrack.checkpoints[checkpoint][0][4] /= 180;
        newTrack.checkpoints[checkpoint][0][4] *= Math.PI;
    }
    return newTrack;
}

export { createTrack, parseTrack };
