
import { GridJson } from "./types.js";
import { Tile, dbJsonToTile } from "./tile.js";

export class Grid {
    width: number;
    height: number;
    tiles: Tile[];
    
    constructor(width: number, height: number, tiles: Tile[]) {
        this.width = width;
        this.height = height;
        this.tiles = tiles;
    }
    
    toJson(): GridJson {
        const tilesData = this.tiles.map((tile) => tile.toDbJson());
        return {
            width: this.width,
            height: this.height,
            tiles: tilesData,
        };
    }
}

export const jsonToGrid = (data: GridJson): Grid => {
    const tiles = data.tiles.map((tileData) => dbJsonToTile(tileData));
    return new Grid(data.width, data.height, tiles);
};


