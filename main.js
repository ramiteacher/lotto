// 색상 배열 (로또 번호 색상)
const ballColors = {
    "1-10": "#fbc400",   // 노랑
    "11-20": "#69c8f2",  // 파랑
    "21-30": "#ff7272",  // 빨강
    "31-40": "#aaa",     // 회색
    "41-45": "#b0d840"   // 초록
};

// 추첨기 초기화 및 공 생성
function initMachine() {
    // 추첨기 본체 생성
    const machine = document.querySelector('.lottery-machine');
    const ballContainer = document.getElementById('ballContainer');
    
    // 기존 내용 초기화
    machine.innerHTML = '';
    
    // ball-container 다시 추가
    const newBallContainer = document.createElement('div');
    newBallContainer.className = 'ball-container';
    newBallContainer.id = 'ballContainer';
    machine.appendChild(newBallContainer);
    
    // 추첨기 본체 생성
    const machineBody = document.createElement('div');
    machineBody.className = 'machine-body';
    machine.appendChild(machineBody);
    
    // 유리 효과 추가
    const machineGlass = document.createElement('div');
    machineGlass.className = 'machine-glass';
    machine.appendChild(machineGlass);
    
    // 공이 나오는 튜브 추가
    const tube = document.createElement('div');
    tube.className = 'tube';
    machine.appendChild(tube);
    
    // 팬 추가
    const fan = document.createElement('div');
    fan.className = 'fan';
    machine.appendChild(fan);
    
    // 받침대 추가
    const machineBase = document.createElement('div');
    machineBase.className = 'machine-base';
    machine.appendChild(machineBase);
    
    // 공 생성
    createBalls();
}

// 볼 색상 가져오기
function getBallColor(number) {
    for (const range in ballColors) {
        const [min, max] = range.split('-').map(Number);
        if (number >= min && number <= max) {
            return ballColors[range];
        }
    }
    return "#ffffff"; // 기본 흰색
}

// 로또 공 생성
function createBalls() {
    const ballContainer = document.getElementById('ballContainer');
    
    // ballContainer가 없으면 종료
    if (!ballContainer) {
        console.error('ballContainer not found');
        return;
    }
    
    ballContainer.innerHTML = '';
    
    // 공기 효과 추가
    const airEffect = document.createElement('div');
    airEffect.className = 'air-effect';
    ballContainer.appendChild(airEffect);
    
    // 45개의 볼 생성
    for (let i = 1; i <= 45; i++) {
        const ball = document.createElement('div');
        ball.className = 'ball';
        ball.dataset.number = i;
        ball.textContent = i;
        ball.style.backgroundColor = getBallColor(i);
        
        // 랜덤 위치 설정
        positionBallRandomly(ball);
        
        // 공마다 다른 애니메이션
        const animationName = Math.random() > 0.5 ? 'float' : 'bounce';
        const duration = 2 + Math.random() * 3;
        const delay = Math.random() * -5;
        
        ball.style.animation = `${animationName} ${duration}s infinite ease-in-out ${delay}s`;
        
        ballContainer.appendChild(ball);
    }
}

// 공 랜덤 위치 설정
function positionBallRandomly(ball) {
    // 원 내부에 랜덤 위치 잡기
    const centerX = 160;
    const centerY = 160;
    const maxRadius = 120;
    
    // 원 내부의 랜덤한 위치 계산
    const angle = Math.random() * Math.PI * 2;
    const radius = Math.random() * maxRadius;
    
    const x = centerX + radius * Math.cos(angle) - 20; // ball width/2
    const y = centerY + radius * Math.sin(angle) - 20; // ball height/2
    
    ball.style.left = `${x}px`;
    ball.style.top = `${y}px`;
    
    // 3D 효과를 위한 Z 위치
    const z = Math.random() * 100 - 50;
    ball.style.transform = `translateZ(${z}px)`;
}

// 결과 표시
function showResults(numbers) {
    const resultContainer = document.getElementById('resultContainer');
    if (!resultContainer) return;
    
    resultContainer.innerHTML = '';
    
    numbers.forEach((number, index) => {
        const resultBall = document.createElement('div');
        resultBall.className = 'result-ball';
        resultBall.textContent = number;
        resultBall.style.backgroundColor = getBallColor(number);
        resultContainer.appendChild(resultBall);
        
        // 공이 하나씩 나타나도록 지연
        setTimeout(() => {
            resultBall.style.transform = 'scale(1)';
        }, index * 800 + 100);
    });
}

