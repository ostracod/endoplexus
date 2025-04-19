
declare module "express-session" {
    interface SessionData {
        username?: string;
        isGuest?: boolean;
    }
}

export interface PageOptions {
    scripts?: string[];
    stylesheets?: string[];
    contentWidth?: number;
}

export interface TemplateParams {
    [name: string]: any;
}

export interface ExpressError extends Error {
    status?: number;
}

export interface AccountRow {
    id: number;
    username: string;
    passwordHash: string;
    emailAddress: string;
    score: number;
    parentGridId?: number;
    posX?: number;
    posY?: number;
    shield: number;
    inventoryItems: string;
}

export interface SessionAccount {
    username: string;
    isGuest: boolean;
}

export type SimpleTileDbJson = number;

export interface ComplexTileDbJson {
    typeId: number;
}

export type TileDbJson = SimpleTileDbJson | ComplexTileDbJson;

export interface GridJson {
    width: number;
    height: number;
    tiles: TileDbJson[];
}

export interface WorldJson {
    grid: GridJson;
}


