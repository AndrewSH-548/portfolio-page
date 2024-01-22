"use strict";
const app = new PIXI.Application({
    width: 1000,
    height: 600
});
window.onload = e => { document.querySelector("#game").appendChild(app.view); }

let sceneWidth = app.view.width;
let sceneHeight = app.view.height;

//Create a key input object with all the arrow keys.
const keyInputs = {
    jumpKey: keyboard("ArrowUp"),
    leftKey: keyboard("ArrowLeft"),
    rightKey: keyboard("ArrowRight"),
    downKey: keyboard("ArrowDown")
}
let rooms = [];
let activeRoom;
// Scenes
let stage, titleScene, gameScene, gameOverScene, gameWinScene;
let loseCaption;
let paused = true;

//Howler.js is incorporated to load all sounds
const jumpSound = new Howl({
    src: ['media/audio/jumpSound.mp3']
})
const openFrill = new Howl({
    src: ['media/audio/openFrill.mp3']
})
const hurtSound = new Howl({
    src: ['media/audio/hurtSound.mp3']
});
const collectItem = new Howl({
    src: ['media/audio/collectItem.mp3']
});
const rainAmbience = new Howl({
    src: ['media/audio/rainAmbience.mp3'],
    loop: true
});

WebFont.load({
    google: {
        families: ['Kaushan Script']
    }
});
let assets;
loadImages();
async function loadImages() {
    PIXI.Assets.addBundle('sprites', {
        lolaSheet: 'media/sprites/lolaSheet.png',
        dragonflySheet: 'media/sprites/dragonflySheet.png',
        cicadaSheet: 'media/sprites/cicadaSheet.png',
        thorns: 'media/sprites/thorns.png',
        terrainBlock: 'media/sprites/terrainBlock.png',
        platform: 'media/sprites/platform.png',
        sign: 'media/sprites/sign.png',
        rainSheet: 'media/sprites/rainSheet.png',
        keyStick: 'media/sprites/keyStick.png',
        keyLeaf: 'media/sprites/keyLeaf.png',
        keyBinding: 'media/sprites/keyBinding.png', 
        keyItemUI: 'media/sprites/keyItemUI.png', 
        signUI: 'media/sprites/signUI.png',
        ui0: 'media/sprites/uiNumbers/0.png',
        ui1: 'media/sprites/uiNumbers/1.png',
        ui2: 'media/sprites/uiNumbers/2.png',
        ui3: 'media/sprites/uiNumbers/3.png',
        ui4: 'media/sprites/uiNumbers/4.png',
        downKey: 'media/sprites/keyDown.png',
        sKey: 'media/sprites/keyS.png'
    });
    assets = await PIXI.Assets.loadBundle('sprites');
    setup();
}

let player;
let lolaSprites, dragonflySprites, cicadaSprites;
let keyItemUI;
let downKeySprite;

//Dimensional constants for hazards
const thornHeight = 38;
const dragonflyWidth = 58;
const dragonflyHeight = 52;
const cicadaWidth = 36;
const cicadaHeight = 50;

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

    //Add the rain animation to the game scene
    gameScene.addChild(loadRainAnim());

    //Create all labels
    createLabelsAndButtons();

    //Load animated sprite frames
    lolaSprites = loadSpriteSheet(assets.lolaSheet, 70, 84, 6, "horizontal");
    dragonflySprites = loadSpriteSheet(assets.dragonflySheet, dragonflyWidth, dragonflyHeight, 2, "horizontal");
    cicadaSprites = loadSpriteSheet(assets.cicadaSheet, cicadaWidth, cicadaHeight, 2, "horizontal");

    player = new Player(0, 0, 60, 82);
    //If player's x and y are declared in the constructor, it messes with the physics, so set them outside.
    player.x = 30;
    player.y = 360;
    gameScene.addChild(player);
    player.loadSheet(lolaSprites, gameScene);

    //Create the down key using the down arrow sprite.
    downKeySprite = new PIXI.Sprite(assets.downKey);
    downKeySprite.x = player.x + 20;
    downKeySprite.y = player.y - 30;

    //Create the key item UI graphic.
    keyItemUI = new KeyItemUI(840, 480);

    //Load all the rooms into the array.
    setRooms();

    rainAmbience.play();

    app.ticker.add(gameLoop);
}

