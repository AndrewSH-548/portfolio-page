class Player extends PIXI.Graphics{
    constructor(x = 0, y = 0, width = 30, height = 30){
        super();
        this.beginFill(0x000000, 0.01);
        this.drawRect(x, y, 2, 2);
        this.endFill();
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;

        //To handle terrain collisions, a "feet" vector will be necesssary to distinguish where the player is colliding with the terrain block.
        this.feet = {
            x: this.x + this.width / 2,
            y: this.y + this.height - 4
        };

        // unique variables
        this.isGrounded = false;
        this.afterJumpPeak = false;
        this.velX = 0;
        this.velY = 0;
        this.gravity = 0;
        this.lolaStates = {};
        this.direction = "right";
    }

    update(dt = 1 / 60, keyInputs, activeRoom, stage) {

        this.updatePositions();
        this.displaySprites("stand", stage);

        //While in the air, the player will accelerate down.
        //While grounded, the player's Y position remains constant.
        if (!this.isGrounded) {

            //The player falls slowly if the jump button is held.
            if (keyInputs.jumpKey.isDown && this.afterJumpPeak){
                this.gravity = 0.0002;
            }
            else{
                this.gravity = 0.2;
            }
            this.afterJumpPeak = this.handleJumpPeak(this.velY, this.isGrounded);

            if (keyInputs.jumpKey.isDown && this.afterJumpPeak) {
                this.displaySprites("float", stage);
            }
            else if (this.afterJumpPeak) {
                this.displaySprites("fall", stage);
            }
            else {
                this.displaySprites("jump", stage);
            }
        }
        else{
            this.gravity = 0;
            this.velY = 0;
        }

        //If the player hits the bottom of a terrain block, their upwards momentum will halt
        for (let t of activeRoom.terrain) {
            if (t.bottomCollision(this)) {
                this.velY = 0;
                this.gravity = 0.4;
            }
        }

        //Movement left or right
        //If the player runs into a wall, they cannot move in that direction.
        this.velX = 0;
        if (keyInputs.leftKey.isDown) {
            this.velX = sideCollision(this, activeRoom.terrain, "right", -4);
            if (this.isGrounded) {
                this.displaySprites("run", stage);
            }
            this.flipSprites("left");
        }
        else if (keyInputs.rightKey.isDown) {
            this.velX = sideCollision(this, activeRoom.terrain, "left", 4);
            if (this.isGrounded) {
                this.displaySprites("run", stage);
            }
            this.flipSprites("right");
        }

        //Affect the player's position with velocity and velocity with acceleration.
        this.velY += this.gravity;
        this.x += this.velX;
        this.y += this.velY;
        
        this.isGrounded = false;

        //If the player is on top of a platform or terrain, they'll be grounded
        for (let t of activeRoom.terrain) {
            if (t.topCollision(this)) {
                this.y = t.y * 2 - this.height;
                this.isGrounded = true;
            }
        }
        for (let p of activeRoom.platforms) {
            if (p.topCollision(this)) {
                this.y = p.bounds.y - this.height;
                this.isGrounded = true;
            }
        }
        
        //When jumping, add a negative velocity to the player
        keyInputs.jumpKey.press = () => {
            //finishGame();
            //Jump if grounded.
            if (this.isGrounded){
                this.velY = -8.2;
                this.isGrounded = false;
                jumpSound.play();
            }
            //While falling, slow the player's descent
            else if (this.afterJumpPeak) {
                this.velY -= 1;
                openFrill.play();
            }
        }

        //Read any signs if the player is in their proximity.
        keyInputs.downKey.press = () => {
            for (let s of activeRoom.signs) {
                if (collisionCheck(player, s)) s.enable(stage);
            }
        }

        //Disable the sign if the player hits another direction.
        for (let s of activeRoom.signs) {
            if (s.isActive && (keyInputs.rightKey.isDown || keyInputs.leftKey.isDown || keyInputs.jumpKey.isDown)) {
                s.disable(stage);
            }
        }
    }

    //If the player is falling down, this returns true.
    handleJumpPeak(velY, isGrounded){
        if (isGrounded){
            return false;
        }
        if (velY < 0){
            return false;
        }
        return true;
    }

    //Updates the player's center object
    updatePositions() {
        this.feet.x = this.x + this.width / 2;
        this.feet.y = this.y + this.height - 4;
        for (let ls in this.lolaStates) {
            this.lolaStates[ls].x = this.x;
            this.lolaStates[ls].y = this.y;
        }
    }

    //Reset the player's position when resetting the game.
    resetProperties() {
        this.x = 30;
        this.y = 360;
    }

    //Add these sprites to the states object.
    loadSheet(spriteSheet) {
        this.lolaStates.stand = loadSprite(spriteSheet[0], this.x, this.y);
        this.lolaStates.run = loadAnimation([spriteSheet[1], spriteSheet[2]], this.x, this.y, 1/7, true);
        this.lolaStates.jump = loadSprite(spriteSheet[3], this.x, this.y);
        this.lolaStates.fall = loadSprite(spriteSheet[4], this.x, this.y);
        this.lolaStates.float = loadSprite(spriteSheet[5], this.x, this.y);
    }

    //Depending on what the player is doing, Lola's appearance will change.
    displaySprites(state, stage) {
        switch (state) {
            case "stand":
                this.replaceSprite(stage, this.lolaStates.stand)
                break;
            case "run":
                this.replaceSprite(stage, this.lolaStates.run)
                this.lolaStates.run.play();
                break;
            case "jump":
                this.replaceSprite(stage, this.lolaStates.jump)
                break;
            case "fall":
                this.replaceSprite(stage, this.lolaStates.fall)
                break;
            case "float":
                this.replaceSprite(stage, this.lolaStates.float)
                break;
        }
    }

    //Remove every sprite from the stage except the specified one, which will be the active one.
    //Add it afterwards.
    replaceSprite(stage, exclude) {
        for (let ls in this.lolaStates) {
            if (this.lolaStates[ls] != exclude) {
                stage.removeChild(this.lolaStates[ls]);
            }
        }
        stage.addChild(exclude);
    }

    //Flip the sprite if the player switches directions.
    //The anchor is shifted to prevent Lola from teleporting while swapping directions.
    flipSprites(currentDirection) {
        let anchorX;
        if (this.direction != currentDirection) {
            if (currentDirection == "right") {
                anchorX = 0;
            }
            else {
                anchorX = 1;
            }
            for (let ls in this.lolaStates) {
                this.lolaStates[ls].anchor.x = anchorX;
                this.lolaStates[ls].scale.x *= -1;
            }
            this.direction = currentDirection;
        }
    }
}

