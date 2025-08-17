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
        arcade: { debug: true}
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
    },
    fps: {
        target: 45,   // 👈 cap at 30 FPS
        forceSetTimeOut: true   // 👈 ensures stable timing across browsers
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
    this.load.image('buttondown', 'https://labs.phaser.io/assets/ui/flixel-button.png');
    this.load.image('portal', 'https://labs.phaser.io/assets/sprites/purple_ball.png');
    this.load.image('buttonup', 'a.png');
 

    
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
        frameRate: 8,
        repeat: -1
    });

    this.anims.create({
        key: 'turn',
        frames: [{ key: 'dude', frame: 4 }],
        frameRate: 10
    });

    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
        frameRate: 8,
        repeat: -1
    });

    player = new Character(this, 0, 0, 'dude', cursors, wasdKeys, joyStick);
    player.setDepth(1);  // on top
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
        
        const other = otherPlayers[playerInfo.id];
        if (other) {
            other.setPosition(playerInfo.x, playerInfo.y);

            // Reset velocity so old movement doesn't linger
            other.setVelocity(0);

            if (playerInfo.vx !== 0 || playerInfo.vy !== 0) {
                // Player is moving → play movement anim
                if (playerInfo.anim) {
                    other.anims.play(playerInfo.anim, true);
                }
            } else {
                // Player stopped → idle animation
                other.anims.play('turn');
            }
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
   
    const anim = player.anims.currentAnim ? player.anims.currentAnim.key : 'turn';
    
    socket.emit('playerMovement', {
        x: player.x,
        y: player.y,
        vx: player.body.velocity.x,
        vy: player.body.velocity.y,
        anim: player.anims.currentAnim ? player.anims.currentAnim.key : 'turn'
    });
}

// helper needs scene passed in
function addOtherPlayer(scene, info, id) {
    const other = new Character(scene, info.x, info.y, 'dude',null, null, null, colors[1]);
    players.add(other)
    scene.physics.add.collider(players, players);
    otherPlayers[id] = other;
}

function load_obstacle(scene,player) {
    const walls = scene.physics.add.staticGroup();

    let wall_creation = scene.add.rectangle(200, 60, 400, 20, 0x6666ff);
    walls.add(wall_creation);
    let wall_creation3 = scene.add.rectangle(200, 500, 100, 100, 0x6666ff);
    walls.add(wall_creation3);

     // Enable physics body for rectangles
    walls.getChildren().forEach(wall => {
        scene.physics.add.existing(wall, true); // true = static
    });

    // Add collision between player and walls
    scene.physics.add.collider(player, walls);

    let wall_creation_no1 = scene.add.rectangle(410, 35, 20, 70, 0x6666ff);
    scene.physics.add.existing(wall_creation_no1, true); // true = static
    scene.physics.add.collider(player, wall_creation_no1);
    
    // // Create portal
    // const portal = scene.physics.add.sprite(600, 300, 'portal');
    // portal.setImmovable(true);
    // portal.setScale(1.5);
    // portal.body.setAllowGravity(false); // if gravity is enabled in your world

    // // Overlap check (not collision, so you can walk into it)
    // scene.physics.add.overlap(player, portal, () => {
    //     console.log("Player entered portal!");
    //     // Teleport player somewhere else
    //     player.setPosition(1000, 800);
    // });

     // === BUTTON ===
    const button1 = scene.physics.add.sprite(300, 25, 'buttonup');
    
    button1.body.setSize(45, 45); // width 100px, height 50px
    button1.body.setOffset(0, 0);  
    button1.setImmovable(true);
    button1.body.setAllowGravity(false);
    button1.isOn = false;
    // Add overlap
    scene.physics.add.overlap(player, button1, () => {
    if (!button1.isPressed) {
        if (button1.isPressed){
            button1.clearTint()
        } else {
            button1.setTint(0xff0000)   
        }
        console.log("Pressed")
        toggleWall(wall_creation_no1,false)

        button1.isPressed = true;
    }
    });

    // Reset each physics step
    scene.physics.world.on('worldstep', () => {
        const isOverlapping = scene.physics.overlap(player, button1);
        if (!isOverlapping && button1.isPressed) {
            if (button1.isPressed){
                button1.setTint(0x00ef00)
            } else {
                button1.clearTint()
            }
            console.log("UN Pressed")
            
            button1.isPressed = false;
        }
    });

    //  // Optional: reset switch if player leaves
    // scene.physics.add.collider(player, button, null, (p, b) => {
    //     // This prevents continuous triggering
    //     return false;
    // });

   

}

// === Toggle function ===
function toggleWall(wall,enabled) {
    if (wall.body.enable == true){
        wall.body.enable = false
        wall.setVisible(false);
    }else {
        wall.body.enable = true
        wall.setVisible(true);
    }
}