import { Track } from "./types/track";

const track: Track = {
    gamePlay: {
        lapCount: 5,
        checkpointsOrder: "normal",
        speed: 1,
    },
    theme: {
        sky: "day",
        roadHeight: 0.6,
        lensFlareOpacity: 1,
        particlesOpacity: 1,
        isRoadDoubleSided: true,
    },
    styles: {
        ice: {
            roadCenterColor: 0x3080d0,
            roadEdgeColor: 0xd0eeee,
            strips: [
                [0, 240],
                [320, 80],
            ],
            glassColor: 0xeeccdd,
            bump: 0.5,
        },
        wave: {
            roadCenterColor: 0x104080,
            roadEdgeColor: 0x90f0f0,
            strips: [
                [0, 125],
                [150, 100],
                [300, 75],
                [450, 50],
                [600, 25],
            ],
            shininess: 100,
            glassColor: 0xeeccdd,
            bump: 2,
        },
    },
    segments: [
        {
            style: "ice",
            width: 1.5,
            vertices: [
                [-1, 0, 0, 0, 0],
                [0, 0, 0, 0, 0],
                [8, 0, 0, 0, 0],
                [10, 0.5, 0, 0, 0],
            ],
        },
        {
            style: "wave",
            width: 1.2,
            vertices: [
                [10.5, 0, 0, 0, 0],
                [15, 0, 0, 0, 0],
                [17.5, 0.2, 1, 45, -10],
                [20, 0.8, 2, 0, -25],
                [25, 0, 0, -45, 0],
                [30, 0.8, -2, 0, 25],
                [32.5, 0.2, -1, 45, 10],
                [35, 0, 0, 0, 0],
                [40, 0, 0, 0, 0],
            ],
        },
        {
            style: "ice",
            width: 1.5,
            vertices: [
                [40, -1, 0, 0, 0],
                [42, -1, 0, 0, 5],
                [48, -1, 6, 90, 10],
                [48, -1, 8, 90, 15],
            ],
        },
        {
            style: "wave",
            width: 1.2,
            vertices: [
                [48, -2, 8, 90, 15],
                [48, -2, 15, 90, 0],
                [53, -1.5, 20, 0, -30],
                [58, -0.5, 15, -90, -45],
                [53, 0.5, 10, -170, -22.5],
                [45, 1, 9, -180, -0],
            ],
        },
        {
            style: "wave",
            width: 1.2,
            vertices: [
                [45, 0, 9, -180, -0],
                [40, 0, 9, -180, -0],
                [37, 0.3, 9, -180, -0],
                [34, -0.1, 9, -180, -0],
                [31, 0.2, 9, -180, -0],
                [28, -0.2, 9, -180, -0],
                [25, 0.1, 9, -180, -0],
                [22, -0.3, 9, -180, -0],
                [19, 0, 9, -180, -0],
            ],
        },
        {
            style: "ice",
            width: 1.5,
            vertices: [
                [19, -0.5, 9, -180, -0],
                [16, -0.5, 9, -180, -0],
                [10, 1.5, 9, -180, -0],
                [5.5, 1.5, 9, -180, -0],
            ],
        },
        {
            style: "wave",
            width: 1.2,
            vertices: [
                [5, 1, 9, -180, 0],
                [-2, 1, 9, -180, -45],
            ],
        },
        {
            style: "ice",
            width: 1.5,
            vertices: [
                [-2.5, 1, 9, -180, 0],
                [-4.5, 1, 9, -180, 0],
            ],
        },
        {
            style: "wave",
            width: 1.2,
            vertices: [
                [-5, 0.5, 9, -180, 0],
                [-12, 0.5, 9, -180, 45],
            ],
        },
        {
            style: "ice",
            width: 1.5,
            vertices: [
                [-12.5, 0.5, 9, -180, 0],
                [-18, 1, 2, -90, 0],
            ],
        },
        {
            style: "wave",
            width: 1.2,
            vertices: [
                [-18, 0.5, 2, -90, 0],
                [-14, 1.5, -6, 0, 45],
                [-9, 1, -3, 45, 10],
                [-5, 0.5, 0, -20, 0],
                [-1.5, 0.75, 0, 0, 0],
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
        [[7, 0, 0, 0, 0], [1, 1], true],
        [[7, 0, 0, 0, 0], [1, 1], true],
        [[7, 0, 0, 0, 0], [1, 1], true],
    ],
};

export default track;