function gameLoop() {
    if (paused) return;

    // Calculate "delta time"
    let dt = 1/app.ticker.FPS;
    if (dt > 1/12) dt=1/12;

    //Handle most mechanics in player's update method.
    player.update(dt, keyInputs, activeRoom, gameScene);

    //The player can grab any items in the room.
    grabKeyItems(activeRoom.items);

    //Move any hazards that contain the function. 
    //An exception is thrown if the hazard doesn't have this function, so catch it.
    for (let h of activeRoom.hazards) {
        try { h.move(); }
        catch { }
    }

    //The player will lose if they run into a hazard.
    hazardCollide(activeRoom.hazards);

    //An image of the player's down key will show up if they can read a nearby sign.
    displayDownKey(activeRoom.signs);

    //Change the active room when necessary.
    activeRoom = roomChange(gameScene);

    //Always remove and re-add the key item UI so it stays in the front of the screen.
    gameScene.removeChild(keyItemUI);
    if (!gameScene.children.includes(keyItemUI)) {
        gameScene.addChildAt(keyItemUI, gameScene.children.length);
        keyItemUI.display(gameScene);
    }
}

function createLabelsAndButtons() {
    //Create necessary text styles
    let titleStyle = new PIXI.TextStyle({
        fill: 0xFFBB88,
        fontSize: 90,
        fontFamily: 'Kaushan Script'
    });

    let textStyle = new PIXI.TextStyle({
        fill: 0xFFBB88,
        fontSize: 45,
        fontFamily: 'Kaushan Script',
        wordWrap: true,
        wordWrapWidth: 1000,
        align: 'center'
    });

    let buttonStyle = new PIXI.TextStyle({
        fill: 0xFFFF66,
        fontSize: 60,
        fontFamily: 'Kaushan Script',
    });

    //1. Title Scene
    //1a. Title Label
    let titleLabel = new PIXI.Text(" Lola Rides The Wind ");
    titleLabel.style = titleStyle;
    titleLabel.x = 110;
    titleLabel.y = 40;
    titleScene.addChild(titleLabel);

    //1b. Instructions label
    let instructionsLabel = new PIXI.Text("You're stuck in a swamp!\nCreate a pinwheel to fly out! \nFind the glowing pieces!");
    instructionsLabel.style = textStyle;
    instructionsLabel.x = 230;
    instructionsLabel.y = 200;
    titleScene.addChild(instructionsLabel);

    //1c. Play w/ arrow keys
    let playButton = new PIXI.Text("Play Arrows ");
    playButton.style = buttonStyle;
    playButton.x = 140;
    playButton.y = 450;
    playButton.interactive = true;
    playButton.buttonMode = true;
    playButton.on("pointerup", startGame);
    playButton.on('pointerover', e => e.target.alpha = 0.7);
    playButton.on('pointerout', e => e.currentTarget.alpha = 1.0);
    titleScene.addChild(playButton);

    //1d. Play w/ WASD
    let playWASDButton = new PIXI.Text("Play WASD ");
    playWASDButton.style = buttonStyle;
    playWASDButton.x = 540;
    playWASDButton.y = 450;
    playWASDButton.interactive = true;
    playWASDButton.buttonMode = true;
    playWASDButton.on("pointerup", e => {
        //Replace the keyboard's keys and the down key to reflect the new controls.
        replaceKeyboard();
        downKeySprite.texture = assets.sKey;
        startGame();
    });
    playWASDButton.on('pointerover', e => e.target.alpha = 0.7);
    playWASDButton.on('pointerout', e => e.currentTarget.alpha = 1.0);
    titleScene.addChild(playWASDButton);

    //2. Game Win Scene
    //2a. "You win!"
    let winLabel = new PIXI.Text(" You Won! ");
    winLabel.style = titleStyle;
    winLabel.x = 300;
    winLabel.y = 40;
    gameWinScene.addChild(winLabel);

    //2b. Caption label
    let winCaption = new PIXI.Text("But how does a lizard craft a pinwheel? \n");
    winCaption.style = textStyle;
    winCaption.x = 170;
    winCaption.y = 200;
    gameWinScene.addChild(winCaption);

    //2c. Replay button
    let replayButton = new PIXI.Text(" Replay ");
    replayButton.style = buttonStyle;
    replayButton.x = 370;
    replayButton.y = 430;
    replayButton.interactive = true;
    replayButton.buttonMode = true;
    replayButton.on("pointerup", startGame);
    replayButton.on('pointerover', e => e.target.alpha = 0.7);
    replayButton.on('pointerout', e => e.currentTarget.alpha = 1.0);
    gameWinScene.addChild(replayButton);

    //3. Game Over Scene
    //3a. "Ouch"
    let loseLabel = new PIXI.Text(" Ouch! ");
    loseLabel.style = titleStyle;
    loseLabel.x = 370;
    loseLabel.y = 40;
    gameOverScene.addChild(loseLabel);

    //3b. Caption label
    //The text will be assigned later depending on how the player loses.
    loseCaption = new PIXI.Text();
    loseCaption.style = textStyle;
    loseCaption.x = 300;
    loseCaption.y = 180;
    gameOverScene.addChild(loseCaption);

    //3b. Retry button
    let retryButton = new PIXI.Text(" Retry ");
    retryButton.style = buttonStyle;
    retryButton.x = 400;
    retryButton.y = 430;
    retryButton.interactive = true;
    retryButton.buttonMode = true;
    retryButton.on("pointerup", startGame);
    retryButton.on('pointerover', e => e.target.alpha = 0.7);
    retryButton.on('pointerout', e => e.currentTarget.alpha = 1.0);
    gameOverScene.addChild(retryButton);
}

