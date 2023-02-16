console.log("HOT PAN! Hello World! This code runs immediately when the file is loaded.");

Hooks.on("init", function() {
    console.log("HOT PAN! This code runs once the Foundry VTT software begins its initialization workflow.");
});

Hooks.on("ready", function() {
    console.log("HOT PAN! This code runs once core initialization is ready and game data is available.");
});

Hooks.on("canvasPan", function() {
    console.log("HOT PAN! canvasPan");

});