
import * as fs from "fs";
import * as pathUtils from "path";
import { WorldJson } from "./types.js";
import { gameDataPath } from "./constants.js";
import { Tile, emptyTile, matterite, energite } from "./tile.js";
import { Grid, jsonToGrid } from "./grid.js";

export class World {
    filePath: string;
    grid: Grid;
    
    constructor(filePath) {
        this.filePath = filePath;
    }
    
    initialize() {
        if (fs.existsSync(this.filePath)) {
            this.readFromFile();
        } else {
            this.initNewContent();
        }
        // TODO: Use world wall tile instead of empty tile for border.
        this.grid.borderTile = emptyTile;
        this.grid.exteriorTile = emptyTile;
    }
    
    readFromFile(): void {
        const worldData = JSON.parse(fs.readFileSync(this.filePath, "utf8")) as WorldJson;
        this.grid = jsonToGrid(worldData.grid);
    }
    
    initNewContent(): void {
        const worldSize = 100;
        const targetLength = worldSize ** 2;
        const tiles: Tile[] = [];
        while (tiles.length < targetLength) {
            let tile: Tile;
            if (Math.random() < 0.1) {
                tile = (Math.random() < 0.5) ? matterite : energite;
            } else {
                tile = emptyTile;
            }
            tiles.push(tile);
        }
        this.grid = new Grid(worldSize, worldSize, tiles);
    }
    
    writeToFile(): void {
        const worldData: WorldJson = {
            grid: this.grid.toDbJson(),
        };
        fs.writeFileSync(this.filePath, JSON.stringify(worldData));
    }
}

const worldPath = pathUtils.join(gameDataPath, "world.json");
export const world = new World(worldPath);


