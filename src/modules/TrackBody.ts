import * as THREE from "three";
import { Track, TrackSegment, TrackVertexCoordinates } from "../types/track";

type Edge = [number, number, number, number, number, number, number];

class TrackBody {
    body: Edge[][];

    constructor(track: Track, scene?: THREE.Scene) {
        this.body = this.createBody(track);

        if (scene) {
            const debugMaterial = new THREE.MeshBasicMaterial({
                color: 0x000000,
            });
            for (const segment of this.body) {
                for (const coord of segment) {
                    for (let i = 0; i < 2; i++) {
                        const mesh = new THREE.Mesh(
                            new THREE.BoxGeometry(5, 5, 5),
                            debugMaterial
                        );
                        mesh.scale.x = 0.1;
                        mesh.scale.y = 0.1;
                        mesh.scale.z = 0.1;
                        mesh.position.set(
                            coord[0 + i * 3],
                            coord[1 + i * 3],
                            coord[2 + i * 3]
                        );
                        scene.add(mesh);
                    }
                }
            }
        }
    }

    private createBody(track: Track) {
        const segments: Edge[][] = [];

        for (const segment of track.segments) {
            const bodySegment = this.createSegment(track, segment);
            segments.push(bodySegment);
        }

        return segments;
    }

    private getInterpolationCount(
        a: TrackVertexCoordinates,
        b: TrackVertexCoordinates
    ) {
        let interpolationCount = 1;

        const xDiff = Math.abs(a[0] - b[0]);
        const yDiff = Math.abs(a[1] - b[1]);
        const zDiff = Math.abs(a[2] - b[2]);
        const ryDiff =
            Math.min(Math.abs(a[3] - b[3]), Math.abs(a[3] - Math.PI - b[3])) /
            (Math.PI / 2);
        const rxDiff =
            Math.min(Math.abs(a[4] - b[4]), Math.abs(a[4] - Math.PI - b[4])) /
            (Math.PI / 2);

        interpolationCount +=
            8 * Math.ceil(yDiff) +
            4 * Math.ceil(Math.max(ryDiff, rxDiff)) * Math.ceil(xDiff + zDiff);

        return interpolationCount;
    }

    private getInterpolatedCoordinates(
        a: TrackVertexCoordinates,
        b: TrackVertexCoordinates,
        index: number
    ): TrackVertexCoordinates {
        const smoothIndex = (Math.sin(index * Math.PI - Math.PI / 2) + 1) / 2;

        const angleDifference =
            Math.min(b[3] - a[3], b[3] - a[3] + Math.PI) / (Math.PI / 2);

        const diffX = Math.abs(a[0] - b[0]);
        const diffZ = Math.abs(a[2] - b[2]);

        const newA = [
            a[0] + angleDifference * Math.sin(a[3]) * diffX,
            a[1],
            a[2] + angleDifference * Math.cos(a[3] + Math.PI) * diffZ,
            a[3],
        ];

        const newB = [
            b[0] + angleDifference * Math.sin(b[3]) * diffX,
            b[1],
            b[2] + angleDifference * Math.cos(b[3] + Math.PI) * diffZ,
            b[3],
        ];

        const x =
            (a[0] * (1 - index) + newB[0] * index) * (1 - index) +
            (newA[0] * (1 - index) + b[0] * index) * index;

        const y = a[1] * (1 - smoothIndex) + b[1] * smoothIndex;

        const z =
            (a[2] * (1 - index) + newB[2] * index) * (1 - index) +
            (newA[2] * (1 - index) + b[2] * index) * index;

        const ry = a[3] * (1 - index) + b[3] * index;
        const rx = a[4] * (1 - smoothIndex) + b[4] * smoothIndex;

        return [x, y, z, ry, rx];
    }

    private createSegment(track: Track, segment: TrackSegment): Edge[] {
        const edges: Edge[] = [];

        const length = segment.vertices.length;
        for (let i = 0; i < length - 1; i++) {
            const a = segment.vertices[i];
            const b = segment.vertices[i + 1];

            if (b[3] - a[3] < -Math.PI * 2) {
                a[3] -= Math.PI * 2;
            }

            if (b[3] - a[3] >= Math.PI * 2) {
                a[3] += Math.PI * 2;
            }

            const interpolationCount = this.getInterpolationCount(a, b);

            const isLastVertex = i === length - 2;
            const iterationCount = interpolationCount + (isLastVertex ? 1 : 0);
            for (let i = 0; i < iterationCount; i++) {
                const interpolatedCoords = this.getInterpolatedCoordinates(
                    a,
                    b,
                    i / interpolationCount
                );

                const newEdges = this.createGeometryPositionVertices(
                    interpolatedCoords,
                    segment.width
                );

                edges.push(newEdges);
            }
        }

        return edges;
    }

