
import { Pos, Color } from "../common/types.js";

const spriteSheets: SpriteSheet[] = [];

const loadImage = (src: string): Promise<HTMLImageElement> => new Promise((resolve) => {
    const image = new Image();
    image.onload = () => {
        resolve(image);
    };
    image.src = src;
});

export class PixelCanvas {
    htmlElement: HTMLCanvasElement;
    context: CanvasRenderingContext2D;
    scale: number;
    
    constructor(htmlElement: HTMLCanvasElement, scale: number) {
        this.htmlElement = htmlElement;
        this.context = this.htmlElement.getContext("2d");
        this.scale = scale;
    }
}

export class Sprite {
    sheetIndex: number;
    palette: Color[];
    width: number;
    height: number;
    image: HTMLImageElement | null;
    
    constructor(sheetIndex: number, palette: Color[], width: number, height: number) {
        this.sheetIndex = sheetIndex;
        this.palette = palette;
        this.width = width;
        this.height = height;
        this.image = null;
    }
    
    draw(canvas: PixelCanvas, pos: Pos): void {
        if (this.image !== null) {
            canvas.context.drawImage(
                this.image,
                pos.x * canvas.scale, pos.y * canvas.scale,
                this.width * canvas.scale, this.height * canvas.scale,
            );
        }
    }
}

class SpriteSheet {
    imagePath: string;
    sizeInSprites: number;
    sizeInPixels: number;
    spriteSize: number;
    sprites: Sprite[];
    
    canvas: HTMLCanvasElement;
    canvasContext: CanvasRenderingContext2D;
    
    imageData: ImageData;
    imageBytes: Uint8ClampedArray;
    
    spriteCanvas: HTMLCanvasElement;
    spriteCanvasContext: CanvasRenderingContext2D;
    spriteImageData: ImageData;
    spriteImageBytes: Uint8ClampedArray;
    
    constructor(imagePath: string, sizeInSprites: number, spriteSize: number) {
        this.imagePath = imagePath;
        this.sizeInSprites = sizeInSprites;
        this.spriteSize = spriteSize;
        this.sizeInPixels = this.sizeInSprites * this.spriteSize;
        this.sprites = [];
        
        this.canvas = document.createElement("canvas");
        this.canvas.width = this.sizeInPixels;
        this.canvas.height = this.sizeInPixels;
        this.canvasContext = this.canvas.getContext("2d");
        
        this.imageData = null
        this.imageBytes = null;
        
        this.spriteCanvas = document.createElement("canvas");
        this.spriteCanvas.width = this.spriteSize;
        this.spriteCanvas.height = this.spriteSize;
        this.spriteCanvasContext = this.spriteCanvas.getContext("2d");
        this.spriteImageData = this.spriteCanvasContext.createImageData(
            this.spriteSize, this.spriteSize,
        );
        this.spriteImageBytes = this.spriteImageData.data;
        
        spriteSheets.push(this);
    }
    
    async load(): Promise<void> {
        const image = await loadImage(this.imagePath);
        this.canvasContext.drawImage(image, 0, 0);
        this.imageData = this.canvasContext.getImageData(
            0, 0, this.sizeInPixels, this.sizeInPixels,
        );
        this.imageBytes = this.imageData.data;
        // We shouldn't use Promise.all here, because we use
        // one canvas to render all of the sprite images.
        for (const sprite of this.sprites) {
            await this.loadSpriteImage(sprite);
        }
    }
    
    // Must be called before this.load().
    createSprite(sheetIndex: number, palette: Color[]): Sprite {
        const sprite = new Sprite(sheetIndex, palette, this.spriteSize, this.spriteSize);
        this.sprites.push(sprite);
        return sprite;
    }
    
    // Must be called before this.load().
    createSprites(sheetIndex: number, palettes: Color[][]): Sprite[] {
        return palettes.map((palette) => this.createSprite(sheetIndex, palette));
    }
    
    async loadSpriteImage(sprite: Sprite): Promise<void> {
        const posX = (sprite.sheetIndex % this.sizeInSprites) * this.spriteSize;
        const posY = Math.floor(sprite.sheetIndex / this.sizeInSprites) * this.spriteSize;
        for (let offsetY = 0; offsetY < this.spriteSize; offsetY++) {
            for (let offsetX = 0; offsetX < this.spriteSize; offsetX++) {
                const srcIndex = (
                    (posX + offsetX) + (posY + offsetY) * this.sizeInPixels
                ) * 4;
                const colorR = this.imageBytes[srcIndex];
                let color;
                if (colorR < 128) {
                    color = sprite.palette[0];
                } else if (colorR < 224) {
                    color = sprite.palette[1];
                } else {
                    color = null;
                }
                const destIndex = (offsetX + offsetY * this.spriteSize) * 4;
                if (color === null) {
                    this.spriteImageBytes[destIndex + 3] = 0;
                } else {
                    this.spriteImageBytes[destIndex] = color.r;
                    this.spriteImageBytes[destIndex + 1] = color.g;
                    this.spriteImageBytes[destIndex + 2] = color.b;
                    this.spriteImageBytes[destIndex + 3] = 255;
                }
            }
        }
        this.spriteCanvasContext.putImageData(this.spriteImageData, 0, 0);
        const imageDataUrl = this.spriteCanvas.toDataURL()
        sprite.image = await loadImage(imageDataUrl);
    }
}

