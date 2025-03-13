// 색상 배열 (로또 번호 색상)
const ballColors = {
    "1-10": "#fbc400",   // 노랑
    "11-20": "#69c8f2",  // 파랑
    "21-30": "#ff7272",  // 빨강
    "31-40": "#aaa",     // 회색
    "41-45": "#b0d840"   // 초록
};

// 전역 변수 선언
let balls = [];
let isAnimating = false;
let drawingInProgress = false;
let animationFrameId = null;
let machineElements = {};

// 사운드 관련 변수
let soundEnabled = true;
let machineSound, ballDropSound, resultSound, startSound;

// DOM 요소 참조 캐싱
function cacheElements() {
    machineElements = {
        lotteryMachine: document.getElementById('lotteryMachine'),
        resultContainer: document.getElementById('resultContainer'),
        startBtn: document.getElementById('startBtn'),
        resetBtn: document.getElementById('resetBtn'),
        soundControl: document.getElementById('soundControl'),
        soundIcon: document.getElementById('soundIcon')
    };
    
    // 오디오 요소 캐싱
    machineSound = document.getElementById('machineSound');
    ballDropSound = document.getElementById('ballDropSound');
    resultSound = document.getElementById('resultSound');
    startSound = document.getElementById('startSound');
    
    // 볼륨 조정
    machineSound.volume = 0.3;
    ballDropSound.volume = 0.5;
    resultSound.volume = 0.5;
    startSound.volume = 0.3;
}

// 볼 색상 가져오기
function getBallColor(number) {
    for (const range in ballColors) {
        const [min, max] = range.split('-').map(Number);
        if (number >= min && number <= max) {
            return ballColors[range];
        }
    }
    return "#ffffff";
}

// 추첨기 초기화
function initMachine() {
    const {lotteryMachine} = machineElements;
    if (!lotteryMachine) return;
    
    // 이전 애니메이션 정리
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }
    
    // 사운드 중지
    machineSound.pause();
    machineSound.currentTime = 0;
    ballDropSound.pause();
    ballDropSound.currentTime = 0;
    resultSound.pause();
    resultSound.currentTime = 0;
    startSound.pause();
    startSound.currentTime = 0;
    
    // 기존 내용 초기화
    lotteryMachine.innerHTML = '';
    balls = [];
    
    // 사운드 컨트롤 다시 추가
    const soundControl = document.createElement('div');
    soundControl.className = 'sound-control';
    soundControl.id = 'soundControl';
    
    const soundIcon = document.createElement('div');
    soundIcon.className = soundEnabled ? 'sound-icon' : 'sound-icon muted';
    soundIcon.id = 'soundIcon';
    
    soundControl.appendChild(soundIcon);
    lotteryMachine.appendChild(soundControl);
    
    // 기계 구성요소 생성 (최적화: 단일 함수로 묶음)
    createMachineComponents(lotteryMachine);
    
    // 볼 생성
    createBalls();
    
    // 애니메이션 시작
    isAnimating = true;
    drawingInProgress = false;
    animateBalls();
    
    // 이벤트 리스너 재설정
    cacheElements();
    setupEventListeners();
}

