import 'phaser';

export default class Demo extends Phaser.Scene
{
    player: Phaser.GameObjects.Image;
    coins: Phaser.GameObjects.Image[] = [];
    levelData: any[] =[];
    score: number= 0;
    level: number = 1;
    forward: Phaser.GameObjects.Image;
    clockwise: Phaser.GameObjects.Image;
    anticlockwise: Phaser.GameObjects.Image;
    blocks: Phaser.GameObjects.Image[] = [];
    start:Phaser.GameObjects.Image;
    area:Phaser.GameObjects.Image;
    blockNames:string[] = ["forward", "clockwise", "anticlockwise"];
    positions:any[] =[];
    blockPlaceX:number = 64;
    blockPlaceY:number = 780;
    executionList: string[] =[];
    executionBlocks: Phaser.GameObjects.Image[] = [];
    started:boolean = false;
    direction:string = "forward";
    constructor ()
    {
        super('demo');
    }

    preload ()
    {
        this.load.image('logo', 'assets/phaser3-logo.png');
        this.load.image('grass', 'assets/grass.png');
        this.load.image('marble', 'assets/marble.png');
        this.load.image('forward', 'assets/forward.png');
        this.load.image('anticlockwise', 'assets/anticlockwise.png');
        this.load.image('clockwise', 'assets/clockwise.png');
        this.load.image('start', 'assets/start.png');
        this.load.image('stop', 'assets/stop.png');
        this.load.image('area', 'assets/area.png');
        this.load.image('player', 'assets/player/player_05.png');
        this.load.image('left', 'assets/left.png');
        this.load.image('right', 'assets/right.png');
        this.load.image('backward', 'assets/backward.png');
        this.load.image('playerHD', 'assets/player.png');
        this.load.image('coin', 'assets/coin.png');
        this.load.image('ground', 'assets/ground.png');
        this.load.image('libs', 'assets/libs.png');
        this.load.glsl('bundle', 'assets/plasma-bundle.glsl.js');
        this.load.glsl('stars', 'assets/starfields.glsl.js');
    }

    create ()
    {
        this.levelData = [
            {"level":1, "player":[1,1], "coins":[[1,2], [1,4]]},
            {"level":2, "player":[1,1], "coins":[[2,2], [3,2]]},
            {"level":3, "player":[1,1], "coins":[[4,1], [3,4]]},
            {"level":4, "player":[1,1], "coins":[[2,1], [2,5]]},
            {"level":5, "player":[1,1], "coins":[[4,1], [3,4], [2,5]]}
        ];

        this.setNextLevel();
        
        for(let i = 0; i<this.blockNames.length; i++){
            const x = (-(this.blockNames.length/2) + i) * 80 + 320;
            const y = 656;
            const temp = this.add.image(x, y, this.blockNames[i]).setDepth(1);
            this.add.image(x, y, this.blockNames[i]).setDepth(0.8).setOrigin(0)
            temp.setData("initX",x);
            temp.setData("initY",y);
            temp.setData("type",this.blockNames[i]);
            temp.setOrigin(0);
            temp.setInteractive();
            this.blocks.push(temp);
            this.positions.push([x,y]);
        }
        this.input.setDraggable([ ...this.blocks]);

        this.area = this.add.image(16, this.blockPlaceY - 48, 'area').setDepth(0.5).setOrigin(0,0);
        this.start = this.add.image(this.blockPlaceX, this.blockPlaceY, 'start').setDepth(0.8).setInteractive();
        this.start.on('pointerdown', ()=> {
            if(this.started){
                this.started = false;
                this.start.setTexture("start");
                this.reset();
            }
            else{
                this.started = true;
                this.start.setTexture("stop");
                this.run(this.player, this.direction);
            }
        })

        this.blockPlaceX+=64;

        this.input.on('drag', (pointer, gameObject, dragX, dragY)=> {
            gameObject.x = dragX;
            gameObject.y = dragY;    
        });

        this.input.on('dragend', (pointer, gameObject:Phaser.GameObjects.Image, dragX, dragY) => {
            const offsetY = this.blockPlaceY - gameObject.y;
            const offsetX = this.blockPlaceX - gameObject.x;
          
            if(offsetY<50 &&offsetY>0 && offsetX > 0 && offsetX < 50){
                const temp = this.add.image(this.blockPlaceX, this.blockPlaceY, gameObject.getData("type")).setDepth(0.8).setOrigin(0.5);
                this.blockPlaceX+=64;
                this.executionBlocks.push(temp);
                this.executionList.push(gameObject.getData("type"));
            }
            gameObject.x = gameObject.getData("initX");
            gameObject.y = gameObject.getData("initY");
        });

        for(let i = 0; i<5; i++){
            for(let j = 0; j<5; j++){
                this.add.image(j*128, i*128, 'marble').setOrigin(0);
            }
        }
    }
    setNextLevel(){
        if(this.level>1)this.player.destroy();
        this.player = this.add.image(this.levelData[this.level-1].player[0] *64, this.levelData[this.level-1].player[1]*64, 'player').setDepth(1);
        this.player.setData("initX",64);
        this.player.setData("initY",64);

        for(let i = 0; i<this.levelData[this.level-1].coins.length; i++){
            const temp = this.add.image(128*this.levelData[this.level-1].coins[i][0] -64, 128*this.levelData[this.level-1].coins[i][1] -64, 'coin').setDepth(1);
            this.coins.push(temp);
        }
    }