class Terrain extends PIXI.Graphics{
    constructor(x = 0, y = 0, width = 100, height = 38, type = null){
        super();
        this.beginFill(0x000000, 0.01);
        this.drawRect(x, y, width, height);
        this.endFill();
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.bounds = this.getBounds();
        this.texture = assets.terrainBlock;
        this.sprites = [];
        this.type = type;
    }

    //If the player's feet are to the right of the block, they're colliding with the right side.
    rightCollision(player) {
        return collisionCheck(player, this) && player.feet.x > this.bounds.x + this.bounds.width;
    }

    //If the player's feet are to the left of the block, they're colliding with the left side.
    leftCollision(player) {
        return collisionCheck(player, this) && player.feet.x < this.bounds.x;
    }

    //If the player's feet are above the block and within the block's edges, they're on top of it.
    topCollision(player) {
        return collisionCheck(player, this) && player.feet.y < this.bounds.y && player.feet.x - 10 < this.bounds.x + this.bounds.width && player.feet.x + 10 > this.bounds.x;
    }

    //If the player's feet are below the block and within the block's edges, they're below it.
    bottomCollision(player) {
        return collisionCheck(player, this) && player.feet.y > this.bounds.y + this.bounds.height && player.feet.x - 10 < this.bounds.x + this.bounds.width && player.feet.x + 10 > this.bounds.x;
    }

