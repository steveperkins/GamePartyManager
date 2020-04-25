// TODO Speed is determined by how quickly fluid is going through the flow meter. We need to find out what the max speed is or add calculations to fit the 0 - 40 range.
const MAX_SPEED = 40
let _game
function Game(canvasId) {
    _game = this
    _game.canvasId = canvasId
    _game.stage = undefined
    _game.assetLoader = undefined
    _game.canvasWidth = undefined
    _game.canvasHeight = undefined
    _game.space = undefined
    _game.ship = undefined
    _game.dockingBay = undefined
    _game.animating = false
    _game.dockingBayScaleTimeoutHandle = undefined
    _game.ambianceLoop = undefined

    _game.horizontalSpeed = 1
    _game.direction = undefined
}

Game.prototype.init = function(readyCallback) {
    _game.stage = new createjs.Stage("canvas")
    // Stash canvas width and height for later calculations:
    _game.canvasWidth = document.getElementById("canvas").width
    _game.canvasHeight = document.getElementById("canvas").height
    const manifest = [
        { src: "x-wing.png", id: "ship" },
        { src: "starrysky.jpg", id: "background" },
        { src: "docking-bay.gif", id: "dockingBay" }
    ]
    _game.assetLoader = new createjs.LoadQueue(false)
    _game.assetLoader.loadManifest(manifest, true, "assets/game/")
    if (readyCallback) {
        _game.assetLoader.addEventListener("complete", readyCallback)
    }

    createjs.Sound.alternateExtensions = ["mp3"]
    createjs.Sound.registerSounds([
        { id: "ambiance", src: "spaceship-ambiance.mp3" },
        { id: "thruster", src: "thruster.mp3" }
    ], "assets/game/")
}

Game.prototype.startAmbiance = function() {
    const props = new createjs.PlayPropsConfig().set({loop: -1, volume: 0.2, pan: -.8, startTime: 1000, duration: 8 * 1000})
    if (!_game.ambianceLoop) {
        _game.ambianceLoop = createjs.Sound.play("ambiance", props) 
    } else {
        _game.ambianceLoop.play("ambiance", props) 
    }
}

Game.prototype.stopAmbiance = function() {
    if (_game.ambianceLoop) {
        _game.ambianceLoop.stop()
    }
}

Game.prototype.startGame = function() {
    _game.stage.removeAllChildren();
    _game.stage.update();

    _game.space = new createjs.Bitmap(_game.assetLoader.getResult("background"))
    _game.stage.addChild(_game.space)

    _game.dockingBay = new createjs.Bitmap(_game.assetLoader.getResult("dockingBay"))
    _game.dockingBay.scaleX = _game.canvasWidth / _game.dockingBay.image.width
    _game.dockingBay.scaleY = _game.dockingBay.scaleX
    _game.dockingBay.regX = 368 / 3
    _game.dockingBay.regy = 0
    _game.stage.addChild(_game.dockingBay)
    
    _game.ship = new createjs.Bitmap(_game.assetLoader.getResult("ship"))

    _game.ship.x = 1000
    _game.ship.y = _game.canvasHeight / 2
    // Set registration point to image center for rotation
    _game.ship.regX = _game.ship.image.width / 2
    _game.ship.regY = _game.ship.image.height / 2

    _game.stage.addChild(_game.ship)

    createjs.Ticker.framerate = 60
    createjs.Ticker.addEventListener("tick", _game.onTick)

    createjs.Tween.get(_game.space, { loop: true })
        .to({ x: -2, y: -1 }, 100, createjs.Ease.sineIn)
        .to({ x: -1, y: 0 }, 100, createjs.Ease.sineIn)
        .to({ x: 0, y: -1 }, 100, createjs.Ease.sineIn)
        .to({ x: -1, y: -1 }, 100, createjs.Ease.sineIn)

    _game.stage.update()
    _game.startAmbiance()

    _game.dockingBayScaleTimeoutHandle = setInterval(function() {
        if (_game.dockingBay.image.height * _game.dockingBay.scaleY > _game.canvasHeight + 600) {
            clearInterval(game.dockingBayScaleTimeoutHandle)
            _game.gameOver()
            return
        }

        const newXScale = _game.dockingBay.scaleX += 0.006
        const newYScale = _game.dockingBay.scaleY += 0.006
        createjs.Tween.get(_game.dockingBay, { override: true })
            .to({ scaleX: newXScale, scaleY: newYScale, x: _game.dockingBay.x - newXScale * 0.8, y: (_game.dockingBay.y - (newYScale / 2))  }, 90)
    }, 70)
}

Game.prototype.onTick = function() {
    if (_game.horizontalSpeed < 0) { _game.horizontalSpeed = 0 }
    else if (_game.horizontalSpeed > MAX_SPEED) { _game.horizontalSpeed = MAX_SPEED }

    let easing = createjs.Ease.sineIn
    let x = _game.ship.x
    let rotation = 0
    if (_game.direction === "left") {
        x -= _game.horizontalSpeed
        rotation = 0 - _game.horizontalSpeed
    } else if (_game.direction === "right") {
        x += _game.horizontalSpeed
        rotation = _game.horizontalSpeed
    }

    if (x <= 0) {
        x = 0
        easing = createjs.Ease.backIn
    } else if (x >= _game.canvasWidth) {
        x = _game.canvasWidth
        easing = createjs.Ease.backIn
    }

    if (!_game.animating && _game.ship.rotation !== rotation) {
        _game.rotateShip(rotation)
    }

    if (!_game.animating) {
        _game.animating = true
        if (Math.abs(_game.ship.x - x) > 3) {
            createjs.Sound.play("thruster", new createjs.PlayPropsConfig().set({ pan: .8, startTime: 0, duration: 100, volume: Math.abs(rotation) / 100 + 0.2 }));
        }

        createjs.Tween.get(_game.ship, { loop: false })
            .to({ x: x, y: _game.ship.y + _game.randomBetween(-1, 3) }, 10, easing)
            .call(function() {
                _game.animating = false
            })
    }

    _game.stage.update()
}

Game.prototype.keyboardInput = function(event) {
     if (event.code === "ArrowLeft") {
        // TODO Once the water is hooked up we'll know the flow speed every time it changes
        _game.direction = "left"
    } else if (event.code === "ArrowRight") {
        _game.direction = "right"
    } else if (event.code === "ArrowUp") {
        _game.horizontalSpeed += 10
    } else if (event.code === "ArrowDown") {
        _game.horizontalSpeed -= 10
    }
    return true
}

Game.prototype.rotateShip = function(rotation) {
    console.log(`Moving ${rotation} degrees`)
    _game.animating = true
    createjs.Tween.get(_game.ship)
        .to({ rotation: rotation }, 30)
        .call(function() {
            _game.animating = false
        })
}

Game.prototype.onGameWon = function(callback) {
    _game.onGameWon = callback
}
Game.prototype.onGameLost = function(callback) {
    _game.onGameLost = callback
}
Game.prototype.gameOver = function() {
    _game.stopAmbiance()
    createjs.Ticker.paused = true

    if (_game.ship.x < _game.canvasWidth / 2) {
        // Close enough to the docking bay to call it good
        if (_game.onGameWon) {
            _game.onGameWon()
        }
    } else {
        if (_game.onGameLost) {
            _game.onGameLost(_game.ship.x - _game.canvasWidth / 2)
        }
    }
}

Game.prototype.randomBetween = function(low, high) {
    return Math.floor(Math.random() * high) + low
}