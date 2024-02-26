

const BurnDistance = -40.0;

class Exhaust extends Phaser.GameObjects.Sprite {
    constructor(config) {
        super(config.scene, config.x, config.y, "flame");
        config.scene.add.existing(this);
        this.isBurning = false;
        this.setOrigin(0.5);
        this.setScale(0.5);
        
    }

    burn() {
        if (this.isBurning == false) {
            this.setVisible(true);
            this.play("burn");
            this.isBurning = true;
        }
    }

    stop() {
        this.setVisible(false);
        this.anims.pause();
        this.isBurning = false;
    }

    updateLoc(x, y, rotation) {
        this.rotation = rotation - (Math.PI / 2.0);
        let x_offset = Math.cos(rotation) * BurnDistance;
        let y_offset = Math.sin(rotation) * BurnDistance;
        this.x = x + x_offset;
        this.y = y + y_offset;
    }
}