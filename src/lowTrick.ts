import { Track } from "./types/track";

const track: Track = {
    gamePlay: {
        lapCount: 5,
        checkpointsOrder: "normal",
        speed: 1,
    },
    theme: {
        sky: "night",
        roadHeight: 0.4,
        lensFlareOpacity: 1,
        particlesOpacity: 1,
        isRoadDoubleSided: true,
    },
    styles: {
        red: {
            roadCenterColor: 0xd4005b,
            roadEdgeColor: 0xe8b0f0,
            strips: [
                [0, 300],
                [350, 50],
                [950, 50],
            ],
            glassColor: 0xeeccdd,
            bump: 0.1,
            shininess: 1000,
        },
        blue: {
            roadCenterColor: 0x2070b8,
            roadEdgeColor: 0x80f0ff,
            strips: [
                [0, 300],
                [350, 50],
                [950, 50],
            ],
            glassColor: 0xccddee,
            bump: 0.1,
            shininess: 1000,
        },
    },
    segments: [
        {
            style: "blue",
            width: 1,
            vertices: [
                [0, 0, 0, 0, 0],
                [7, 0, 0, 0, 0],
                [9, 0, -2, -90, 0],
                [9, 0, -3, -90, 0],
                [9, 0.5, -5, -90, 0],
            ],
        },
        {
            style: "red",
            width: 1,
            vertices: [
                [9, 0, -5.5, -90, 0],
                [9, 0, -6, -90, 0],
                [6, 0, -8, -180, 0],
                [5, 0, -8, -180, 0],
                [3.5, 0, -8.5, -135, 0],
                [2, 0, -9, -180, 0],
                [1, 0, -9, -180, 0],
                [0, 0, -8.5, -225, 0],
                [-1.5, 0, -8, -180, 0],
                [-3, 0, -8, 180, 0],
                [-8, 0, 0, 90, 0],
                [-8, 0.5, 2.5, 90, 0],
            ],
        },
        {
            style: "blue",
            width: 1,
            vertices: [
                [-8, 0, 3, 90, 0],
                [-8, 0, 4, 90, 0],
                [-4, 0, 8, 0, 0],
                [-1, 0.75, 8, 0, 0],
            ],
        },
        {
            style: "red",
            width: 1,
            vertices: [
                [0, 0, 8, 0, 0],
                [6, 0.5, 8, 0, 0],
                [8, 1.5, 4, -90, 0],
                [6, 2.25, 0, -180, 0],
                [4, 2.5, 0, -180, 0],
                [2, 3, 0, -180, 0],
            ],
        },
        {
            style: "red",
            width: 1,
            vertices: [
                [1, 2.25, 0, -180, 0],
                [-2, 2.25, 0, -180, 0],
                [-4, 2.75, 0, -180, 0],
            ],
        },
        {
            style: "blue",
            width: 1,
            vertices: [
                [-5, 2, 0, -180, 0],
                [-10, 2, 0, -180, 0],
                [-12, 2, -2, -90, 0],
                [-15, 1.5, -4, -180, 0],
                [-18, 1, -2, -270, 0],
                [-18, 0.5, 0, -270, 0],
                [-18, 0, 2, 90, 0],
                [-15, -0.5, 4, 0, 0],
                [-12, -1, 2, -90, 0],
                [-9, -1.5, 0, 0, 0],
                [-4.5, -1, 0, 0, 0],
                [0, 0, 0, 0, 0],
            ],
        },
    ],
    environment: [],
    startingPoint: [
        [0, 0, 0, 0, 0],
        [1, 1],
    ],
    checkpoints: [
        [[7, 0, 0, 0, 0], [1, 1], true],
        [[1, 0, -9, -180, 0], [1, 1], true],
        [[8, 1.5, 4, -90, 0], [1, 1], true],
        [[-18, 0.5, 0, -270, 0], [1, 1], true],
    ],
};

export default track;
