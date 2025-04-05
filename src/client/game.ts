
const gameCanvasWidth = 1200;
const gameCanvasHeight = 1200;
const gameCanvasScale = 2;

let gameCanvas: HTMLCanvasElement;
let gameCanvasContext: CanvasRenderingContext2D;
let modules: Module[] = [];

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
};

document.addEventListener("DOMContentLoaded", initializeGame);