// 기계 구성요소 생성 (최적화: DOM 조작을 한 번에 수행)
function createMachineComponents(lotteryMachine) {
    // DocumentFragment 사용으로 렌더링 최적화
    const fragment = document.createDocumentFragment();
    
    // 추첨기 본체 생성
    const machineBody = document.createElement('div');
    machineBody.className = 'machine-body';
    fragment.appendChild(machineBody);
    
    // 볼 컨테이너 생성
    const ballContainer = document.createElement('div');
    ballContainer.className = 'ball-container';
    ballContainer.id = 'ballContainer';
    
    // 공기 효과 추가
    const airEffect = document.createElement('div');
    airEffect.className = 'air-effect';
    airEffect.id = 'airEffect';
    ballContainer.appendChild(airEffect);
    
    fragment.appendChild(ballContainer);
    
    // 출구 구멍 추가
    const exitHole = document.createElement('div');
    exitHole.className = 'exit-hole';
    fragment.appendChild(exitHole);
    
    // 튜브 상단 추가
    const tubeTop = document.createElement('div');
    tubeTop.className = 'tube-top';
    fragment.appendChild(tubeTop);
    
    // 튜브 패스 추가 (공이 떨어지는 경로)
    const tubePath = document.createElement('div');
    tubePath.className = 'tube-path';
    tubePath.id = 'tubePath';
    fragment.appendChild(tubePath);
    
    // 튜브 추가
    const tube = document.createElement('div');
    tube.className = 'tube';
    
    // 튜브 빛 효과 추가
    const tubeLight = document.createElement('div');
    tubeLight.className = 'tube-light';
    tube.appendChild(tubeLight);
    
    fragment.appendChild(tube);
    
    // 유리 효과 추가 (맨 위에 배치)
    const machineGlass = document.createElement('div');
    machineGlass.className = 'machine-glass';
    fragment.appendChild(machineGlass);
    
    // 팬 추가
    const fan = document.createElement('div');
    fan.className = 'fan';
    fragment.appendChild(fan);
    
    // 받침대 추가
    const machineBase = document.createElement('div');
    machineBase.className = 'machine-base';
    fragment.appendChild(machineBase);
    
    // 한 번에 DOM에 추가
    lotteryMachine.appendChild(fragment);
}

// 로또 공 생성 (최적화: DOM 조작 최소화)
function createBalls() {
    const ballContainer = document.getElementById('ballContainer');
    if (!ballContainer) return;
    
    // DocumentFragment 사용으로 렌더링 최적화
    const fragment = document.createDocumentFragment();
    
    // 45개의 볼 생성
    for (let i = 1; i <= 45; i++) {
        const ball = document.createElement('div');
        
        // 다양한 회전 스타일 랜덤하게 적용
        const animType = Math.floor(Math.random() * 4); // 0~3 랜덤값
        let animClass = 'ball-rotate';
        
        switch(animType) {
            case 0: animClass = 'ball-rotate'; break;
            case 1: animClass = 'ball-fast'; break;     // 빠른 회전
            case 2: animClass = 'ball-reverse'; break;  // 반대 방향
            case 3: animClass = 'ball-bounce'; break;   // 튕기는 효과
        }
        
        ball.className = `ball ${animClass}`;
        ball.dataset.number = i;
        ball.textContent = i;
        ball.style.backgroundColor = getBallColor(i);
        
        // 초기 랜덤 위치와 움직임 설정 (계산 최소화)
        const angleRad = Math.random() * Math.PI * 2;
        const radius = 80 + Math.random() * 60;
        
        // 속도 2배 향상
        const speed = (0.4 + Math.random() * 1.0); // 이전보다 2배 빠르게
        const direction = Math.random() > 0.5 ? 1 : -1;
        
        const centerX = 200;
        const centerY = 200;
        
        const x = centerX + Math.cos(angleRad) * radius - 20;
        const y = centerY + Math.sin(angleRad) * radius - 20;
        
        // 초기 위치 설정
        ball.style.left = `${x}px`;
        ball.style.top = `${y}px`;
        
        // 볼 정보 저장
        balls.push({
            element: ball,
            number: i,
            radius,
            angle: angleRad,
            speed: speed * direction,
            centerX,
            centerY,
            selected: false,
            speedY: 0,
            x, y,
            rotating: true,
            animType  // 애니메이션 타입 저장
        });
        
        fragment.appendChild(ball);
    }
    
    // 한 번에 DOM에 추가
    ballContainer.appendChild(fragment);
    
    // 초기에 볼들이 튀어오르는 효과
    balls.forEach((ball, idx) => {
        setTimeout(() => {
            ball.element.classList.add('jump-ball');
            setTimeout(() => {
                ball.element.classList.remove('jump-ball');
            }, 300);
        }, idx * 20); // 약간의 지연시간
    });
}

