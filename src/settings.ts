type SETTINGS = {
    DISPLAY: { [key: string]: unknown };
    GRAPHICS: { [key: string]: unknown };
};

const SETTINGS: { [key: string]: any } = {
    DISPLAY: {
        CAMERA: {
            DEFAULT: {
                cameraShaking: true,
                cameraRotation: true,
                cameraFov: 80,
            },
            CHILL: {
                cameraFov: 70,
                cameraShaking: false,
                cameraRotation: true,
            },
            CINEMATIC: {
                cameraFov: 90,
                cameraShaking: false,
                cameraRotation: true,
            },
            FIXED: {
                cameraFov: 80,
                cameraShaking: false,
                cameraRotation: false,
            },
        },
        STREAMER_MODE: {
            ON: {
                streamerMode: true,
            },
            OFF: {
                streamerMode: false,
            },
        },
        OVERLAY: {
            DEFAULT: {
                overlayElements: true,
                overlayVignette: true,
                overlayDebug: false,
            },
            OFF: {
                overlayElements: false,
                overlayVignette: false,
                overlayDebug: false,
            },

            DEBUG: {
                overlayElements: true,
                overlayVignette: true,
                overlayDebug: true,
            },
        },
    },
    GRAPHICS: {
        LIGHTING: {
            DEBUG: {
                lightCount: 1,
                lightRadius: 0,
                shadows: false,
                shadowMapRes: 2048,
            },
            LOW: {
                lightCount: 4,
                lightRadius: 5,
                shadows: false,
            },
            MEDIUM: {
                lightCount: 5,
                lightRadius: 4,
                shadows: true,
                shadowMapRes: 512,
            },
            HIGH: {
                lightCount: 8,
                lightRadius: 10,
                shadows: true,
                shadowMapRes: 1024,
            },
            ULTRA: {
                lightCount: 10,
                lightRadius: 25,
                ambientOcclusion: 0.6,
                shadows: true,
                shadowMapRes: 2048,
            },
        },
        BLOOM: {
            ON: {
                bloom: true,
            },
            OFF: {
                bloom: false,
            },
        },
    },
};

function getLocalStorageSettings() {
    for (const category in SETTINGS) {
        for (const setting in SETTINGS[category]) {
            const savedSettings = localStorage.getItem(
                `settings_${category}_${setting}`
            );

            if (savedSettings && savedSettings in SETTINGS[category][setting]) {
                settings = {
                    ...settings,
                    ...SETTINGS[category][setting][savedSettings],
                };
            }
        }
    }
}

let settings = {
    ...SETTINGS.GRAPHICS.BLOOM.ON,
    ...SETTINGS.GRAPHICS.LIGHTING.MEDIUM,
    ...SETTINGS.DISPLAY.CAMERA.DEFAULT,
    ...SETTINGS.DISPLAY.OVERLAY.DEFAULT,
    ...SETTINGS.DISPLAY.OVERLAY.DEFAULT,
    ...SETTINGS.DISPLAY.STREAMER_MODE.OFF,
};
getLocalStorageSettings();

export { settings };
