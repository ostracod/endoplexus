
import { ExtendedWebSocket } from "websocket-express";
import { Pos, WsCommand, NearbyTilesCommand } from "../common/types.js";
import { SessionAccount, WsMessage } from "./types.js";
import { world } from "./world.js";

export class WsManager {
    ws: ExtendedWebSocket;
    account: SessionAccount;
    commandHandlers: Map<string, (command: WsCommand) => void>;
    commandsToSend: WsCommand[];
    
    constructor(ws: ExtendedWebSocket, account: SessionAccount) {
        this.ws = ws;
        this.account = account;
        this.commandHandlers = new Map();
        this.addCommandHandler("getInitState", this.handleGetInitState);
        this.addCommandHandler("getUpdates", this.handleGetUpdates);
    }
    
    async run(): Promise<void> {
        while (true) {
            let message: WsMessage;
            try {
                message = await this.ws.nextMessage({ timeout: 20 * 1000 });
            } catch {
                break;
            }
            const commands = JSON.parse(message.data.toString()) as WsCommand[];
            this.commandsToSend = [];
            for (const command of commands) {
                const handler = this.commandHandlers.get(command.name);
                if (typeof handler === "undefined") {
                    throw new Error(`Unknown command name "${command.name}".`);
                }
                handler.call(this, command);
            }
            this.ws.send(JSON.stringify(this.commandsToSend));
        }
        this.ws.close();
    }
    
    sendWsCommand(command: WsCommand): void {
        this.commandsToSend.push(command);
    }
    
    addCommandHandler(commandName: string, handler: (command: WsCommand) => void): void {
        this.commandHandlers.set(commandName, handler);
    }
    
    handleGetInitState(command: WsCommand): void {
        // TODO: Implement.
    }
    
    handleGetUpdates(command: WsCommand): void {
        // TODO: Use player position to extract subgrid.
        const grid = world.grid.getSubgrid({ x: 0, y: 0 }, 10, 10);
        const response: NearbyTilesCommand = {
            name: "nearbyTiles",
            grid: grid.toClientJson(),
        };
        this.sendWsCommand(response);
    }
}


