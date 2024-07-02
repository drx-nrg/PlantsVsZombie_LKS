const menu = document.querySelector('.main-menu');
const game = document.querySelector('.game');

const play = document.getElementById('play');
const username = document.getElementById('username')
const level = document.getElementById('level');

let usernameEmpty = true;

username.onchange = () => {
    if(username.value !== ""){
        play.style.backgroundColor = "green";
        usernameEmpty = false;
    }
}

play.onclick = () => {
    if(!usernameEmpty){
        const data = {
            username: username.value,
            level: level.value
        }

        localStorage["zombie"] = JSON.stringify(data);
        menu.style.display = "none";
        game.style.display = "flex";

        playGame()
    }
}

function playGame(){
    const canvas = document.getElementById('canvas');
    canvas.width = 1000;
    canvas.height = 600;
    const ctx = canvas.getContext('2d');

    let countdown = 3;

    const pause = document.getElementById('paused');
    const countdownEl = document.querySelector('.countdown');
    const continueBtn = document.getElementById('#continue');
    const restart = document.querySelectorAll('#restart');

    const data = JSON.parse(localStorage["zombie"]);

    const game = {
        username: data.username,
        level: data.level,
        timer: 60,
        isPaused: false,
        isGameOver: false,
        mouseDown: false,
        sun: 0,
    }

    const GeneralImage = {
        Background: './Sprites/General/Background.jpg',
        Sun: './Sprites/General/Sun.png',
        CloseIcon: './Sprites/General/close-icon.png',
        LawnIdle: './Sprites/General/lawnmoweridle.gif',
        LawnActive: './Sprites/General/lawnmowerActivated.gif',
        Shovel: './Sprites/General/Shovel.png',
    }

    const SeedsImages = {
        IcePea: './Sprites/Seeds/IcePeaSeed.png',
        PeaShooter: './Sprites/Seeds/PeaShooterSeed.png',
        SunFlower: './Sprites/Seeds/SunFlowerSeed.png',
        WallNut: './Sprites/Seeds/WallNutSeed.png',
    }

    const GrassImage = './Sprites/General/Grass.bmp';
    const ZombieImage = './Sprites/Zombie/frame_*_delay-0.05s.gif'
    const SunFlowerImage = './Sprites/SunFlower/frame_*_delay-0.06s.gif'
    const PeaShooterImage = './Sprites/PeaShooter/frame_*_delay-0.12s.gif'
    const IcePeaImage = './Sprites/IcePea/frame_*_delay-0.12s.gif'
    const WallNutImage = './Sprites/WallNut/frame_*_delay-0.12s.gif'

    const lawnMowerInit = {
        width: 100,
        height: 100,
        position: {
            x: 0,
            y: 0
        }
    }

    const zombieInit = {
        width: 80,
        height: 120,
        position: {
            x: canvas.width,
            y: 0
        }
    }

    const seedsInit = {
        width: 60,
        height: 80,
    }

    const click = {
        status: false,
        x: 0,
        y: 0
    }

    const mouse = {
        x: 0,
        y: 0
    }

    class Sprite{
        constructor(width, height, x, y, imageSrc, isBlur){
            this.width = width;
            this.height = height;
            this.x = x;
            this.y = y;
            this.image = new Image();
            this.image.src = imageSrc;
            this.isBlur = isBlur;
        }
        draw(){
            if(this.isBlur) ctx.globalAlpha = 0.5
            ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
            ctx.globalAlpha = 1.0;
        }
        update(){
            this.draw();
        }
        calcDistanceWith(object){
            const a = Math.pow(this.x - object.x, 2);
            const b = Math.pow(this.y - object.y, 2);

            return Math.sqrt(a + b);
        }
    }

    class Sun extends Sprite{
        constructor(width, height, x, y){
            super(width, height, x, y);
            this.velocityY = 1;
            this.velocityX = 0;
            this.image = new Image();
            this.image.src = GeneralImage.Sun
            this.isClicked = false;
        }
        draw(){
            ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
        }
        update(){
            this.draw();

            this.x += this.velocityX;
            this.y += this.velocityY;

            if(this.y > canvas.height - this.height){
                this.velocityX = 0;
                this.velocityY = 0;
            }

            if(this.isClicked){
                this.velocityY += -5;
                this.velocityX += -2;
            }

        }
    }

    class SunFlower extends Sprite{
        constructor(width, height, x, y){
            super(width, height, x, y);
            this.image = new Image();
            this.image.src = SunFlowerImage.replace("*", "00");
            this.frameCurrent = 0;
            this.frameMax = 24;
        }
        draw(){
            ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
        }
        update(){
            if(this.frameCurrent > this.frameMax){
                this.frameCurrent = 0;
            }

            this.image.src = SunFlowerImage.replace("*", this.frameCurrent < 10 ? "0"+this.frameCurrent : this.frameCurrent);

            this.draw();

            this.frameCurrent++;
        }
    }

    class PeaShooter extends Sprite{
        constructor(width, height, x, y){
            super(width, height, x, y);
            this.image = new Image();
            this.image.src = PeaShooterImage.replace("*", "00");
            this.frameCurrent = 0;
            this.frameMax = 30;
            this.frameElapsed = 0;
        }
        draw(){
            ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
        }
        update(){
            if(this.frameCurrent === this.frameMax){
                this.frameCurrent = 0;
            }

            this.image.src = PeaShooterImage.replace("*", this.frameCurrent < 10 ? "0"+this.frameCurrent : this.frameCurrent);

            this.draw();

            this.frameElapsed++;

            if(this.frameElapsed === 12){
                this.frameCurrent++;
                this.frameElapsed = 0;
            }
        }
    }

    class IcePeaShooter extends Sprite{
        constructor(width, height, x, y){
            super(width, height, x, y);
            this.image = new Image();
            this.image.src = IcePeaImage.replace("*", "00");
            this.frameCurrent = 0;
            this.frameMax = 31;
            this.frameElapsed = 0;
        }
        draw(){
            ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
        }
        update(){
            if(this.frameCurrent === this.frameMax){
                this.frameCurrent = 0;
            }

            this.image.src = PeaShooterImage.replace("*", this.frameCurrent < 10 ? "0"+this.frameCurrent : this.frameCurrent);

            this.draw();

            this.frameElapsed++;

            if(this.frameElapsed === 12){
                this.frameCurrent++;
                this.frameElapsed = 0;
            }
        }
    }

    class Wallnut extends Sprite{
        constructor(width, height, x, y){
            super(width, height, x, y);
            this.image = new Image();
            this.image.src = WallNutImage.replace("*", "00");
            this.frameCurrent = 0;
            this.frameMax = 32;
        }
        update(){
            if(this.frameCurrent > this.frameMax){
                this.frameCurrent = 0;
            }

            this.image.src = WallNutImage.replace("*", this.frameCurrent.toString().padStart(2, "0"));

            this.draw();
        }
    }

    class Zombie extends Sprite{
        constructor(width, height, x, y, imageSrc){
            super(width, height, x, y);
            this.image = new Image();
            this.image.src = imageSrc;
            this.frameMax = 33;
            this.frameCurrent = 0;
            this.frameElapsed = 0;
            this.velocityX = 0.2;
            this.rotateVelocity = 30
            this.rotation = 0;
            this.collideWithLawnMower = false;
        }
        draw(){
            if(this.collideWithLawnMower){
                ctx.save();
                ctx.translate(this.x + this.width / 2, this.y + this.height);
                ctx.rotate(this.rotation);
                ctx.drawImage(this.image , -this.width, -this.height, this.width, this.height);
                ctx.restore();
            }else{
                ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
            }
        }
        update(){
            this.x = !this.collideWithLawnMower ? this.x - this.velocityX : this.x;

            if(this.frameCurrent > this.frameMax){
                this.frameCurrent = 0;
            }

            this.image.src = ZombieImage.replace("*", this.frameCurrent < 10 ? "0"+this.frameCurrent : this.frameCurrent);

            this.draw();

            this.frameElapsed++;
            
            if(this.frameElapsed === 5 && !this.collideWithLawnMower){
                this.frameCurrent++;
                this.frameElapsed = 0;
            }

            if(this.collideWithLawnMower && this.rotation <= 90){
                this.rotation += this.rotateVelocity;
                console.log(this.rotation);
            }
        }
    }

    class Mower extends Sprite{
        constructor(width, height, x, y){
            super(width, height, x, y);
            this.image = new Image();
            this.image.src = GeneralImage.LawnIdle;
            this.isActive = false;
            this.velocityX = 10;
        }
        draw(){
            ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
        }
        update(){
            if(this.isActive){
                this.image.src = GeneralImage.LawnActive;
                this.x += this.velocityX
            }

            this.draw();
        }
    }


    const background = new Sprite(canvas.width, canvas.height, 0, 0, GeneralImage.Background, false);
    const grounds = [];
    let zombies = [];
    let draggedItems = null;
    let draggedItemsName = null;
    let plants = [new PeaShooter(90, 90, 120, 120)];
    const lawnMowers = [];
    const seeds = [];
    const suns = [];
    const shovel = new Sprite(60, 70, 800, 10, GeneralImage.Shovel, false);

    function generateRandomX(){
        return Math.floor(Math.random() * canvas.width - 300);
    }

    function generateRandomY(){
        let posAvailable = [110, 200, 280, 370, 460];   
        return posAvailable[Math.floor(Math.random() * posAvailable.length)];
    }

    function isColliding(rect1, rect2){
        return rect1.x < rect2.x + rect2.width &&
                rect1.x + rect1.width  > rect2.x &&
                rect1.y < rect2.y + rect2.height &&
                rect1.y + rect1.height  > rect2.y;
    }

    function generateGrounds(){
        for(let i = 1; i <= 5; i++){
            for(let j = 1; j < 10; j++){
                let posInit = {
                    x: 120,
                    y: 120
                }

                let position = {
                    x: j === 1 ? posInit.x : posInit.x + (90 * (j - 1)),
                    y: i === 1 ? posInit.y : posInit.y + (90 * (i - 1))
                }
                
                grounds.push(new Sprite(90, 90, position.x, position.y, GrassImage))
            }
        }
    }

    function renderGrounds(){
        if(!grounds.length) generateGrounds();

        grounds.forEach(g => {
            g.update();
        })
    }


    function generateZombies(){
        if(game.level === "easy"){
            let y = generateRandomY();
            zombies.push(new Zombie(zombieInit.width, zombieInit.height, zombieInit.position.x, y - 50, ZombieImage.replace("*", "00")))
        }else if(game.level === "medium"){
            for(let i = 0; i < 2; i++){
                let y = generateRandomY();
                zombies.push(new Zombie(zombieInit.width, zombieInit.height, zombieInit.position.x, y - 50, ZombieImage.replace("*", "00")));
            }
        }else if(game.level === "hard"){
            for(let i = 0; i < 3; i++){
                let y = generateRandomY();
                zombies.push(new Zombie(zombieInit.width, zombieInit.height, zombieInit.position.x, y - 50, ZombieImage.replace("*", "00")));
            }
        }
    }

    function renderZombies(){
        if(zombies.length){
            zombies.sort((a,b) => a.y - b.y);
            zombies.forEach(zombie => {
                zombie.update();
            });
        }
    }

    function generateSun(){
        let x = generateRandomX();
        suns.push(new Sun(60, 60, x, -60));
    }

    function renderSuns(){
        if(suns.length){
            suns.forEach((sun, index) => {
                sun.update();
            });
        }
    }

    function renderPlants(){
        console.log(plants)
        if(plants.length){
            plants.forEach((plant, index) => {
                plant.update();
            });
        }
    }

    function generateSeeds(){
        let index = 0;
        for(const key in SeedsImages){
            seeds.push(new Sprite(seedsInit.width, seedsInit.height, index === 0 ? 230 :230 + seedsInit.width * index, 10, SeedsImages[key], false));
            index++;
        }
    }

    function renderSeeds(){
        if(!seeds.length) generateSeeds();

        seeds.forEach(seed => {
            seed.update();
        });
    }

    function generateLawnMower(){
        let posAvailable = [110, 200, 280, 370, 460];   
        for(let i = 0; i < 5; i++){
            lawnMowers.push(new Mower(lawnMowerInit.width, lawnMowerInit.height, 0, posAvailable[i]));
        }
    }

    function renderLawnMower(){
        if(!lawnMowers.length) generateLawnMower();

        lawnMowers.forEach(mower => {
            mower.update();
        });
    }

    function handleMowerOnZombies (){
        lawnMowers.forEach((mower, mIndex) => {
            zombies.forEach((zombie, zIndex) => {
                if(isColliding(mower, zombie)){
                    lawnMowers[mIndex].isActive = true;
                    zombies[zIndex].collideWithLawnMower = true;
                }
            });
        });
    }

    function handleUserClick(){
        // Handle for suns click
        suns.forEach((sun, index) => {
            if(click.x > sun.x && click.x < sun.x + sun.width &&
                click.y > sun.y && click.y < sun.y + sun.height &&
                click.status
            ){
                suns[index].isClicked = true;
                game.sun += 25
                click.status = false;
            }
        });

        // Handle seed that clicked and dragged by user
        seeds.forEach((seed, index) => {
            if(click.x > seed.x && click.x < seed.x + seed.width &&
                click.y > seed.y && click.y < seed.y + seed.height &&
                game.mouseDown
            ){ 
                let image = null;

                if(seed.image.src.includes("PeaShooterSeed")) {
                    image = PeaShooterImage.replace("*", "00");
                    draggedItemsName = "PeaShooter"
                }
                else if(seed.image.src.includes("IcePeaSeed")) {
                    image = IcePeaImage.replace("*", "02");
                    draggedItemsName = "IcePea"
                }
                else if(seed.image.src.includes("SunFlowerSeed")) {
                    image = SunFlowerImage.replace("*", "00");
                    draggedItemsName = "SunFlower"
                }
                if(seed.image.src.includes("WallNutSeed")) {
                    image = WallNutImage.replace("*", "00");
                    draggedItemsName = "Wallnut"
                }
                
                draggedItems = new Sprite(90, 90, mouse.x - 90 / 2, mouse.y - 90 / 2, image, true);
                draggedItems.update();
            }
        }); 

        // Handle all the lawn mower to activate
        lawnMowers.forEach((mower, index) => {
            if(click.x > mower.x && click.x < mower.x + mower.width && 
                click.y > mower.y && click.y < mower.y + mower.width && 
                game.mouseDown
            ){
                lawnMowers[index].isActive = true;
            }
        }); 

        if(click.x > shovel.x && click.x < shovel.x + shovel.width && click.y > shovel.y && click.y < shovel.y + shovel.height && game.mouseDown){
            let image = GeneralImage.Shovel;
            draggedItems = new Sprite(shovel.width, shovel.height, mouse.x, mouse.y, image, true);
            draggedItems.update();
        }

        plants.forEach((plant, index) => {
            if(draggedItems?.image.src.includes("Shovel") && mouse.x > plant.x && mouse.x < plant.x + plant.width && mouse.y > plant.y && mouse.y < plant.y + plant.height){
                plants = plants.filter((_, i) => i !== index);
            }
        });

    }

    function handlePlantPut(){
        if(!draggedItems || draggedItems?.image.src.includes("Shovel")){
            return false;
        }

        let nearestPosition = []

        grounds.forEach((ground, index) => {
            const data = {
                distance: draggedItems.calcDistanceWith(ground),
                ground: grounds[index]
            }

            nearestPosition.push(data);
        });

        nearestPosition.sort((a, b) => a.distance - b.distance);

        const plantPositionFinal = {
            x: nearestPosition[0].ground.x,
            y: nearestPosition[0].ground.y,
        }

        let plant = null

        if(draggedItemsName === "PeaShooter"){
            plant = new PeaShooter(90, 90, plantPositionFinal.x, plantPositionFinal.y);
        }else if(draggedItemsName === "Wallnut"){
            plant = new Wallnut(90, 90, plantPositionFinal.x, plantPositionFinal.y);
        }
        else if(draggedItemsName === "IcePea"){
            plant = new IcePeaShooter(90, 90, plantPositionFinal.x, plantPositionFinal.y);
        }
        else if(draggedItemsName === "SunFlower"){
            plant = new SunFlower(90, 90, plantPositionFinal.x, plantPositionFinal.y);
        }

        draggedItems = null;
        return plants.push(plant);
    }   

    function handleZombies(){
        zombies.forEach((zombie, index) => {
            if(zombie.rotation === 90){
                setTimeout(() => {
                    zombies = zombies.filter((z, i) => i !== index);
                }, 1500);
            }
        })
    }

    function handleGame(){
        handleMowerOnZombies();
        handleUserClick();
        handleZombies();

        textFill(game.sun, 185, 90, "black");
    }

    function animate(){
        if(!game.isGameOver && !game.isPaused){
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            background.update();
            renderSeeds();
            shovel.update();
            renderGrounds();
            renderPlants();
            renderZombies();
            renderSuns();
            renderLawnMower();
        }
        
        handleGame();
        requestAnimationFrame(animate);
    }

    function textFill(text, x, y, color){
        ctx.fillStyle = color;
        ctx.font = "Bold 25px Arial"
        ctx.textAlign = "center";
        ctx.fillText(text, x, y);
    }

    function startCountdown(callback){
        const intervalID = this.setInterval(() => {
            if(countdown > 0){
                countdownEl.style.display = "flex";
                countdown -= 1
                countdownEl.innerHTML = countdown;
            }else{
                this.clearInterval(intervalID);
                countdownEl.style.display = "none";
                game.isPaused = false;
                callback();
            }
        }, 1000);
    }

    startCountdown(animate);

    this.setInterval(() => {
        if(!game.isPaused && !game.isGameOver) generateZombies();
    }, 5000);

    this.setInterval(() => {
        if(!game.isPaused && !game.isGameOver) generateSun();
    }, 3000);

    window.addEventListener('keyup', function(e){
        if(e.key === "Escape"){
            if(!game.isPaused){
                game.isPaused = true;
                pause.style.display = "flex";
            }else{
                pause.style.display = "none";
                countdown = 4;
                startCountdown(animate);
            }
        }
    });

    window.addEventListener('mousedown', function(e){
        const rect = canvas.getBoundingClientRect();
        click.x = e.clientX - rect.left;
        click.y = e.clientY - rect.top;

        click.status = true;
        game.mouseDown = true;
    });

    window.addEventListener('mouseup', function(){
        game.mouseDown = false;
        handlePlantPut();
    });

    window.addEventListener('mousemove', function(e){
        const rect = canvas.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
    }); 
}