    visualize(stage) {
        if (!this.texture) return;
        //Create a bunch of offsets to extract from the terrain sprite.
        let topLeftCorner = new PIXI.Rectangle(20, 34, 22, 24);
        let topRightCorner = new PIXI.Rectangle(162, 34, 22, 24);
        let bottomLeftCorner = new PIXI.Rectangle(20, 104, 22, 24);
        let bottomRightCorner = new PIXI.Rectangle(162, 104, 22, 24);
        let topSide = new PIXI.Rectangle(42, 34, 120, 24);
        let leftSide = new PIXI.Rectangle(20, 58, 22, 46);
        let rightSide = new PIXI.Rectangle(162, 58, 22, 46);
        let bottomSide = new PIXI.Rectangle(42, 104, 120, 24);
        let centerBlock = new PIXI.Rectangle(42, 58, 120, 46);

        //The type dictates which side will have the decorations on it.
        switch (this.type) {
            case "floor":
                //Increase the height to show the decorations.
                topSide.y = 0;
                topSide.height += 34;
                break;
            case "rightWall":
                leftSide.x = 0;
                leftSide.width += 20;
                break;
            case "leftWall":
                rightSide.width += 20;
            case "ceiling":
                bottomSide.height += 30;
                break;
        }

        //Create a "brush" that will keep track of our current location when painting the terrain.
        let brush = { x: this.x * 2, y: this.y * 2 }

        //Loading the top
        //Draw the piece of the terrain in the right location, then move the brush forward.
        this.sprites.push(loadSpritePortion(this.texture, topLeftCorner, brush.x, brush.y));
        brush.x += topLeftCorner.width;
        this.loadHorizontalSide("floor", topSide, brush, 34);
        this.sprites.push(loadSpritePortion(this.texture, topRightCorner, brush.x, brush.y));
        //Move the brush back to the far left
        brush.x = this.x * 2;
        brush.y += topRightCorner.height;

        //Drawing the walls and center uses the same loop method as the horizontal side, just with the height instead of the width.
        //Load a line of sprites, and then move down by adding to the brush's y.
        let totalHeight = this.height - 58;
        let leftOver = totalHeight;
        for (let i = 0; i < Math.floor(totalHeight / centerBlock.height); i++) {
            if (this.type == "rightWall") {
                brush.x -= 20;
            }
            this.sprites.push(loadSpritePortion(this.texture, leftSide, brush.x, brush.y));
            brush.x += leftSide.width;
            this.loadHorizontalSide("center", centerBlock, brush, 0);
            this.sprites.push(loadSpritePortion(this.texture, rightSide, brush.x, brush.y));
            brush.x = this.x * 2;
            brush.y += rightSide.height;
            leftOver -= rightSide.height;
        }
        if (this.type == "rightWall") {
            brush.x -= 20;
        }
        this.sprites.push(loadSpritePortion(this.texture, new PIXI.Rectangle(leftSide.x, leftSide.y, leftSide.width, leftOver), brush.x, brush.y));
        brush.x += leftSide.width;
        this.loadHorizontalSide("center", new PIXI.Rectangle(centerBlock.x, centerBlock.y, centerBlock.width, leftOver), brush, 0);
        this.sprites.push(loadSpritePortion(this.texture, new PIXI.Rectangle(rightSide.x, rightSide.y, rightSide.width, leftOver), brush.x, brush.y));
        brush.x = this.x * 2;
        brush.y += leftOver;

        //Load the bottom side
        //Same process as loading the top.
        this.sprites.push(loadSpritePortion(this.texture, bottomLeftCorner, brush.x, brush.y));
        brush.x += bottomLeftCorner.width;
        this.loadHorizontalSide("ceiling", bottomSide, brush, 30);
        this.sprites.push(loadSpritePortion(this.texture, bottomRightCorner, brush.x, brush.y));

        //Add all the sprites we just created to the stage.
        for (let s of this.sprites) {
            stage.addChild(s);
        }

    }

    //This will load a horizontal line of terrain sprites.
    loadHorizontalSide(type, offset, brush, decoHeight) {
        //Move the brush upwards if this is using the floor sprite.
        if (this.type == "floor" && type == "floor") {
            brush.y -= decoHeight;
        }

        //To draw the line, keep track of the total width and leftover width.
        //As the pieces are being drawn, the brush moves forward and the leftover width decreases.
        //Repeat until the leftover width is less than the width of the offset.
        let totalWidth = this.width - 44;
        let leftOver = totalWidth;
        for (let i = 0; i < Math.floor(totalWidth / 120); i++) {
            this.sprites.push(loadSpritePortion(this.texture, offset, brush.x, brush.y));
            brush.x += offset.width;
            leftOver -= offset.width;
        }
        //Create a final sprite with a rectangle that has all the offset's dimensions except the width, which will be the leftover width.
        this.sprites.push(loadSpritePortion(this.texture, new PIXI.Rectangle(offset.x, offset.y, leftOver, offset.height), brush.x, brush.y));
        brush.x += leftOver;

        //Return the brush to its normal position if it was elevated.
        if (this.type == "floor" && type == "floor") {
            brush.y += decoHeight;
        }
    }

