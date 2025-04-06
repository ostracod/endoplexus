
import * as fs from "fs";
import { WorldJson } from "./types.js";
import { Tile, emptyTile, matterite, energite } from "./tile.js";
import { Grid, jsonToGrid } from "./grid.js";

export class World {
    filePath: string;
    grid: Grid;
    
    constructor(filePath) {
        this.filePath = filePath;
        if (fs.existsSync(this.filePath)) {
            this.readFromFile();
        } else {
            this.initNewContent();
        }
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
            if (Math.random() < 0.02) {
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
            grid: this.grid.toJson(),
        };
        fs.writeFileSync(this.filePath, JSON.stringify(worldData));
    }
}


