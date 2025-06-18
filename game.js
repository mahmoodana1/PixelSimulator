const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

const buttons = {
  sand: document.getElementById('sand-btn'),
  water: document.getElementById('water-btn'),
  dirt: document.getElementById('dirt-btn'),
  lava: document.getElementById('lava-btn'),
  erase: document.getElementById('erase-btn'),
  eraseAll: document.getElementById('erase-all-btn'),
  render: document.getElementById('render-btn')
};

let resolution = 8;

const flowSlider = document.getElementById('flow-slider');
let flowRate = parseInt(flowSlider.value);

const cols = Math.floor(canvas.width / resolution);
const rows = Math.floor(canvas.height / resolution);

let redndered = false;
let isMouseDown = false;
let currentParticleType = P_TYPE.SAND;

function createGrid() {
    return new Array(Math.floor(canvas.width / resolution)).fill(null)
        .map(() => new Array(rows).fill( P_TYPE.EMPTY ));
}

function createRenderGrid() {
    const renderCols = Math.floor(canvas.width / 4);
    const renderRows = Math.floor(canvas.height / 4);
    return new Array(renderCols).fill(null)
        .map(() => new Array(renderRows).fill(C_TYPE.EMPTY_BASE));
}

function createParticleAtMouse(e) {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    for (let i = 0; i < flowRate; i++) {
        // Calculate base grid position
        const baseGridX = Math.floor(mouseX / resolution);
        const baseGridY = Math.floor(mouseY / resolution);
        
        // Add random offset (-1 to 1)
        const offsetX = Math.floor(Math.random() * 3) - 1;
        const offsetY = Math.floor(Math.random() * 3) - 1;
        
        const gridX = baseGridX + offsetX;
        const gridY = baseGridY + offsetY;

        // Check bounds after applying offset
        if (gridX >= 0 && gridX < cols && gridY >= 0 && gridY < rows) {
            grid[gridX][gridY] = currentParticleType;
        }
    }
}

// event listeners 
buttons.sand.addEventListener('click', () => setActiveParticle(P_TYPE.SAND, buttons.sand));
buttons.water.addEventListener('click', () => setActiveParticle(P_TYPE.WATER, buttons.water));
buttons.dirt.addEventListener('click', () => setActiveParticle(P_TYPE.DIRT, buttons.dirt));
buttons.lava.addEventListener('click', () => setActiveParticle(P_TYPE.LAVA, buttons.lava));
buttons.erase.addEventListener('click', () => setActiveParticle(P_TYPE.EMPTY, buttons.erase));
buttons.eraseAll.addEventListener('click', () => {
    grid = createGrid();
    drawGrid(grid);
}
);
buttons.render.addEventListener('click', () => {
    redndered = !redndered;
    if (redndered) {
        mapRegularGridToRenderGrid(); // Update the rendering grid with current particles
        render();        
    }
}
);

canvas.addEventListener('mousedown', () => {
    isMouseDown = true;
});

canvas.addEventListener('mouseup', () => {
    isMouseDown = false;
});

canvas.addEventListener('mousemove', (e) => {
    if (!isMouseDown) return;
    createParticleAtMouse(e); 
});

// Touch event handlers
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    isMouseDown = true;
    const touch = e.touches[0];
    createParticleAtMouse(touch);
}, { passive: false });

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    if (!isMouseDown) return;
    const touch = e.touches[0];
    createParticleAtMouse(touch);
}, { passive: false });

canvas.addEventListener('touchend', (e) => {
    e.preventDefault();
    isMouseDown = false;
}, { passive: false });

canvas.addEventListener('touchcancel', (e) => {
    e.preventDefault();
    isMouseDown = false;
}, { passive: false });

flowSlider.addEventListener('input', () => {
    flowRate = parseInt(flowSlider.value);
    document.getElementById('flow-number').textContent = flowRate;
});

// functions
function setActiveParticle(type, activeBtn) {
    currentParticleType = type;
    Object.values(buttons).forEach(btn => btn.classList.remove('active'));
    activeBtn.classList.add('active');
}

