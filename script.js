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
     let speedMode = 1; // 1: 일반 속도, 4: 4X 속도, 8: 8X 속도
 
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
             soundIcon: document.getElementById('soundIcon'),
             speedToggleBtn: document.getElementById('speedToggleBtn') // 속도 토글 버튼 추가
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
 
         // 애니메이션 시작
         isAnimating = true;
         drawingInProgress = false;
         animateBalls();
 
         // 이벤트 리스너 재설정
         cacheElements();
         setupEventListeners();
     }
 
     // 기계 구성요소 생성 함수 수정
     function createMachineComponents(lotteryMachine) {
         // DocumentFragment 사용으로 렌더링 최적화
         const fragment = document.createDocumentFragment();
     
         // 추첨기 본체 생성
         const machineBody = document.createElement('div');
         machineBody.className = 'machine-body';
     
         // 팬 추가
         const fan = document.createElement('div');
         fan.className = 'fan';
         machineBody.appendChild(fan);
     
         // 볼 컨테이너를 machineBody 안에 생성
         const ballContainer = document.createElement('div');
         ballContainer.className = 'ball-container';
         ballContainer.id = 'ballContainer';
         
         // 공기 효과 추가
         const airEffect = document.createElement('div');
         airEffect.className = 'air-effect';
         airEffect.id = 'airEffect';
         ballContainer.appendChild(airEffect);
         
         // 볼 컨테이너를 machineBody 안에 추가
         machineBody.appendChild(ballContainer);
         
         // 모든 공 생성 및 ballContainer에 추가
         createBalls(ballContainer);
         
         // machineBody를 fragment에 추가
         fragment.appendChild(machineBody);
     
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
     
         // 받침대 추가
         const machineBase = document.createElement('div');
         machineBase.className = 'machine-base';
         fragment.appendChild(machineBase);
     
         // 한 번에 DOM에 추가
         lotteryMachine.appendChild(fragment);
     }
 
     // 로또 공 생성 함수 수정
     function createBalls(ballContainer) {
         const containerWidth = 400; // 기본 컨테이너 너비
         const containerHeight = 400; // 기본 컨테이너 높이
         const centerX = containerWidth / 2;
         const centerY = containerHeight / 2;

         const maxRadius = Math.min(containerWidth, containerHeight) / 2 * 0.85;

         for (let i = 1; i <= 45; i++) {
             const ballElement = document.createElement('div');
             ballElement.className = 'ball' + (Math.random() > 0.5 ? ' ball-rotate' : ' ball-reverse');
             ballElement.style.backgroundColor = getBallColor(i);
             ballElement.textContent = i;
             
             // 중심을 기준으로 초기 위치 설정
             const angle = Math.random() * Math.PI * 2; // 0~2PI 사이의 랜덤 각도
             // 작은 반경으로 시작하여 중앙에 더 집중되게 함
             const radius = Math.min(containerWidth, containerHeight) * 0.15 * Math.random();
             
             // 컨테이너의 중심점
             const centerX = containerWidth / 2;
             const centerY = containerHeight / 2;
             
             // 볼의 초기 위치 계산 (중심에서 시작)
             const ballSize = 40; // 볼 크기
             const initialX = centerX + Math.cos(angle) * radius - ballSize / 2;
             const initialY = centerY + Math.sin(angle) * radius - ballSize / 2;
             
             ballElement.style.left = initialX + 'px';
             ballElement.style.top = initialY + 'px';
             
             ballContainer.appendChild(ballElement);
             
             // 볼 객체 정보 저장 - 매우 작은 바운스 효과
             balls.push({
                 number: i,
                 element: ballElement,
                 angle: angle,
                 speed: 0.4 + Math.random() * 0.2, // 속도 범위 축소 (0.4~0.6)
                 bouncePhase: Math.random() * Math.PI * 2, // 랜덤한 위상차
                 bounceHeight: 1 + Math.random() * 2, // 최소한의 바운스 (1~3px)
                 bounceSpeed: 0.3 + Math.random() * 0.4 // 낮은 바운스 속도
             });
         }
     }
 
    // 볼 애니메이션 - 자연스러운 물리 기반 움직임 구현
    function animateBalls() {
        if (!isAnimating) return;
    
        const ballContainer = document.querySelector('.ball-container');
        if (!ballContainer) return;
        
        const containerWidth = ballContainer.offsetWidth;
        const containerHeight = ballContainer.offsetHeight;
        
        // 컨테이너의 중심점
        const centerX = containerWidth / 2;
        const centerY = containerHeight / 2;
        
        // 최대 반경 (원형 컨테이너 가정)
        const maxRadius = Math.min(containerWidth, containerHeight) / 2 * 0.85;
        
        balls.forEach(ball => {
            const element = ball.element;
            if (!element || !element.parentNode) return;
            
            // 초기화되지 않은 속도 속성 초기화
            if (ball.velocityX === undefined) {
                ball.velocityX = (Math.random() - 0.5) * 1.2;
                ball.velocityY = (Math.random() - 0.5) * 1.2;
                ball.posX = parseFloat(element.style.left) + element.offsetWidth / 2;
                ball.posY = parseFloat(element.style.top) + element.offsetHeight / 2;
            }
            
            // 추첨 중일 때 더 활발한 움직임
            const movementFactor = drawingInProgress ? 2.5 : 1;
            
            // 새 위치 계산
            ball.posX += ball.velocityX * speedMode * movementFactor;
            ball.posY += ball.velocityY * speedMode * movementFactor;
            
            // 원형 경계 충돌 감지
            const distFromCenter = Math.sqrt(
                Math.pow(ball.posX - centerX, 2) + 
                Math.pow(ball.posY - centerY, 2)
            );
            
            const ballRadius = element.offsetWidth / 2;
            
            if (distFromCenter + ballRadius > maxRadius) {
                // 충돌 지점 계산
                const angle = Math.atan2(ball.posY - centerY, ball.posX - centerX);
                
                // 충돌 처리 - 경계에서 약간 안쪽으로 이동
                ball.posX = centerX + (maxRadius - ballRadius) * Math.cos(angle);
                ball.posY = centerY + (maxRadius - ballRadius) * Math.sin(angle);
                
                // 속도 반사
                const normalX = (ball.posX - centerX) / distFromCenter;
                const normalY = (ball.posY - centerY) / distFromCenter;
                
                const dotProduct = ball.velocityX * normalX + ball.velocityY * normalY;
                
                ball.velocityX = ball.velocityX - 2 * dotProduct * normalX;
                ball.velocityY = ball.velocityY - 2 * dotProduct * normalY;
                
                // 속도 감소 (에너지 손실)
                ball.velocityX *= 0.8;
                ball.velocityY *= 0.8;
                
                // 랜덤 요소 추가로 자연스러운 움직임
                if (drawingInProgress) {
                    ball.velocityX += (Math.random() - 0.5) * 0.5;
                    ball.velocityY += (Math.random() - 0.5) * 0.5;
                }
            }
            
            // 볼끼리 충돌 감지 및 처리
            balls.forEach(otherBall => {
                if (ball === otherBall || !otherBall.posX || !otherBall.posY || ball.selected || otherBall.selected) return;
                
                const dx = ball.posX - otherBall.posX;
                const dy = ball.posY - otherBall.posY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const minDistance = element.offsetWidth;
                
                if (distance < minDistance) {
                    // 충돌 해결 - 볼 분리
                    const overlap = minDistance - distance;
                    const moveX = (dx / distance) * overlap * 0.5;
                    const moveY = (dy / distance) * overlap * 0.5;
                    
                    ball.posX += moveX;
                    ball.posY += moveY;
                    otherBall.posX -= moveX;
                    otherBall.posY -= moveY;
                    
                    // 속도 교환
                    const nx = dx / distance;
                    const ny = dy / distance;
                    const p = 2 * (ball.velocityX * nx + ball.velocityY * ny - otherBall.velocityX * nx - otherBall.velocityY * ny) / 2;
                    
                    ball.velocityX = ball.velocityX - p * nx;
                    ball.velocityY = ball.velocityY - p * ny;
                    otherBall.velocityX = otherBall.velocityX + p * nx;
                    otherBall.velocityY = otherBall.velocityY + p * ny;
                    
                    // 약간의 에너지 손실
                    ball.velocityX *= 0.95;
                    ball.velocityY *= 0.95;
                    otherBall.velocityX *= 0.95;
                    otherBall.velocityY *= 0.95;
                }
            });
            
            // 추첨 중에는 더 역동적으로
            if (drawingInProgress) {
                // 가끔 랜덤한 힘을 가함
                if (Math.random() < 0.05) {
                    ball.velocityX += (Math.random() - 0.5) * 1.0;
                    ball.velocityY += (Math.random() - 0.5) * 1.0;
                }
                
                // 중력 효과 (약한)
                ball.velocityY += 0.03;
                
                // 팬에 의한 바람 효과
                const fanForceX = (ball.posX - centerX) * 0.001;
                const fanForceY = (ball.posY - centerY) * 0.001;
                ball.velocityX -= fanForceX;
                ball.velocityY -= fanForceY;
            } else {
                // 추첨 중이 아닐 때는 점차 느려지게
                ball.velocityX *= 0.99;
                ball.velocityY *= 0.99;
                
                // 최소 속도 유지
                const speed = Math.sqrt(ball.velocityX * ball.velocityX + ball.velocityY * ball.velocityY);
                if (speed < 0.2) {
                    const angle = Math.random() * Math.PI * 2;
                    const boost = 0.2 + Math.random() * 0.1;
                    ball.velocityX = Math.cos(angle) * boost;
                    ball.velocityY = Math.sin(angle) * boost;
                }
            }
            
            // 최대 속도 제한
            const maxSpeed = drawingInProgress ? 2.5 : 1.2;
            const currentSpeed = Math.sqrt(ball.velocityX * ball.velocityX + ball.velocityY * ball.velocityY);
            if (currentSpeed > maxSpeed) {
                ball.velocityX = (ball.velocityX / currentSpeed) * maxSpeed;
                ball.velocityY = (ball.velocityY / currentSpeed) * maxSpeed;
            }
            
            // 위치 업데이트
            element.style.left = (ball.posX - element.offsetWidth / 2) + 'px';
            element.style.top = (ball.posY - element.offsetHeight / 2) + 'px';
        });
        
        animationFrameId = requestAnimationFrame(animateBalls);
    }
    
 
     // 로또 번호 뽑기 (6개)
     function generateLottoNumbers() {
         // 선택된 조합 유형 가져오기
         const selectedType = document.querySelector('input[name="numberCount"]:checked').value;
         
         // 단일 세트 생성 함수
         function generateSingleSet() {
             const numbers = [];
             while (numbers.length < 6) {
                 const randomNumber = Math.floor(Math.random() * 45) + 1;
                 if (!numbers.includes(randomNumber)) {
                     numbers.push(randomNumber);
                 }
             }
             return numbers.sort((a, b) => a - b);
         }
         
         // 조합 유형에 따라 결과 반환
         if (selectedType === "single") {
             return generateSingleSet();
         } else {
             // 5세트 생성
             const sets = [];
             for (let i = 0; i < 5; i++) {
                 sets.push(generateSingleSet());
             }
             return sets;
         }
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
            }, 100);
        }
    
        // 에어 효과 강화
        const airEffect = document.getElementById('airEffect');
        if (airEffect) {
            airEffect.classList.add('air-strong');
            airEffect.style.animationDuration = (0.3 / speedMode) + 's';
        }
    
        // 팬 속도 대폭 증가
        const fan = document.querySelector('.fan');
        if (fan) fan.style.animationDuration = (0.05 / speedMode) + 's';
    
        // 볼에 임의의 힘 가하기 - 활발하게 움직임
        balls.forEach(ball => {
            if (ball.selected) return;
            
            // 강력한 임의의 방향으로 힘 가하기
            const angle = Math.random() * Math.PI * 2;
            const force = 1.5 + Math.random() * 1.5;
            
            ball.velocityX += Math.cos(angle) * force;
            ball.velocityY += Math.sin(angle) * force;
            
            // 볼 회전 효과 추가
            const rotationClass = Math.random() > 0.5 ? 'ball-rotate' : 'ball-reverse';
            const speedClass = Math.random() > 0.3 ? ' ball-fast' : '';
            
            ball.element.className = 'ball ' + rotationClass + speedClass;
        });
    
        // 일정 시간 후 상태 복구 (속도모드에 따라 조정)
        const resetDelay = 3000 / speedMode;
        setTimeout(() => {
            // 애니메이션 관련 코드는 유지...
            if (machineBody) machineBody.classList.remove('shake-hard');
            if (airEffect) {
                airEffect.classList.remove('air-strong');
                airEffect.style.animationDuration = (1 / speedMode) + 's';
            }
            if (fan) fan.style.animationDuration = (0.5 / speedMode) + 's';
        }, resetDelay);
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
 
             // 속도 모드에 따른 시간 설정
             const moveTime = 0.5 / speedMode + 's';
             const exitDelay = 700 / speedMode;
             const fallDelay = 300 / speedMode;
             const fallTime = 1.2 / speedMode + 's';
             
             // 선택 상태로 표시
             selectedBall.selected = true;
             selectedBall.element.classList.add('selected-ball');
             selectedBall.element.classList.remove('ball-rotate', 'ball-fast', 'ball-reverse', 'ball-bounce');
 
             // 출구로 이동
             selectedBall.element.style.transition = `left ${moveTime}, top ${moveTime}, transform ${moveTime}`;
             selectedBall.element.style.left = '180px';
             selectedBall.element.style.top = '330px';
             selectedBall.element.style.transform = 'scale(1.5)';
 
             // 출구에 도달 후 처리
             setTimeout(() => {
                 // 원래 볼 제거
                 if (selectedBall.element && selectedBall.element.parentNode) {
                     selectedBall.element.style.opacity = '0';
                     setTimeout(() => {
                         if (selectedBall.element.parentNode) {
                             selectedBall.element.parentNode.removeChild(selectedBall.element);
                         }
                     }, fallDelay);
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
                         ballClone.style.animation = `fallDown ${fallTime} forwards`;
 
                         // 볼이 튜브를 완전히 통과한 후 결과 표시
                         const totalFallTime = parseFloat(fallTime) * 1000;
                         setTimeout(resolve, totalFallTime);
                     } else {
                         resolve();
                     }
                 }, fallDelay);
             }, exitDelay);
         });
     }
 
     // 결과 표시 (사운드 추가)
     function showResult(number, container) {
         if (!container) return;
 
         // 새 결과 공 생성
         const resultBall = document.createElement('div');
         resultBall.className = 'result-ball';
         resultBall.textContent = number;
         resultBall.style.backgroundColor = getBallColor(number);
         container.appendChild(resultBall);
 
         // 나타나는 애니메이션
         setTimeout(() => {
             resultBall.style.transform = 'scale(1)';
         }, 50);
     }
 
     // 로또 추첨 실행 (사운드 추가)
     async function drawLottery() {
         if (drawingInProgress) return;
 
         const {startBtn} = machineElements;
 
         drawingInProgress = true;
         startBtn.disabled = true;
 
         // 기존 결과 초기화
         machineElements.resultContainer.innerHTML = '';
 
         // 선택된 조합 유형 가져오기
         const selectedType = document.querySelector('input[name="numberCount"]:checked').value;
         const lottoNumbers = generateLottoNumbers();
 
         // 강화된 애니메이션 시작
         enhancedAnimation();
 
         // 속도모드에 따른 지연 시간 조정
         const animationDelay = 3000 / speedMode;
         await new Promise(resolve => setTimeout(resolve, animationDelay));
 
         if (selectedType === "single") {
             // 단일 세트 처리
             const setContainer = document.createElement('div');
             setContainer.className = 'result-set';
             machineElements.resultContainer.appendChild(setContainer);
             
             // 각 번호 순차적으로 추첨
             for (let i = 0; i < lottoNumbers.length; i++) {
                 const number = lottoNumbers[i];
 
                 // 첫 공 이후에는 속도모드에 따른 간격
                 if (i > 0) {
                     const ballDelay = 500 / speedMode;
                     await new Promise(resolve => setTimeout(resolve, ballDelay));
                 }
 
                 // 공 선택하고 빠져나가는 애니메이션
                 await selectBall(number);
                 showResult(number, setContainer);
 
                 // 마지막 번호일 경우 추첨 완료 사운드 재생
                 if (i === lottoNumbers.length - 1) {
                     machineSound.pause(); // 추첨기 소리 중지
                     playSound(resultSound); // 당첨 소리 재생
                 }
             }
         } else {
             // 5세트 처리
             for (let setIndex = 0; setIndex < lottoNumbers.length; setIndex++) {
                 const set = lottoNumbers[setIndex];
                 
                 // 세트 컨테이너 생성
                 const setContainer = document.createElement('div');
                 setContainer.className = 'result-set';
                 
                 // 세트 번호 표시
                 const setNumber = document.createElement('div');
                 setNumber.className = 'set-number';
                 setNumber.textContent = setIndex + 1;
                 setContainer.appendChild(setNumber);
                 
                 machineElements.resultContainer.appendChild(setContainer);
                 
                 // 각 번호 순차적으로 추첨
                 for (let i = 0; i < set.length; i++) {
                     const number = set[i];
 
                     // 첫 공 이후에는 속도모드에 따른 간격
                     if (i > 0) {
                         const ballDelay = 300 / speedMode;
                         await new Promise(resolve => setTimeout(resolve, ballDelay));
                     }
 
                     // 공 선택하고 빠져나가는 애니메이션
                     await selectBall(number);
                     showResult(number, setContainer);
 
                     // 마지막 세트의 마지막 번호일 경우 추첨 완료 사운드 재생
                     if (setIndex === lottoNumbers.length - 1 && i === set.length - 1) {
                         machineSound.pause(); // 추첨기 소리 중지
                         playSound(resultSound); // 당첨 소리 재생
                     }
                 }
                 
                 // 세트 사이에 약간의 딜레이 (속도모드에 따라 조정)
                 if (setIndex < lottoNumbers.length - 1) {
                     const setDelay = 1000 / speedMode;
                     await new Promise(resolve => setTimeout(resolve, setDelay));
                     
                     // 추첨기 초기화
                     balls.forEach(ball => {
                         if (ball.selected) {
                             ball.selected = false;
                         }
                     });
                 }
             }
         }
 
         // 추첨 완료 후 버튼 활성화
         startBtn.disabled = false;
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
 
     // 속도 토글 함수 추가
     function toggleSpeed() {
         // 속도 모드 순환: 1 -> 4 -> 8 -> 1
         if (speedMode === 1) {
             speedMode = 4;
         } else if (speedMode === 4) {
             speedMode = 8;
         } else {
             speedMode = 1;
         }
         
         const {speedToggleBtn} = machineElements;
         if (speedToggleBtn) {
             if (speedMode === 1) {
                 speedToggleBtn.textContent = "일반 속도";
                 speedToggleBtn.classList.remove('active', 'ultra');
             } else if (speedMode === 4) {
                 speedToggleBtn.textContent = "4X 속도";
                 speedToggleBtn.classList.add('active');
                 speedToggleBtn.classList.remove('ultra');
             } else {
                 speedToggleBtn.textContent = "8X 속도";
                 speedToggleBtn.classList.add('active', 'ultra');
             }
         }
     }
 
     // 새 함수: 초기화 후 추첨 시작을 순차적으로 수행
     async function startDrawing() {
         if (drawingInProgress) return;
         
         // 먼저 초기화 수행
         initMachine();
         
         // 초기화 후 잠시 대기 (애니메이션이 원활하게 시작하도록)
         await new Promise(resolve => setTimeout(resolve, 300));
         
         // 추첨 시작
         drawLottery();
     }
 
     // 이벤트 리스너 등록
     function setupEventListeners() {
         const {startBtn, soundControl, speedToggleBtn} = machineElements;
 
         // 시작 버튼이 초기화+추첨을 모두 실행하도록 변경
         if (startBtn) startBtn.addEventListener('click', startDrawing);
         
         // 다시하기 버튼은 더 이상 사용하지 않음
         // resetBtn 관련 코드 제거
         
         if (soundControl) soundControl.addEventListener('click', toggleSound);
         
         // 속도 토글 버튼 이벤트 리스너 추가
         if (speedToggleBtn) {
             speedToggleBtn.addEventListener('click', toggleSpeed);
         }
         
         // 조합 유형 변경 이벤트
         const radios = document.querySelectorAll('input[name="numberCount"]');
         radios.forEach(radio => {
             radio.addEventListener('change', () => {
                 if (!drawingInProgress) {
                     initMachine();
                 }
             });
         });
     }
 
     // finishDrawing 함수가 있다면 여기서도 resetBtn 관련 코드 제거
     function finishDrawing() {
         // 애니메이션 초기화
         const machineBody = document.querySelector('.machine-body');
         if (machineBody) machineBody.classList.remove('shake-hard');
         
         const airEffect = document.getElementById('airEffect');
         if (airEffect) airEffect.classList.remove('air-strong');
         
         const fan = document.querySelector('.fan');
         if (fan) fan.style.animationDuration = '0.5s';
         
         // 사운드 중지
         if (soundEnabled) {
             machineSound.pause();
             machineSound.currentTime = 0;
         }
         
         // 결과음 재생
         playSound(resultSound);
         
         // 상태 초기화
         drawingInProgress = false;
         document.getElementById('startBtn').disabled = false;
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
