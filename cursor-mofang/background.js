class RubiksCube {
    constructor() {
        // 初始化属性
        this.cubeSize = 0.8;
        this.gap = 0.05;
        this.isAnimating = false;
        this.currentStep = 0;

        // 添加播放控制相关属性
        this.isPaused = false;
        this.animationSpeed = 1;
        this.stepDuration = 1.5;
        this.pauseBetweenSteps = 0.5;
        this.solutionSteps = [];

        // 初始化场景
        this.initMainScene();
        this.initSolutionScene();
        
        // 创建魔方
        this.createMainCube();
        this.createDemonstrationCube();
        
        // 添加丰富的背景装饰
        this.initBackgroundDecorations();
        
        // 设置控制器
        this.setupControls();
        
        // 开始动画循环
        this.animate();
    }

    initMainScene() {
        // 主场景初始化
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true, 
            alpha: true,
            logarithmicDepthBuffer: true 
        });
        
        // 设置渲染器
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor(0x000000, 0);
        document.getElementById('bg-animation').appendChild(this.renderer.domElement);

        // 修改相机位置，使背景更容易看到
        this.camera.position.set(0, 0, 50);
        this.camera.lookAt(0, 0, 0);

        // 增强光照效果
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
        directionalLight.position.set(10, 10, 10);
        this.scene.add(directionalLight);

        // 添加更多点光源以增强视觉效果
        const pointLight1 = new THREE.PointLight(0x00ff00, 1, 50);
        pointLight1.position.set(15, 15, 15);
        this.scene.add(pointLight1);

        const pointLight2 = new THREE.PointLight(0x0000ff, 1, 50);
        pointLight2.position.set(-15, -15, 15);
        this.scene.add(pointLight2);

        const pointLight3 = new THREE.PointLight(0xff0000, 1, 50);
        pointLight3.position.set(0, 15, -15);
        this.scene.add(pointLight3);
    }

    initBackgroundDecorations() {
        this.decorations = [];
        
        // 添加星空背景
        this.addStarfield();
        
        // 添加漂浮的小魔方
        this.addFloatingCubes();
        
        // 添加光线效果
        this.addLightBeams();
        
        // 添加粒子系统
        this.addParticleSystem();
    }

    addStarfield() {
        const starsGeometry = new THREE.BufferGeometry();
        const starsMaterial = new THREE.PointsMaterial({
            color: 0xFFFFFF,
            size: 0.1,
            transparent: true,
            opacity: 0.8
        });

        const starsVertices = [];
        for (let i = 0; i < 2000; i++) {
            const x = (Math.random() - 0.5) * 120;
            const y = (Math.random() - 0.5) * 100;
            const z = (Math.random() - 0.5) * 100;
            starsVertices.push(x, y, z);
        }

        starsGeometry.setAttribute('position', 
            new THREE.Float32BufferAttribute(starsVertices, 3));
        
        const starField = new THREE.Points(starsGeometry, starsMaterial);
        this.scene.add(starField);
        this.decorations.push(starField);
    }

    addFloatingCubes() {
        // 增加魔方数量到 40 个
        for (let i = 0; i < 40; i++) {
            // 调整大小范围，使魔方大小更加多样
            const size = Math.random() * 1.0 + 0.6; // 0.6 到 1.6 的尺寸
            const cubeGroup = new THREE.Group();
            const subCubeSize = size / 3;
            const gap = size * 0.03;

            // 增强颜色的饱和度和亮度
            const colors = {
                front: new THREE.Color(0xff4444),
                back: new THREE.Color(0xff8800),
                top: new THREE.Color(0xffffff),
                bottom: new THREE.Color(0xffdd00),
                right: new THREE.Color(0x0088ff),
                left: new THREE.Color(0x00dd00)
            };

            // 创建3x3x3的魔方结构
            for (let x = -1; x <= 1; x++) {
                for (let y = -1; y <= 1; y++) {
                    for (let z = -1; z <= 1; z++) {
                        const geometry = new THREE.BoxGeometry(subCubeSize, subCubeSize, subCubeSize);
                        
                        // 修改材质设置
                        const materials = [
                            new THREE.MeshPhongMaterial({ 
                                color: x === 1 ? colors.right : 0x282828,
                                shininess: 70,
                                specular: 0x888888,
                                transparent: true,
                                opacity: 0.95
                            }),
                            new THREE.MeshPhongMaterial({ 
                                color: x === -1 ? colors.left : 0x282828,
                                shininess: 70,
                                specular: 0x888888,
                                transparent: true,
                                opacity: 0.95
                            }),
                            new THREE.MeshPhongMaterial({ 
                                color: y === 1 ? colors.top : 0x282828,
                                shininess: 70,
                                specular: 0x888888,
                                transparent: true,
                                opacity: 0.95
                            }),
                            new THREE.MeshPhongMaterial({ 
                                color: y === -1 ? colors.bottom : 0x282828,
                                shininess: 70,
                                specular: 0x888888,
                                transparent: true,
                                opacity: 0.95
                            }),
                            new THREE.MeshPhongMaterial({ 
                                color: z === 1 ? colors.front : 0x282828,
                                shininess: 70,
                                specular: 0x888888,
                                transparent: true,
                                opacity: 0.95
                            }),
                            new THREE.MeshPhongMaterial({ 
                                color: z === -1 ? colors.back : 0x282828,
                                shininess: 70,
                                specular: 0x888888,
                                transparent: true,
                                opacity: 0.95
                            })
                        ];

                        const subCube = new THREE.Mesh(geometry, materials);
                        subCube.position.set(
                            x * (subCubeSize + gap),
                            y * (subCubeSize + gap),
                            z * (subCubeSize + gap)
                        );

                        // 增强边框效果
                        const edgesGeometry = new THREE.EdgesGeometry(geometry);
                        const edgesMaterial = new THREE.LineBasicMaterial({ 
                            color: 0x000000, 
                            transparent: true, 
                            opacity: 0.7,
                            linewidth: 2
                        });
                        const edges = new THREE.LineSegments(edgesGeometry, edgesMaterial);
                        subCube.add(edges);

                        cubeGroup.add(subCube);
                    }
                }
            }

            // 使用球面坐标系进行更均匀的分布
            const phi = Math.acos(-1 + (2 * i) / 40);
            const theta = Math.sqrt(40 * Math.PI) * phi;
            
            // 计算半径，使魔方分布在不同的距离
            const radius = Math.random() * 30 + 25; // 25-55 的半径范围
            
            // 转换为笛卡尔坐标
            cubeGroup.position.set(
                radius * Math.sin(phi) * Math.cos(theta),
                (Math.random() - 0.5) * 40, // 保持垂直方向的随机性
                radius * Math.sin(phi) * Math.sin(theta)
            );

            // 随机旋转，但保持一定的规律性
            cubeGroup.rotation.set(
                Math.random() * Math.PI,
                Math.random() * Math.PI,
                Math.random() * Math.PI
            );

            // 调整动画速度，使其更加自然
            const speedFactor = 1 / (size * 2); // 大小影响速度
            const baseSpeed = 0.005; // 基础速度
            cubeGroup.userData = {
                rotationSpeed: {
                    x: (Math.random() - 0.5) * baseSpeed * speedFactor,
                    y: (Math.random() - 0.5) * baseSpeed * speedFactor,
                    z: (Math.random() - 0.5) * baseSpeed * speedFactor
                },
                floatSpeed: {
                    x: (Math.random() - 0.5) * 0.002,
                    y: (Math.random() - 0.5) * 0.002,
                    z: (Math.random() - 0.5) * 0.002
                },
                initialPosition: cubeGroup.position.clone(),
                size: size,
                phaseOffset: Math.random() * Math.PI * 2 // 添加相位偏移使动画不同步
            };

            this.scene.add(cubeGroup);
            this.decorations.push(cubeGroup);
        }
    }

    addLightBeams() {
        for (let i = 0; i < 10; i++) {
            const geometry = new THREE.CylinderGeometry(0.1, 0.1, 40, 32);
            const material = new THREE.MeshBasicMaterial({
                color: new THREE.Color().setHSL(Math.random(), 1, 0.5),
                transparent: true,
                opacity: 0.2
            });

            const beam = new THREE.Mesh(geometry, material);
            beam.position.set(
                (Math.random() - 0.5) * 60,
                0,
                (Math.random() - 0.5) * 40 - 15
            );
            beam.rotation.set(
                Math.random() * Math.PI * 0.2,
                Math.random() * Math.PI * 2,
                Math.random() * Math.PI * 0.2
            );

            this.scene.add(beam);
            this.decorations.push(beam);
        }
    }

    addParticleSystem() {
        const particlesGeometry = new THREE.BufferGeometry();
        const particlesCnt = 1000;
        const posArray = new Float32Array(particlesCnt * 3);
        
        for(let i = 0; i < particlesCnt * 3; i += 3) {
            // 确保粒子在整个场景中均匀分布
            posArray[i] = (Math.random() - 0.5) * 60;     // x
            posArray[i + 1] = (Math.random() - 0.5) * 40; // y
            posArray[i + 2] = (Math.random() - 0.5) * 40; // z
        }
        
        particlesGeometry.setAttribute('position', 
            new THREE.BufferAttribute(posArray, 3));

        const particlesMaterial = new THREE.PointsMaterial({
            size: 0.05,
            map: this.createParticleTexture(),
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
        this.scene.add(particlesMesh);
        this.decorations.push(particlesMesh);
    }

    createParticleTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 32;
        canvas.height = 32;
        const ctx = canvas.getContext('2d');
        
        const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
        gradient.addColorStop(0, 'rgba(255,255,255,1)');
        gradient.addColorStop(1, 'rgba(255,255,255,0)');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 32, 32);
        
        const texture = new THREE.Texture(canvas);
        texture.needsUpdate = true;
        return texture;
    }

    updateDecorations() {
        const time = Date.now() * 0.001;

        this.decorations.forEach(decoration => {
            if (decoration.userData && decoration.userData.rotationSpeed) {
                // 更平滑的旋转动画
                decoration.rotation.x += decoration.userData.rotationSpeed.x;
                decoration.rotation.y += decoration.userData.rotationSpeed.y;
                decoration.rotation.z += decoration.userData.rotationSpeed.z;

                // 使用相位偏移创造更自然的浮动效果
                const phaseOffset = decoration.userData.phaseOffset || 0;
                const floatAmplitude = 1.2 / decoration.userData.size; // 调整浮动幅度
                const initialPos = decoration.userData.initialPosition;
                
                // 三维浮动动画
                decoration.position.x = initialPos.x + Math.sin(time * 0.3 + phaseOffset) * floatAmplitude;
                decoration.position.y = initialPos.y + Math.cos(time * 0.4 + phaseOffset) * floatAmplitude;
                decoration.position.z = initialPos.z + Math.sin(time * 0.5 + phaseOffset) * floatAmplitude;
            }
        });

        // 更新光束效果
        this.decorations.forEach(decoration => {
            if (decoration.geometry instanceof THREE.CylinderGeometry) {
                decoration.rotation.y += 0.005;
                decoration.material.opacity = 0.2 + Math.sin(time) * 0.1;
            }
        });

        // 更新粒子系统
        this.decorations.forEach(decoration => {
            if (decoration instanceof THREE.Points) {
                const positions = decoration.geometry.attributes.position.array;
                for (let i = 0; i < positions.length; i += 3) {
                    positions[i + 1] += Math.sin(time + positions[i]) * 0.01;
                }
                decoration.geometry.attributes.position.needsUpdate = true;
            }
        });
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        // 确保场景和相机存在
        if (this.scene && this.camera) {
            // 更新装饰元素
            this.updateDecorations();

            // 渲染主场景
            this.renderer.render(this.scene, this.camera);
        }

        // 确保解决方案场景和相机存在
        if (this.solutionScene && this.solutionCamera && this.solutionRenderer && this.demonstrationCube) {
            // 更新轨道控制器
            if (this.controls) {
                this.controls.update();
            }
            
            // 渲染解决方案场景
            this.solutionRenderer.render(this.solutionScene, this.solutionCamera);
        }
    }

    initSolutionScene() {
        this.solutionScene = new THREE.Scene();
        this.solutionCamera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
        this.solutionRenderer = new THREE.WebGLRenderer({ 
            antialias: true,
            alpha: true,
            canvas: document.getElementById('solution-animation')
        });

        // 设置解决方案场景
        const container = document.querySelector('.animation-container');
        this.solutionRenderer.setSize(container.clientWidth, container.clientHeight);
        this.solutionRenderer.setClearColor(0xf5f5f5, 1);
        
        // 修改相机位置为正面视角
        this.solutionCamera.position.set(0, 0, 6);
        this.solutionCamera.lookAt(0, 0, 0);

        // 增强光照效果
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
        this.solutionScene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
        directionalLight.position.set(10, 10, 10);
        this.solutionScene.add(directionalLight);
    }

    createMainCube() {
        this.cubeGroup = new THREE.Group();
        this.cubePieces = [];

        // 魔方的标准颜色
        const colors = {
            front: 0xff6b6b,    // 柔和的红色
            back: 0xffa94d,     // 柔和的橙色
            top: 0xf8f9fa,      // 柔和的白色
            bottom: 0xffd43b,   // 柔和的黄色
            right: 0x4dabf7,    // 柔和的蓝色
            left: 0x69db7c      // 柔和的绿色
        };

        // 创建3x3x3的魔方
        for (let x = -1; x <= 1; x++) {
            for (let y = -1; y <= 1; y++) {
                for (let z = -1; z <= 1; z++) {
                    const geometry = new THREE.BoxGeometry(this.cubeSize, this.cubeSize, this.cubeSize);
                    const materials = this.createCubeMaterials(colors, x, y, z);

                    const cube = new THREE.Mesh(geometry, materials);
                    cube.position.set(
                        x * (this.cubeSize + this.gap),
                        y * (this.cubeSize + this.gap),
                        z * (this.cubeSize + this.gap)
                    );

                    this.cubePieces.push({
                        mesh: cube,
                        position: { x, y, z }
                    });
                    this.cubeGroup.add(cube);
                }
            }
        }

        this.cubeGroup.rotation.x = Math.PI / 6;
        this.cubeGroup.rotation.y = -Math.PI / 4;

        this.scene.add(this.cubeGroup);
    }

    createCubeMaterials(colors, x, y, z) {
        return [
            new THREE.MeshPhongMaterial({ 
                color: x === 1 ? colors.right : 0x282828,
                shininess: 50,
                specular: 0x666666,
                emissive: x === 1 ? colors.right : 0x000000,
                emissiveIntensity: 0.1
            }),
            new THREE.MeshPhongMaterial({ 
                color: x === -1 ? colors.left : 0x282828,
                shininess: 50,
                specular: 0x666666,
                emissive: x === -1 ? colors.left : 0x000000,
                emissiveIntensity: 0.1
            }),
            new THREE.MeshPhongMaterial({ 
                color: y === 1 ? colors.top : 0x282828,
                shininess: 50,
                specular: 0x666666,
                emissive: y === 1 ? colors.top : 0x000000,
                emissiveIntensity: 0.1
            }),
            new THREE.MeshPhongMaterial({ 
                color: y === -1 ? colors.bottom : 0x282828,
                shininess: 50,
                specular: 0x666666,
                emissive: y === -1 ? colors.bottom : 0x000000,
                emissiveIntensity: 0.1
            }),
            new THREE.MeshPhongMaterial({ 
                color: z === 1 ? colors.front : 0x282828,
                shininess: 50,
                specular: 0x666666,
                emissive: z === 1 ? colors.front : 0x000000,
                emissiveIntensity: 0.1
            }),
            new THREE.MeshPhongMaterial({ 
                color: z === -1 ? colors.back : 0x282828,
                shininess: 50,
                specular: 0x666666,
                emissive: z === -1 ? colors.back : 0x000000,
                emissiveIntensity: 0.1
            })
        ];
    }

    createDemonstrationCube() {
        this.demonstrationCube = this.cubeGroup.clone(true);
        
        // 修改：设置演示魔方为正面视角，不再使用斜视角
        this.demonstrationCube.rotation.set(0, 0, 0);  // 重置为正面视角
        
        this.solutionScene.add(this.demonstrationCube);
    }

    setupControls() {
        // 添加窗口大小变化监听
        window.addEventListener('resize', () => {
            // 更新主场景
            const width = window.innerWidth;
            const height = window.innerHeight;
            this.camera.aspect = width / height;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(width, height);

            // 更新解决方案场景
            if (this.solutionRenderer) {
                const container = document.querySelector('.animation-container');
                this.solutionRenderer.setSize(container.clientWidth, container.clientHeight);
            }
        });

        // 添加播放控制
        const playPauseBtn = document.getElementById('play-pause');
        const restartBtn = document.getElementById('restart');
        const speedSlider = document.getElementById('speed-slider');
        const speedValue = document.getElementById('speed-value');

        if (playPauseBtn) {
            playPauseBtn.addEventListener('click', () => {
                this.isPaused = !this.isPaused;
                const playIcon = playPauseBtn.querySelector('.play-icon');
                const pauseIcon = playPauseBtn.querySelector('.pause-icon');
                if (playIcon) playIcon.style.display = this.isPaused ? 'block' : 'none';
                if (pauseIcon) pauseIcon.style.display = this.isPaused ? 'none' : 'block';
                
                if (!this.isPaused && this.currentStep < this.solutionSteps.length) {
                    this.animateNextStep();
                }
            });
        }

        if (restartBtn) {
            restartBtn.addEventListener('click', () => {
                this.currentStep = 0;
                this.isPaused = false;
                this.demonstrationCube.rotation.set(0, 0, 0);
                this.updateDemonstrationCube();
                this.startSolving();
            });
        }

        if (speedSlider && speedValue) {
            speedSlider.addEventListener('input', (e) => {
                this.animationSpeed = parseFloat(e.target.value);
                speedValue.textContent = `${this.animationSpeed}x`;
            });
        }

        // 修改相机控制按钮事件
        const cameraLeft = document.getElementById('camera-left');
        const cameraRight = document.getElementById('camera-right');
        const cameraUp = document.getElementById('camera-up');
        const cameraDown = document.getElementById('camera-down');
        const cameraReset = document.getElementById('camera-reset');

        // 添加相机位置限制
        const MIN_DISTANCE = 4;
        const MAX_DISTANCE = 8;
        const ROTATION_ANGLE = Math.PI / 12; // 15度

        // 辅助函数：确保相机距离在合理范围内
        const ensureCameraDistance = () => {
            const distance = this.solutionCamera.position.length();
            if (distance < MIN_DISTANCE || distance > MAX_DISTANCE) {
                const targetDistance = Math.min(Math.max(distance, MIN_DISTANCE), MAX_DISTANCE);
                const scale = targetDistance / distance;
                this.solutionCamera.position.multiplyScalar(scale);
            }
        };

        if (cameraLeft) {
            cameraLeft.addEventListener('click', () => {
                const currentPos = this.solutionCamera.position.clone();
                const rotationMatrix = new THREE.Matrix4();
                rotationMatrix.makeRotationY(ROTATION_ANGLE);
                currentPos.applyMatrix4(rotationMatrix);
                
                gsap.to(this.solutionCamera.position, {
                    x: currentPos.x,
                    z: currentPos.z,
                    duration: 0.5,
                    onUpdate: () => {
                        this.solutionCamera.lookAt(0, 0, 0);
                        ensureCameraDistance();
                    }
                });
            });
        }

        if (cameraRight) {
            cameraRight.addEventListener('click', () => {
                const currentPos = this.solutionCamera.position.clone();
                const rotationMatrix = new THREE.Matrix4();
                rotationMatrix.makeRotationY(-ROTATION_ANGLE);
                currentPos.applyMatrix4(rotationMatrix);
                
                gsap.to(this.solutionCamera.position, {
                    x: currentPos.x,
                    z: currentPos.z,
                    duration: 0.5,
                    onUpdate: () => {
                        this.solutionCamera.lookAt(0, 0, 0);
                        ensureCameraDistance();
                    }
                });
            });
        }

        if (cameraUp) {
            cameraUp.addEventListener('click', () => {
                const currentPos = this.solutionCamera.position.clone();
                const rotationMatrix = new THREE.Matrix4();
                rotationMatrix.makeRotationX(-ROTATION_ANGLE);
                currentPos.applyMatrix4(rotationMatrix);
                
                gsap.to(this.solutionCamera.position, {
                    x: currentPos.x,
                    y: currentPos.y,
                    z: currentPos.z,
                    duration: 0.5,
                    onUpdate: () => {
                        this.solutionCamera.lookAt(0, 0, 0);
                        ensureCameraDistance();
                    }
                });
            });
        }

        if (cameraDown) {
            cameraDown.addEventListener('click', () => {
                const currentPos = this.solutionCamera.position.clone();
                const rotationMatrix = new THREE.Matrix4();
                rotationMatrix.makeRotationX(ROTATION_ANGLE);
                currentPos.applyMatrix4(rotationMatrix);
                
                gsap.to(this.solutionCamera.position, {
                    x: currentPos.x,
                    y: currentPos.y,
                    z: currentPos.z,
                    duration: 0.5,
                    onUpdate: () => {
                        this.solutionCamera.lookAt(0, 0, 0);
                        ensureCameraDistance();
                    }
                });
            });
        }

        if (cameraReset) {
            cameraReset.addEventListener('click', () => {
                gsap.to(this.solutionCamera.position, {
                    x: 0,
                    y: 0,
                    z: 6,
                    duration: 0.5,
                    onUpdate: () => {
                        this.solutionCamera.lookAt(0, 0, 0);
                    }
                });
            });
        }
    }

    // 添加还原开始方法
    startSolving() {
        this.isAnimating = true;
        this.isPaused = false;
        this.currentStep = 0;
        this.solutionSteps = this.generateSolutionSteps();
        
        // 修改：重置演示魔方为正面视角
        this.demonstrationCube.rotation.set(0, 0, 0);
        this.updateDemonstrationCube();
        
        // 重置相机位置为正面视角
        gsap.to(this.solutionCamera.position, {
            x: 0,
            y: 0,
            z: 6,  // 调整距离以确保魔方完全可见
            duration: 0.5,
            onUpdate: () => this.solutionCamera.lookAt(0, 0, 0)
        });
        
        this.createStepIndicators();
        this.animateNextStep();
    }

    // 生成还原步骤
    generateSolutionSteps() {
        return [
            { face: 'front', angle: Math.PI/2, type: 'whiteCross', description: '将白色十字对齐' },
            { face: 'right', angle: Math.PI/2, type: 'whiteCross', description: '调整白色边块' },
            { face: 'top', angle: -Math.PI/2, type: 'whiteCross', description: '完成白色十字' },
            { face: 'right', angle: Math.PI/2, type: 'firstLayer', description: '放置第一层角块' },
            { face: 'top', angle: Math.PI/2, type: 'firstLayer', description: '调整角块位置' },
            { face: 'right', angle: -Math.PI/2, type: 'firstLayer', description: '完成第一层' },
            { face: 'front', angle: Math.PI/2, type: 'secondLayer', description: '开始第二层' },
            { face: 'right', angle: Math.PI/2, type: 'secondLayer', description: '调整中层边块' },
            { face: 'top', angle: -Math.PI/2, type: 'secondLayer', description: '完成第二层' }
        ];
    }

    // 执行下一步动画
    animateNextStep() {
        if (this.isPaused || this.currentStep >= this.solutionSteps.length) {
            if (this.currentStep >= this.solutionSteps.length) {
                this.isAnimating = false;
                this.updateUIOnComplete();
            }
            return;
        }

        const step = this.solutionSteps[this.currentStep];
        this.updateStepIndicators(this.currentStep);
        this.updateStepDescription(step);
        
        this.animateDemonstrationStep(step, () => {
            this.currentStep++;
            setTimeout(() => {
                this.animateNextStep();
            }, this.pauseBetweenSteps * 1000 / this.animationSpeed);
        });
    }

    // 更新步骤指示器
    createStepIndicators() {
        const stepsDiv = document.getElementById('steps');
        stepsDiv.innerHTML = '';
        
        this.solutionSteps.forEach((step, index) => {
            const indicator = document.createElement('div');
            indicator.className = 'step-indicator';
            indicator.textContent = `步骤 ${index + 1}`;
            stepsDiv.appendChild(indicator);
        });
    }

    // 更新当前步骤显示
    updateStepIndicators(currentStep) {
        const indicators = document.querySelectorAll('.step-indicator');
        indicators.forEach((indicator, index) => {
            indicator.classList.toggle('active', index === currentStep);
        });
    }

    // 更新步骤描述
    updateStepDescription(step) {
        const descriptionElement = document.getElementById('current-step-description');
        if (descriptionElement) {
            descriptionElement.textContent = step.description;
        }
    }

    // 更新UI显示完成状态
    updateUIOnComplete() {
        const descriptionElement = document.getElementById('current-step-description');
        if (descriptionElement) {
            descriptionElement.textContent = "还原完成！";
        }
        
        const playPauseBtn = document.getElementById('play-pause');
        if (playPauseBtn) {
            const playIcon = playPauseBtn.querySelector('.play-icon');
            const pauseIcon = playPauseBtn.querySelector('.pause-icon');
            if (playIcon) playIcon.style.display = 'block';
            if (pauseIcon) pauseIcon.style.display = 'none';
        }
    }

    // 添加魔方旋转动画方法
    animateDemonstrationStep(step, callback) {
        const duration = this.stepDuration / this.animationSpeed;
        const pieces = this.getAffectedPieces(step.face);
        const axis = this.getRotationAxis(step.face);
        const rotationGroup = new THREE.Group();

        // 根据当前步骤调整相机位置
        this.adjustCameraForStep(step, duration);

        // 计算旋转中心
        const center = new THREE.Vector3();
        pieces.forEach(piece => {
            center.add(piece.mesh.position);
        });
        center.divideScalar(pieces.length);

        // 创建临时组以进行旋转，并设置正确的旋转中心
        pieces.forEach(piece => {
            const worldPosition = piece.mesh.position.clone();
            piece.originalParent = piece.mesh.parent;
            piece.originalPosition = worldPosition.clone();
            
            // 将块的位置调整为相对于旋转中心的位置
            piece.mesh.position.sub(center);
            rotationGroup.attach(piece.mesh);
        });

        // 设置旋转组的位置为计算出的中心点
        rotationGroup.position.copy(center);
        this.solutionScene.add(rotationGroup);

        // 使用GSAP进行平滑动画
        gsap.to(rotationGroup.rotation, {
            [this.getRotationProperty(axis)]: step.angle,
            duration: duration,
            ease: "power1.inOut",
            onComplete: () => {
                // 动画完成后，将块重新附加到原始父级
                pieces.forEach(piece => {
                    // 计算最终世界坐标
                    const worldMatrix = new THREE.Matrix4();
                    worldMatrix.multiplyMatrices(rotationGroup.matrixWorld, piece.mesh.matrix);
                    
                    // 将块重新附加到原始父级
                    piece.originalParent.attach(piece.mesh);
                    
                    // 应用计算出的世界坐标
                    piece.mesh.position.setFromMatrixPosition(worldMatrix);
                    piece.mesh.rotation.setFromRotationMatrix(worldMatrix);
                });

                // 更新魔方状态
                this.updateCubeState(step.face, step.angle);
                
                // 移除临时旋转组
                this.solutionScene.remove(rotationGroup);
                
                if (callback) callback();
            }
        });
    }

    // 获取需要旋转的魔方块
    getAffectedPieces(face) {
        const pieces = [];
        const threshold = 0.01; // 减小阈值，提高精度

        this.cubePieces.forEach(piece => {
            const pos = piece.mesh.position;
            switch(face) {
                case 'front':
                    if (Math.abs(pos.z - (this.cubeSize + this.gap)) < threshold) pieces.push(piece);
                    break;
                case 'back':
                    if (Math.abs(pos.z + (this.cubeSize + this.gap)) < threshold) pieces.push(piece);
                    break;
                case 'right':
                    if (Math.abs(pos.x - (this.cubeSize + this.gap)) < threshold) pieces.push(piece);
                    break;
                case 'left':
                    if (Math.abs(pos.x + (this.cubeSize + this.gap)) < threshold) pieces.push(piece);
                    break;
                case 'top':
                    if (Math.abs(pos.y - (this.cubeSize + this.gap)) < threshold) pieces.push(piece);
                    break;
                case 'bottom':
                    if (Math.abs(pos.y + (this.cubeSize + this.gap)) < threshold) pieces.push(piece);
                    break;
            }
        });
        return pieces;
    }

    // 获取旋转轴
    getRotationAxis(face) {
        switch(face) {
            case 'front':
            case 'back':
                return new THREE.Vector3(0, 0, 1);
            case 'right':
            case 'left':
                return new THREE.Vector3(1, 0, 0);
            case 'top':
            case 'bottom':
                return new THREE.Vector3(0, 1, 0);
        }
    }

    // 获取旋转属性
    getRotationProperty(axis) {
        if (axis.x === 1) return 'x';
        if (axis.y === 1) return 'y';
        if (axis.z === 1) return 'z';
    }

    // 更新魔方状态
    updateCubeState(face, angle) {
        const normalizedAngle = ((angle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
        const turns = Math.round(normalizedAngle / (Math.PI / 2));

        // 更新所有受影响块的位置和旋转
        const pieces = this.getAffectedPieces(face);
        pieces.forEach(piece => {
            // 确保位置精确到小数点后4位
            this.roundVector(piece.mesh.position);
            // 确保旋转角度精确到小数点后4位
            this.roundVector(piece.mesh.rotation);
        });

        this.rotateFaceColors(face, turns);
    }

    // 处理照片上传和颜色识别
    processUploadedPhoto(file, faceIndex) {
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                // 创建canvas来分析图片颜色
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);

                // 获取中心点的颜色
                const centerX = Math.floor(img.width / 2);
                const centerY = Math.floor(img.height / 2);
                const pixelData = ctx.getImageData(centerX, centerY, 1, 1).data;
                const color = new THREE.Color(
                    pixelData[0] / 255,
                    pixelData[1] / 255,
                    pixelData[2] / 255
                );

                // 更新魔方对应面的颜色
                this.updateFaceColor(faceIndex, color);
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    // 更新魔方面的颜色
    updateFaceColor(faceIndex, color) {
        const faces = ['top', 'front', 'right', 'back', 'left', 'bottom'];
        const face = faces[faceIndex];
        
        // 更新演示魔方的颜色
        const pieces = this.getAffectedPieces(face);
        pieces.forEach(piece => {
            const materials = piece.mesh.material;
            // 根据面的位置更新对应的材质颜色
            switch(face) {
                case 'front':
                    materials[4].color = color;
                    break;
                case 'back':
                    materials[5].color = color;
                    break;
                case 'right':
                    materials[0].color = color;
                    break;
                case 'left':
                    materials[1].color = color;
                    break;
                case 'top':
                    materials[2].color = color;
                    break;
                case 'bottom':
                    materials[3].color = color;
                    break;
            }
        });
    }

    // 旋转面的颜色
    rotateFaceColors(face, turns) {
        // 获取受影响的块
        const pieces = this.getAffectedPieces(face);
        
        // 存储原始颜色
        const originalColors = pieces.map(piece => ({
            position: { ...piece.position },
            materials: piece.mesh.material.map(m => m.color.clone())
        }));

        // 根据旋转次数更新颜色
        for (let i = 0; i < turns; i++) {
            this.rotateFaceColorsOnce(pieces, face);
        }
    }

    // 单次旋转颜色更新
    rotateFaceColorsOnce(pieces, face) {
        const colorMap = new Map();
        
        pieces.forEach(piece => {
            const newPos = this.getNewPosition(piece.position, face);
            colorMap.set(
                `${piece.position.x},${piece.position.y},${piece.position.z}`,
                piece.mesh.material.map(m => m.color.clone())
            );
        });

        pieces.forEach(piece => {
            const newPos = this.getNewPosition(piece.position, face);
            const newColors = colorMap.get(`${newPos.x},${newPos.y},${newPos.z}`);
            piece.mesh.material.forEach((m, i) => {
                m.color = newColors[i];
            });
        });
    }

    // 计算新位置
    getNewPosition(pos, face) {
        const { x, y, z } = pos;
        switch(face) {
            case 'front':
                return { x: -y, y: x, z };
            case 'back':
                return { x: y, y: -x, z };
            case 'right':
                return { x, y: -z, z: y };
            case 'left':
                return { x, y: z, z: -y };
            case 'top':
                return { x: -z, y, z: x };
            case 'bottom':
                return { x: z, y, z: -x };
        }
    }

    // 添加辅助方法来确保位置精确性
    roundVector(vector, decimals = 4) {
        vector.x = Number(vector.x.toFixed(decimals));
        vector.y = Number(vector.y.toFixed(decimals));
        vector.z = Number(vector.z.toFixed(decimals));
        return vector;
    }

    // 添加相机位置调整方法
    adjustCameraForStep(step, duration) {
        // 修改：调整相机位置以匹配正面握魔方的视角
        const cameraPositions = {
            'front': { x: 0, y: 0, z: 6 },      // 正面
            'back': { x: 0, y: 0, z: -6 },      // 背面
            'right': { x: 6, y: 0, z: 0 },      // 右面
            'left': { x: -6, y: 0, z: 0 },      // 左面
            'top': { x: 0, y: 6, z: 0.1 },      // 上面（略微倾斜以便观察）
            'bottom': { x: 0, y: -6, z: 0.1 }   // 下面（略微倾斜以便观察）
        };

        const targetPosition = cameraPositions[step.face];
        
        // 使用GSAP进行相机移动动画
        gsap.to(this.solutionCamera.position, {
            x: targetPosition.x,
            y: targetPosition.y,
            z: targetPosition.z,
            duration: duration * 0.3,  // 缩短相机移动时间，使动画更流畅
            ease: "power2.inOut",
            onUpdate: () => {
                this.solutionCamera.lookAt(0, 0, 0);
            }
        });
    }
}

// 创建魔方实例
document.addEventListener('DOMContentLoaded', () => {
    const cube = new RubiksCube();
    
    // 隐藏加载动画
    window.addEventListener('load', () => {
        document.getElementById('loading').style.display = 'none';
    });
    
    document.getElementById('analyze').addEventListener('click', () => {
        cube.startSolving();
    });
}); 