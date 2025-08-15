// Character.js
export default class Character extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture, cursors, keys) {
        super(scene, x, y, texture);
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.setCollideWorldBounds(true);
        this.cursors = cursors;
        this.keys = keys;
    }

    handleMovement() {
        this.setVelocity(0);
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