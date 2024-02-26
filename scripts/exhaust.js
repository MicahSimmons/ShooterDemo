

const BurnDistance = -40.0;

/* Exhaust is a GameObject sprite tailored to be the
 * Flames trailing behind a spaceship.  The flame
 * is expected to trail behind the space ship,
 * offset from the spaceships position and matching rotation.
 */
class Exhaust extends Phaser.GameObjects.Sprite {
    constructor(config) {
        /* Basics for setting up a sprite object */
        super(config.scene, config.x, config.y, "flame");
        config.scene.add.existing(this);

        /* Set Origin to 0.5 so the fire rotates around 
         * the center point.  Adjust scale to match
         * the size of the ship
         */
        this.isBurning = false;
        this.setOrigin(0.5);
        this.setScale(0.5);
        
    }

    /* Burn starts the engines running */
    burn() {
        /* Using isBurning as a switch to prevent
         * the animation from restarting on every 
         * keypress.
         * 
         * setVisible() makes the flames appear
         * and disappear.  setOpacity() could 
         * be a good one to use here too.
         */
        if (this.isBurning == false) {
            this.setVisible(true);
            this.play("burn");
            this.isBurning = true;
        }
    }

    /* Stop the engines running */
    stop() {
        /* Turn off the sprite display, stop animation */
        this.setVisible(false);
        this.anims.pause();
        this.isBurning = false;
    }

    /* Force the flame to trail behind the ship,
     * and match the ships rotation
     */
    updateLoc(x, y, rotation) {
        /* This is copying the ships rotation, but
         * offset by 90 degress since my ship image
         * and flame images are drawn at different 
         * orientations
         */
        this.rotation = rotation - (Math.PI / 2.0);

        /* Cos/Sin give me a normal vector in the 
         * direction specified.  BurnDistance is
         * how far back the flames should trail,
         * and needs to be a negative number so
         * that its behind the ship
         */
        let x_offset = Math.cos(rotation) * BurnDistance;
        let y_offset = Math.sin(rotation) * BurnDistance;

        /* Assuming the ship was moving, copy the ships
         * location, and then apply the calculated 
         * distance behind the ship
         */
        this.x = x + x_offset;
        this.y = y + y_offset;
    }
}