    //Remove all the sprites in the array from the stage
    clear(stage) {
        for (let s of this.sprites) {
            stage.removeChild(s);
        }
    }
}

class Platform extends PIXI.Sprite {
    constructor(x = 0, y = 0) {
        super(assets.platform);
        this.x = x;
        this.y = y;
        this.bounds = new PIXI.Rectangle(this.x + 12, this.y + 12, 118, 6);
    }

    //Platforms will only collide with the player from the top.
    topCollision(player) {
        return collisionCheck(player, this) && player.feet.y < this.bounds.y && player.feet.x - 10 < this.bounds.x + this.bounds.width && player.feet.x + 10 > this.bounds.x;
    }
}

class Hazard extends PIXI.Graphics{
    //The height in this constructor is never used, but is necessary to avoid desyncs.
    //The coordinates with PIXI.Graphics behave weirdly and internally double the passed x and y values.
    constructor(x = 0, y = 0, type, width = 100, height = 38){
        super();
        switch (type) {
            //Set the width and height depending on the 
            case "cicada":
                width = cicadaWidth;
                height = cicadaHeight;
                break;
            case "dragonfly":
                width = dragonflyWidth;
                height = dragonflyHeight;
                break;
            case "thorns":
                height = thornHeight;
                break;
        }
        //this.beginFill(0xFF0000);
        this.beginFill(0x000000, 0.01)
        this.drawRect(x, y, width, height);
        this.endFill();
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;

        //Use a different sprite depending on the type of hazard this is.
        if (type == "cicada") {
            this.texture = cicadaSprites;
        }
        else if (type == "dragonfly") {

            this.texture = dragonflySprites;
        }
        else {
            this.texture = assets.thorns;
        }
        this.bounds = this.getBounds();
        this.sprites;
        this.type = type;
    }

    visualize(stage) {
        if (!this.texture) return;
        switch (this.type) {
            case "cicada":
            case "dragonfly":
                //Cicadas and dragonflies use a single animated sprite.
                this.sprites = loadAnimation([this.texture[0], this.texture[1]], this.x * 2, this.y * 2, 1 / 4, true);
                this.sprites.play();
                stage.addChild(this.sprites);
                return;
            case "thorns":
                //Thorns have a list of sprites, using a similar loading loop to terrain.
                this.sprites = [];
                let xOffset = this.x * 2;
                let widthLeftover = this.width;

                //Load sprite instances until the leftover width is less than the width of one sprite.
                for (let i = 0; i < Math.floor(this.width / 216); i++) {
                    this.sprites.push(loadSprite(this.texture, xOffset, this.y * 2));
                    xOffset += 216;
                    widthLeftover -= 216;
                }
                //Load a sprite instances using the leftover width.
                this.sprites.push(loadSpritePortion(this.texture, new PIXI.Rectangle(0, 0, widthLeftover, thornHeight), xOffset, this.y * 2));
                for (let s of this.sprites) {
                    stage.addChild(s);
                }
                return;
        }
    }

    clear(stage) {
        //Try removing the sprites as if it's a list. If it doesn't work, just remove the sprite itself.
        try {
            for (let s of this.sprites) {
                stage.removeChild(s);
            }
            return;
        }
        catch { }
        stage.removeChild(this.sprites);
    }
}

class Dragonfly extends Hazard {
    constructor(x = 0, y = 0, direction, speed = 2, distance = 150) {
        super(x, y, "dragonfly");
        this.distance = distance;
        this.direction = direction;
        this.startingX = this.x;
        this.startingY = this.y;
        this.startingSpeed = speed;
        this.speed = speed;
        this.distanceCovered = 0;
    }

    //Rotate the sprite depending on the direction it's currently flying.
    //The rotation goes clockwise and uses radians.
    orient(direction) {
        switch (direction) {
            case "up":
                this.sprites.rotation = 0;
                break;
            case "right":
                this.sprites.rotation = Math.PI / 2;
                break;
            case "left":
                this.sprites.rotation = Math.PI * 1.5;
                break;
            case "down":
                this.sprites.rotation = Math.PI;
                break;
        }
    }

