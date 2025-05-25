
import { Pos } from "../common/types.js";

export const sprites: { [name: string]: Sprite[] } = {};

const loadImage = (src: string): Promise<HTMLImageElement> => new Promise((resolve) => {
    const image = new Image();
    image.onload = () => {
        resolve(image);
    };
    image.src = src;
});

class Color {
    r: number;
    b: number;
    g: number;
    
    constructor(r: number, g: number, b: number) {
        this.r = r;
        this.g = g;
        this.b = b;
    }
}

class Sprite {
    image: HTMLImageElement;
    width: number;
    height: number;
    
    constructor(image, width, height) {
        this.image = image;
        this.width = width;
        this.height = height;
    }
    
    draw(canvasContext: CanvasRenderingContext2D, pos: Pos, scale: number): void {
        canvasContext.drawImage(
            this.image,
            pos.x * scale, pos.y * scale,
            this.width * scale, this.height * scale,
        );
    }
}

class SpriteSheet {
    imagePath: string;
    sizeInSprites: number;
    sizeInPixels: number;
    spriteSize: number;
    
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
    }
    
    async load(): Promise<void> {
        const image = await loadImage(this.imagePath);
        this.canvasContext.drawImage(image, 0, 0);
        this.imageData = this.canvasContext.getImageData(
            0, 0, this.sizeInPixels, this.sizeInPixels,
        );
        this.imageBytes = this.imageData.data;
    }
    
    async createSprite(sheetIndex: number, palette: Color[]): Promise<Sprite> {
        const posX = (sheetIndex % this.sizeInSprites) * this.spriteSize;
        const posY = Math.floor(sheetIndex / this.sizeInSprites) * this.spriteSize;
        for (let offsetY = 0; offsetY < this.spriteSize; offsetY++) {
            for (let offsetX = 0; offsetX < this.spriteSize; offsetX++) {
                const srcIndex = (
                    (posX + offsetX) + (posY + offsetY) * this.sizeInPixels
                ) * 4;
                const colorR = this.imageBytes[srcIndex];
                let color;
                if (colorR < 128) {
                    color = palette[0];
                } else if (colorR < 224) {
                    color = palette[1];
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
        const image = await loadImage(imageDataUrl);
        return new Sprite(image, this.spriteSize, this.spriteSize);
    }
}

export const loadAllSprites = async (): Promise<void> => {
    const bigSpriteSheet = new SpriteSheet("/images/bigSprites.png", 10, 13);
    await bigSpriteSheet.load();
    const testPalette = [new Color(0, 0, 0), new Color(0, 255, 0)];
    sprites.ball = [await bigSpriteSheet.createSprite(20, testPalette)];
};