// 볼 애니메이션 최적화 (회전 및 움직임)
function animateBalls() {
    if (!isAnimating) return;
    
    // 주사율에 맞춘 최적화 (60프레임 기준)
    const now = Date.now();
    if (!animateBalls.lastTime) animateBalls.lastTime = now;
    
    const delta = now - animateBalls.lastTime;
    if (delta < 16) { // 약 60fps (1000ms/60 ≈ 16.7ms)
        animationFrameId = requestAnimationFrame(animateBalls);
        return;
    }
    
    animateBalls.lastTime = now;
    
    const updateBalls = [];
    
    // 모든 공 위치 계산 (DOM 업데이트와 분리)
    balls.forEach(ball => {
        if (ball.selected || !ball.rotating) return;
        
        // 원 궤도로 회전 - 속도 3배 향상
        ball.angle += ball.speed * 0.03; // 기존 0.01에서 0.03으로 증가
        
        // 새 위치 계산
        ball.x = ball.centerX + Math.cos(ball.angle) * ball.radius - 20;
        ball.y = ball.centerY + Math.sin(ball.angle) * ball.radius - 20;
        
        updateBalls.push(ball);
    });
    
    // 모든 DOM 업데이트를 한번에 처리 (Layout Thrashing 방지)
    updateBalls.forEach(ball => {
        ball.element.style.left = `${ball.x}px`;
        ball.element.style.top = `${ball.y}px`;
    });
    
    animationFrameId = requestAnimationFrame(animateBalls);
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
    return numbers.sort((a, b) => a - b);
}

// 추첨 애니메이션 강화 (사운드 추가)
function enhancedAnimation() {
    // 추첨기 흔들기
    const machineBody = document.querySelector('.machine-body');
    if (machineBody) machineBody.classList.add('shake-hard');
    
    // 사용자 상호작용 후에 소리 재생 시도
    if (soundEnabled) {
        // 시작 소리 재생
        playSound(startSound);
        
        // 약간 지연 후 기계 소리 재생 (두 소리가 겹치지 않도록)
        setTimeout(() => {
            playSound(machineSound);
        }, 10);
    }
    
    // 나머지 애니메이션 코드 유지...
    // 에어 효과 강화
    const airEffect = document.getElementById('airEffect');
    if (airEffect) {
        airEffect.classList.add('air-strong');
        airEffect.style.animationDuration = '0.3s'; // 기존보다 더 빠르게
    }
    
    // 팬 속도 대폭 증가
    const fan = document.querySelector('.fan');
    if (fan) fan.style.animationDuration = '0.05s'; // 매우 빠르게
    
    // 볼의 움직임 극적으로 증가
    balls.forEach(ball => {
        if (!ball.selected) {
            // 볼마다 다양한 애니메이션 효과 적용
            const oldAnim = ball.element.className;
            ball.element.className = 'ball ball-fast'; // 모든 볼을 빠르게 회전
            
            // 속도 대폭 증가
            ball.speed = ball.speed * 5; // 5배 빠르게
            
            // 랜덤 방향 전환으로 더 혼란스럽게
            if (Math.random() > 0.5) {
                ball.speed = -ball.speed;
            }
        }
    });
    
    // 3초 후 원래 상태로 복귀
    setTimeout(() => {
        // 애니메이션 관련 코드는 유지...
        if (machineBody) machineBody.classList.remove('shake-hard');
        if (airEffect) {
            airEffect.classList.remove('air-strong');
            airEffect.style.animationDuration = '1s';
        }
        if (fan) fan.style.animationDuration = '0.5s';
        
        // 공 움직임 정상화 - 원래보다는 빠르게
        balls.forEach(ball => {
            if (!ball.selected) {
                ball.speed = ball.speed / 3; // 원래보다 약간 빠르게
                
                // 원래 애니메이션 유형으로 복구
                const animType = ball.animType;
                let animClass = 'ball-rotate';
                
                switch(animType) {
                    case 0: animClass = 'ball-rotate'; break;
                    case 1: animClass = 'ball-fast'; break;
                    case 2: animClass = 'ball-reverse'; break;
                    case 3: animClass = 'ball-bounce'; break;
                }
                
                ball.element.className = `ball ${animClass}`;
            }
        });
    }, 3000);
}

