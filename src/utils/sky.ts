import { TrackTheme } from "@/types/track";
import * as THREE from "three";

const textureWidth = 4000;
const textureHeight = 2000;

function hexToRgb(hex: number) {
    const r = (hex >> 16) & 255;
    const g = (hex >> 8) & 255;
    const b = hex & 255;

    return { r, g, b };
}

function createSkyMaterial(theme: TrackTheme) {
    const manager = new THREE.LoadingManager();

    const skyTexture = new THREE.TextureLoader(manager).load(
        createSkyTexture(theme)
    );

    const skyMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        map: skyTexture,
        side: THREE.BackSide,
        fog: false,
    });

    return skyMaterial;
}

function getTextureColorIndexes(y: number, theme: TrackTheme) {
    const horizonHeight = 100;

    const spaceLimit = textureHeight / 2 - horizonHeight;
    const groundLimit = textureHeight / 2;

    if (y < spaceLimit) {
        const spaceIndex = Math.pow(1 - y / spaceLimit, 1 / 2.5);

        return {
            space: spaceIndex,
            sky: 1 - spaceIndex,
            horizon: 0,
            ground: 0,
        };
    }
    if (y > groundLimit) {
        const groundIndex = Math.pow(
            1 - (textureHeight - y) / groundLimit,
            1 / 5
        );

        return {
            space: 0,
            sky: 0,
            horizon: 1 - groundIndex,
            ground: groundIndex,
        };
    }
    return {
        space: 0,
        sky: 1 - (y - spaceLimit + 1) / (groundLimit - spaceLimit),
        horizon: (y - spaceLimit + 1) / (groundLimit - spaceLimit),
        ground: 0,
    };
}

function createSkyTexture(theme: TrackTheme) {
    const buffer = new Uint8ClampedArray(textureWidth * textureHeight * 4);

    const skyThemes = {
        day: {
            spaceColor: 0x4068b0,
            skyColor: 0x6fa8cd,
            horizonColor: 0xdee4ee,
            groundColor: 0xb0c6dc,
        },
        cloudy: {
            spaceColor: 0x202020,
            skyColor: 0x504060,
            horizonColor: 0xf0e0d0,
            groundColor: 0x202020,
        },
        night: {
            spaceColor: 0x090a0d,
            skyColor: 0x14151f,
            horizonColor: 0x2b2d40,
            groundColor: 0x14151f,
        },
    };

    const skyTheme: "day" | "night" | "cloudy" = theme.sky;

    const spaceColor = hexToRgb(skyThemes[skyTheme].spaceColor);
    const skyColor = hexToRgb(skyThemes[skyTheme].skyColor);
    const horizonColor = hexToRgb(skyThemes[skyTheme].horizonColor);
    const groundColor = hexToRgb(skyThemes[skyTheme].groundColor);

    for (let y = 0; y < textureHeight; y++) {
        for (let x = 0; x < textureWidth; x++) {
            const pos = (y * textureWidth + x) * 4;

            let color = {
                r: 0,
                g: 0,
                b: 0,
            };

            const i = getTextureColorIndexes(y, theme);

            color = {
                r:
                    spaceColor.r * i.space +
                    skyColor.r * i.sky +
                    horizonColor.r * i.horizon +
                    groundColor.r * i.ground,
                g:
                    spaceColor.g * i.space +
                    skyColor.g * i.sky +
                    horizonColor.g * i.horizon +
                    groundColor.g * i.ground,
                b:
                    spaceColor.b * i.space +
                    skyColor.b * i.sky +
                    horizonColor.b * i.horizon +
                    groundColor.b * i.ground,
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

    if (skyTheme === "night") {
        ctx!.fillStyle = "#ffffff";
        for (let i = 0; i < 2500; i++) {
            const x = Math.floor(Math.random() * textureWidth);
            const y = Math.floor((Math.random() * textureHeight) / 2);
            const r = Math.pow(Math.random() * 1.1, 4);

            ctx!.beginPath();
            ctx!.arc(x, y, r, 0, Math.PI * 2);
            ctx!.fill();
        }
    }

    const texture = canvas.toDataURL();
    return texture;
}

function createSky(theme: TrackTheme) {
    const sky = new THREE.Mesh(
        new THREE.SphereGeometry(),
        createSkyMaterial(theme)
    );

    return sky;
}

export { createSky };