    private createGeometryPositionVertices(
        coord: TrackVertexCoordinates,
        width: number
    ): Edge {
        const w = width;
        const edges: Edge = [
            coord[0],
            coord[1],
            -w + coord[2],
            coord[0],
            coord[1],
            w + coord[2],
            coord[3],
        ];

        for (let i = 0; i < 2; i++) {
            // Coordinates
            const isLeft = edges[i * 3 + 2] === -w + coord[2];

            if (isLeft) {
                edges[i * 3] += w * Math.sin(coord[3]);
                edges[i * 3 + 2] -= w * (Math.cos(coord[3]) - 1);
            } else {
                edges[i * 3] += w * Math.sin(coord[3] + Math.PI);
                edges[i * 3 + 2] += w * (Math.cos(coord[3]) - 1);
            }

            if (isLeft) {
                edges[i * 3 + 1] += w * Math.sin(coord[4]);
            } else {
                edges[i * 3 + 1] += w * Math.sin(coord[4] + Math.PI);
            }
        }

        for (let i = 0; i < edges.length - 1; i++) {
            edges[i] *= 8;
        }

        return edges;
    }

    private sqr(x: number) {
        return x * x;
    }
    private dist2(v: { x: number; y: number }, w: { x: number; y: number }) {
        return this.sqr(v.x - w.x) + this.sqr(v.y - w.y);
    }
    private distToSegmentSquared(
        p: { x: number; y: number },
        v: { x: number; y: number },
        w: { x: number; y: number }
    ) {
        const l2 = this.dist2(v, w);
        if (l2 == 0) return this.dist2(p, v);
        let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
        t = Math.max(0, Math.min(1, t));
        return this.dist2(p, {
            x: v.x + t * (w.x - v.x),
            y: v.y + t * (w.y - v.y),
        });
    }
    private distToSegment(
        p: { x: number; y: number },
        v: { x: number; y: number },
        w: { x: number; y: number }
    ) {
        return Math.sqrt(this.distToSegmentSquared(p, v, w));
    }

    public isIntersecting(x: number, y: number) {
        let heights: [number, number][] = [];

        for (const segment of this.body) {
            segmentLoop: for (let i = 0; i < segment.length - 1; i++) {
                const square = [
                    [segment[i + 1][0], segment[i + 1][2]],
                    [segment[i + 1][3], segment[i + 1][5]],
                    [segment[i][3], segment[i][5]],
                    [segment[i][0], segment[i][2]],
                ];

                for (let i = 0; i < 4; i++) {
                    const bodyVector = [
                        square[(i + 1) % 4][0] - square[i][0],
                        square[(i + 1) % 4][1] - square[i][1],
                    ];
                    const playerVector = [x - square[i][0], y - square[i][1]];

                    const bodyAngle = Math.atan2(bodyVector[1], bodyVector[0]);
                    let playerAngle = Math.atan2(
                        playerVector[1],
                        playerVector[0]
                    );

                    if (playerAngle < bodyAngle) {
                        playerAngle += Math.PI * 2;
                    }

                    const deltaAngle = playerAngle - bodyAngle;
                    if (deltaAngle > Math.PI) {
                        continue segmentLoop;
                    }
                }

                const playerCoord = { x, y };

                const aCoord1 = { x: segment[i][0], y: segment[i][2] };
                const aCoord2 = { x: segment[i][3], y: segment[i][5] };
                const bCoord1 = { x: segment[i + 1][0], y: segment[i + 1][2] };
                const bCoord2 = { x: segment[i + 1][3], y: segment[i + 1][5] };

                const distA = this.distToSegment(playerCoord, aCoord1, aCoord2);
                const distB = this.distToSegment(playerCoord, bCoord1, bCoord2);
                const totalABDist = distA + distB;

                const distL = this.distToSegment(playerCoord, aCoord1, bCoord1);
                const distR = this.distToSegment(playerCoord, aCoord2, bCoord2);
                const totalLRDist = distL + distR;

                const heightA =
                    (segment[i][1] * distR) / totalLRDist +
                    (segment[i][4] * distL) / totalLRDist;
                const heightB =
                    (segment[i + 1][1] * distR) / totalLRDist +
                    (segment[i + 1][4] * distL) / totalLRDist;

                const height: [number, number] = [
                    heightA * (distB / totalABDist) +
                        heightB * (distA / totalABDist),
                    segment[i][6],
                ];

                heights.push(height);
            }
        }

        heights = heights.sort((a, b) => (a[0] < b[0] ? 1 : -1));
        return heights;
    }
}

export { TrackBody };