function replaceKeyboard() {
    //Replace the arrow keys with WASD.
    keyInputs.jumpKey = keyboard("w");
    keyInputs.leftKey = keyboard("a");
    keyInputs.rightKey = keyboard("d");
    keyInputs.downKey = keyboard("s");
}

function startGame() {
    //Ensure the game scene is visible and no other scene.
    titleScene.visible = false;
    gameOverScene.visible = false;
    gameWinScene.visible = false;
    gameScene.visible = true;
    paused = false;

    //Reset the player and key item UI.
    player.resetProperties();
    keyItemUI.reset();

        //Load the room at 0, 0
    activeRoom = roomLoad(gameScene);
}

function finishGame() {
    //Display the win screen and unload the current room.
    gameScene.visible = false;
    activeRoom.unload(gameScene);
    paused = true;
    gameWinScene.visible = true;
}

function gameOver(hazardType) {
    //Hide the game screen and unload the current room.
    gameScene.visible = false;
    activeRoom.unload(gameScene);
    paused = true;

    //The message will depend on what hazard the player hits.
    switch (hazardType) {
        case "thorns":
            loseCaption.text = " Don't land on thorns! ";
            break;
        case "dragonfly":
            loseCaption.text = " Don't hit dragonflies! ";
            break;
        case "cicada":
            loseCaption.text = " Don't hit cicadas! ";
            break;
    }
    gameOverScene.visible = true;
}

function grabKeyItems(keyItems) {
    for (let k of keyItems) {
        //Any uncollected key items will be collected and marked off.
        if (collisionCheck(player, k) && !k.isCollected) {
            k.isCollected = true;
            collectItem.play();
            gameScene.removeChild(k);
            k.clear(gameScene);
            //indices 2 to 5 have leaves, so increase the leaf count if they're grabbed.
            if (keyItemUI.items.indexOf(k) > 1 && keyItemUI.items.indexOf(k) < keyItemUI.items.length) {
                keyItemUI.leavesCollected++;
            }
        }
    }
    //Finish the game when all key items are grabbed.
    if (keyItemUI.winCheck()) {
        finishGame();
    }
}

function loadRainAnim() {
    //Load the rain sprite sheet and have it constantly play in the background.
    let rainSprites = loadSpriteSheet(assets.rainSheet, 1000, 600, 3, "vertical");
    let rainAnims = loadAnimation(rainSprites, 0, 0, 1/5, true);
    rainAnims.play();
    return rainAnims;
}

function hazardCollide(hazards) {
    //The player will lose if they run into a hazard.
    for (let h of hazards) {
        if (collisionCheck(player, h)) {
            hurtSound.play();
            gameOver(h.type);
        }
    }
}