    run (player:Phaser.GameObjects.Image, direction:string){
        let i = 0;
        const timer = setInterval(()=>{
            if(this.executionList[i] == "forward"){
                if(this.direction=="forward"){player.y+=128;}
                else if (this.direction=="backward"){player.y-=128;}
                else if (this.direction=="left"){player.x-=128;}
                else if (this.direction=="right"){player.x+=128;}

                for(let i = 0; i<this.coins.length;i++){
                    if(Math.abs(this.player.x - this.coins[i].x)<5 && Math.abs(this.player.y - this.coins[i].y) <5 ){
                        this.score+=1;
                        this.coins[i].setVisible(false);
                    }
                }

                if(this.score>=this.levelData[this.level+1].coins.length){                   
                    for(let i = 0; i<this.coins.length; i++){
                        this.coins[i].destroy();
                    }
                    clearInterval(timer);
                    this.level++;
                    this.coins=[];
                    setTimeout(()=>{
                        this.setNextLevel(); 
                    },3000)                    
                }
            }
            else if(this.executionList[i] == "anticlockwise"){
                if(this.direction=="forward"){
                    this.direction="right"
                    this.player.setTexture("right")
                }
                else if (this.direction=="backward"){
                    this.direction="left"
                    this.player.setTexture("left")
                }
                else if (this.direction=="left"){
                    this.direction="forward"
                    this.player.setTexture("player")
                }
                else if (this.direction=="right"){
                    this.direction="backward"
                    this.player.setTexture("backward")
                }
            }
            else if(this.executionList[i] == "clockwise"){
                if(this.direction=="forward"){
                    this.direction="left"
                    this.player.setTexture("left")
                }
                else if (this.direction=="backward"){
                    this.direction="right"
                    this.player.setTexture("right")
                }
                else if (this.direction=="left"){
                    this.direction="backward"
                    this.player.setTexture("backward")
                }
                else if (this.direction=="right"){
                    this.direction="forward"
                    this.player.setTexture("player")
                }
            }
            i++;

            if(i>= this.executionList.length){
                clearInterval(timer)
            }
        },1000)
    }

    reset (){
        this.player.x = this.player.getData("initX");
        this.player.y = this.player.getData("initY");
        for(let i = 0; i<this.coins.length;i++){
            this.coins[i].setVisible(true);
        }
    }
}

const config = {
    type: Phaser.AUTO,
    backgroundColor: '#627577',
    width: 640,
    height: 840,
    scene: Demo
};

const game = new Phaser.Game(config);
