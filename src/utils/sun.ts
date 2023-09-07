import { TrackTheme } from "@/types/track";
import * as THREE from "three";

function createSunMaterial(theme: TrackTheme) {
    const manager = new THREE.LoadingManager();

    const themeSuns = {
        day: "day.png",
        night: "night.png",
        cloudy: "day.png",
    };

    const sunTexture = new THREE.TextureLoader(manager).load(
        `/assets/images/sun/${themeSuns[theme.sky]}`
    );

    const sunMaterial = new THREE.MeshBasicMaterial({
        transparent: true,
        map: sunTexture,
        fog: false,
        blending: THREE.AdditiveBlending,
    });

    return sunMaterial;
}

function createSun(theme: TrackTheme) {
    const sun = new THREE.Mesh(
        new THREE.PlaneGeometry(),
        createSunMaterial(theme)
    );

    return sun;
}

export { createSun };
