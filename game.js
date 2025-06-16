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

let resulution = 7;

const flowSlider = document.getElementById('flow-slider');
let flowRate = parseInt(flowSlider.value);

const cols = Math.floor(canvas.width / resulution);
const rows = Math.floor(canvas.height / resulution);

let redndered = false;
let isMouseDown = false;
let currentParticleType = P_TYPE.SAND;

function createGrid() {
  return new Array(cols).fill(null)
    .map(() => new Array(rows).fill( P_TYPE.EMPTY ));
}

function createParticleAtMouse(e) {
  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  for (let i = 0; i < flowRate; i++) {
  const gridX = Math.floor((mouseX / resulution) + Math.random() * 3);
  const gridY = Math.floor((mouseY / resulution) + Math.random() * 3);

  if (
    gridX >= 0 && gridX < cols &&
    gridY >= 0 && gridY < rows
  ) {
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
                ctx.fillRect(x * resulution, y * resulution, resulution, resulution);
            }
        }
    }
}

const renderingGrid = createGrid();
function mapParticleToRenderGrid(particle) {
    switch(particle) {
        case P_TYPE.EMPTY:
            return Math.random() < 0.0025 ? C_TYPE.EMPTY_STAR : 
                   Math.random() < 0.001 ? C_TYPE.EMPTY_STAR_LIGHT : C_TYPE.EMPTY_BASE;
        case P_TYPE.SAND:
            return Math.random() < 0.9 ? C_TYPE.SAND_BASE : 
                   Math.random() < 0.5 ? C_TYPE.SAND_LIGHT : C_TYPE.SAND_DARK;
        case P_TYPE.WATER:
            return C_TYPE.WATER_BASE;
        case P_TYPE.DIRT:
            return Math.random() < 0.86 ? C_TYPE.DIRT_BASE : 
                   Math.random() < 0.3 ? C_TYPE.DIRT_LIGHT : 
                   Math.random() < 0.03 ? C_TYPE.STONE_LIGHT : 
                   Math.random() < 0.05 ? C_TYPE.STONE_DARK : C_TYPE.DIRT_DARK;
        case P_TYPE.LAVA:
            return Math.random() < 0.7 ? C_TYPE.LAVA_BASE : 
                   Math.random() < 0.5 ? C_TYPE.LAVA_GLOW : C_TYPE.LAVA_DARK;
        case P_TYPE.STONE:
            return Math.random() < 0.7 ? C_TYPE.STONE_BASE : 
                   Math.random() < 0.5 ? C_TYPE.STONE_LIGHT : C_TYPE.STONE_DARK;
        default:
            return C_TYPE.EMPTY_BASE;
    }
}

function render() {
    // mapping particles to rendering grid
    for (let x = 0; x < cols; x++) {
        for (let y = 0; y < rows; y++) {
            let particle = grid[x][y];
            renderingGrid[x][y] = mapParticleToRenderGrid(particle);
        }
    }

    // adding grass and trees
    for (let x = 0; x < cols; x++) {
        //determens how deep the grass goes
        let deepGrass = 3;

        for (let y = 0; y < rows; y++) {
            let particle = renderingGrid[x][y];
            
            // adding grass
            if (particle >= C_TYPE.DIRT_BASE && particle <= C_TYPE.DIRT_DARK && deepGrass > 0) {
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

                // adding trees
                if (Math.random() < 0.009 && deepGrass ==2) {
                    const treeHeight = Math.floor(Math.random() * 5) + 5;

                    for (let i = 0; i < treeHeight; i++) {
                        renderingGrid[x][y - i] = C_TYPE.TREE_TRUNK;
                    }
                    
                    renderingGrid[x][y - treeHeight] = C_TYPE.TREE_FOLIAGE;
                    renderingGrid[x][y - treeHeight + 1] = C_TYPE.TREE_HIGHLIGHT;
                    renderingGrid[x][y - treeHeight + 2] = C_TYPE.TREE_SHADOW;
                    renderingGrid[x + 1][y - treeHeight] = C_TYPE.TREE_FOLIAGE;
                    renderingGrid[x + 1][y - treeHeight + 1] = C_TYPE.TREE_HIGHLIGHT;
                    renderingGrid[x - 1][y - treeHeight] = C_TYPE.TREE_FOLIAGE;
                    renderingGrid[x - 1][y - treeHeight + 1] = C_TYPE.TREE_HIGHLIGHT;

                    if (Math.random() < 0.5) renderingGrid[x + 1][y - treeHeight + 2] = C_TYPE.TREE_SHADOW;

                    if (Math.random() < 0.5) renderingGrid[x - 1][y - treeHeight + 2] = C_TYPE.TREE_SHADOW;
                    
                }
            }

            //adding animals
            if (
                particle >= C_TYPE.DIRT_BASE &&
                particle <= C_TYPE.DIRT_DARK &&
                Math.random() < 0.01 &&
                renderingGrid[x - 1][y] === C_TYPE.EMPTY_BASE
                ) {
                renderingGrid[x][y] = C_TYPE.ANIMAL_BASE;           
                renderingGrid[x + 1][y] = C_TYPE.ANIMAL_SHADOW;     
                renderingGrid[x - 1][y] = C_TYPE.ANIMAL_SHADOW;     
                renderingGrid[x][y - 1] = C_TYPE.ANIMAL_DETAIL;     
                renderingGrid[x - 1][y - 1] = C_TYPE.ANIMAL_DETAIL; 
                renderingGrid[x][y + 1] = C_TYPE.ANIMAL_SHADOW;     
                renderingGrid[x + 1][y + 1] = C_TYPE.ANIMAL_SHADOW; 
            }


            //adding flowers
            if (particle >= C_TYPE.DIRT_BASE && particle <= C_TYPE.DIRT_DARK && Math.random() < 0.01 
            && renderingGrid[x - 1][y] === C_TYPE.EMPTY_BASE) {
                renderingGrid[x][y] = C_TYPE.FLOWER_BASE;
                renderingGrid[x + 1][y] = C_TYPE.FLOWER_CENTER;
                renderingGrid[x - 1][y] = C_TYPE.FLOWER_PINK;
                renderingGrid[x][y - 1] = C_TYPE.FLOWER_PINK;
            }

            //adding fish
            if (
                particle >= C_TYPE.WATER_BASE &&
                particle <= C_TYPE.WATER_DARK &&
                Math.random() < 0.001 &&
                x > 1 && x < cols - 2 &&
                y > 0 && y < rows - 1
                ) {
                renderingGrid[x][y] = C_TYPE.FISH_BASE;            // Fish body center
                renderingGrid[x + 1][y] = C_TYPE.FISH_LIGHT;        // Front/head
                renderingGrid[x + 2][y] = C_TYPE.FISH_LIGHT;        // Nose or fin
                renderingGrid[x - 1][y] = C_TYPE.FISH_DARK;         // Back
                renderingGrid[x - 2][y] = C_TYPE.FISH_DARK;         // Tail
                renderingGrid[x][y - 1] = C_TYPE.FISH_LIGHT;        // Top fin
                renderingGrid[x][y + 1] = C_TYPE.FISH_DARK;         // Bottom fin
            }


        }
    }

    //redering the grid
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let x = 0; x < cols; x++) {
        for (let y = 0; y < rows; y++) {
            const particle = renderingGrid[x][y];
            ctx.fillStyle = PARTICLE_COLORS[particle];
            ctx.fillRect(x * resulution, y * resulution, resulution, resulution);
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
