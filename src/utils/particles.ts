const particlesData: any = {
    particles: Array(200)
        .fill(0)
        .map((v) => ({
            x: Math.random(),
            y: Math.random(),
            distance: Math.random(),
        })),
    globalDistance: 0,
    time: 0,
};

function initParticles(canvas: HTMLCanvasElement) {
    canvas.height = window.innerHeight;
    canvas.width = window.innerWidth;
    particlesData.canvas = canvas;
    particlesData.ctx = particlesData.canvas.getContext("2d");
}

function renderParticles(speed: number) {
    particlesData.globalDistance = (particlesData.globalDistance + speed) % 1;
    particlesData.time += 0.0025 + 0.05 * speed;

    particlesData.ctx.clearRect(
        0,
        0,
        particlesData.canvas.width,
        particlesData.canvas.height
    );

    for (const particle of particlesData.particles) {
        const finalDistance =
            (particle.distance + particlesData.globalDistance) % 1;

        const coord = getCoordinates(
            particle,
            finalDistance,
            particlesData.time
        );
        const opacity = getOpacityColor(finalDistance);
        particlesData.ctx.fillStyle = opacity;

        particlesData.ctx.beginPath();
        particlesData.ctx.arc(coord.x, coord.y, coord.size, 0, Math.PI * 2);
        particlesData.ctx.fill();
    }
}

function getOpacityColor(distance: number) {
    const opacity = 1 - Math.pow(distance * 2 - 1, 2);

    return `rgba(${255}, ${255}, ${255}, ${opacity})`;
}

type Particle = {
    x: number;
    y: number;
    distance: number;
};

function getCoordinates(particle: Particle, distance: number, time: number) {
    const xOffset = Math.PI * 8 * particle.distance + particle.x + particle.y;
    const yOffset =
        Math.PI / 2 + Math.PI * 6 * particle.distance + particle.x + particle.y;

    let x =
        Math.cos(time + xOffset) * 250 +
        particle.x * particlesData.canvas.width;
    x =
        particlesData.canvas.width / 2 +
        (distance * 0.5 + 0.5) * 2 * (x - particlesData.canvas.width / 2);

    let y =
        Math.cos(time + yOffset) * 100 +
        particle.y * particlesData.canvas.height;
    y =
        particlesData.canvas.height / 2 +
        (distance * 0.75 + 0.25) * 2 * (y - particlesData.canvas.height / 2);

    const size = Math.abs(distance * 4);

    return {
        x,
        y,
        size,
    };
}

export { initParticles, renderParticles };