// 공 선택하고 떨어뜨리기 (사운드 추가)
function selectBall(number) {
    return new Promise((resolve) => {
        // 해당 번호의 공 찾기
        const selectedBall = balls.find(ball => ball.number === number);
        if (!selectedBall) {
            resolve();
            return;
        }
        
        // 선택 상태로 표시
        selectedBall.selected = true;
        selectedBall.element.classList.add('selected-ball');
        selectedBall.element.classList.remove('ball-rotate');
        selectedBall.element.classList.remove('ball-fast');
        selectedBall.element.classList.remove('ball-reverse');
        selectedBall.element.classList.remove('ball-bounce');
        
        // 출구로 유도하는 대신 CSS로 즉시 중앙으로 이동
        selectedBall.element.style.transition = 'left 0.5s, top 0.5s, transform 0.5s';
        selectedBall.element.style.left = '180px';
        selectedBall.element.style.top = '330px';
        selectedBall.element.style.transform = 'scale(1.5)';
        
        // 출구에 도달한 후 처리
        setTimeout(() => {
            // 원래 볼 제거
            if (selectedBall.element && selectedBall.element.parentNode) {
                selectedBall.element.style.opacity = '0';
                setTimeout(() => {
                    if (selectedBall.element.parentNode) {
                        selectedBall.element.parentNode.removeChild(selectedBall.element);
                    }
                }, 300);
            }
            
            // 튜브로 떨어지는 애니메이션
            setTimeout(() => {
                // 볼 떨어지는 소리 재생
                playSound(ballDropSound);
                
                // 튜브 패스로 공이 떨어지는 효과
                const ballClone = document.createElement('div');
                ballClone.className = 'ball selected-ball';
                ballClone.textContent = selectedBall.number;
                ballClone.style.backgroundColor = getBallColor(selectedBall.number);
                
                const tubePath = document.getElementById('tubePath');
                
                if (tubePath) {
                    tubePath.appendChild(ballClone);
                    ballClone.style.position = 'absolute';
                    ballClone.style.left = '10px';  // 튜브 중앙
                    ballClone.style.top = '0';
                    ballClone.style.animation = 'fallDown 1.2s forwards';
                    
                    // 볼이 튜브를 완전히 통과한 후 결과 표시
                    setTimeout(() => {
                        resolve();
                    }, 1200);
                } else {
                    resolve();
                }
            }, 300);
        }, 700);
    });
}

// 결과 표시 (사운드 추가)
function showResult(number) {
    const {resultContainer} = machineElements;
    if (!resultContainer) return;
    
    // 새 결과 공 생성
    const resultBall = document.createElement('div');
    resultBall.className = 'result-ball';
    resultBall.textContent = number;
    resultBall.style.backgroundColor = getBallColor(number);
    resultContainer.appendChild(resultBall);
    
    // 나타나는 애니메이션
    setTimeout(() => {
        resultBall.style.transform = 'scale(1)';
    }, 100);
}