const bigSpriteSheet = new SpriteSheet("/images/bigSprites.png", 10, 13);
const smallSpriteSheet = new SpriteSheet("/images/smallSprites.png", 15, 7);

const colors = {
    black: { r: 0, g: 0, b: 0 },
    red: { r: 144, g: 32, b: 32 },
    orange: { r: 160, g: 80, b: 0 },
    yellow: { r: 136, g: 136, b: 0 },
    green: { r: 32, g: 128, b: 32 },
    teal: { r: 0, g: 128, b: 128 },
    blue: { r: 32, g: 32, b: 192 },
    purple: { r: 128, g: 0, b: 128 },
    gray: { r: 128, g: 128, b: 128 },
    lightRed: { r: 255, g: 64, b: 64 },
    lightOrange: { r: 255, g: 144, b: 0 },
    lightYellow: { r: 255, g: 255, b: 0 },
    lightGreen: { r: 0, g: 255, b: 0 },
    lightTeal: { r: 0, g: 255, b: 255 },
    lightBlue: { r: 128, g: 128, b: 255 },
    lightPurple: { r: 255, g: 0, b: 255 },
    lightGray: { r: 192, g: 192, b: 192 },
    white: { r: 255, g: 255, b: 255 },
};

export const tileSprites = {
    placeholder: bigSpriteSheet.createSprite(0, [colors.black, colors.lightGray]),
    square: bigSpriteSheet.createSprites(1, [
        [colors.black, colors.red],
        [colors.black, colors.orange],
        [colors.black, colors.yellow],
        [colors.black, colors.green],
        [colors.black, colors.teal],
        [colors.black, colors.blue],
    ]),
    wall: bigSpriteSheet.createSprites(2, [
        [colors.black, colors.blue],
        [colors.black, colors.gray],
    ]),
    ball: bigSpriteSheet.createSprite(20, [colors.black, colors.purple]),
    gem: bigSpriteSheet.createSprites(21, [
        [colors.black, colors.lightYellow],
        [colors.black, colors.lightBlue],
    ]),
};

export const tubeSprites: Sprite[][] = [];

const tubePalettes = [
    [colors.black, colors.teal],
    [colors.black, colors.lightTeal],
    [colors.black, colors.yellow],
    [colors.black, colors.lightYellow],
];
for (let sheetIndex = 10; sheetIndex <= 15; sheetIndex++) {
    tubeSprites.push(bigSpriteSheet.createSprites(sheetIndex, tubePalettes));
}

export const portSprites = {
    passive: [] as Sprite[][],
    active: [] as Sprite[][],
    activeTube: [] as Sprite[],
};

const portPalettes = [
    [colors.black, colors.lightYellow],
    [colors.black, colors.lightGreen],
    [colors.black, colors.lightTeal],
    [colors.black, colors.lightPurple],
];
const activeTubePortPalette = [colors.black, colors.black];
for (let sheetIndex = 0; sheetIndex < 12; sheetIndex += 3) {
    portSprites.passive.push(smallSpriteSheet.createSprites(sheetIndex, portPalettes));
    portSprites.active.push(smallSpriteSheet.createSprites(sheetIndex + 1, portPalettes));
    portSprites.activeTube.push(smallSpriteSheet.createSprite(sheetIndex + 2, activeTubePortPalette));
}

const iconSheetIndexes: { [name: string]: number } = {
    face: 15,
    box: 16,
    portConnector: 17,
    parentConnector: 18,
    mergeJunction: 19,
    splitJunction: 20,
    actionGate: 21,
    tileFilter: 22,
    delayLine: 23,
    inventory: 24,
    bank: 25,
    
    walk: 30,
    phaseBox: 31,
    removeTile: 32,
    senseTile: 33,
    inspectTile: 34,
    arrangePorts: 35,
    craft: 36,
    recycle: 37,
    spike: 38,
    
    oscillator: 45,
    bitwiseNot: 46,
    bitwiseOr: 47,
    bitwiseAnd: 48,
    bitwiseXor: 49,
    bitshiftLeft: 50,
    bitshiftRight: 51,
    
    add: 60,
    subtract: 61,
    multiply: 62,
    divide: 63,
    remainder: 64,
    greaterThan: 65,
    greaterOrEqual: 66,
    equal: 67,
    notEqual: 68,
    
    register: 75,
    memory: 76,
};

export const iconSprites: { [name: string]: Sprite } = {};

const iconPalette = [colors.white, colors.lightGray];
for (const name in iconSheetIndexes) {
    const sheetIndex = iconSheetIndexes[name];
    iconSprites[name] = smallSpriteSheet.createSprite(sheetIndex, iconPalette);
}

export const loadAllSprites = async (): Promise<void> => {
    await Promise.all(spriteSheets.map((spriteSheet) => spriteSheet.load()));
};


