
import { Pos, TileClientJson, ComplexTileClientJson } from "../common/types.js";
import { tileTypeIds } from "../common/constants.js";
import { PixelCanvas, Sprite, tileSprites } from "./sprite.js";

type ComplexTileDeserializer = (data: ComplexTileClientJson) => Tile;

const tilePixelSize = 13;

const toPixelPos = (pos: Pos): Pos => ({
    x: pos.x * tilePixelSize,
    y: pos.y * tilePixelSize,
});

export abstract class Tile {
    
    constructor() {
        // Do nothing.
    }
    
    abstract getTypeId(): number;
    
    abstract getBigSprite(): Sprite | null;
    
    drawHelper(canvas: PixelCanvas, pos: Pos): void {
        // Do nothing.
    }
    
    draw(canvas: PixelCanvas, pos: Pos): void {
        const sprite = this.getBigSprite();
        if (sprite !== null) {
            const pixelPos = toPixelPos(pos);
            sprite.draw(canvas, pixelPos);
            this.drawHelper(canvas, pixelPos);
        }
    }
}

export class EmptyTile extends Tile {
    
    getTypeId(): number {
        return tileTypeIds.empty;
    }
    
    getBigSprite(): Sprite | null {
        return null;
    }
}

export const emptyTile = new EmptyTile();

export class Matterite extends Tile {
    
    getTypeId(): number {
        return tileTypeIds.matterite;
    }
    
    getBigSprite(): Sprite | null {
        return tileSprites.gem[1];
    }
}

export const matterite = new Matterite();

export class Energite extends Tile {
    
    getTypeId(): number {
        return tileTypeIds.energite;
    }
    
    getBigSprite(): Sprite | null {
        return tileSprites.gem[0];
    }
}

export const energite = new Energite();

const simpleTiles = [emptyTile, matterite, energite];
const simpleTileMap = new Map<number, Tile>();
for (const tile of simpleTiles) {
    simpleTileMap.set(tile.getTypeId(), tile);
}

const complexDeserializerMap = new Map<number, ComplexTileDeserializer>([]);

export const jsonToTile = (data: TileClientJson): Tile => {
    if (typeof data === "number") {
        return simpleTileMap.get(data);
    } else {
        const deserializer = complexDeserializerMap.get(data.typeId);
        return deserializer(data);
    }
};