    //Reset all the properties so this stays in its original position when leaving and re-entering a room.
    reset() {
        this.x = this.startingX;
        this.y = this.startingY;
        this.sprites.x = this.x * 2;
        this.sprites.y = this.y * 2;
        this.distanceCovered = 0;
        this.speed = this.startingSpeed;
    }

    visualize(stage) {
        //Since this is inherited from regular hazards, all the normal visualizations are handled there.
        super.visualize(stage);
        this.reset();
        //Since this'll be rotating, set the anchor to the center and solve the desync.
        this.sprites.anchor.set(0.5, 0.5);
        this.sprites.x += this.width / 2;
        this.sprites.y += this.height / 2;
        //Have this face the specified direction.
        //This creates a slight inaccuracy between the hitbox and the sprite, but it's minimal and attempting to adjust it just causes more problems.
        switch (this.direction) {
            case "right":
                this.orient("right");
                break;
            case "down":
                this.orient("down");
                break;
        }
        
    }

    move() {
        //Reassign these to ensure they update with the position.
        this.bounds = this.getBounds();

        //The direction will influence whether x or y is affected by the movement code.
        switch (this.direction) {
            case "right":
                //Move the dragonfly using the current speed.
                this.x += this.speed;
                this.sprites.x += this.speed;
                this.distanceCovered += this.speed;

                //If the dragonfly went its max distance or reached its origin, it'll flip and go the other way.
                if (this.distanceCovered > this.distance) {
                    this.orient("left");
                    this.speed *= -1;
                }
                else if (this.distanceCovered < 0) {
                    this.orient("right");
                    this.speed *= -1;
                }
                break;
            case "down":
                this.y += this.speed;
                this.sprites.y += this.speed;
                this.distanceCovered += this.speed;
                if (this.distanceCovered > this.distance) {
                    this.orient("up");
                    this.speed *= -1;
                }
                else if (this.distanceCovered < 0) {
                    this.orient("down");
                    this.speed *= -1;
                }
                break;
        }
        
    }
}

class KeyItem extends PIXI.Graphics {
    constructor(x = 0, y = 0, sprite, width = 32, height = 32) {
        super();
        this.beginFill(0x000000, 0.1);
        this.drawRect(x, y, width, height);
        this.endFill();
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.isCollected = false;
        this.sprite = loadSprite(sprite, this.x * 2, this.y * 2);
    }

    visualize(stage) {
        stage.addChild(this.sprite);
    }

    clear(stage) {
        stage.removeChild(this.sprite);
    }
}

class Sign extends PIXI.Sprite {
    constructor(x = 0, y = 0, text = "Sample") {
        super(assets.sign);
        this.x = x;
        this.y = y;

        //The trigger field will be a lot larger than the actual sign, for ease of access.
        this.triggerField = new PIXI.Rectangle(this.x - 30, this.y - this.height, this.width + 60, this.height * 2);
        this.text = text;

        //Create the large sign graphic which will hold the sign's text.
        this.bigSign = new PIXI.Sprite(assets.signUI);
        this.bigSign.x = 100;
        this.bigSign.y = 50;
        this.isActive = false;

        //The text will use the string parameter.
        this.text = new PIXI.Text(text);
        this.text.style = new PIXI.TextStyle({
            fill: 0x222200,
            fontSize: 35,
            fontFamily: 'Kaushan Script',
            wordWrap: true,
            wordWrapWidth: 1000,
        });
        this.text.x = 240;
        this.text.y = 140;

        //Create a container to hold the sign and text.
        //This is separate from the game scene to prevent any other sprites from overlapping it.
        this.display = new PIXI.Container();
        this.display.visible = false;
        this.display.addChild(this.bigSign);
        this.display.addChild(this.text);
        app.stage.addChild(this.display);
    }

    enable(stage) {
        //Hide the game scene and show this sign's display container.
        this.isActive = true;
        stage.visible = false;
        this.display.visible = true;
    }

    disable(stage) {
        //Hide the sign's display and return to the game scene.
        this.isActive = false;
        stage.visible = true;
        this.display.visible = false;
    }
}

class Room {
    constructor(xCoordinate, yCoordinate, terrain, platforms, items, signs, hazards) {
        //Each room has an x and y in relation to each other, and holds all the specified objects.
        this.x = xCoordinate;
        this.y = yCoordinate;
        this.terrain = terrain;
        this.platforms = platforms;
        this.items = items;
        this.signs = signs;
        this.hazards = hazards;
    }