let grid = createGrid();
function update() {
    const nextGrid = createGrid();

    for (let y = rows - 1; y >= 0; y--) {
        for (let x = 0; x < cols; x++) {
            const particle = grid[x][y];
            if (particle === P_TYPE.EMPTY) continue;

            const par = PARTICLES[particle];

            let moved = false;

            // pass nextGrid to update so the interactions work properly
                par.update(x, y, grid, (newX, newY) => {
                    nextGrid[newX][newY] = particle;
                    moved = true;
                }, nextGrid);

            if (!moved && nextGrid[x][y] === P_TYPE.EMPTY) {
                nextGrid[x][y] = particle;
            }
        }
    }

    grid = nextGrid;
}

function drawGrid(gridToDraw) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let x = 0; x < cols; x++) {
        for (let y = 0; y < rows; y++) {
            const particle = gridToDraw[x][y];
            if (particle !== P_TYPE.EMPTY) {
                ctx.fillStyle = PARTICLES[particle].color;
                ctx.fillRect(x * resolution, y * resolution, resolution, resolution);
            }
        }
    }
}

function mapParticleToRenderGrid(particle) {
    switch(particle) {
        case P_TYPE.EMPTY:
            return Math.random() < 0.0005 ? C_TYPE.EMPTY_STAR : 
                   Math.random() < 0.0005 ? C_TYPE.EMPTY_STAR_LIGHT : C_TYPE.EMPTY_BASE;
        case P_TYPE.SAND:
            return Math.random() < 0.9 ? C_TYPE.SAND_BASE : 
                   Math.random() < 0.5 ? C_TYPE.SAND_LIGHT : C_TYPE.SAND_DARK;
        case P_TYPE.WATER:
            return Math.random() < 0.95 ? C_TYPE.WATER_BASE :
                   Math.random() < 0.5 ? C_TYPE.WATER_LIGHT : C_TYPE.WATER_DARK;
        case P_TYPE.DIRT:
            return Math.random() < 0.86 ? C_TYPE.DIRT_BASE : 
            Math.random() < 0.3 ? C_TYPE.DIRT_LIGHT : 
            Math.random() < 0.03 ? C_TYPE.STONE_LIGHT : 
                   Math.random() < 0.05 ? C_TYPE.STONE_DARK : C_TYPE.DIRT_DARK;
        case P_TYPE.LAVA:
            return C_TYPE.LAVA_BASE;
        case P_TYPE.STONE:
            return Math.random() < 0.7 ? C_TYPE.STONE_BASE : 
            Math.random() < 0.5 ? C_TYPE.STONE_LIGHT : C_TYPE.STONE_DARK;
            default:
                return C_TYPE.EMPTY_BASE;
            }
        }


let renderingGrid = createRenderGrid();
function mapRegularGridToRenderGrid() {
    let rGrid = createRenderGrid();
    const maxX = rGrid.length;
    const maxY = rGrid[0].length;

    for (let x = 0; x < cols; x++) {
        for (let y = 0; y < rows; y++) {
            const xGrid = x * 2;
            const yGrid = y * 2;
            
            if (xGrid < maxX && yGrid < maxY) {
                const particle = grid[x][y];
                rGrid[xGrid][yGrid] = mapParticleToRenderGrid(particle);
                
                if (xGrid + 1 < maxX) {
                    rGrid[xGrid + 1][yGrid] = mapParticleToRenderGrid(particle);
                }
                if (yGrid + 1 < maxY) {
                    rGrid[xGrid][yGrid + 1] = mapParticleToRenderGrid(particle);
                }
                if (xGrid + 1 < maxX && yGrid + 1 < maxY) {
                    rGrid[xGrid + 1][yGrid + 1] = mapParticleToRenderGrid(particle);
                }
            }
        }
    }

    renderingGrid = rGrid;
}
    
