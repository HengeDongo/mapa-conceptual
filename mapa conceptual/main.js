const VIEW_W = 1200, VIEW_H = 675;

class SceneMain extends Phaser.Scene {
    constructor() {
        super();
        this.camSpeed = 400;
        this.cameraJump = 100; 
        this.snapToGrid = true;
        this.gridSize = 100; 
        
        this.zoomLevels = [0.1, 0.2, 0.3, 0.5, 0.75, 1, 1.5, 2, 3]; 
        this.currentZoomIndex = 5; 
    }

    preload() {
        this.load.image('tileset', 'assets/tiles/tileset.png?v=' + new Date().getTime());
        const timestamp = new Date().getTime();
        this.load.tilemapTiledJSON('mymap', `assets/maps/mymap.json?nocache=${timestamp}`);
    }

    create() {
        const map = this.make.tilemap({ key: 'mymap' });
        if (!map) return;
        
        const tileset = map.addTilesetImage('tileset', 'tileset', map.tileWidth, map.tileHeight);
        if (!tileset) return;
        
        const layer = map.createLayer(map.layers[0].name, tileset);
        if (!layer) return;
        
        const worldWidth = map.width * map.tileWidth;
        const worldHeight = map.height * map.tileHeight;
        
        this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);
        
        // ==========================================
        // AQUÍ ESTÁ EL CAMBIO: Posición inicial en 13, 9
        // ==========================================
        const startTileX = 13; 
        const startTileY = 9; 
        
        let startPixelX = (startTileX * map.tileWidth) + (map.tileWidth / 2) - (VIEW_W / 2);
        let startPixelY = (startTileY * map.tileHeight) + (map.tileHeight / 2) - (VIEW_H / 2);
        
        startPixelX = Phaser.Math.Clamp(startPixelX, 0, worldWidth - VIEW_W);
        startPixelY = Phaser.Math.Clamp(startPixelY, 0, worldHeight - VIEW_H);
        
        if (this.snapToGrid) {
            startPixelX = Math.round(startPixelX / this.gridSize) * this.gridSize;
            startPixelY = Math.round(startPixelY / this.gridSize) * this.gridSize;
        }
        
        this.cameras.main.scrollX = startPixelX;
        this.cameras.main.scrollY = startPixelY;
        
        this.cameras.main.zoom = this.zoomLevels[this.currentZoomIndex];

        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = {
            up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
            down: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
            left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
            right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
        };

        this.input.keyboard.on('keydown', (event) => {
            if (event.keyCode === 187 || event.keyCode === 107) {
                if (this.currentZoomIndex < this.zoomLevels.length - 1) {
                    this.currentZoomIndex++;
                    this.cameras.main.zoom = this.zoomLevels[this.currentZoomIndex];
                }
            }
            if (event.keyCode === 189 || event.keyCode === 109) {
                if (this.currentZoomIndex > 0) {
                    this.currentZoomIndex--;
                    this.cameras.main.zoom = this.zoomLevels[this.currentZoomIndex];
                }
            }
        });

        this.input.on('wheel', (pointer, gameObjects, deltaX, deltaY) => {
            if (deltaY < 0) { 
                if (this.currentZoomIndex < this.zoomLevels.length - 1) {
                    this.currentZoomIndex++;
                    this.cameras.main.zoom = this.zoomLevels[this.currentZoomIndex];
                }
            } else if (deltaY > 0) { 
                if (this.currentZoomIndex > 0) {
                    this.currentZoomIndex--;
                    this.cameras.main.zoom = this.zoomLevels[this.currentZoomIndex];
                }
            }
        });

        this.lastMoveTime = 0;
        this.moveDelay = 120;
    }

    update(time, dt) {
        const cam = this.cameras.main;
        let moveX = 0, moveY = 0;
        
        if (this.cursors.left.isDown || this.wasd.left.isDown) moveX = -1;
        if (this.cursors.right.isDown || this.wasd.right.isDown) moveX = 1;
        if (this.cursors.up.isDown || this.wasd.up.isDown) moveY = -1;
        if (this.cursors.down.isDown || this.wasd.down.isDown) moveY = 1;

        if ((moveX !== 0 || moveY !== 0) && (time - this.lastMoveTime >= this.moveDelay)) {
            this.lastMoveTime = time;
            let newX = cam.scrollX + moveX * this.cameraJump;
            let newY = cam.scrollY + moveY * this.cameraJump;

            newX = Math.round(newX / this.gridSize) * this.gridSize;
            newY = Math.round(newY / this.gridSize) * this.gridSize;

            const bounds = cam.getBounds();
            if (bounds) {
                const visibleWidth = cam.width / cam.zoom;
                const visibleHeight = cam.height / cam.zoom;
                newX = Phaser.Math.Clamp(newX, bounds.x, bounds.right - visibleWidth);
                newY = Phaser.Math.Clamp(newY, bounds.y, bounds.bottom - visibleHeight);
            }
            cam.scrollX = newX;
            cam.scrollY = newY;
        }
    }
}

const config = {
    type: Phaser.CANVAS,
    width: VIEW_W,
    height: VIEW_H,
    backgroundColor: '#000000',
    scene: SceneMain,
    pixelArt: true,
    roundPixels: true,
    scale: {
        mode: Phaser.Scale.FIT, 
        autoCenter: Phaser.Scale.CENTER_BOTH 
    }
};

window.addEventListener('load', () => {
    new Phaser.Game(config);
});