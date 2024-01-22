function keyboard(value) {
    const key = {};
    key.value = value;
    key.isDown = false;
    key.isUp = true;
    key.press = undefined;
    key.release = undefined;
    //The `downHandler`
    key.downHandler = (event) => {
      if (event.key === key.value) {
        if (key.isUp && key.press) {
          key.press();
        }
        key.isDown = true;
        key.isUp = false;
        event.preventDefault();
      }
    };
  
    //The `upHandler`
    key.upHandler = (event) => {
      if (event.key === key.value) {
        if (key.isDown && key.release) {
          key.release();
        }
        key.isDown = false;
        key.isUp = true;
        event.preventDefault();
      }
    };
  
    //Attach event listeners
    const downListener = key.downHandler.bind(key);
    const upListener = key.upHandler.bind(key);
    
    window.addEventListener("keydown", downListener, false);
    window.addEventListener("keyup", upListener, false);
    
    // Detach event listeners
    key.unsubscribe = () => {
      window.removeEventListener("keydown", downListener);
      window.removeEventListener("keyup", upListener);
    };
    
    return key;
}

function collisionCheck(a, b) {
    let ab = a.getBounds();
    let bb;
    if (b.bounds) {
        bb = b.bounds;
    }
    else if (b.triggerField) {
        bb = b.triggerField;
    }
    else {
        bb = b.getBounds();
    }
    return ab.x + ab.width >= bb.x && ab.x <= bb.x + bb.width && ab.y <= bb.y + bb.height && ab.y + ab.height >= bb.y;
}

function sideCollision(player, terrain, direction, velX) {
    let collision = false;
    
    for (let t of terrain) {
        if ((direction == "left" && t.leftCollision(player)) || (direction == "right" && t.rightCollision(player)) && !t.topCollision(player)) {
            collision = true;
        }
    }
    if (collision) {
        return 0;
    }
    else {
        return velX;
    }
}

function loadSprite(texture, x, y) {
    let sprite = new PIXI.Sprite(texture);
    sprite.x = x;
    sprite.y = y;
    return sprite;
}

function loadSpriteSheet(sheet, width, height, numFrames, layout) {
    let textures = [];
    switch (layout) {
        case "horizontal":
            for (let i = 0; i < numFrames; i++) {
                let frame = new PIXI.Texture(sheet, new PIXI.Rectangle(i * width, 0, width, height));
                textures.push(frame);
            }
            break;
        case "vertical":
            for (let i = 0; i < numFrames; i++) {
                let frame = new PIXI.Texture(sheet, new PIXI.Rectangle(0, i * height, width, height));
                textures.push(frame);
            }
            break;
    }
    return textures;
}

function loadAnimation(textures, x, y, animSpeed, loop) {
    let sprite = new PIXI.AnimatedSprite(textures);
    sprite.x = x;
    sprite.y = y;
    sprite.animationSpeed = animSpeed;
    sprite.loop = loop;
    return sprite;
}

function loadSpritePortion(baseTexture, rectangle, x, y) {
    let texture = new PIXI.Texture(baseTexture, rectangle);
    let sprite = PIXI.Sprite.from(texture);
    sprite.x = x;
    sprite.y = y;
    return sprite;
}