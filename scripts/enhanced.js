var level = {
  world: {
    x: 3200,
    y: 600
  },
  platforms: [
    {x: 400, y:568, scale:2.5 },
    {x: 1400, y:568, scale:2.0 },
    {x: 2000, y:568, scale:2.0 },
    {x: 2600, y:568, scale:2.0 },
    {x: 600, y:400 },
    {x: 50,  y:250 },
    {x: 750, y:220 },
    {x: 1600, y:400 },
    {x: 1050,  y:250 },
    {x: 1750, y:220 },
    {x: 2600, y:400 },
    {x: 2050,  y:300 }
  ],
  decor: [
    {x: 10, y:300, type:'tree_1'},
    {x: 2000, y:160, scale:0.5, type:'tree_1'},
    {x: 1100, y:370, scale:0.7, type:'tree_2'},
    {x: 2600, y:160, type:'tree_2'}
  ]
}

class EnhRunScene extends Phaser.Scene {
  constructor() {
    super("EnhRunScene");
  }

  init () {
    this.platforms; 
    this.player;
    this.cursors;
    this.stars;
    this.score = 0;
    this.scoreText;
    this.bombs;
    this.decor;
  }

  preload () {
      this.load.image('sky', 'images/handpainted/Background.png');
      this.load.image('ground', 'images/handpainted/platform_edit.png');
      this.load.image('star', 'images/handpainted/Object_4.png');
      this.load.image('bomb', 'images/bomb.png');
      this.load.spritesheet('dude', 
          'images/castle/elisa_remap.png',
          { frameWidth: 54, frameHeight: 54 }
      );

      this.load.image('tree_1', 'images/handpainted/Object_18.png');
      this.load.image('tree_2', 'images/handpainted/Object_19.png');
  }

  create () {

    this.physics.world.setBounds(0,-200, level.world.x, level.world.y+600);
    /* Instance the background image */
    for (let i = 400; i<level.world.x; i+=800) {
      var sky = this.add.image(i,300, 'sky');
    }

    /* Decorations */
    this.decor = this.physics.add.staticGroup();
    level.decor.forEach( (item_spec) => {
      var item = this.decor.create(item_spec.x, item_spec.y, item_spec.type);
      if (item_spec.hasOwnProperty('scale')) {
        item.setScale(item_spec.scale).refreshBody();
      }
    });

    /* Create the static ground object and platforms */
    this.platforms = this.physics.add.staticGroup();

    level.platforms.forEach( (pf) => {
      var platform = this.platforms.create(pf.x, pf.y, 'ground');
      if (pf.hasOwnProperty('scale')) {
        platform.setScale(pf.scale).refreshBody();
      }
    });

    /* Create a player object */
    this.player = this.physics.add.sprite(100, 450, 'dude');
    this.player.setScale(1.6);
    this.player.setBounce(0.2);
    this.player.setCollideWorldBounds(true);
    this.cameras.main.startFollow(this.player);
    this.cameras.main.setBounds(0,0, level.world.x, level.world.y);

    this.anims.create({
      key: 'left',
      frames: this.anims.generateFrameNumbers('dude', {start:0, end:7}),
      frameRate: 10,
      repeat: -1
    });

    this.anims.create({
      key: 'turn',
      frames: [ { key: 'dude', frame:8 }],
      frameRate: 20
    });

    this.anims.create({
      key: 'right',
      frames: this.anims.generateFrameNumbers('dude', {start:0, end:7}),
      frameRate: 10,
      repeat: -1
    });

    /* Stars dynamic group */
    this.stars = this.physics.add.group({
      key: 'star',
      repeat: 11,
      setXY: { x: 12, y: 0, stepX: 270 }
    });
    this.stars.children.iterate((child) => child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8 )));
    this.stars.children.iterate((child) => child.setScale(0.25).refreshBody());

    /* Create mobs dynamic group */
    this.bombs = this.physics.add.group();

    /* Setup Collider rules */
    this.physics.add.collider(this.player, this.platforms);
    this.physics.add.collider(this.stars, this.platforms);
    this.physics.add.overlap(this.player, this.stars, 
      (player, star) => {
        star.disableBody(true, true)
        this.score += 10;

        if (this.stars.countActive(true) === 0) {
          this.stars.children.iterate((child) => {
            child.enableBody(true, child.x, 0, true, true);
          });

          var x = (this.player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);
          var bomb = this.bombs.create(x, 16, 'bomb');
          bomb.setBounce(1);
          bomb.setCollideWorldBounds(true);
          bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
        }
      }, null, this);

    this.physics.add.collider(this.bombs, this.platforms);
    this.physics.add.collider(this.player, this.bombs, this.hitBomb, null, this);

    /* Setup keyboard control interactions */
    this.cursors = this.input.keyboard.createCursorKeys();

    /* Score textbox */
    this.scoreText = this.add.text(16,16, 'score: 0', { fontSize: '32px', fill: '#000'});
    this.scoreText.setScrollFactor(0);

  }

  hitBomb (player, bomb) {
    this.physics.pause();
    player.setTint(0xff0000);
    player.anims.play('turn');
    this.gameOver = true;
  }

  update () {

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-160);
      this.player.anims.play('left', true);
      this.player.flipX = true;
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(160);
      this.player.anims.play('right', true);
      this.player.flipX = false;
    } else {
      this.player.setVelocityX(0);
      this.player.anims.play('turn');
    }

    if (this.cursors.up.isDown && this.player.body.touching.down) {
      this.player.setVelocityY(-330);
    }

    this.scoreText.setText('Score: ' + this.score);
  }
}


class EnhancedGame {
  constructor (dom_container) {
    this.config = {
      type: Phaser.AUTO,
      width: 800,
      height: 600,
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { y: 300 },
          debug: false
        }
      },
      scene: [
        EnhRunScene
      ],
      parent: dom_container
    };

    this.game = new Phaser.Game(this.config);
  }
}