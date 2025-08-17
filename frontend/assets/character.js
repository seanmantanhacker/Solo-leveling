const isMobile = /Mobi|Android/i.test(navigator.userAgent);
// Character.js
export default class Character extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture, cursors, keys, joyStick, tint=null) {
        super(scene, x, y, texture);
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.setCollideWorldBounds(true);
        this.joyStick = joyStick;
        this.cursors = cursors;
        this.keys = keys; // 👇 apply tint if provided
        if (tint) {
            this.setTint(tint);
        }
    }

    handleMovement() {
        this.setVelocity(0);
        // --- Joystick ---
        if (isMobile) {
        // create joystick/buttons
            if (this.joyStick) {
                const cursorKeys = this.joyStick.createCursorKeys();
                if (cursorKeys.left.isDown) {
                    this.setVelocityX(-160);
                    this.anims.play('left', true);
                }
                else if (cursorKeys.right.isDown) {
                    this.setVelocityX(160);
                    this.anims.play('right', true);
                } else {
                    this.anims.play('turn');
                }
                if (cursorKeys.up.isDown)    this.setVelocityY(-160);
                if (cursorKeys.down.isDown)  this.setVelocityY(160);
            }
        } else {
            if (this.cursors.left.isDown || this.keys.A.isDown) {
                this.setVelocityX(-160);
                this.anims.play('left', true);
            } else if (this.cursors.right.isDown || this.keys.D.isDown) {
                this.setVelocityX(160);
                this.anims.play('right', true);
            } else {
                this.anims.play('turn');
            }
            if (this.cursors.up.isDown || this.keys.W.isDown) {
                this.setVelocityY(-160);
            } else if (this.cursors.down.isDown || this.keys.S.isDown) {
                this.setVelocityY(160);
            }
        }
        

    }
}