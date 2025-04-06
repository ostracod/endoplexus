
import { TileDbJson, ComplexTileDbJson } from "./types.js";

type ComplexTileDeserializer = (data: ComplexTileDbJson) => Tile;

const tileTypeIds = {
    empty: 0,
    matterite: 1,
    energite: 2,
};

export abstract class Tile {
    
    constructor() {
        // Do nothing.
    }
    
    abstract toDbJson(): TileDbJson;
}

export class EmptyTile extends Tile {
    
    toDbJson(): TileDbJson {
        return tileTypeIds.empty;
    }
}

export const emptyTile = new EmptyTile();

export class Matterite extends Tile {
    
    toDbJson(): TileDbJson {
        return tileTypeIds.matterite;
    }
}

export const matterite = new Matterite();

export class Energite extends Tile {
    
    toDbJson(): TileDbJson {
        return tileTypeIds.energite;
    }
}

export const energite = new Energite();

const simpleTileMap = new Map<number, Tile>([
    [tileTypeIds.empty, emptyTile],
    [tileTypeIds.matterite, matterite],
    [tileTypeIds.energite, energite],
]);

const complexDeserializerMap = new Map<number, ComplexTileDeserializer>([]);

export const dbJsonToTile = (data: TileDbJson): Tile => {
    if (typeof data === "number") {
        return simpleTileMap.get(data);
    } else {
        const deserializer = complexDeserializerMap.get(data.typeId);
        return deserializer(data);
    }
};


