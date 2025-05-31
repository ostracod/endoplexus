
import { GridDbJson } from "./types.js";
import { Pos, GridClientJson } from "../common/types.js";
import { Tile, emptyTile, dbJsonToTile } from "./tile.js";

export class Grid {
    width: number;
    height: number;
    tiles: Tile[];
    borderTile: Tile | null;
    exteriorTile: Tile | null;
    
    constructor(width: number, height: number, tiles: Tile[]) {
        this.width = width;
        this.height = height;
        this.tiles = tiles;
        this.borderTile = null;
        this.exteriorTile = null;
    }
    
    containsPos(pos: Pos): boolean {
        return (pos.x >= 0 && pos.x < this.width && pos.y >= 0 && pos.y < this.height);
    }
    
    borderContainsPos(pos: Pos): boolean {
        return (pos.x === -1 || pos.x === this.width || pos.y === -1 || pos.y === this.height);
    }
    
    getTileIndex(pos: Pos) {
        return pos.x + pos.y * this.width;
    }
    
    getTile(pos: Pos): Tile | null {
        if (this.containsPos(pos)) {
            const index = this.getTileIndex(pos);
            return this.tiles[index];
        } else if (this.borderTile !== null && this.borderContainsPos(pos)) {
            return this.borderTile;
        } else {
            return this.exteriorTile;
        }
    }
    
    getSubgrid(startPos: Pos, width: number, height: number): Grid {
        const pos: Pos = { x: 0, y: 0 };
        const tiles: Tile[] = [];
        for (let offsetY = 0; offsetY < height; offsetY++) {
            pos.y = startPos.y + offsetY;
            for (let offsetX = 0; offsetX < width; offsetX++) {
                pos.x = startPos.x + offsetX;
                const tile = this.getTile(pos);
                tiles.push(tile);
            }
        }
        return new Grid(width, height, tiles);
    }
    
    toDbJson(): GridDbJson {
        const tilesData = this.tiles.map((tile) => tile.toDbJson());
        return {
            width: this.width,
            height: this.height,
            tiles: tilesData,
        };
    }
    
    toClientJson(): GridClientJson {
        const tilesData = this.tiles.map((tile) => tile.toClientJson());
        return {
            width: this.width,
            height: this.height,
            tiles: tilesData,
        };
    }
}

export const jsonToGrid = (data: GridDbJson): Grid => {
    const tiles = data.tiles.map((tileData) => dbJsonToTile(tileData));
    return new Grid(data.width, data.height, tiles);
};


