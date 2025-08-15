class Character extends Phaser.Physics.Arcade.Sprite {
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
        }
        else if (this.cursors.right.isDown || this.keys.D.isDown) {
            this.setVelocityX(160);
            this.anims.play('right', true);
        } else {
            this.anims.play('turn');
        }
        if (this.cursors.up.isDown || this.keys.W.isDown) {
            this.setVelocityY(-160);
        }
        else if (this.cursors.down.isDown || this.keys.S.isDown) {
            this.setVelocityY(160);
        }
    }
}

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: { debug: false }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

const game = new Phaser.Game(config);

function preload() {
    // Load a placeholder image from Phaser's example assets
    // this.load.image('player', 'https://labs.phaser.io/assets/sprites/phaser-dude.png');
    this.load.spritesheet('dude', 'https://labs.phaser.io/assets/sprites/dude.png', {
        frameWidth: 32,
        frameHeight: 48
    });
    
}

function create() {
    // Add player to the center
    let cursors = this.input.keyboard.createCursorKeys();
    let wasdKeys = this.input.keyboard.addKeys({
        W: Phaser.Input.Keyboard.KeyCodes.W,
        A: Phaser.Input.Keyboard.KeyCodes.A,
        S: Phaser.Input.Keyboard.KeyCodes.S,
        D: Phaser.Input.Keyboard.KeyCodes.D
    });
    // Define animations ONCE
    this.anims.create({
        key: 'left',
        frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'turn',
        frames: [{ key: 'dude', frame: 4 }],
        frameRate: 20
    });

    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
        frameRate: 10,
        repeat: -1
    });

    player = new Character(this, 400, 300, 'dude', cursors, wasdKeys);
    enemy = new Character(this, 450, 300, 'dude', cursors, wasdKeys);
}

function update() {
    player.handleMovement();
    
}