// 로또 번호 뽑기 (6개)
function generateLottoNumbers() {
    const numbers = [];
    while (numbers.length < 6) {
        const randomNumber = Math.floor(Math.random() * 45) + 1;
        if (!numbers.includes(randomNumber)) {
            numbers.push(randomNumber);
        }
    }
    // 오름차순 정렬
    return numbers.sort((a, b) => a - b);
}

// 추첨 애니메이션 강화
function enhancedAnimation() {
    // 기계 흔들림 효과
    const machineBody = document.querySelector('.machine-body');
    if (machineBody) {
        machineBody.style.animation = 'shake 0.5s infinite';
    }
    
    // 팬 속도 증가
    const fan = document.querySelector('.fan');
    if (fan) {
        fan.style.animationDuration = '0.1s';
    }
    
    // 모든 공에 애니메이션 효과 증가
    const balls = document.querySelectorAll('.ball');
    balls.forEach(ball => {
        const randomAnim = Math.floor(Math.random() * 3);
        let animName = 'float';
        
        switch(randomAnim) {
            case 0: animName = 'float'; break;
            case 1: animName = 'bounce'; break;
            case 2: animName = 'float'; break;  // spin은 제거 (오류 가능성)
        }
        
        ball.style.animation = `${animName} 1s infinite ease-in-out`;
    });
    
    setTimeout(() => {
        // 흔들림 효과 제거
        if (machineBody) {
            machineBody.style.animation = '';
        }
        
        // 팬 속도 정상화
        if (fan) {
            fan.style.animationDuration = '0.5s';
        }
    }, 3000);
}

// 공이 선택되어 나오는 애니메이션
function shootBall(ball) {
    if (!ball) return;
    
    ball.classList.add('selected-ball');
    
    // 공의 현재 위치 기억
    const originalLeft = ball.style.left;
    const originalTop = ball.style.top;
    
    // 공을 중앙으로 이동
    setTimeout(() => {
        ball.style.left = '180px';  // 중앙
        ball.style.top = '250px';   // 아래쪽
        ball.style.zIndex = '100';
        
        // 잠시 후 사라짐
        setTimeout(() => {
            ball.style.opacity = '0';
        }, 800);
    }, 500);
}

// 로또 추첨 실행
function drawLottery() {
    const startBtn = document.getElementById('startBtn');
    const resetBtn = document.getElementById('resetBtn');
    
    if (startBtn) startBtn.disabled = true;
    if (resetBtn) resetBtn.disabled = true;
    
    // 기존 결과 초기화
    const resultContainer = document.getElementById('resultContainer');
    if (resultContainer) resultContainer.innerHTML = '';
    
    const lottoNumbers = generateLottoNumbers();
    
    // 강화된 애니메이션 시작
    enhancedAnimation();
    
    setTimeout(() => {
        // 선택된 번호 강조
        lottoNumbers.forEach((number, index) => {
            setTimeout(() => {
                const balls = document.querySelectorAll('.ball');
                let selectedBall = null;
                
                balls.forEach(ball => {
                    if (parseInt(ball.dataset.number) === number) {
                        // 선택된 공
                        selectedBall = ball;
                        shootBall(ball);
                    }
                });
                
                // 결과 영역에 공 표시
                setTimeout(() => {
                    showResults(lottoNumbers.slice(0, index + 1));
                }, 1200);
            }, index * 2000 + 3000);
        });
        
        // 추첨 완료 후 버튼 활성화
        setTimeout(() => {
            if (startBtn) startBtn.disabled = false;
            if (resetBtn) resetBtn.disabled = false;
        }, lottoNumbers.length * 2000 + 5000);
    }, 3000);
}

// DOM이 로드된 후 이벤트 리스너 등록
document.addEventListener('DOMContentLoaded', function() {
    const startBtn = document.getElementById('startBtn');
    const resetBtn = document.getElementById('resetBtn');
    
    if (startBtn) {
        startBtn.addEventListener('click', function() {
            console.log('Start button clicked');
            drawLottery();
        });
    } else {
        console.error('Start button not found');
    }
    
    if (resetBtn) {
        resetBtn.addEventListener('click', function() {
            console.log('Reset button clicked');
            initMachine();
        });
    } else {
        console.error('Reset button not found');
    }
    
    // 초기화
    initMachine();
});