function displayDownKey(signs) {
    //Have the down key's position conform to the player's
    downKeySprite.x = player.x + 20;
    downKeySprite.y = player.y - 30;
    if (signs.length == 0) {
        //No reason to display this if the room doesn't have a sign.
        gameScene.removeChild(downKeySprite);
        return;
    }
        //Display the key if the player's in the sign's trigger zone.
    if (collisionCheck(player, signs[0])) {
        gameScene.addChild(downKeySprite);
    }
    else {
        gameScene.removeChild(downKeySprite);
    }
}

function setRooms() {
    //All of these rooms are added to the array.
    //To add a room, just push one into an unused coordinate.
    //The arrays in order are Terrain, Platforms, Key Items, Signs, and Hazards. 
    rooms.push(new Room(0, 0,
        [new Terrain(-20, 250, 540, 200, "floor")],
        [], [keyItemUI.items[0]],
        [new Sign(100, 442, "Welcome!\nDon't be fooled by your vision.\nThe edges of your view hold more of the\nworld to explore.\nSimply walk off your field of view to\nsee what lies in that direction.")],
        [
            new Hazard(250, 281, "thorns", 500),
            new Hazard(190, 35, "cicada")
            ]));
    rooms.push(new Room(-1, 0,
        [
            new Terrain(-20, -40, 80, sceneHeight - 120, "leftWall"),
            new Terrain(-20, 250, sceneWidth + 80, 200, "floor"),
        ],
        [
            new Platform(160, 340),
            new Platform(740, 190),
        ],
        [],
        [new Sign(160, 442, "To craft a pinwheel, you need these\npieces:\n- 1 wooden stick for the handle\n- 4 leaves to act as petals\n- 1 wooden binding for the axle")], []));
    rooms.push(new Room(1, 0,
        [
            new Terrain(sceneWidth / 2 - 30, -20, 100, sceneHeight + 80, "rightWall"),
        ],
        [
            new Platform(640, 160),
            new Platform(820, 30),
        ], [], [],
        [new Hazard(0, 281, "thorns", sceneWidth - 50)]));
    rooms.push(new Room(1, 1, 
        [
            new Terrain(sceneWidth / 2 - 30, -20, 100, sceneHeight + 80, "rightWall"),
        ],
        [
            new Platform(460, 560),
            new Platform(640, 420), 
        ], [], [],
        [new Hazard(170, 200, "cicada")]));
    rooms.push(new Room(0, 1,
        [],
        [
            new Platform(400, 360)
        ], 
        [keyItemUI.items[2]], [],
        [new Dragonfly(40, 30, "down", 5, 400)]));
    rooms.push(new Room(-1, 1,
        [
            new Terrain(-20, 110, 80, sceneHeight, "leftWall"),
        ],
        [
            new Platform(890, 320),
            new Platform(360, 470)
        ],
        [], [],
        [new Hazard(230, 120, "cicada")]));
    rooms.push(new Room(-2, 1,
        [
            new Terrain(450, 110, 200, sceneHeight, "rightWall"),
            new Terrain(-20, -40, 80, sceneHeight + 120, "leftWall"),
            new Terrain(200, 270, 100, 100, "floor")
        ],
        [
            new Platform(700, 60),
        ], [], [],
        [
            new Hazard(250, 281, "thorns", 500),
            new Hazard(210, 245, "cicada"),
            new Dragonfly(50, 150, "right", 4, 200),
        ]));
    rooms.push(new Room(-2, 0,
        [
            new Terrain(-20, -40, 80, 400, "leftWall"),
            new Terrain(450, -40, 200, sceneHeight - 120, "rightWall"),
            new Terrain(200, -40, 650, 140, "ceiling"),
            new Terrain(-30, 240, sceneWidth - 120, 200, "floor"),
            new Terrain(465, 250, 200, 200, "rightWall"),
            new Terrain(360, 170, 100, 300, "floor")
        ], [], 
        [keyItemUI.items[1]],
        [new Sign(950, 442, "We dug this hole as a means of easily\ngetting to the right side of the swamp.\nWe also threw thorns so nobody could\nget in from here.\nAt least if they can't fly.")],
        [
            new Dragonfly(100, 200, "right", 4, 300),
            new Hazard(410, 281, "thorns", 140)
        ]));
    rooms.push(new Room(-3, 0,
        [
            new Terrain(400, -40, 250, 450, "rightWall"),
            new Terrain(-40, -40, 300, sceneHeight + 120, "leftWall"),
            new Terrain(-30, 240, sceneWidth + 90, 150, "floor"),
        ], 
        [
            new Platform(440, 300),
            new Platform(580, 160),
            new Platform(280, 30),
        ],
        [],
        [new Sign(400, 422, "Drake's Hideout\nNO REPTILES ALLOWED!\nUnless you have wings.")],
        [
            new Hazard(220, 125, "cicada"),
            new Hazard(244, 125, "cicada"),
        ]
    ));
    rooms.push(new Room(-3, 1,
        [
            new Terrain(400, -40, 250, sceneHeight + 120, "rightWall"),
            new Terrain(-40, -40, 300, sceneHeight + 120, "leftWall"),
            new Terrain(-30, -40, sceneWidth + 120, 100, "ceiling")
        ],
        [
            new Platform(380, 550),
            new Platform(560, 390),
            new Platform(270, 300),
            new Platform(410, 230),
        ],
        [keyItemUI.items[3]], [],
        [
            new Hazard(330, 170, "cicada"),
            new Hazard(140, 200, "cicada"),
            new Dragonfly(170, 100, "down", 3, 100)
        ]));
    rooms.push(new Room(-2, 2,
        [
            new Terrain(100, 80, 450, 80, "floor"),
            new Terrain(-20, -40, 80, sceneHeight + 120, "leftWall"),
            new Terrain(-30, -40, sceneWidth + 120, 100, "ceiling")
        ],
        [
            new Platform(620, 580),
            new Platform(320, 440),
            new Platform(70, 330),
            new Platform(0, 200),
        ],
        [keyItemUI.items[4]],
        [new Sign(500, 102, "Fly as far as possible!\nThere's treasure at the end for anyone\nwho makes it.")],
        [new Dragonfly(80, 175, "right")]
    ))
    rooms.push(new Room(-1, 2, [new Terrain(-30, -40, sceneWidth + 120, 100, "ceiling")], [], [], [],
        [
            new Dragonfly(245, 120, "down"),
        ]));
    rooms.push(new Room(0, 2, [new Terrain(-30, -40, sceneWidth + 120, 100, "ceiling")], [], [], [],
        [
            new Dragonfly(130, 90, "down", 3, 250),
            new Dragonfly(430, 90, "down", 3, 250)
        ]));
    rooms.push(new Room(1, 2,
        [
        new Terrain(-30, -40, sceneWidth + 120, 100, "ceiling"),
        new Terrain(470, 280, 100, 80, "floor"),
        ],
        [new Platform(790, 560)], [], [], []));
    rooms.push(new Room(2, 2,
        [
            new Terrain(400, -20, 300, sceneHeight + 80, "rightWall"),
            new Terrain(-30, 280, sceneWidth + 120, 80, "floor"),
            new Terrain(-30, -40, sceneWidth + 120, 100, "ceiling"),
        ], [],
        [keyItemUI.items[5]],
        [new Sign(240, 502, "We flap our wings to stay in the air.\nI wonder if any non-winged creatures\ncould also do that with a similar\nappendage?")], []));
}

function roomLoad(stage, x = 0, y = 0) {
    //Load the room with the specified x and y coordinates.
    for (let r of rooms) {
        if (r.x == x && r.y == y) {
            r.load(stage);
            return r;
        }
    }
}

function roomChange(stage) {
    //If the player goes off-screen in a certain direction, change the room according to the direction.
    if (player.x + player.width < 0) {
        activeRoom.unload(stage);
        //Teleport the player to the opposite side when loading the next room.
        player.x = sceneWidth - 1;
        return roomLoad(stage, activeRoom.x - 1, activeRoom.y);
    }
    else if (player.x > sceneWidth) {
        player.x = 3 - player.width;
        activeRoom.unload(stage);
        return roomLoad(stage, activeRoom.x + 1, activeRoom.y);
    }
    else if (player.y + player.height < 0) {
        activeRoom.unload(stage);
        player.y = sceneHeight - 1;
        return roomLoad(stage, activeRoom.x, activeRoom.y + 1);
    }
    else if (player.y > sceneHeight) {
        activeRoom.unload(stage);
        player.y = 3 - player.height;
        return roomLoad(stage, activeRoom.x, activeRoom.y - 1);
    }
    else {
        return activeRoom;
    }
}