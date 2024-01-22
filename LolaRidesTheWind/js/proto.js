"use strict";
const app = new PIXI.Application({
    width: 1000,
    height: 600
});
document.body.appendChild(app.view);

let sceneWidth = app.view.width;
let sceneHeight = app.view.height;

const keyInputs = {
    jumpKey: keyboard("ArrowUp"),
    leftKey: keyboard("ArrowLeft"),
    rightKey: keyboard("ArrowRight")
}
let player = new Player();
let rooms = [
    new Room(0, 0,
        [new Platform(-10, 250, 500, 100)],
        [new KeyItem(160, 20)],
        [new Platform(500, 250, 500, 100)]),
    new Room(-1, 0,
        [
            new Platform(-10, 250, sceneWidth + 20, 100),
            new Platform(0, 0, 20, sceneHeight),
            new Platform(80, 170, 100, 40),
            new Platform(360, 95, 150, 40),
        ], [], []), 
    new Room(1, 0,
        [
            new Platform(-10, 250, sceneWidth + 20, 100),
            new Platform(sceneWidth / 2 - 10, 0, 20, sceneHeight),
        ], [],
        [new Platform(-10, 250, sceneWidth + 20, 100)])
];
let activeRoom;
// Scenes
let stage, titleScene, gameScene, gameOverScene, gameWinScene;
let paused = true;

setup();

function setup() {
    stage = app.stage;

    //Add all scenes to the stage
    //Title Scene will be visible at start
    titleScene = new PIXI.Container();
    stage.addChild(titleScene);

    //Game Scene, Game Win Scene and Game Over Scene won't be visible
    gameScene = new PIXI.Container();
    gameScene.visible = false;
    stage.addChild(gameScene);
    gameOverScene = new PIXI.Container();
    gameOverScene.visible = false;
    stage.addChild(gameOverScene);
    gameWinScene = new PIXI.Container();
    gameWinScene.visible = false;
    stage.addChild(gameWinScene);

    //Create all labels
    createLabelsAndButtons();

    player = new Player();
    //If player's x and y are declared in the constructor, it messes with the physics, so set them outside.
    player.x = 30;
    player.y = 360;
    gameScene.addChild(player);

    app.ticker.add(gameLoop);
}

function gameLoop() {
    if (paused) return;

    // #1 - Calculate "delta time"
    let dt = 1/app.ticker.FPS;
    if (dt > 1/12) dt=1/12;

    //Handle most mechanics in player's update method.
    player.update(dt, keyInputs, activeRoom);

    //The player can grab any items in the room.
    grabKeyItems(activeRoom.items);

    //Change the active room when necessary.
    activeRoom = roomChange(gameScene);
}

function createLabelsAndButtons() {
    //Create necessary text styles
    let titleStyle = new PIXI.TextStyle({
        fill: 0xFFBB88,
        fontSize: 90,
        fontFamily: "Freestyle Script Regular"
    });

    let textStyle = new PIXI.TextStyle({
        fill: 0xFFBB88,
        fontSize: 45,
        fontFamily: "Freestyle Script Regular",
        wordWrap: true,
        wordWrapWidth: 1000,
        align: 'center'
    });

    let buttonStyle = new PIXI.TextStyle({
        fill: 0xFFFF66,
        fontSize: 60,
        fontFamily: "Freestyle Script Regular",
    });

    //1. Title Scene
    //1a. Title Label
    let titleLabel = new PIXI.Text(" Lola Rides The Wind ");
    titleLabel.style = titleStyle;
    titleLabel.x = 220;
    titleLabel.y = 40;
    titleScene.addChild(titleLabel);

    //1b. Instructions label
    let instructionsLabel = new PIXI.Text("Left/Right to move\nUp to Jump\nUp while falling to slow-fall.\nGrab the blue item to win!");
    instructionsLabel.style = textStyle;
    instructionsLabel.x = 330;
    instructionsLabel.y = 200;
    titleScene.addChild(instructionsLabel);

    //1c. Play button
    let playButton = new PIXI.Text(" Begin");
    playButton.style = buttonStyle;
    playButton.x = 440;
    playButton.y = 450;
    playButton.interactive = true;
    playButton.buttonMode = true;
    playButton.on("pointerup", startGame);
    playButton.on('pointerover', e => e.target.alpha = 0.7);
    playButton.on('pointerout', e => e.currentTarget.alpha = 1.0);
    titleScene.addChild(playButton);

    //2. Game Win Scene
    //2a. "You win!"
    let winLabel = new PIXI.Text(" You Won! ");
    winLabel.style = titleStyle;
    winLabel.x = 360;
    winLabel.y = 40;
    gameWinScene.addChild(winLabel);

    //2b. Caption label
    let winCaption = new PIXI.Text("For now.");
    winCaption.style = textStyle;
    winCaption.x = 430;
    winCaption.y = 200;
    gameWinScene.addChild(winCaption);

    //2c. Replay button
    let replayButton = new PIXI.Text(" Replay");
    replayButton.style = buttonStyle;
    replayButton.x = 430;
    replayButton.y = 430;
    replayButton.interactive = true;
    replayButton.buttonMode = true;
    replayButton.on("pointerup", startGame);
    replayButton.on('pointerover', e => e.target.alpha = 0.7);
    replayButton.on('pointerout', e => e.currentTarget.alpha = 1.0);
    gameWinScene.addChild(replayButton);
}

function startGame() {
    //Ensure the game scene is visible and no other scene.
    titleScene.visible = false;
    gameOverScene.visible = false;
    gameWinScene.visible = false;
    gameScene.visible = true;
    paused = false;

    //Load the room at 0, 0
    activeRoom = roomLoad(gameScene);
    player.resetPosition();
}

function finishGame() {
    gameScene.visible = false;
    paused = true;
    gameWinScene.visible = true;
}

function grabKeyItems(keyItems) {
    for (let k of keyItems) {
        if (collisionCheck(player, k)) {
            player.inventory.push(k);
            gameScene.removeChild(k);
            finishGame();
        }
    }
}

function roomLoad(stage, x = 0, y = 0) {
    for (let r of rooms) {
        if (r.x == x && r.y == y) {
            r.load(stage);
            return r;
        }
    }
}

function roomUnload(stage) {
    activeRoom.unload(stage);
}

function roomChange(stage) {
    if (player.x + player.width < 0) {
        roomUnload(stage);
        player.x = sceneWidth - 1;
        return roomLoad(stage, activeRoom.x - 1, activeRoom.y);
    }
    else if (player.x > sceneWidth) {
        player.x = 3 - player.width;
        roomUnload(stage);
        return roomLoad(stage, activeRoom.x + 1, activeRoom.y);
    }
    else if (player.y + player.height < 0) {
        roomUnload(stage);
        player.y = sceneHeight - 1;
        return roomLoad(stage, activeRoom.x, activeRoom.y + 1);
    }
    else if (player.y > sceneHeight) {
        roomUnload(stage);
        player.y = 3 - player.height;
        return roomLoad(stage, activeRoom.x, activeRoom.y - 1);
    }
    else {
        return activeRoom;
    }
}