import { TrackTheme } from "../types/track";

function getInterpolatedCoordinates(
    a: LegacyCoordinates,
    b: LegacyCoordinates,
    index: number
): LegacyCoordinates {
    const smoothIndex = (Math.sin(index * Math.PI - Math.PI / 2) + 1) / 2;

    const angleDifference =
        Math.min(b.ry - a.ry, b.ry - a.ry + Math.PI) / (Math.PI / 2);

    const diffX = Math.abs(a.x - b.x);
    const diffZ = Math.abs(a.z - b.z);

    const newA = {
        x: a.x + angleDifference * Math.sin(a.ry) * diffX,
        y: a.y,
        z: a.z + angleDifference * Math.cos(a.ry + Math.PI) * diffZ,
        ry: a.ry,
    };

    const newB = {
        x: b.x + angleDifference * Math.sin(b.ry) * diffX,
        y: b.y,
        z: b.z + angleDifference * Math.cos(b.ry + Math.PI) * diffZ,
        ry: b.ry,
    };

    const x =
        (a.x * (1 - index) + newB.x * index) * (1 - index) +
        (newA.x * (1 - index) + b.x * index) * index;

    const y = a.y * (1 - smoothIndex) + b.y * smoothIndex;

    const z =
        (a.z * (1 - index) + newB.z * index) * (1 - index) +
        (newA.z * (1 - index) + b.z * index) * index;

    const ry = a.ry * (1 - index) + b.ry * index;
    const rx = a.rx * (1 - smoothIndex) + b.rx * smoothIndex;

    return {
        x,
        y,
        z,
        ry,
        rx,
    };
}

type SegmentOptions = {
    width: number;
    isFirst: boolean;
    isLast: boolean;
};

function createInterpolatedGeometryPosition(
    a: LegacyCoordinates,
    b: LegacyCoordinates,
    interpolationCount: number,
    theme: TrackTheme,
    options: SegmentOptions
) {
    const vertices: { [key: string]: number[] } = {};

    if (b.ry - a.ry < -Math.PI) {
        a.ry -= Math.PI * 2;
    }

    for (let i = 0; i < interpolationCount; i++) {
        const interpolatedA = getInterpolatedCoordinates(
            a,
            b,
            i / interpolationCount
        );
        const interpolatedB = getInterpolatedCoordinates(
            a,
            b,
            (i + 1) / interpolationCount
        );

        const newVertices = createGeometryPositionVertices(
            interpolatedA,
            interpolatedB,
            theme,
            options.width,
            options.isLast && i === interpolationCount - 1,
            options.isFirst && i === 0
        );

        for (const part in newVertices) {
            if (!vertices[part]) {
                vertices[part] = [];
            }
            vertices[part].push(...newVertices[part]);
        }
    }

    return vertices;
}

type LegacyCoordinates = {
    x: number;
    y: number;
    z: number;
    ry: number;
    rx: number;
};

function createGeometryPositionVertices(
    a: LegacyCoordinates,
    b: LegacyCoordinates,
    theme: TrackTheme,
    width: number,
    isFront: boolean,
    isBack: boolean
): { [key: string]: number[] } {
    const vertices: { [key: string]: number[] } = {
        top: [],
        left: [],
        right: [],
        bottom: [],
    };

    const h = theme.roadHeight ?? 0.25;

    const w = width;

    // Top face
    vertices.top.push(-1.0, 0, -w, -1.0, 0, w, 1.0, 0, -w);
    vertices.top.push(-1.0, 0, w, 1.0, 0, w, 1.0, 0, -w);

    // Bottom face
    vertices.bottom.push(1.0, -h, -w, -1.0, -h, w, -1.0, -h, -w);
    vertices.bottom.push(1.0, -h, w, -1.0, -h, w, 1.0, -h, -w);

    // Left face
    vertices.left.push(1.0, -h, w, -1.0, 0, w, -1.0, -h, w);
    vertices.left.push(-1.0, 0, w, 1.0, -h, w, 1.0, 0, w);

    // Right face
    vertices.right.push(-1.0, -h, -w, -1.0, 0, -w, 1.0, -h, -w);
    vertices.right.push(-1.0, 0, -w, 1.0, 0, -w, 1.0, -h, -w);

    // Front face
    if (isFront) {
        vertices.front = [];
        vertices.front.push(1.0, 0, w, 1.0, -h, -w, 1.0, 0, -w);
        vertices.front.push(1.0, 0, w, 1.0, -h, w, 1.0, -h, -w);
    }

    // Back face
    if (isBack) {
        vertices.back = [];
        vertices.back.push(-1.0, 0, w, -1.0, 0, -w, -1.0, -h, -w);
        vertices.back.push(-1.0, -h, -w, -1.0, -h, w, -1.0, 0, w);
    }

    for (const part in vertices) {
        const trianglesCount = vertices[part].length / 3;

        for (let i = 0; i < trianglesCount; i++) {
            // Coordinates
            const isA = vertices[part][i * 3] === -1;
            const isLeft = vertices[part][i * 3 + 2] === -w;

            const current = isA ? a : b;

            vertices[part][i * 3] = current.x;
            vertices[part][i * 3 + 1] += current.y;
            vertices[part][i * 3 + 2] += current.z;

            if (isLeft) {
                vertices[part][i * 3] += w * Math.sin(current.ry);
                vertices[part][i * 3 + 2] -= w * (Math.cos(current.ry) - 1);
            } else {
                vertices[part][i * 3] += w * Math.sin(current.ry + Math.PI);
                vertices[part][i * 3 + 2] += w * (Math.cos(current.ry) - 1);
            }

            if (isLeft) {
                vertices[part][i * 3 + 1] += w * Math.sin(current.rx);
            } else {
                vertices[part][i * 3 + 1] += w * Math.sin(current.rx + Math.PI);
            }
        }

        // Scaling up
        for (let i = 0; i < vertices[part].length; i++) {
            vertices[part][i] *= 8;
        }
    }

    return vertices;
}

export { createInterpolatedGeometryPosition };