// 로또 추첨 실행 (사운드 추가)
async function drawLottery() {
    if (drawingInProgress) return;
    
    const {startBtn, resetBtn} = machineElements;
    
    drawingInProgress = true;
    startBtn.disabled = true;
    resetBtn.disabled = true;
    
    // 기존 결과 초기화
    machineElements.resultContainer.innerHTML = '';
    
    const lottoNumbers = generateLottoNumbers();
    
    // 강화된 애니메이션 시작
    enhancedAnimation();
    
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // 각 번호 순차적으로 추첨
    for (let i = 0; i < lottoNumbers.length; i++) {
        const number = lottoNumbers[i];
        
        // 첫 공 이후에는 간격 짧게
        if (i > 0) {
            await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        // 공 선택하고 빠져나가는 애니메이션 실행
        await selectBall(number);
        
        // 공이 완전히 빠져나간 후 결과 표시
        showResult(number);
        
        // 마지막 번호일 경우 추첨 완료 사운드 재생
        if (i === lottoNumbers.length - 1) {
            machineSound.pause(); // 추첨기 소리 중지
            playSound(resultSound); // 당첨 소리 재생
        }
    }
    
    // 추첨 완료 후 버튼 활성화
    startBtn.disabled = false;
    resetBtn.disabled = false;
    drawingInProgress = false;
}

// 사운드 토글 기능 개선
function toggleSound() {
    soundEnabled = !soundEnabled;
    
    if (soundEnabled) {
        machineElements.soundIcon.classList.remove('muted');
        // 현재 추첨 중이라면 소리 재생
        if (drawingInProgress) {
            // 다시 재생 시도
            setTimeout(() => {
                machineSound.play().catch(err => console.log('사용자 상호작용 후 재생 시도:', err));
            }, 100);
        }
    } else {
        machineElements.soundIcon.classList.add('muted');
        // 모든 소리 중지
        pauseAllSounds();
    }
}

// 모든 소리 중지 함수 추가
function pauseAllSounds() {
    const sounds = [machineSound, ballDropSound, resultSound, startSound];
    sounds.forEach(sound => {
        if (sound && !sound.paused) {
            sound.pause();
        }
    });
}

// 사운드 재생 함수 개선
function playSound(audioElement) {
    if (!soundEnabled || !audioElement) return;
    
    // 오디오 요소 체크
    if (audioElement.readyState === 0) {
        console.log('오디오가 로드되지 않았습니다. 로드 중...');
        audioElement.load();
    }
    
    // 안전하게 시간 초기화
    try {
        audioElement.currentTime = 0;
    } catch (e) {
        console.log('오디오 시간 초기화 오류:', e);
    }
    
    // 오디오 재생 시도
    try {
        const playPromise = audioElement.play();
        
        if (playPromise !== undefined) {
            playPromise.then(() => {
                console.log('오디오 재생 성공');
            }).catch(error => {
                console.log('오디오 재생 실패:', error);
                
                // 자동 재생 정책 우회 시도
                if (error.name === 'NotAllowedError') {
                    console.log('자동 재생 정책 우회 시도...');
                    
                    // 보조 오디오 생성 (내장 오실레이터 사용)
                    createFallbackAudio(audioElement.id);
                }
            });
        }
    } catch (e) {
        console.log('오디오 재생 중 오류 발생:', e);
        createFallbackAudio(audioElement.id);
    }
}

// 웹 오디오 API를 사용한 대체 소리 생성 (브라우저 내장 사운드)
function createFallbackAudio(type) {
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        
        // 소리 유형에 따라 다른 효과 적용
        switch(type) {
            case 'machineSound':
                oscillator.type = 'sawtooth';
                oscillator.frequency.value = 100;
                gainNode.gain.value = 0.1;
                break;
            case 'ballDropSound':
                oscillator.type = 'sine';
                oscillator.frequency.value = 440;
                gainNode.gain.value = 0.2;
                setTimeout(() => gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5), 100);
                break;
            case 'resultSound':
                oscillator.type = 'square';
                oscillator.frequency.value = 880;
                gainNode.gain.value = 0.2;
                oscillator.frequency.setValueAtTime(880, audioCtx.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 0.5);
                setTimeout(() => gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1), 500);
                break;
            case 'startSound':
                oscillator.type = 'triangle';
                oscillator.frequency.value = 220;
                gainNode.gain.value = 0.3;
                setTimeout(() => {
                    oscillator.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 1);
                    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.5);
                }, 100);
                break;
        }
        
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        oscillator.start();
        setTimeout(() => {
            oscillator.stop();
        }, type === 'machineSound' ? 10000 : 2000);
        
        console.log('대체 오디오 재생 중');
    } catch (e) {
        console.log('대체 오디오 생성 실패:', e);
    }
}

