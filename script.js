const score = document.querySelector('.score');
const start = document.querySelector('.start');
const gameArea = document.querySelector('.gameArea');
const MAX_ENEMY = 5;
const HEIGHT_ELEM = 100;
const topScore = document.getElementById('topScore');

const car = document.createElement('div');

const audio = document.createElement('embed');
const audioCrash = document.createElement('embed');
audio.src = 'audio.mp3';
audioCrash.src = 'crash.mp3';
audio.type = 'audio/mp3';
audio.style.cssText = `position: absolute; top: -1000px;`
audioCrash.style.cssText = `position: absolute; top: -1000px;`


car.classList.add('car');
const countOfSections = document.documentElement.clientHeight / HEIGHT_ELEM;
gameArea.style.height = countOfSections * HEIGHT_ELEM ;

start.addEventListener('click', startGame);
document.addEventListener('keydown', startRun);
document.addEventListener('keyup', stopRun);


const keys = {
    ArrowUp: false,
    ArrowDown: false,
    ArrowRight: false,
    ArrowLeft: false,
};

const setting = {
    start: false,
    score: 0,
    speed: 0,
    traffic: 0,
    level: 0,
}

let level = setting.level;
const result = parseInt(localStorage.getItem('needforjs_score', setting.score));
topScore.textContent = result ? result : 0 ;

const addLocalStorage = () => {
    if(result < setting.score) {
        localStorage.setItem('needforjs_score', setting.score);
        topScore.textContent = setting.score;
    }
    
}

function getQuantityElements(heightElement) {//функция вычисляет, сколько линий д.б. на странице в зависимости от высоты экрана девайса
    return (gameArea.offsetHeight / heightElement) + 1;
}


function startGame(event) {
    const target = event.target;
    if(target === start) return;

    switch(target.id) {
        case 'easy':
            setting.speed = 3;
            setting.traffic = 4;
            break;
        case 'middle':
            setting.speed = 5;
            setting.traffic = 3;
            break;
        case 'hard':
            setting.speed = 7;
            setting.traffic = 2;
            break;
    }

    start.classList.add('hide');
    gameArea.innerHTML = '';
    
    for(let i = 0; i < getQuantityElements(HEIGHT_ELEM); i++) {
        const line = document.createElement('div');
        line.classList.add('line');
        line.style.top = (i * HEIGHT_ELEM) + 'px';
        line.style.height = (HEIGHT_ELEM / 2) + 'px';
        line.y = i * HEIGHT_ELEM;
        gameArea.append(line);
    }

    for(let i = 0; i < getQuantityElements(HEIGHT_ELEM * setting.traffic); i++ ) {
        const enemy = document.createElement('div');
        const randomEnemy = Math.floor(Math.random() * MAX_ENEMY) + 1;
        enemy.classList.add('enemy');
        enemy.y = -HEIGHT_ELEM * setting.traffic * (i + 1); //какое расстояние будет между автомобилями
        
        enemy.style.top = enemy.y + 'px';
        enemy.style.background = `transparent url(./img/enemy${randomEnemy}.png) center / cover no-repeat` ;
        gameArea.append(enemy);
        enemy.style.left = Math.floor(Math.random() * (gameArea.offsetWidth - enemy.offsetWidth)) + 'px';
    }

    setting.score = 0;
    setting.start = true;
    gameArea.append(car);
    car.style.left = gameArea.offsetWidth / 2 - car.offsetWidth / 2;
    car.style.top = 'auto';
    car.style.bottom = '10px';
    gameArea.append(audio);
    setting.x = car.offsetLeft;
    setting.y = car.offsetTop;
    requestAnimationFrame(playGame);
};

function playGame() {

    setting.level = Math.floor(setting.score / 3000);
    if(setting.level !== level) {
        level = setting.level;
        setting.speed += 1;
    }
    
    if(setting.start) {
        setting.score += setting.speed;
        score.innerHTML = 'SCORE<br>' + setting.score;
        moveRoad();
        moveEnemy();

        if(keys.ArrowLeft && setting.x > 0) {
            setting.x -= setting.speed;
        }
        if(keys.ArrowRight && setting.x < (gameArea.offsetWidth - car.offsetWidth)) {
            setting.x += setting.speed;
        }

        if(keys.ArrowDown && setting.y < (gameArea.offsetHeight - car.offsetHeight)) {
            setting.y += setting.speed;
        }

        if(keys.ArrowUp && setting.y > 0) {
            setting.y -= setting.speed;
        }

        car.style.left = setting.x + 'px';
        car.style.top = setting.y + 'px';
        requestAnimationFrame(playGame); //рекурсия(ф-ция щапускает сама себя)
    }  
}


function startRun(event) {
 if(keys.hasOwnProperty(event.key)) {
        event.preventDefault();
        keys[event.key] = true;
    }   
}

function stopRun(event) {
    event.preventDefault();
    keys[event.key] = false;
}

function moveRoad() {
    let lines = document.querySelectorAll('.line');
    lines.forEach((line) =>{
        line.y += setting.speed;
        line.style.top = line.y + 'px';

        if(line.y >= gameArea.offsetHeight) {
            line.y = -HEIGHT_ELEM;
        }
    } );
}

function moveEnemy() {
    let enemy = document.querySelectorAll('.enemy');
    enemy.forEach((item) => {
        let carRect = car.getBoundingClientRect();
        let enemyRect = item.getBoundingClientRect();

        if (carRect.top <= enemyRect.bottom &&
            carRect.right >= enemyRect.left &&
            carRect.left <= enemyRect.right &&
            carRect.bottom >= enemyRect.top) {
            console.warn('ДТП');
            setting.start = false;
            audio.remove();
            gameArea.append(audioCrash);
            start.classList.remove('hide');
            //start.innerHTML = 'Кликни, чтобы начать игру заново!'
            start.style.top = score.offsetHeight;
            addLocalStorage();
        }
        item.y += setting.speed / 2;
        item.style.top = item.y + 'px';

    if(item.y >= gameArea.offsetHeight) {
        item.y = -HEIGHT_ELEM * setting.traffic;
        item.style.left = Math.floor(Math.random() * (gameArea.offsetWidth - item.offsetWidth)) + 'px';
        }
    });

    
  }