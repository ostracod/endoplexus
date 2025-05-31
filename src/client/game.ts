
import { WsCommand } from "../common/types.js";
import { tileSprites, tubeSprites, portSprites, iconSprites, loadAllSprites } from "./sprite.js";

const gameCanvasWidth = 1200;
const gameCanvasHeight = 1200;
const gameCanvasScale = 2;

let gameCanvas: HTMLCanvasElement;
let gameCanvasContext: CanvasRenderingContext2D;
let modules: Module[] = [];
let ws: WebSocket;
let wsCommandsToSend: WsCommand[] = [];
let wsCommandsToRepeat: WsCommand[];
let lastWsSendTime = 0;
let expectingWsResponse = false;
let wsCommandHandlers = new Map<string, (command: WsCommand) => void>();
let wsCommandRepeaters = new Map<string, (command: WsCommand) => void>();

class Module {
    name: string;
    displayName: string;
    shouldShowOnLoad: boolean;
    tag: HTMLElement;
    buttonTag: HTMLButtonElement;
    isVisible: boolean;
    
    constructor(name, displayName, shouldShowOnLoad = false) {
        this.name = name;
        this.displayName = displayName;
        this.shouldShowOnLoad = shouldShowOnLoad;
        this.tag = null;
        this.isVisible = false;
        modules.push(this);
    }
    
    show() {
        this.tag.style.display = "block";
        this.buttonTag.className = "visibleModuleButton";
        this.isVisible = true;
    }
    
    hide() {
        this.tag.style.display = "none";
        this.buttonTag.className = "hiddenModuleButton";
        this.isVisible = false;
    }
    
    toggle() {
        if (this.isVisible) {
            this.hide();
        } else {
            this.show();
        }
    }
    
    initialize() {
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

const getModule = (name) => modules.find((module) => (module.name === name));

const hideModule = (name) => {
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

addWsCommandHandler("nearbyTiles", (command) => {
    // TODO: Handle the command.
    console.log(command);
});

const clearGameCanvas = () => {
    gameCanvasContext.fillStyle = "#FFFFFF";
    gameCanvasContext.fillRect(0, 0, gameCanvasWidth, gameCanvasHeight);
};

const timerEvent = () => {
    clearGameCanvas();
    
    tileSprites.ball.draw(gameCanvasContext, { x: 20, y: 20 }, 8);
    iconSprites.face.draw(gameCanvasContext, { x: 23, y: 23 }, 8);
    portSprites.active[1][3].draw(gameCanvasContext, { x: 26, y: 23 }, 8);
    
    tileSprites.square[3].draw(gameCanvasContext, { x: 40, y: 20 }, 8);
    iconSprites.bitwiseAnd.draw(gameCanvasContext, { x: 43, y: 23 }, 8);
    portSprites.passive[0][1].draw(gameCanvasContext, { x: 43, y: 20 }, 8);
    portSprites.passive[1][2].draw(gameCanvasContext, { x: 46, y: 23 }, 8);
    portSprites.passive[2][0].draw(gameCanvasContext, { x: 43, y: 26 }, 8);
    
    tubeSprites[2][1].draw(gameCanvasContext, { x: 20, y: 40 }, 8);
    portSprites.activeTube[1].draw(gameCanvasContext, { x: 26, y: 43 }, 8);
    
    tubeSprites[2][0].draw(gameCanvasContext, { x: 40, y: 40 }, 8);
    portSprites.activeTube[1].draw(gameCanvasContext, { x: 46, y: 43 }, 8);
};

const initializeGame = async () => {
    gameCanvas = document.getElementById("gameCanvas") as HTMLCanvasElement;
    gameCanvas.width = gameCanvasWidth;
    gameCanvas.height = gameCanvasHeight;
    gameCanvas.style.width = gameCanvasWidth / gameCanvasScale + "px";
    gameCanvas.style.height = gameCanvasHeight / gameCanvasScale + "px";
    gameCanvas.style.border = "3px #AAAAAA solid";
    gameCanvasContext = gameCanvas.getContext("2d");
    gameCanvasContext.imageSmoothingEnabled = false;
    
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


