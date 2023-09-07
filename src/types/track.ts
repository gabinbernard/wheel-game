type Track = {
    theme: TrackTheme;
    styles: { [key: string]: TrackStyle };
    segments: TrackSegment[];
    environment: TrackEnvironment;
    startingPoint: TrackStartingPoint;
    checkpoints: TrackCheckPoint[];
    gamePlay: TrackGamePlay;
};

type TrackGamePlay = {
    checkpointsOrder: string;
    lapCount: number;
    speed: number;
};

type TrackEnvironment = TrackEnvironmentElement[];

type TrackEnvironmentElement = {
    type: string;
    style: string;
    pos: [number, number, number];
};

type TrackStyles = { [key: string]: TrackStyle };
type TrackStyle = {
    roadCenterColor: number;
    roadEdgeColor: number;
    strips: [number, number][];
    glassColor?: number;
    bump?: number;
    shininess?: number;
};

type TrackTheme = {
    sky: "day" | "night" | "cloudy";
    roadHeight: number;
    lensFlareOpacity?: number;
    particlesOpacity?: number;
    isRoadDoubleSided?: boolean;
};

type TrackStartingPoint = [TrackVertexCoordinates, [number, number]];
type TrackCheckPoint = [TrackVertexCoordinates, [number, number], boolean];

type TrackSegment = {
    style: string;
    styleType?: string;
    width: number;
    vertices: TrackVertexCoordinates[];
};

type TrackMaterials = {
    [key: string]: {
        road: THREE.MeshPhongMaterial;
        side: THREE.MeshPhongMaterial;
        glass_road: THREE.MeshPhongMaterial;
        glass_side: THREE.MeshPhongMaterial;
    };
};

type TrackMaterialType = "road" | "side" | "glass_road" | "glass_side";

type TrackVertexCoordinates = [number, number, number, number, number];

export {
    Track,
    TrackTheme,
    TrackStyle,
    TrackStyles,
    TrackSegment,
    TrackMaterials,
    TrackEnvironment,
    TrackEnvironmentElement,
    TrackMaterialType,
    TrackVertexCoordinates,
};
