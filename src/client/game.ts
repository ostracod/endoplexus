
import { WsCommand } from "../common/types.js";

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

const addWsCommand = (command: WsCommand): void => {
    wsCommandsToSend.push(command);
};

const wsTimerEvent = (): void => {
    if (expectingWsResponse) {
        return;
    }
    const currentTime = Date.now() / 1000;
    if (currentTime < lastWsSendTime + 0.25) {
        return;
    }
    ws.send(JSON.stringify(wsCommandsToSend));
    expectingWsResponse = true;
    lastWsSendTime = currentTime;
    wsCommandsToRepeat = wsCommandsToSend;
    wsCommandsToSend = [];
};

const handleWsResponse = (commands: WsCommand[]): void => {
    // TODO: Evaluate commands from the server.
    console.log(commands);
    // TODO: Repeat commands in wsCommandsToRepeat.
    
    wsCommandsToRepeat = [];
    expectingWsResponse = false;
};

const initializeGame = () => {
    gameCanvas = document.getElementById("gameCanvas") as HTMLCanvasElement;
    gameCanvas.width = gameCanvasWidth;
    gameCanvas.height = gameCanvasHeight;
    gameCanvas.style.width = gameCanvasWidth / gameCanvasScale + "px";
    gameCanvas.style.height = gameCanvasHeight / gameCanvasScale + "px";
    gameCanvas.style.border = "3px #AAAAAA solid";
    gameCanvasContext = gameCanvas.getContext("2d");
    
    for (const module of modules) {
        module.initialize();
    }
    
    const wsProtocol = (window.location.protocol == "http:") ? "ws:" : "wss:";
    const wsAddress = `${wsProtocol}//${window.location.hostname}:${window.location.port}/gameCommands`;
    ws = new WebSocket(wsAddress);
    ws.addEventListener("open", () => {
        addWsCommand({ name: "getInitState" });
        setInterval(wsTimerEvent, 50);
    });
    ws.addEventListener("message", (event: MessageEvent) => {
        const commands = JSON.parse(event.data) as WsCommand[];
        handleWsResponse(commands);
    });
};

document.addEventListener("DOMContentLoaded", initializeGame);


