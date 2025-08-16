import Character from '/Character.js';

let cursors, wasdKeys, player
let socket;           
let otherPlayers = {}; 
const colors = [0xff0000, 0x00ff00, 0xffff00, 0xff00ff];

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

    this.load.image('wall', 'https://labs.phaser.io/assets/sprites/block.png');

    
}

function create() {
    // Add player to the center
    cursors = this.input.keyboard.createCursorKeys();
    wasdKeys = this.input.keyboard.addKeys({
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

    // Example: wall sprite
    let wall = this.physics.add.staticImage(400, 200, 'wall');
    this.physics.add.collider(this.player, wall);
     

    socket = io();

    socket.on('currentPlayers', players => {
        Object.keys(players).forEach(id => {
            if(id !== socket.id){
                addOtherPlayer(this, players[id], id);
            }
        });
    });

    socket.on('newPlayer', playerInfo => {    
        addOtherPlayer(this, playerInfo, playerInfo.id);
    });

    socket.on('playerMoved', playerInfo => {
        if(otherPlayers[playerInfo.id]){
            otherPlayers[playerInfo.id].x = playerInfo.x;
            otherPlayers[playerInfo.id].y = playerInfo.y;
        }
    });

    socket.on('playerDisconnected', id => {
        if(otherPlayers[id]){
            otherPlayers[id].destroy();
            delete otherPlayers[id];
        }
    });

}

function update() {
    player.handleMovement();
    // In your Phaser update loop
    socket.emit('playerMovement', { x: player.x, y: player.y });
}

// helper needs scene passed in
function addOtherPlayer(scene, info, id) {
    const other = new Character(scene, info.x, info.y, 'dude',cursors, wasdKeys,colors[1]);
    otherPlayers[id] = other;
}