function render() {
    mapRegularGridToRenderGrid();
    
    // adding grass//trees/animals/flowers/fish/palm trees/lava GLow
    for (let x = 1; x < renderingGrid.length; x++) {
        //determens how deep the grass goes
        let deepGrass = 3;
        for (let y = 0; y < renderingGrid[0].length; y++) {
            let particle = renderingGrid[x][y];
            
            // adding grass
            if (particle >= C_TYPE.DIRT_BASE && particle <= C_TYPE.DIRT_DARK && deepGrass > 0 
                && renderingGrid[x][y - 1] === C_TYPE.EMPTY_BASE) {
                if (Math.random() < 0.5) {
                    renderingGrid[x][y] = C_TYPE.GRASS_LIGHT;
                    deepGrass--;
                } else if (Math.random() < 0.3) {
                    renderingGrid[x][y] = C_TYPE.GRASS_BASE;
                    deepGrass--;
                } else if (Math.random() < 0.2) {
                    renderingGrid[x][y] = C_TYPE.GRASS_DARK;
                    deepGrass--;
                }

                // trees
                if (Math.random() < 0.009 && deepGrass === 2) {
                const treeHeight = Math.floor(Math.random() * 8) + 24;
                const trunkHalfWidth = 1; 
                const canopyTop = y - treeHeight;

                // trunk
                for (let i = 0; i < treeHeight; i++) {
                    for (let j = -trunkHalfWidth; j <= trunkHalfWidth; j++) {
                        const barkType = Math.random() < 0.5 ? C_TYPE.DIRT_DARK : C_TYPE.DIRT_LIGHT;
                        renderingGrid[x + j][y - i] = barkType;
                    }
                }

                // Bigger canopy
                const canopyRadiusX = 6 + Math.floor(Math.random() * 2);  // wider: 13–15 total width
                const canopyHeight = 10 + Math.floor(Math.random() * 3);  // taller: 10–12 total height

                for (let dx = -canopyRadiusX; dx <= canopyRadiusX; dx++) {
                    for (let dy = -2; dy < canopyHeight; dy++) {
                        const chance = Math.random();
                        const cx = x + dx;
                        const cy = canopyTop + dy;

                        if (chance < 0.6) {
                            renderingGrid[cx][cy] = C_TYPE.TREE_FOLIAGE;
                        } else if (chance < 0.85) {
                            renderingGrid[cx][cy] = C_TYPE.TREE_HIGHLIGHT;
                        } else {
                            renderingGrid[cx][cy] = C_TYPE.TREE_SHADOW;
                        }
                    }
                }
                if (Math.random() < 0.5) {
                    renderingGrid[x][canopyTop - 1] = C_TYPE.TREE_HIGHLIGHT;
                }

                }

            }

            //adding animals
            if (
                particle >= C_TYPE.DIRT_BASE &&
                particle <= C_TYPE.DIRT_DARK &&
                Math.random() < 0.01 &&
                renderingGrid[x][y - 1] === C_TYPE.EMPTY_BASE &&
                x > 2 && x < renderingGrid.length - 3 && y > 2 && y < renderingGrid[0].length - 2
            ) {
                // Legs
                renderingGrid[x - 1][y + 1] = C_TYPE.ANIMAL_SHADOW;
                renderingGrid[x + 1][y + 1] = C_TYPE.ANIMAL_SHADOW;

                // Body (wool)
                renderingGrid[x - 1][y] = C_TYPE.ANIMAL_BASE;
                renderingGrid[x][y] = C_TYPE.ANIMAL_BASE;
                renderingGrid[x + 1][y] = C_TYPE.ANIMAL_BASE;

                // Top wool fluff
                renderingGrid[x][y - 1] = C_TYPE.ANIMAL_DETAIL;
                renderingGrid[x - 1][y - 1] = C_TYPE.ANIMAL_DETAIL;
                renderingGrid[x + 1][y - 1] = C_TYPE.ANIMAL_DETAIL;

                // Head (in front of body)
                renderingGrid[x + 2][y] = C_TYPE.ANIMAL_DETAIL;
                renderingGrid[x + 2][y - 1] = C_TYPE.ANIMAL_DETAIL;

                // Horn or ear (optional)
                if (Math.random() < 0.5) renderingGrid[x + 2][y - 2] = C_TYPE.ANIMAL_DETAIL;
            }

            //adding gazel
            if (
                particle >= C_TYPE.DIRT_BASE &&
                particle <= C_TYPE.DIRT_DARK &&
                renderingGrid[x - 1][y] === C_TYPE.EMPTY_BASE &&
                Math.random() < 0.005
            ) {
                // Rear legs
                renderingGrid[x + 1][y] = C_TYPE.GAZEL_SHADOW;
                renderingGrid[x + 1][y - 1] = C_TYPE.GAZEL_SHADOW;

                // Front legs
                renderingGrid[x + 5][y] = C_TYPE.GAZEL_SHADOW;
                renderingGrid[x + 5][y - 1] = C_TYPE.GAZEL_SHADOW;

                // Body (arched and longer)
                renderingGrid[x + 2][y - 2] = C_TYPE.GAZEL_BASE;
                renderingGrid[x + 3][y - 2] = C_TYPE.GAZEL_LIGHT;
                renderingGrid[x + 4][y - 2] = C_TYPE.GAZEL_LIGHT;

                // Back / shoulder hump
                renderingGrid[x + 3][y - 3] = C_TYPE.GAZEL_BASE;

                // Neck (slanted forward)
                renderingGrid[x + 5][y - 2] = C_TYPE.GAZEL_BASE;
                renderingGrid[x + 6][y - 3] = C_TYPE.GAZEL_BASE;

                // Head
                renderingGrid[x + 7][y - 3] = C_TYPE.GAZEL_BASE;

                // Eye (optional detail)
                renderingGrid[x + 7][y - 4] = C_TYPE.GAZEL_LIGHT;

                // Antlers (stylized curve)
                renderingGrid[x + 6][y - 4] = C_TYPE.GAZEL_HORN;
                renderingGrid[x + 7][y - 5] = C_TYPE.GAZEL_HORN;
            }

            // flowers
            if (
                particle >= C_TYPE.DIRT_BASE &&
                particle <= C_TYPE.DIRT_DARK &&
                Math.random() < 0.01 &&
                renderingGrid[x][y - 1] === C_TYPE.EMPTY_BASE
            ) {
                // Stem
                renderingGrid[x][y - 1] = C_TYPE.FLOWER_STEM;

                // Center of flower
                renderingGrid[x][y - 2] = C_TYPE.FLOWER_CENTER;

                // Petals
                renderingGrid[x - 1][y - 2] = C_TYPE.FLOWER_PINK;
                renderingGrid[x + 1][y - 2] = C_TYPE.FLOWER_PINK;
                renderingGrid[x][y - 3] = C_TYPE.FLOWER_PINK;
            }
            // Add pixel flowers on top of dirt
            if (
                particle >= C_TYPE.DIRT_BASE &&
                particle <= C_TYPE.DIRT_DARK &&
                Math.random() < 0.01 &&
                renderingGrid[x][y - 1] === C_TYPE.EMPTY_BASE
            ) {
                // Stem
                renderingGrid[x][y - 1] = C_TYPE.FLOWER_STEM;

                // Center of flower
                renderingGrid[x][y - 2] = C_TYPE.FLOWER_CENTER;

                // Petals
                renderingGrid[x - 1][y - 2] = C_TYPE.FLOWER_PINK;
                renderingGrid[x + 1][y - 2] = C_TYPE.FLOWER_PINK;
                renderingGrid[x][y - 3] = C_TYPE.FLOWER_PINK;
            }


            // fish
            if (
                particle >= C_TYPE.WATER_BASE &&
                particle <= C_TYPE.WATER_DARK &&
                Math.random() < 0.005 &&
                x > 2 && x < renderingGrid.length - 2 &&
                y > 1 && y < renderingGrid[0].length - 2 &&
                renderingGrid[x][y] === C_TYPE.WATER_BASE
            ) {
                const facingRight = Math.random() < 0.5;

                if (facingRight) {
                    // Fish facing right →
                    renderingGrid[x][y] = C_TYPE.FISH_BASE;
                    renderingGrid[x + 1][y] = C_TYPE.FISH_LIGHT;    // front
                    renderingGrid[x - 1][y] = C_TYPE.FISH_DARK;     // tail
                    renderingGrid[x][y + 1] = C_TYPE.FISH_LIGHT;    // fin
                    renderingGrid[x + 1][y - 1] = C_TYPE.FISH_DARK; // eye
                } else {
                    // Fish facing left ←
                    renderingGrid[x][y] = C_TYPE.FISH_BASE;
                    renderingGrid[x - 1][y] = C_TYPE.FISH_LIGHT;    // front
                    renderingGrid[x + 1][y] = C_TYPE.FISH_DARK;     // tail
                    renderingGrid[x][y + 1] = C_TYPE.FISH_LIGHT;    // fin
                    renderingGrid[x - 1][y - 1] = C_TYPE.FISH_DARK; // eye
                }
            }

            // add seaweed
            if (
                particle >= C_TYPE.WATER_BASE &&
                particle <= C_TYPE.WATER_DARK &&
                Math.random() < 0.01 &&
                renderingGrid[x][y + 1] !== C_TYPE.WATER_BASE &&
                x > 2 && x < renderingGrid.length - 2 &&
                y > 1 && y < renderingGrid[0].length - 2
            ) {
                const height = Math.floor(Math.random() * 3) + 2; // random height between 2 and 4
                for (let i = 0; i < height; i++) {
                    renderingGrid[x][y - i] = C_TYPE.TREE_FOLIAGE;
                }
            }

            //palm trees
            if (
                particle === C_TYPE.SAND_BASE &&
                Math.random() < 0.003 &&
                renderingGrid[x][y - 1] == P_TYPE.EMPTY
            ) {
                const trunkHeight = 15; // Fixed height
                const curveDirection = Math.random() < 0.5 ? -1 : 1;
                let currentX = x;
                let currentY = y;

                // Trunk with late bend (only top 20% bends)
                for (let i = 0; i < trunkHeight; i++) {
                    if (i > trunkHeight * 0.8) {
                        currentX += curveDirection;
                    }
                    currentY -= 1;

                    renderingGrid[currentX][currentY] = Math.floor(Math.random() * 10) % 2 === 0 ? C_TYPE.PALM_TRUNK : C_TYPE.PALM_TRUNK_SHADOW;;
                    renderingGrid[currentX + 1][currentY] = Math.floor(Math.random() * 10) % 2 === 0 ? C_TYPE.PALM_TRUNK : C_TYPE.PALM_TRUNK_SHADOW;;
                }

                const baseX = currentX;
                const baseY = currentY - 1;

                // Generate 5–7 dense, short arched fronds
                const leafCount = 5 + Math.floor(Math.random() * 3); // 5–7
                const angles = [-2, -1, 0, 1, 2]; // tight spread
                const selectedOffsets = angles
                    .sort(() => 0.5 - Math.random())
                    .slice(0, leafCount)
                    .sort((a, b) => a - b);

                for (let offset of selectedOffsets) {
                    for (let j = 0; j <= 4; j++) {
                        const progress = j / 4;
                        const curveAmount = -Math.sin(progress * Math.PI); // up then down
                        const lx = baseX + offset * j;
                        const ly = baseY + Math.round(curveAmount * 2); // tight arc

                        const color = j % 2 === 0 ? C_TYPE.PALM_LEAF : C_TYPE.PALM_LEAF_LIGHT;
                        renderingGrid[lx][ly] = color;
                    }
                }

                // Optional coconuts
                if (Math.random() < 0.4) {
                    renderingGrid[baseX][baseY + 1] = C_TYPE.PALM_TRUNK_SHADOW;
                    renderingGrid[baseX + 1][baseY + 1] = C_TYPE.PALM_TRUNK_SHADOW;
                }
            }

            // lava Glow
            if (renderingGrid[x][y] === C_TYPE.LAVA_BASE) {
                const isLava = (v) =>
                    v === C_TYPE.LAVA_BASE ||
                    v === C_TYPE.LAVA_DARK ||
                    v === C_TYPE.LAVA_GLOW;

                const inBounds = (x, y) =>
                    x >= 0 && x < renderingGrid.length &&
                    y >= 0 && y < renderingGrid[0].length;

                const checkGlow =
                    inBounds(x, y - 6) && isLava(renderingGrid[x][y - 6]) &&
                    inBounds(x, y + 6) && isLava(renderingGrid[x][y + 6]) &&
                    inBounds(x + 10, y) && isLava(renderingGrid[x + 10][y]) &&
                    inBounds(x - 10, y) && isLava(renderingGrid[x - 10][y]);

                const checkDark =
                    inBounds(x, y - 4) && isLava(renderingGrid[x][y - 4]) &&
                    inBounds(x, y + 4) && isLava(renderingGrid[x][y + 4]) &&
                    inBounds(x + 4, y) && isLava(renderingGrid[x + 4][y]) &&
                    inBounds(x - 4, y) && isLava(renderingGrid[x - 4][y]);

                if (checkGlow) {
                    renderingGrid[x][y] = C_TYPE.LAVA_GLOW;
                } else if (checkDark) {
                    renderingGrid[x][y] = C_TYPE.LAVA_DARK;
                } else {
                    renderingGrid[x][y] = C_TYPE.LAVA_BASE;
                }
            }

            //birds
            if (
                renderingGrid[x][y] === C_TYPE.EMPTY_BASE &&
                Math.random() < 0.0002 && 
                !(y < renderingGrid[0].length / 3)
            ) {
                const direction = Math.random() < 0.5 ? 'right' : 'left';

                if (
                    x > 2 && x < renderingGrid.length - 2 &&
                    y > 1 && y < renderingGrid[0].length - 1
                ) {
                    if (direction === 'right') {
                        // Bird facing right, M shape
                        renderingGrid[x - 2][y + 1] = C_TYPE.BIRD_WING;
                        renderingGrid[x - 1][y]     = C_TYPE.BIRD_BODY;
                        renderingGrid[x][y + 1]     = C_TYPE.BIRD_BODY;
                        renderingGrid[x + 1][y]     = C_TYPE.BIRD_BODY;
                        renderingGrid[x + 2][y + 1] = C_TYPE.BIRD_WING;
                    } else {
                        // Bird facing left, mirror M
                        renderingGrid[x + 2][y + 1] = C_TYPE.BIRD_WING;
                        renderingGrid[x + 1][y]     = C_TYPE.BIRD_BODY;
                        renderingGrid[x][y - 1]     = C_TYPE.BIRD_BODY;
                        renderingGrid[x - 1][y]     = C_TYPE.BIRD_BODY;
                        renderingGrid[x - 2][y + 1] = C_TYPE.BIRD_WING;
                    }
                }
            }

        }
    }
    
    //moom
    const moonRadius = 80;

    // 🌙 Push moon partially offscreen (top-right)
    const moonCenterX = renderingGrid.length + moonRadius - 100 / 2 - 5;
    const moonCenterY = 0 - moonRadius + 100/ 2 + 5;

    // 🎯 Generate crater positions
    const craterCount = 60;
    const craters = [];
    for (let i = 0; i < craterCount; i++) {
        const angle = Math.random() * Math.PI * 0.5 + Math.PI / 2; // lower-left quadrant only
        const r = Math.random() * (moonRadius - 10);
        const cx = Math.floor(moonCenterX + Math.cos(angle) * r);
        const cy = Math.floor(moonCenterY + Math.sin(angle) * r);
        const size = 2 + Math.floor(Math.random() * 3); // size 2–4
        craters.push({ cx, cy, size });
    }

    // 🌕 Draw bottom-left quarter of the moon
    for (let dx = -moonRadius; dx <= 0; dx++) {
        for (let dy = 0; dy <= moonRadius; dy++) {
            const x = moonCenterX + dx; 
            const y = moonCenterY + dy;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (
                x >= 0 && x < renderingGrid.length &&
                y >= 0 && y < renderingGrid[0].length &&
                dist <= moonRadius
            ) {
                // Draw craters if nearby
                let craterPlaced = false;

                for (const { cx, cy, size } of craters) {
                    const craterDist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
                    if (craterDist < size) {
                        renderingGrid[x][y] = craterDist < size - 1
                            ? C_TYPE.MOON_CRATER_DARK
                            : C_TYPE.MOON_CRATER_LIGHT;
                        craterPlaced = true;
                        break;
                    }
                }

                if (!craterPlaced) {
                    if (dist > moonRadius - 1.5) {
                        renderingGrid[x][y] = C_TYPE.MOON_EDGE;
                    } else if (dist > moonRadius - 6) {
                        renderingGrid[x][y] = C_TYPE.MOON_SHADE;
                    } else {
                        renderingGrid[x][y] = C_TYPE.MOON_FILL;
                    }
                }
            }
        }
    }

    //rendering rays from the moon
    const isRayAvailable = (v) => (
        v === C_TYPE.EMPTY_BASE ||
        v === C_TYPE.EMPTY_STAR ||
        v === C_TYPE.EMPTY_STAR_LIGHT ||
        v === C_TYPE.BIRD_BODY ||
        v === C_TYPE.BIRD_WING ||
        v === C_TYPE.MOON_EDGE || 
        v === C_TYPE.MOON_SHADE ||
        v === C_TYPE.MOON_CRATER_DARK || 
        v === C_TYPE.MOON_CRATER_LIGHT || 
        v === C_TYPE.MOON_FILL || 
        v === C_TYPE.MOON_RAY
    );
    const doesRenderWithRay = (v) => (
        v === C_TYPE.EMPTY_STAR ||
        v === C_TYPE.EMPTY_STAR_LIGHT ||
        v === C_TYPE.BIRD_BODY ||
        v === C_TYPE.BIRD_WING ||
        v === C_TYPE.MOON_EDGE || 
        v === C_TYPE.MOON_SHADE ||
        v === C_TYPE.MOON_CRATER_DARK || 
        v === C_TYPE.MOON_CRATER_LIGHT || 
        v === C_TYPE.MOON_FILL || 
        v === C_TYPE.MOON_RAY
    );

    for (let y = 0; y < renderingGrid[0].length; y++) {
        if (y > 200){

            console.log(y)
        }
        for (let x = 0; x < renderingGrid.length; x++) {
            if ((x === renderingGrid.length - 1 && y < 80) || renderingGrid[x][y] == C_TYPE.MOON_SHADE) {
                for (let rayX = x - 2, rayY = y; rayX >= 2 && rayY < renderingGrid[0].length - 2; rayY++, rayX = rayX - 2) {
                    if (
                    isRayAvailable(renderingGrid[rayX][rayY]) &&
                    isRayAvailable(renderingGrid[rayX - 1][rayY])
                    ) {
                        if (
                            doesRenderWithRay(renderingGrid[rayX][rayY]) ||
                            doesRenderWithRay(renderingGrid[rayX - 1][rayY])
                        )
                        {
                            continue;
                        }else {
                            renderingGrid[rayX][rayY] = C_TYPE.MOON_RAY;
                            renderingGrid[rayX - 1][rayY] = C_TYPE.MOON_RAY;
                        }
                    } else {
                        break;
                    }
                }
            }
        }
    }





    //rendering the grid
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let x = 0; x < renderingGrid.length; x++) {
        for (let y = 0; y < renderingGrid[0].length; y++) {
            const particle = renderingGrid[x][y];
            ctx.fillStyle = PARTICLE_COLORS[particle];
            ctx.fillRect(x * 4, y * 4, 4, 4);
        }
    }
}

function gameLoop() {
    if (!redndered) {
        update();
        drawGrid(grid);
    }
    requestAnimationFrame(gameLoop);
}

gameLoop();
