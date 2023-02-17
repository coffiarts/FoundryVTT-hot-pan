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
    socket.register("handleCanvasPanEvent", handleCanvasPanEvent);
    logger.debug(`Module ${MODULE.data.name} registered in socketlib.`);
});

Hooks.on("init", function() {
    logger.debug("Running hook on game.init()");
});

Hooks.on("ready", function() {
    logger.info("Ready to play!");
});

// Hooks.on("canvasPan", function() {
//     logger.info("canvasPan (hook)");
// });

function handleCanvasPanEvent(arg) {
    if (!game.user.isGM) return;

    // if the logged in user is the active GM with the lowest user id
    const isResponsibleGM = game.users
        .filter(user => user.isGM && user.isActive)
        .some(other => other.data._id < game.user.data._id);

    if (!isResponsibleGM) return;

    // do something
    logger.debug("handleCanvasPanEvent");
}

//socket.on(`module.${MODULE.data.ID}`, handleCanvasPanEvent);
