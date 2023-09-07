import { TrackStyle, TrackStyles, TrackTheme } from "@/types/track";
import { hexToRgb } from "./colors";
import * as THREE from "three";

const textureWidth = 2048;
const textureHeight = 2;

function getTrackMaterials(theme: TrackTheme, styles: TrackStyles) {
    const manager = new THREE.LoadingManager();

    const envMap = new THREE.TextureLoader().load("/assets/images/envmap.png");
    envMap.mapping = THREE.EquirectangularReflectionMapping;

    const materials: { [key: string]: any } = {};

    const bumpTexture = new THREE.TextureLoader(manager).load(
        "/assets/images/bump.png"
    );

    for (const style in styles) {
        const roadTexture = new THREE.TextureLoader().load(
            getRoadTexture(styles[style])
        );
        const roadMaterial = new THREE.MeshPhongMaterial({
            color: 0xffffff,
            depthWrite: true,
            map: roadTexture,
            bumpMap: bumpTexture,
            bumpScale: 0.08 * (styles[style].bump ?? 1),
            specular: 0x202020,
            shininess: styles[style].shininess ?? 100,
            envMap,
            combine: THREE.AddOperation,
            reflectivity: 0.4,
        });

        const sideTexture = new THREE.TextureLoader(manager).load(
            getSideTexture(styles[style])
        );
        const sideMaterial = new THREE.MeshPhongMaterial({
            color: 0xffffff,
            depthWrite: true,
            map: sideTexture,
            bumpMap: bumpTexture,
            bumpScale: 0.06 * (styles[style].bump ?? 1),
            specular: 0x202020,
            shininess: styles[style].shininess ?? 100,
            envMap,
            combine: THREE.AddOperation,
            reflectivity: 0.4,
        });

        const glassTexture = new THREE.TextureLoader(manager).load(
            getGlassTexture(styles[style])
        );

        const glassRoadMaterial = new THREE.MeshPhongMaterial({
            color: styles[style].glassColor,
            depthWrite: true,
            specular: 0xffffff,
            shininess: 50,
            transparent: true,
            alphaMap: glassTexture,
        });

        const glassSideMaterial = new THREE.MeshPhongMaterial({
            color: styles[style].glassColor,
            depthWrite: true,
            specular: 0xffffff,
            shininess: 50,
            transparent: true,
            opacity: 0.75,
        });

        materials[style] = {
            road: roadMaterial,
            side: sideMaterial,
            glass_road: glassRoadMaterial,
            glass_side: glassSideMaterial,
        };
    }

    return materials;
}

function getRoadTexture(style: TrackStyle) {
    const buffer = new Uint8ClampedArray(textureWidth * textureHeight * 4);

    for (let y = 0; y < textureHeight; y++) {
        for (let x = 0; x < textureWidth; x++) {
            const pos = (y * textureWidth + x) * 4;

            let color = hexToRgb(0xdbe5ee);

            let isStrip = false;

            for (const strip of style.strips) {
                if (x >= strip[0] && x < strip[0] + strip[1]) {
                    isStrip = true;
                }
                if (
                    x <= textureWidth - strip[0] &&
                    x > textureWidth - (strip[0] + strip[1])
                ) {
                    isStrip = true;
                }
            }

            if (!isStrip) {
                const index = Math.pow(x / (textureWidth / 2) - 1, 2);

                const rgbRoadCenterColor = hexToRgb(style.roadCenterColor);
                const rgbRoadEdgeColor = hexToRgb(style.roadEdgeColor);

                color = {
                    r:
                        rgbRoadCenterColor.r * (1 - index) +
                        rgbRoadEdgeColor.r * index,
                    g:
                        rgbRoadCenterColor.g * (1 - index) +
                        rgbRoadEdgeColor.g * index,
                    b:
                        rgbRoadCenterColor.b * (1 - index) +
                        rgbRoadEdgeColor.b * index,
                };
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

function getSideTexture(style: TrackStyle) {
    const buffer = new Uint8ClampedArray(textureWidth * textureHeight * 4);

    for (let y = 0; y < textureHeight; y++) {
        for (let x = 0; x < textureWidth; x++) {
            const pos = (y * textureWidth + x) * 4;

            let color = {
                r: 0,
                g: 0,
                b: 0,
            };

            const index = Math.pow(x / (textureWidth / 2) - 1, 2);

            const rgbConcreteColor = hexToRgb(0xdee8f0);
            const rgbConcreteDarkColor = hexToRgb(0xa0a8b0);

            color = {
                r:
                    rgbConcreteDarkColor.r * (1 - index) +
                    rgbConcreteColor.r * index,
                g:
                    rgbConcreteDarkColor.g * (1 - index) +
                    rgbConcreteColor.g * index,
                b:
                    rgbConcreteDarkColor.b * (1 - index) +
                    rgbConcreteColor.b * index,
            };

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

function getGlassTexture(style: TrackStyle) {
    const buffer = new Uint8ClampedArray(textureWidth * textureHeight * 4);

    for (let y = 0; y < textureHeight; y++) {
        for (let x = 0; x < textureWidth; x++) {
            const pos = (y * textureWidth + x) * 4;

            let color = {
                r: 150,
                g: 150,
                b: 150,
            };

            let isStrip = false;

            for (const strip of style.strips) {
                if (x > strip[0] && x < strip[0] + strip[1]) {
                    isStrip = true;
                }
            }

            if (isStrip) {
                color = {
                    r: 192,
                    g: 192,
                    b: 192,
                };
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

export {
    getTrackMaterials,
    getRoadTexture,
    getSideTexture as getRoadSideTexture,
};
