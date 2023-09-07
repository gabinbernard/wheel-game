// import { Track } from "./types/track";

// const track: Track = {
//     theme: {
//         sky: "day",
//         roadHeight: 0.5,
//         lensFlareOpacity: 1,
//         particlesOpacity: 1,
//         isRoadDoubleSided: true,
//         roadShininess: 120,
//     },
//     styles: {
//         default: {
//             roadCenterColor: 0xd03060,
//             roadEdgeColor: 0xff98b8,
//             stripsWidth: [120, 40, 40],
//             glassColor: 0xeeccdd,
//         },
//         blue: {
//             roadCenterColor: 0x2080d0,
//             roadEdgeColor: 0x80c0ff,
//             stripsWidth: [120, 40, 40],
//             glassColor: 0xccddee,
//         },
//         white: {
//             roadCenterColor: 0xffffff,
//             roadEdgeColor: 0xffffff,
//             stripsWidth: [120, 40, 40],
//             glassColor: 0xccddee,
//         },
//     },
//     segments: [
//         {
//             style: "white",
//             width: 1,
//             vertices: ["start", "a"],
//         },
//         {
//             style: "blue",
//             width: 1,
//             vertices: ["a", "b", "d"],
//         },
//         {
//             style: "white",
//             width: 1,
//             vertices: ["d", "g1"],
//         },
//         {
//             style: "blue",
//             styleType: "glass",
//             width: 1,
//             vertices: ["g1", "g2"],
//         },
//         {
//             style: "white",
//             width: 1,
//             vertices: ["g2", "r1"],
//         },
//         {
//             style: "blue",
//             width: 1,
//             vertices: ["r1", "r2", "r3", "r4", "white"],
//         },
//         {
//             style: "white",
//             width: 1,
//             vertices: ["white", "i"],
//         },
//         {
//             style: "default",
//             width: 0.75,
//             vertices: ["i", "j", "k", "l", "m", "n"],
//         },
//         {
//             style: "default",
//             width: 0.75,
//             vertices: ["f1", "f2", "f3", "f4"],
//         },
//         {
//             style: "white",
//             width: 0.75,
//             vertices: ["f4", "fg1"],
//         },
//         {
//             style: "default",
//             styleType: "glass",
//             width: 0.75,
//             vertices: ["fg1", "fg2"],
//         },
//         {
//             style: "white",
//             width: 0.75,
//             vertices: ["fg2", "f5"],
//         },
//         {
//             style: "default",
//             width: 0.75,
//             vertices: ["f5", "f6", "f7", "f8", "f9", "start"],
//         },
//     ],
//     environment: [],
//     vertices: {
//         start: [-1, 0, -1, 0],
//         a: [-0.875, 0, -1, 0],
//         b: [2, 0, -1, 0],
//         d: [6, 2, 1, 90],
//         g1: [6, 2, 1.125, 90],
//         g2: [6, 3, 3.875, 90],
//         r1: [6, 3, 4, 90],
//         r2: [8, 3.5, 6, 0],
//         r3: [10, 4, 4, -90],
//         r4: [8, 4.5, 2, -180],
//         white: [6.125, 4.5, 2, -180],
//         i: [6, 4.5, 2, -180],
//         j: [3, 5, 2, 180],
//         k: [0, 3, 2, 180],
//         l: [-2, 2, 4, 90],
//         m: [2, 1, 8, 0],
//         n: [3.5, 1.5, 8, 0],
//         f1: [4, 0, 8, 0],
//         f2: [5, 0, 8, 0],
//         f3: [7, 0, 6, -90],
//         f4: [7, 0, 4, -90],
//         fg1: [7, 0, 3.875, -90],
//         fg2: [7, 0, 1.125, -90],
//         f5: [7, 0, 1, -90],
//         f6: [7, 0, -2, -90],
//         f7: [5, 0, -4, -180],
//         f8: [-1, 0, -4, 180],
//         f9: [-3, 0, -2.5, 90],
//     },
// };

// export default track;
