

const P_TYPE = {
    EMPTY: 0,
    SAND: 1,
    WATER: 2,
    DIRT: 3,
    LAVA: 4,
    STONE: 5,
};

const PARTICLES = {
  [P_TYPE.SAND]: {
    color: "#D6B370",
    update(col, row, grid, move){
        const below = grid[col][row + 1];
        if (below === 0) {
            move(col, row + 1);
            return;
        }

        const direction = Math.random() < 0.49 ? -1 : 1;

        const diagonalA = grid[col + direction]?.[row + 1];
        if (diagonalA === P_TYPE.EMPTY) {
        move(col + direction, row + 1);
        return;
        }

        const diagonalB = grid[col - direction]?.[row + 1];
        if (diagonalB === P_TYPE.EMPTY) {
        move(col - direction, row + 1);
        return;
        }
    }
  },
    [P_TYPE.WATER]: {
        color: "#357EC7",
        update(col, row, grid, move) {
            const randomFactor = Math.random();
            const below = grid[col][row + 1];
            if (below === P_TYPE.EMPTY) {
                move(col, row + 1);
                return;
            }
            const direction = randomFactor < 0.49 ? -1 : 1;

            //moves diagonally down if possible
            const diagonalA = grid[col + direction]?.[row + 1];
            if (diagonalA === P_TYPE.EMPTY) {
                move(col + direction, row + 1);
                return;
            }
            const diagonalB = grid[col - direction]?.[row + 1];
            if (diagonalB === P_TYPE.EMPTY) {
                move(col - direction, row + 1);
                return;
            }
            
            // 20% chance to move sideways to fix water geetting stuck in a single column
            if (randomFactor < 0.2) {
            //move sideways to the left or right
            const sideA = grid[col + direction]?.[row];
            if (sideA === P_TYPE.EMPTY) {
                move(col + direction, row);
                return;
            }

            //move to the other side
            const sideB = grid[col - direction]?.[row];
            if (sideB === P_TYPE.EMPTY) {
                move(col - direction, row);
                return;
            }
            
    }
}
        },
    [P_TYPE.DIRT]: {
        color: '#5A3825',
        update(col, row, grid, move){
            const below = grid[col][row + 1];
            const belowLeftThree = grid[col - 1]?.[row + 2];
            const belowRightThree = grid[col + 1]?.[row + 2];
            if (below === P_TYPE.EMPTY) {
                move(col, row + 1);
                return;
            }
    
            const direction = Math.random() < 0.49 ? -1 : 1;
            
            if (belowLeftThree === P_TYPE.EMPTY) {
            const diagonalA = grid[col + direction]?.[row + 1];
            if (diagonalA === P_TYPE.EMPTY) {
                move(col + direction, row + 1);
                return;
            }
        }
            
            if (belowRightThree === P_TYPE.EMPTY) {
            const diagonalB = grid[col - direction]?.[row + 1];
            if (diagonalB === P_TYPE.EMPTY) {
                move(col - direction, row + 1);
                return;
            }
        }
    }
    },
    [P_TYPE.LAVA]: {
        color: "#FF4500",
        update(col, row, grid, move, nextGrid) {
            // check if lava is next to water 
            if (
                grid[col + 1]?.[row] === P_TYPE.WATER ||
                grid[col - 1]?.[row] === P_TYPE.WATER ||
                grid[col]?.[row + 1] === P_TYPE.WATER ||
                grid[col]?.[row - 1] === P_TYPE.WATER ||
                grid[col + 1]?.[row + 1] === P_TYPE.WATER ||
                grid[col - 1]?.[row + 1] === P_TYPE.WATER ||
                grid[col + 1]?.[row - 1] === P_TYPE.WATER ||
                grid[col - 1]?.[row - 1] === P_TYPE.WATER
            ) {
                nextGrid[col][row] = P_TYPE.STONE;
                return;
            }

            const randomFactor = Math.random();
            const below = grid[col][row + 1];
            if (below === P_TYPE.EMPTY) {
                move(col, row + 1);
                return;
            }
            if (randomFactor < 0.1) {
                const direction = randomFactor < 0.49 ? -1 : 1;
                const diagonalA = grid[col + direction]?.[row];
                if (diagonalA === P_TYPE.EMPTY) {
                    move(col + direction, row);
                    return;
                }
                const diagonalB = grid[col - direction]?.[row];
                if (diagonalB === P_TYPE.EMPTY) {
                    move(col - direction, row);
                    return;
                }
            }
        }
    },
    [P_TYPE.STONE]: {
        color: "#707070",
        update(col, row, grid, move) {
            return;
        }
    },
};