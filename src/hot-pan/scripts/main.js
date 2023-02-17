import {logger} from './logger.js';
import {MODULE} from './module.js'

const SUB_MODULES = {
    MODULE,
    logger
}

let socket;

/*
  Initialize Anything
 */
(async () => {
    console.log("Hot Pan | Initializing Module");
    await preRequisitesReady();
    logger.info("Ready to play!")
})();

async function preRequisitesReady() {
    return Promise.all([
        areSubmodulesReady(),
        isSocketlibRegistered(),
        isCanvasReady()]);
}

async function areSubmodulesReady() {
    return new Promise(resolve => {
        Hooks.once('setup', () => {
            resolve(registerSubmodules());
        });
    });
}

async function isSocketlibRegistered() {
    return new Promise(resolve => {
        Hooks.once('socketlib.ready', () => {
            resolve(registerToSocketlib());
        });
    });
}

async function isCanvasReady() {
    return new Promise(resolve => {
        Hooks.once('canvasReady', () => {
            resolve(registerCanvasListeners());
            logger.info("Canvas is ready (listeners registered)");
        });
    });
}

async function registerSubmodules() {
    Object.values(SUB_MODULES).forEach(function(cl) {
        cl.register(); // includes loading each module's settings
        logger.info("Submodule registered:", cl.name);
    });
}

async function registerToSocketlib() {
    socket = socketlib.registerModule(MODULE.data.name);
    socket.register("pushPanToClients", pushPanToClients);
    logger.info(`Module ${MODULE.data.name} registered in socketlib.`);
}

async function registerCanvasListeners() {
    Hooks.on("canvasPan", async function (canvas, position) {
        if (!game.user.isGM) return; // Only the GM shall be allowed to force canvas position on others!
        logger.debug("Pushing canvas position from GM to clients.");
        socket.executeForOthers("pushPanToClients", {position: position, username: game.user.name});
    });
}

async function pushPanToClients(data) {
    logger.debug("pushPanToClients from", data.username, "to", game.user.name, "canvasPosition", data.position);
    canvas.animatePan(data.position);
}

