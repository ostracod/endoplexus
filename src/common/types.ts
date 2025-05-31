
export interface Pos {
    x: number;
    y: number;
}

export interface Color {
    r: number;
    g: number;
    b: number;
}

export type SimpleTileClientJson = number;

export interface ComplexTileClientJson {
    typeId: number;
}

export type TileClientJson = SimpleTileClientJson | ComplexTileClientJson;

export interface GridClientJson {
    width: number;
    height: number;
    tiles: TileClientJson[];
}

export interface WsCommand {
    name: string;
}

export interface NearbyTilesCommand extends WsCommand {
    grid: GridClientJson;
}


