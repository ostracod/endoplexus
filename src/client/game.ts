
import { Pos, WsCommand, NearbyTilesCommand } from "../common/types.js";
import { PixelCanvas, tileSprites, tubeSprites, portSprites, iconSprites, loadAllSprites } from "./sprite.js";
import { Tile, emptyTile, jsonToTile } from "./tile.js";

const gameCanvasWidth = 1170;
const gameCanvasHeight = 1170;
const gameCanvasScale = 2;

let gameCanvas: PixelCanvas;
let modules: Module[] = [];
let ws: WebSocket;
let wsCommandsToSend: WsCommand[] = [];
let wsCommandsToRepeat: WsCommand[];
let lastWsSendTime = 0;
let expectingWsResponse = false;
let wsCommandHandlers = new Map<string, (command: WsCommand) => void>();
let wsCommandRepeaters = new Map<string, (command: WsCommand) => void>();
let cameraPos: Pos = { x: 0, y: 0 };
let nearbyTiles: Tile[] = [];
let nearbyTilesWidth: number = 0;
let nearbyTilesHeight: number = 0;

class Module {
    name: string;
    displayName: string;
    shouldShowOnLoad: boolean;
    tag: HTMLElement;
    buttonTag: HTMLButtonElement;
    isVisible: boolean;
    
    constructor(name: string, displayName: string, shouldShowOnLoad: boolean = false) {
        this.name = name;
        this.displayName = displayName;
        this.shouldShowOnLoad = shouldShowOnLoad;
        this.tag = null;
        this.isVisible = false;
        modules.push(this);
    }
    
    show(): void {
        this.tag.style.display = "block";
        this.buttonTag.className = "visibleModuleButton";
        this.isVisible = true;
    }
    
    hide(): void {
        this.tag.style.display = "none";
        this.buttonTag.className = "hiddenModuleButton";
        this.isVisible = false;
    }
    
    toggle(): void {
        if (this.isVisible) {
            this.hide();
        } else {
            this.show();
        }
    }
    
    initialize(): void {
        this.tag = document.getElementById(this.name + "Module");
        const containerTag = document.getElementById("moduleButtonsContainer");
        this.buttonTag = document.createElement("button");
        this.buttonTag.innerHTML = this.displayName;
        this.buttonTag.onclick = () => {
            this.toggle();
        };
        containerTag.appendChild(this.buttonTag);
        if (this.shouldShowOnLoad) {
            this.show();
        } else {
            this.hide();
        }
    }
}

new Module("parentTiles", "Parent Tiles");
new Module("tileAttributes", "Tile Attributes");
new Module("inventory", "Inventory", true);
new Module("crafting", "Crafting", true);
new Module("tileHelp", "Tile Help");

const getModule = (name: string): Module => modules.find((module) => (module.name === name));

const hideModule = (name: string): void => {
    getModule(name).hide();
}

window.hideModule = hideModule;

const sendWsCommand = (command: WsCommand): void => {
    wsCommandsToSend.push(command);
};

const finishWsRequest = (): void => {
    sendWsCommand({ name: "getUpdates" });
};

const wsTimerEvent = (): void => {
    if (expectingWsResponse) {
        return;
    }
    const currentTime = Date.now() / 1000;
    if (currentTime < lastWsSendTime + 0.25) {
        return;
    }
    finishWsRequest();
    ws.send(JSON.stringify(wsCommandsToSend));
    expectingWsResponse = true;
    lastWsSendTime = currentTime;
    wsCommandsToRepeat = wsCommandsToSend;
    wsCommandsToSend = [];
};

const handleWsResponse = (commands: WsCommand[]): void => {
    for (const command of commands) {
        const handler = wsCommandHandlers.get(command.name);
        if (typeof handler === "undefined") {
            throw new Error(`Unknown command name "${command.name}".`);
        }
        handler(command);
    }
    for (const command of wsCommandsToRepeat) {
        const repeater = wsCommandRepeaters.get(command.name);
        if (typeof repeater !== "undefined") {
            repeater(command);
        }
    }
    wsCommandsToRepeat = [];
    expectingWsResponse = false;
};

const addWsCommandHandler = (
    commandName: string,
    handler: (command: WsCommand) => void,
): void => {
    wsCommandHandlers.set(commandName, handler);
};

const addWsCommandRepeater = (
    commandName: string,
    repeater: (command: WsCommand) => void,
): void => {
    wsCommandRepeaters.set(commandName, repeater);
};

addWsCommandHandler("nearbyTiles", (command: NearbyTilesCommand) => {
    nearbyTiles = [];
    const gridData = command.grid;
    for (const tileData of gridData.tiles) {
        const tile = jsonToTile(tileData);
        nearbyTiles.push(tile);
    }
    nearbyTilesWidth = gridData.width;
    nearbyTilesHeight = gridData.height;
});

const clearGameCanvas = (): void => {
    gameCanvas.context.fillStyle = "#FFFFFF";
    gameCanvas.context.fillRect(0, 0, gameCanvasWidth, gameCanvasHeight);
};

const getNearbyTileIndex = (pos: Pos): number | null => {
    if (pos.x >= 0 && pos.x < nearbyTilesWidth && pos.y >= 0 && pos.y < nearbyTilesHeight) {
        return pos.x + pos.y * nearbyTilesWidth;
    } else {
        return null;
    }
};

const getNearbyTile = (pos: Pos): Tile => {
    const index = getNearbyTileIndex(pos);
    // TODO: Return missing tile when pos is out of bounds.
    return (index === null) ? emptyTile : nearbyTiles[index];
};

const drawNearbyTiles = (): void => {
    const offset: Pos = { x: 0, y: 0 };
    const pos: Pos = { x: 0, y: 0 };
    for (offset.y = 0; offset.y < nearbyTilesHeight; offset.y++) {
        pos.y = cameraPos.y + offset.y;
        for (offset.x = 0; offset.x < nearbyTilesWidth; offset.x++) {
            pos.x = cameraPos.x + offset.x;
            const tile = getNearbyTile(pos);
            tile.draw(gameCanvas, offset);
        }
    }
};

const timerEvent = (): void => {
    clearGameCanvas();
    drawNearbyTiles();
};

const initializeGame = async (): Promise<void> => {
    const canvas = document.getElementById("gameCanvas") as HTMLCanvasElement;
    canvas.width = gameCanvasWidth;
    canvas.height = gameCanvasHeight;
    canvas.style.width = gameCanvasWidth / gameCanvasScale + "px";
    canvas.style.height = gameCanvasHeight / gameCanvasScale + "px";
    canvas.style.border = "3px #AAAAAA solid";
    gameCanvas = new PixelCanvas(canvas, 6);
    gameCanvas.context.imageSmoothingEnabled = false;
    
    for (const module of modules) {
        module.initialize();
    }
    
    await loadAllSprites();
    
    const wsProtocol = (window.location.protocol == "http:") ? "ws:" : "wss:";
    const wsAddress = `${wsProtocol}//${window.location.hostname}:${window.location.port}/gameCommands`;
    ws = new WebSocket(wsAddress);
    ws.addEventListener("open", () => {
        sendWsCommand({ name: "getInitState" });
        setInterval(wsTimerEvent, 50);
    });
    ws.addEventListener("message", (event: MessageEvent) => {
        const commands = JSON.parse(event.data) as WsCommand[];
        handleWsResponse(commands);
    });
    ws.addEventListener("error", (event: Event) => {
        alert("Lost communication with the server. Please reload this page.");
        ws.close();
    });
    
    setInterval(timerEvent, 50);
};

document.addEventListener("DOMContentLoaded", initializeGame);