// 오디오 세팅 강화
function setupAudio() {
    // 오디오 요소 캐싱
    machineSound = document.getElementById('machineSound');
    ballDropSound = document.getElementById('ballDropSound');
    resultSound = document.getElementById('resultSound');
    startSound = document.getElementById('startSound');
    
    // 오디오 요소 존재 확인
    if (!machineSound || !ballDropSound || !resultSound || !startSound) {
        console.error('오디오 요소가 없습니다. 오디오 기능이 제한됩니다.');
        return;
    }
    
    // 오디오 이벤트 리스너 추가
    const sounds = [machineSound, ballDropSound, resultSound, startSound];
    
    sounds.forEach(sound => {
        // 로딩 중 이벤트
        sound.addEventListener('loadstart', () => {
            console.log(`${sound.id} 로딩 시작`);
        });
        
        // 로딩 완료 이벤트
        sound.addEventListener('canplaythrough', () => {
            console.log(`${sound.id} 로딩 완료, 재생 가능`);
            sound.dataset.loaded = 'true';
        });
        
        // 오류 이벤트
        sound.addEventListener('error', (e) => {
            console.error(`${sound.id} 로드 오류:`, e);
            sound.dataset.error = 'true';
        });
        
        // 볼륨 조정
        sound.volume = 0.3;
        
        // 강제 로드
        sound.load();
    });
    
    // 개별 볼륨 조절
    if (ballDropSound) ballDropSound.volume = 0.6;
    if (resultSound) resultSound.volume = 0.6;
}

// 오디오 사용 가능 여부 확인 함수 추가
function checkAudioAvailability() {
    return new Promise((resolve) => {
        // AudioContext 지원 확인
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) {
            console.warn('Web Audio API가 지원되지 않습니다. 대체 사운드를 사용합니다.');
            resolve(false);
            return;
        }
        
        // 오디오 컨텍스트 생성 테스트
        try {
            const testContext = new AudioContext();
            testContext.close().then(() => {
                console.log('오디오 시스템 사용 가능');
                resolve(true);
            }).catch(() => {
                console.warn('오디오 시스템 닫기 실패');
                resolve(false);
            });
        } catch (e) {
            console.warn('오디오 시스템 초기화 실패:', e);
            resolve(false);
        }
    });
}

// DOM 요소 참조 캐싱
function cacheElements() {
    machineElements = {
        lotteryMachine: document.getElementById('lotteryMachine'),
        resultContainer: document.getElementById('resultContainer'),
        startBtn: document.getElementById('startBtn'),
        resetBtn: document.getElementById('resetBtn'),
        soundControl: document.getElementById('soundControl'),
        soundIcon: document.getElementById('soundIcon')
    };
    
    // 오디오 요소 캐싱
    machineSound = document.getElementById('machineSound');
    ballDropSound = document.getElementById('ballDropSound');
    resultSound = document.getElementById('resultSound');
    startSound = document.getElementById('startSound');
    
    // 볼륨 조정
    machineSound.volume = 0.3;
    ballDropSound.volume = 0.5;
    resultSound.volume = 0.5;
    startSound.volume = 0.3;
}

// 이벤트 리스너 등록
function setupEventListeners() {
    const {startBtn, resetBtn, soundControl} = machineElements;
    
    if (startBtn) startBtn.addEventListener('click', drawLottery);
    if (resetBtn) resetBtn.addEventListener('click', initMachine);
    if (soundControl) soundControl.addEventListener('click', toggleSound);
}

// 이벤트 리스너 등록
document.addEventListener('DOMContentLoaded', async function() {
    // 오디오 시스템 확인
    const audioAvailable = await checkAudioAvailability();
    
    // DOM 요소 캐싱
    cacheElements();
    
    // 오디오 설정
    setupAudio();
    
    // 이벤트 리스너 설정
    setupEventListeners();
    
    // 초기화
    initMachine();
    
    // 오디오 시스템 상태 알림
    if (!audioAvailable) {
        console.log('오디오 시스템이 제한되어 있습니다. 내장 사운드 생성기를 사용합니다.');
    }
    
    // 사용자에게 상호작용 필요성 알림
    console.log('소리를 재생하려면 화면을 클릭하세요.');
    document.body.addEventListener('click', function bodyClick() {
        // 무음 오디오 재생으로 오디오 활성화
        const silentAudio = new Audio("data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA");
        silentAudio.play().then(() => {
            console.log('오디오 활성화 성공');
            document.body.removeEventListener('click', bodyClick);
        }).catch(err => {
            console.log('오디오 활성화 실패:', err);
        });
    });
});
