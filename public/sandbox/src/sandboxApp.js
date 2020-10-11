/**
 *
 * UI Controller (VIEW)
 * This is our 'V' in MVC
 *
 */
const uiController = (() => {
  const initialSceneSetupFunctions = {
    loadGameAssets: (gameObject) => {
      gameObject.load.image('sky', './../sandbox/assets/sky.png');
      gameObject.load.image('ground', './../sandbox/assets/platform.png');
      gameObject.load.image('star', './../sandbox/assets/star.png');
      gameObject.load.image('bomb', './../sandbox/assets/bomb.png');
      gameObject.load.spritesheet('dude', './../sandbox/assets/dude.png', {
        frameWidth: 32,
        frameHeight: 48,
      });
      return gameObject;
    },
    renderBlueSkyBackground: (gameObject) => {
      gameObject.add.image(0, 0, 'sky').setOrigin(0, 0);
      return gameObject;
    },
    renderScenePlatforms: (gameObject) => {
      const platforms = gameObject.physics.add.staticGroup();
      platforms.create(400, 580, 'ground').setScale(2).refreshBody();
      platforms.create(400, 450, 'ground');
      platforms.create(100, 350, 'ground');
      platforms.create(600, 250, 'ground');
      platforms.create(75, 225, 'ground');
      platforms.create(300, 100, 'ground');
      return platforms;
    },

    displayGameTitle: (gameObject) => {
      const titleCss = {
        font: '16px Courier',
        fill: '#fff',
      };
      gameObject.add.text(
        300,
        15,
        `${gameObject.game.config.gameTitle}`,
        titleCss
      );
      return gameObject;
    },
    bindCursorKeys: (gameObject) => {
      const cursors = gameObject.input.keyboard.createCursorKeys();
      return cursors;
    },
  };

  const starSetupFunctions = {
    renderStarGroup: (gameObject, xVal, yVal, stepXVal) => {
      const stars = gameObject.physics.add.group({
        key: 'star',
        repeat: 11,
        setXY: { x: xVal, y: yVal, stepX: stepXVal },
      });

      stars.children.iterate(function (child) {
        child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
      });
      return stars;
    },
    setupPlatformStarsCollision: (gameObject, stars, platforms) => {
      gameObject.physics.add.collider(stars, platforms);
      return gameObject;
    },
    starCollected: (player, star) => {
      return star.disableBody(true, true);
    },
  };

  const playerOneSetupFunctions = {
    renderPlayerOne: (gameObject) => {
      const playerOne = gameObject.physics.add.sprite(50, 500, 'dude');
      return playerOne;
    },
    setPlayerOneInitialPhysics: (player) => {
      player.setBounce(0.5);
      player.body.setGravity(0, 300);
      player.setCollideWorldBounds(true);
      return player;
    },
    setPlayerOneAnimations: (gameObject) => {
      gameObject.anims.create({
        key: 'left',
        frames: gameObject.anims.generateFrameNumbers('dude', {
          start: 0,
          end: 3,
        }),
        frameRate: 10,
        repeat: -1,
      });

      gameObject.anims.create({
        key: 'turn',
        frames: [{ key: 'dude', frame: 4 }],
        frameRate: 20,
      });

      gameObject.anims.create({
        key: 'right',
        frames: gameObject.anims.generateFrameNumbers('dude', {
          start: 5,
          end: 8,
        }),
        frameRate: 10,
        repeat: -1,
      });
      return gameObject;
    },
    setupPlayerOneMovement: (player, cursors, dataCtrl) => {
      /**
       *
       * Let's asses which cursor is being pressed,
       * and set some velocity on the x-axis if its
       * a left or right key being pressed.
       * if no key is pressed, face the user
       *
       */
      if (cursors.left.isDown) {
        player.setVelocityX(-80);
        player.anims.play('left', true);
      } else if (cursors.right.isDown) {
        player.setVelocityX(80);
        player.anims.play('right', true);
      } else {
        player.setVelocityX(0);
        player.anims.play('turn');
      }

      /**
       *
       * let's assess if the player is touching the ground
       * and if the up key is pressed, jump...
       * also, we'll set a jump counter in the browsers local
       * storage to moderate double jumping.
       *
       */
      // --- jump
      if (cursors.up.isDown && player.body.touching.down) {
        player.setVelocityY(-330);
        dataCtrl.setJumpCount();
      }

      // double jump
      const jumpCount = dataCtrl.getJumpCount();
      /**
       *
       * if the player is jumping, at a veloctity(Y)
       * of less than 30, and they have only jumped once,
       * ... jump again and reset the jump counter to prevent
       * further jumps.
       *
       */
      if (
        cursors.up.isDown &&
        !player.body.touching.down &&
        jumpCount == 1 &&
        player.body.velocity.y < 30 &&
        player.body.velocity.y > -100
      ) {
        player.setVelocityY(-330);
        dataCtrl.resetJumpCount();
      }

      return player;
    },
    setupPlayerPlatformCollision: (gameObject, player, platforms) => {
      gameObject.physics.add.collider(player, platforms);
      return gameObject;
    },
    setupPlayerStarCollection: (player, stars, collectStarFn, gameObject) => {
      gameObject.physics.add.overlap(
        player,
        stars,
        collectStarFn,
        false,
        gameObject
      );
      return gameObject;
    },
  };

  return {
    loadAssets: initialSceneSetupFunctions.loadGameAssets,
    renderSky: initialSceneSetupFunctions.renderBlueSkyBackground,
    renderPlatform: initialSceneSetupFunctions.renderScenePlatforms,
    renderStars: starSetupFunctions.renderStarGroup,
    collectStar: starSetupFunctions.starCollected,
    setStarPlatformCollisions: starSetupFunctions.setupPlatformStarsCollision,
    displayTitle: initialSceneSetupFunctions.displayGameTitle,
    setupCursorKeys: initialSceneSetupFunctions.bindCursorKeys,
    renderPlayerOne: playerOneSetupFunctions.renderPlayerOne,
    setPlayerOnePhysics: playerOneSetupFunctions.setPlayerOneInitialPhysics,
    setPlayerOneAnimations: playerOneSetupFunctions.setPlayerOneAnimations,
    setPlayerPlatformCollisions:
      playerOneSetupFunctions.setupPlayerPlatformCollision,
    setPlayerStarCollisions: playerOneSetupFunctions.setupPlayerStarCollection,
    evaluatePlayerOneMovement: playerOneSetupFunctions.setupPlayerOneMovement,
  };
})();

