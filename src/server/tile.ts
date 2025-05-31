
import { TileDbJson, ComplexTileDbJson } from "./types.js";
import { TileClientJson } from "../common/types.js";
import { tileTypeIds } from "../common/constants.js";

type ComplexTileDeserializer = (data: ComplexTileDbJson) => Tile;

export abstract class Tile {
    
    constructor() {
        // Do nothing.
    }
    
    abstract getTypeId(): number;
    
    abstract toDbJson(): TileDbJson;
    
    abstract toClientJson(): TileClientJson;
}

export class EmptyTile extends Tile {
    
    getTypeId(): number {
        return tileTypeIds.empty;
    }
    
    toDbJson(): TileDbJson {
        return this.getTypeId();
    }
    
    toClientJson(): TileClientJson {
        return this.getTypeId();
    }
}

export const emptyTile = new EmptyTile();

export class Matterite extends Tile {
    
    getTypeId(): number {
        return tileTypeIds.matterite;
    }
    
    toDbJson(): TileDbJson {
        return this.getTypeId();
    }
    
    toClientJson(): TileClientJson {
        return this.getTypeId();
    }
}

export const matterite = new Matterite();

export class Energite extends Tile {
    
    getTypeId(): number {
        return tileTypeIds.energite;
    }
    
    toDbJson(): TileDbJson {
        return this.getTypeId();
    }
    
    toClientJson(): TileClientJson {
        return this.getTypeId();
    }
}

export const energite = new Energite();

const simpleTiles = [emptyTile, matterite, energite];
const simpleTileMap = new Map<number, Tile>();
for (const tile of simpleTiles) {
    simpleTileMap.set(tile.getTypeId(), tile);
}

const complexDeserializerMap = new Map<number, ComplexTileDeserializer>([]);

export const dbJsonToTile = (data: TileDbJson): Tile => {
    if (typeof data === "number") {
        return simpleTileMap.get(data);
    } else {
        const deserializer = complexDeserializerMap.get(data.typeId);
        return deserializer(data);
    }
};


