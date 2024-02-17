
const BEAM_SPEED = 2000;
const SPAWN_TIME = 3.0;

class TutRunScene extends Phaser.Scene {
  constructor() {
    super("EnhRunScene");
    this.rockHit = this.rockHit.bind(this);
  }

  init () {
    /* Sprite objects */
    this.bg;
    this.player;
    this.target;

    /* Sprite Groups */
    this.lasers;
    this.rocks;

    /* Misc Data */
    this.pointer = { x: 400, y: 300, angle: 0 };
    this.now = 0;
    this.spawnTimer = 0;
  }

  preload () {
      this.load.image('space', 'images/nebula.jpg');
      this.load.image('ship', 'images/ship.png')
      this.load.image('target', 'images/crosshair6.png');
      this.load.image('laser', 'images/33.png');

      this.load.spritesheet( 'rock1', 'images/asteroid1.png', { frameWidth: 128, frameHeight:128 });
      this.load.spritesheet( 'boom', 'images/explosion.png', { frameWidth: 64, frameHeight:64 })

      this.load.audio('bg_music', 'sounds/music.mp3')
      this.load.audio('shoot_sfx', 'sounds/laser4.wav');
      this.load.audio('rock_sfx', 'sounds/rumble.mp3');
  }

  create () {
    /* Music */
    this.sfxShoot = this.sound.add('shoot_sfx');
    this.sfxRock = this.sound.add('rock_sfx');
    this.bgMusic = this.sound.add('bg_music');
    this.bgMusic.loop = true;
    this.bgMusic.play();

    /* Instance the background image */
    this.bg = this.add.image(400,300, 'space');

    /* Player Sprite.  Resize, move control point of sprite to the center */
    this.player = this.add.sprite(400, 300, 'ship');
    this.player.setScale(0.3);
    this.player.setOrigin(0.5);
    this.player.setDepth(2);

    /* Mouse Pointer */  /* Capture Mouse Movement */
    this.target = this.add.sprite(400, 300, 'target');
    this.input.on('pointermove', (mouse) => { this.pointer.x = mouse.x ; this.pointer.y = mouse.y });

    /* Laser Beams */
    this.lasers = this.physics.add.group();
    this.input.on('pointerdown', (mouse) => { this.shoot() });

    /* Asteroid */
    this.anims.create({
      key: 'spin',
      frames: this.anims.generateFrameNumbers('rock1', {start:0, end:47}),
      frameRate: 10,
      repeat: -1
    })
    this.rocks = this.physics.add.group();

    /* Explosion */
    this.anims.create({
      key: 'boom',
      frames: this.anims.generateFrameNumbers('boom', {start:0, end:6}),
      frameRate: 7,
      repeat: -1
    })

    /* Lasers can shoot rocks */
    this.physics.add.collider(this.rocks, this.lasers, this.rockHit);
  }

  shoot () {
    this.sfxShoot.play();

    let beam = this.physics.add.sprite(400, 300, 'laser');
    this.lasers.add(beam);
    beam.rotation = this.pointer.angle;
    beam.setVelocity( BEAM_SPEED * Math.cos(this.pointer.angle), 
                      BEAM_SPEED * Math.sin(this.pointer.angle));
    beam.setScale(0.5);
    beam.setSize(20, 20);
    beam.setDepth(1);
  }

  rockHit (rock, laser) {
    let explosion = this.add.sprite(rock.x, rock.y, 'boom');
    explosion.play('boom');
    setTimeout(() => { explosion.destroy() }, 1000);

    this.sfxRock.play();
    rock.destroy();
    laser.destroy();
  }

  spawn () {
    let spawnPoints = [
      { x: -50, y: 50, dx: 100, dy: 0 },
      { x: 850, y: 100, dx: -100, dy: 0 },
      { x: -50, y: 550, dx: 100, dy: 0 },
      { x: 850, y: 500, dx: -100, dy: 0 },
      { x: -50, y: 300, dx: 75, dy: 75 },
      { x: -50, y: 300, dx: 75,  dy: -75 },
      { x: 850, y: 300, dx: -75, dy: 75 },
      { x: 850, y: 300, dx: -75,  dy: -75 },

    ]
    let spawnPoint = spawnPoints[ Math.floor( Math.random() * spawnPoints.length )];
    
    let rock = this.physics.add.sprite(spawnPoint.x, spawnPoint.y, 'rock1');
    this.rocks.add(rock);
    rock.play('spin');
    rock.setSize(75, 75)
    rock.setVelocity( spawnPoint.dx, spawnPoint.dy );

    console.log(rock);
  }

  update (gameTime) {
    let deltaTime = gameTime - this.now;
    this.now = gameTime;

    /* Make the background spin */
    this.bg.rotation -= 0.0005;

    /* Make the target spin and follow the mouse pointer */
    this.target.rotation += 1 * deltaTime;
    this.target.x = this.pointer.x;
    this.target.y = this.pointer.y;

    /* Rotate the ship to face the mouse pointer */
    let dy = this.pointer.y - this.player.y;
    let dx = this.pointer.x - this.player.x;
    this.pointer.angle = Math.atan2(dy, dx);
    this.player.rotation = this.pointer.angle;

    /* Make Rocks */
    if ((this.spawnTimer <= 0) || (this.rocks.countActive() == 0)) {
      this.spawn();
      this.spawnTimer = SPAWN_TIME;
    }
    this.spawnTimer -= deltaTime / (1000.0);

    /* Destroy lasers if they go off the screen */
    this.lasers.children.each ( (beam) => {
      if ((beam.x > 850) ||
          (beam.x < -50) ||
          (beam.y > 650) ||
          (beam.y < -50)) {
            beam.destroy();
          }
    })

    /* Destroy rocks if they go off the screen */
    this.rocks.children.each ( (rock) => {
      if ((rock.x > 850) ||
          (rock.x < -50) ||
          (rock.y > 650) ||
          (rock.y < -50)) {
            rock.destroy();
          }
    })
    

  }
}

class TutorialGame {
  constructor (dom_container) {
    this.config = {
      type: Phaser.AUTO,
      width: 800,
      height: 600,
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { y: 0 },
          debug: true
        }
      },
      scene: [
        TutRunScene
      ],
      parent: dom_container
    };

    this.game = new Phaser.Game(this.config);
  }
}