    load(stage) {
        //go through all the lists and add each item to the stage.
        //Visualize certain objects like hazards and terrain.
        for (let i of this.items) {
            if (!i.isCollected) {
                stage.addChild(i);
                i.visualize(stage);
            }
        }
        for (let p of this.platforms) {
            stage.addChild(p);
        }
        for (let h of this.hazards) {
            stage.addChild(h);
            h.visualize(stage);
        }
        for (let t of this.terrain) {
            stage.addChild(t);
            t.visualize(stage);
        }
        for (let s of this.signs) {
            stage.addChild(s);
        }
    }

    unload(stage) {
        //Remove and clear all the room's objects from the stage.
        for (let t of this.terrain) {
            stage.removeChild(t);
            t.clear(stage);
        }
        for (let p of this.platforms) {
            stage.removeChild(p);
        }
        for (let i of this.items) {
            stage.removeChild(i);
            i.clear(stage);
        }
        for (let h of this.hazards) {
            stage.removeChild(h);
            h.clear(stage);
        }
        for (let s of this.signs) {
            stage.removeChild(s);
        }

    }
}

class KeyItemUI extends PIXI.Sprite {
    constructor(x = 0, y = 0) {
        super(assets.keyItemUI);
        this.x = x;
        this.y = y;

        //This object holds all the key items, which are put in the rooms from here.
        this.items = [
            new KeyItem(160, 20, assets.keyStick),
            new KeyItem(210, 130, assets.keyBinding), 
            new KeyItem(210, 90, assets.keyLeaf), 
            new KeyItem(155, 110, assets.keyLeaf), 
            new KeyItem(210, 50, assets.keyLeaf), 
            new KeyItem(320, 220, assets.keyLeaf), 
        ];

        //Hold the graphics here to utilize them in displays and comparisons.
        this.leavesCollected = 0;
        this.keyItemGraphics = [assets.keyStick, assets.keyBinding, assets.keyLeaf];
        this.numberGraphics = [assets.ui0, assets.ui1, assets.ui2, assets.ui3, assets.ui4];
    }

    display(stage) {
        //If a key item is collected, it'll show up in the UI.
        if (this.items[0].isCollected && !stage.children.includes(this.keyItemGraphics[0])) {
            stage.addChild(loadSprite(this.keyItemGraphics[0], this.x + 18, this.y + 16));
        }
        if (this.items[1].isCollected && !stage.children.includes(this.keyItemGraphics[1])) {
            stage.addChild(loadSprite(this.keyItemGraphics[1], this.x + 83, this.y + 16));
        }
        //Show the number of leaves collected
        switch (this.leavesCollected) {
            case 0:
                if (!stage.children.includes(this.numberGraphics[0])) {
                    stage.addChild(loadSprite(this.numberGraphics[0], this.x + 50, this.y + 48));
                }
                break;
            case 1:
                if (!stage.children.includes(this.numberGraphics[1])) {
                    stage.addChild(loadSprite(this.numberGraphics[1], this.x + 50, this.y + 48));
                }
                break;
            case 2:
                if (!stage.children.includes(this.numberGraphics[2])) {
                    stage.addChild(loadSprite(this.numberGraphics[2], this.x + 50, this.y + 48));
                }
                break;
            case 3:
                if (!stage.children.includes(this.numberGraphics[3])) {
                    stage.addChild(loadSprite(this.numberGraphics[3], this.x + 50, this.y + 48));
                }
                break;
            case 4:
                if (!stage.children.includes(this.numberGraphics[4])) {
                    stage.addChild(loadSprite(this.numberGraphics[4], this.x + 50, this.y + 48));
                }
                break;
        }
        //Once all 4 leaves are collected, the leaf graphic will highlight.
        if (this.leavesCollected == 4 && !stage.children.includes(this.keyItemGraphics[2])) {
            stage.addChild(loadSprite(this.keyItemGraphics[2], this.x + 52, this.y + 16))
        }
    }

    //Check if the player won by seeing if all the key items were collected.
    winCheck() {
        for (let i of this.items) {
            if (!i.isCollected) return false;
        }
        return true;
    }

    //Reset all the items when reloading the game.
    reset() {
        for (let i of this.items) {
            i.isCollected = false;
        }
        this.leavesCollected = 0;
    }
}