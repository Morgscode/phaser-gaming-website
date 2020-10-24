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
      // ground layer
      platforms.create(400, 600, 'ground').setScale(2).refreshBody();
      // 2nd left
      platforms.create(250, 500, 'ground');
      // 2nd right
      platforms.create(750, 500, 'ground');
      // 3rd left
      platforms.create(-100, 400, 'ground');
      // 3rd middle
      platforms.create(400, 400, 'ground');
      // 3rd right
      platforms.create(900, 400, 'ground');
      // 4th left
      platforms.create(150, 300, 'ground');
      // 4th right
      platforms.create(650, 300, 'ground');
      // 5th left
      platforms.create(0, 200, 'ground');
      // 5th right
      platforms.create(500, 200, 'ground');
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
    renderScoreBoardText: (gameObject, score) => {
      const scoreText = gameObject.add.text(16, 16, `score: ${score}`, {
        fontSize: `32px`,
        fontFamily: 'Courier',
        fill: `#303030`,
      });
      return scoreText;
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
      star.disableBody(true, true);
      let score = parseInt(window.localStorage.getItem('playerOneScore'));
      score += 10;
      return window.localStorage.setItem('playerOneScore', score);
    },
    renderRandomStarGroup: (stars) => {
      stars.children.iterate((child) => {
        yVal = Phaser.Math.Between(0, 500);
        child.enableBody(true, child.x, yVal, true, true);
      });
      return stars;
    },
  };

  const playerOneSetupFunctions = {
    renderPlayerOne: (gameObject) => {
      const playerOne = gameObject.physics.add.sprite(50, 545, 'dude');
      return playerOne;
    },
    setPlayerOneInitialPhysics: (player) => {
      player.setBounce(0.2);
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
        frameRate: 10,
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
        player.setVelocityY(-275);
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
        player.setVelocityY(-275);
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
        null,
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
    renderScoreText: initialSceneSetupFunctions.renderScoreBoardText,
    renderRandomStars: starSetupFunctions.renderRandomStarGroup,
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

  const scoreState = {
    setGameScore: () => {
      return window.localStorage.setItem('playerOneScore', 0);
    },
    getGameScore: () => {
      return parseInt(window.localStorage.getItem('playerOneScore'));
    },
  };

  return {
    setJumpCount: playerJumpState.setJumpCount,
    resetJumpCount: playerJumpState.resetJumpCount,
    getJumpCount: playerJumpState.getJumpCount,
    setupPlayerOneScore: scoreState.setGameScore,
    getPlayerOneGameScore: scoreState.getGameScore,
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
        debug: false,
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
  let scoreText;
  let activeStarGroups;

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
    dataCtrl.setupPlayerOneScore();
    uiCtrl.renderSky(this);
    platforms = uiCtrl.renderPlatform(this);
    stars.push(uiCtrl.renderStars(this, 5, 450, 70));
    stars.push(uiCtrl.renderStars(this, 15, 350, 60));
    stars.push(uiCtrl.renderStars(this, 25, 165, 50));
    uiCtrl.setStarPlatformCollisions(this, stars, platforms);
    player = uiCtrl.renderPlayerOne(this);
    uiCtrl.setPlayerOnePhysics(player);
    uiCtrl.setPlayerPlatformCollisions(this, player, platforms);
    uiCtrl.setPlayerOneAnimations(this);
    cursors = uiCtrl.setupCursorKeys(this);
    uiCtrl.displayTitle(this);
    scoreText = uiCtrl.renderScoreText(this, dataCtrl.getPlayerOneGameScore());
  }

  function update() {
    uiCtrl.evaluatePlayerOneMovement(player, cursors, dataCtrl);
    uiCtrl.setPlayerStarCollisions(player, stars, uiCtrl.collectStar, this);
    scoreText.setText(`Score: ${dataCtrl.getPlayerOneGameScore()}`);
    activeStarGroups = 3;
    stars.forEach((starGroup) => {
      if (starGroup.countActive() === 0) {
        activeStarGroups--;
      }
    });
    if (activeStarGroups === 0) {
      stars.forEach((starGroup) => {
        uiCtrl.renderRandomStars(starGroup);
      });
    }
  }

  // LET'S MAKE THE GAME AVAILABLE TO THE GLOBAL SCOPE
  return game;
})(uiController, dataController);