/**
 *
 * Data Controller (MODEL)
 * This is our 'M' in MVC
 *
 */
const dataController = (() => {
  const playerJumpState = {
    setJumpCount: () => {
      return window.localStorage.setItem('jumpCount', 1);
    },
    resetJumpCount: () => {
      return window.localStorage.setItem('jumpCount', 0);
    },
    getJumpCount: () => {
      return window.localStorage.getItem('jumpCount');
    },
  };

  return {
    setJumpCount: playerJumpState.setJumpCount,
    resetJumpCount: playerJumpState.resetJumpCount,
    getJumpCount: playerJumpState.getJumpCount,
  };
})();

/**
 *
 * GameController (Controller)
 * This our 'C' in MVC
 *
 */
const gameController = ((uiCtrl, dataCtrl) => {
  //------- GAME CONFIG
  const config = {
    type: Phaser.AUTO,
    parent: 'sandbox-game',
    title: 'phaser-sandbox',
    width: 800,
    height: 600,
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { y: 300 },
        debug: true,
      },
    },
    scene: {
      preload: preload,
      create: create,
      update: update,
    },
  };

  let game = new Phaser.Game(config);
  // ------ lets define some variables to make them available to the game scene functions
  let cursors;
  let player;
  let platforms;
  let stars = [];

  //----- GAME SCENE FUNCTIONS DEFINITIONS
  /**
   *
   * We use Javascript's binding of `this` to the
   * 'object in question calling the function'.
   * so, in this context...`this` will be the
   * game object (at the time of execution).
   *
   */

  function preload() {
    uiCtrl.loadAssets(this);
  }

  function create() {
    uiCtrl.renderSky(this);
    platforms = uiCtrl.renderPlatform(this);
    stars[0] = uiCtrl.renderStars(this, 12, 300, 70);
    stars[1] = uiCtrl.renderStars(this, 12, 0, 70);
    stars.forEach((starGroup) => {
      uiCtrl.setStarPlatformCollisions(this, starGroup, platforms);
    });
    player = uiCtrl.renderPlayerOne(this);
    uiCtrl.setPlayerOnePhysics(player);
    uiCtrl.setPlayerPlatformCollisions(this, player, platforms);
    uiCtrl.setPlayerOneAnimations(this);
    cursors = uiCtrl.setupCursorKeys(this);
    uiCtrl.displayTitle(this);
  }

  function update() {
    uiCtrl.evaluatePlayerOneMovement(player, cursors, dataCtrl);
    stars.forEach((starGroup) => {
      uiCtrl.setPlayerStarCollisions(
        player,
        starGroup,
        uiCtrl.collectStar,
        this
      );
    });
  }

  // LET'S MAKE THE GAME AVAILABLE TO THE GLOBAL SCOPE
  return game;
})(uiController, dataController);
