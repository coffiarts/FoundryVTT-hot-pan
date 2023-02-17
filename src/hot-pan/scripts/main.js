import { logger } from './3rd-party/logger.js';
import { MODULE } from './module.js'

const SUB_MODULES = {
    MODULE,
    logger
}

/*
  Initialize Module
*/
MODULE.build();

/*
  Initialize all Sub Modules
*/
Hooks.on(`setup`, () => {
    Object.values(SUB_MODULES).forEach(cl => cl.register());
});

let socket;

Hooks.once("socketlib.ready", () => {
    socket = socketlib.registerModule(MODULE.data.name);
    socket.register("pushPanToClients", pushPanToClients);
    logger.info(`Module ${MODULE.data.name} registered in socketlib.`);
});

Hooks.on("init", function() {
    logger.debug("Executing hook on game.init()");
});

Hooks.on("ready", function() {
    logger.info("Ready to play!");
});

// capture all Canvas.canvasPan events
Hooks.on("canvasPan", function (canvas, position) {
    // logger.debug("game.user.isGM: ", game.user.isGM);
    if (!game.user.isGM) return;
    logger.debug("Pushing new Canvas.canvasPan event to players' clients.");
    socket.executeAsGM("pushPanToClients", {canvasPosition: canvas.position, username: game.user.name});
});

function pushPanToClients(data) {
    // ignore for the GM
    // logger.debug("game.user.isGM: ", game.user.isGM);
    //if (game.user.isGM) return;

    // const isResponsibleGM = game.users
    //     .filter(user => user.isGM && user.isActive)
    //     .some(other => other.data._id < game.user.data._id);
    // logger.debug("isResponsibleGM: ", isResponsibleGM);
    // if (!isResponsibleGM) return;
    logger.debug("pushPanToClients from", data.username, "to" , data.canvasPosition);
    //canvas.animatePan(data.canvasPosition);
}

