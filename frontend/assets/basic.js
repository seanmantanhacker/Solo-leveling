import Character from '/Character.js';
// basic.js
import rexVirtualJoystickPlugin from 
  "https://cdn.jsdelivr.net/npm/phaser3-rex-plugins/plugins/virtualjoystick-plugin.js";
const isMobile = /Mobi|Android/i.test(navigator.userAgent);
let cursors, wasdKeys, joyStick, player
let socket;           
let otherPlayers = {}; 
const colors = [0xff0000, 0x00ff00, 0xffff00, 0xff00ff];
let players;

const config = {
    type: Phaser.AUTO,
    // width: 1000,
    // height: 825,
    backgroundColor: '#6f7579', // sky blue // sky blue
    physics: {
        default: 'arcade',
        arcade: { debug: true }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    },
    width: window.innerWidth,
    height: window.innerHeight,
    scale: {
        mode: Phaser.Scale.RESIZE,           // canvas resizes with window
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    plugins: {
        scene: [
            { key: 'rexVirtualJoystick', plugin: rexVirtualJoystickPlugin, mapping: 'joystick' }
        ]
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
    if (isMobile) {
        joyStick = this.joystick.add(this, {
            x: 100, y: this.scale.height - 100,
            radius: 60,
            base: this.add.circle(0, 0, 60, 0x888888),
            thumb: this.add.circle(0, 0, 30, 0xcccccc),
        });
    } else {
        joyStick = null
    }
    
    this.physics.world.setBounds(0, 0, 3000, 3000)
    this.cameras.main.setBounds(0, 0, 3000, 3000)

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

    player = new Character(this, 400, 300, 'dude', cursors, wasdKeys, joyStick);
    
    this.cameras.main.startFollow(player, true, 0.08, 0.08)
    load_obstacle(this,player)
    players = this.physics.add.group({
        collideWorldBounds: true  // this applies to all children added to the group
    });
    players.add(player);
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
    player.handleMovement()
   
    // In your Phaser update loop
    socket.emit('playerMovement', { x: player.x, y: player.y });
}

// helper needs scene passed in
function addOtherPlayer(scene, info, id) {
    const other = new Character(scene, info.x, info.y, 'dude',null, null, null, colors[1]);
    players.add(other)
    scene.physics.add.collider(players, players);
    otherPlayers[id] = other;
}

function load_obstacle(scene,player) {
    const walls = [
        { x: 0, y: 15, width: 400, height: 15 },
        { x: 300, y: 78, width: 400, height: 15 }
    ];

    walls.forEach(w => {
        let wall = scene.add.rectangle(w.x, w.y, w.width, w.height, 0x6666ff);
        scene.physics.add.existing(wall, true);
        scene.physics.add.collider(player, wall);
    });
}