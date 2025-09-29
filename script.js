class ScrollEffect {
    constructor() {
        this.canvas = document.getElementById('sequence-canvas');
        this.ctx = this.canvas.getContext('2d');

        this.heroSection = document.querySelector('.hero-section');
        
        this.images = [];
        this.totalFrames = 25; // 图像序列总帧数
        this.currentFrame = 0;
        this.effectProgress = 0;
        this.isEffectComplete = false;
        this.imagesLoaded = 0;
        
        this.init();
    }
    
    init() {
        this.setupCanvas();
        this.loadImages();
        document.body.style.overflow = 'hidden';
    }
    
    setupCanvas() {
        // 等待第一张图片加载后再设置canvas尺寸
        if (this.images.length > 0 && this.images[0].complete) {
            this.updateCanvasSize();
        }
    }
    
    updateCanvasSize() {
        const containerWidth = Math.min(this.canvas.parentElement.offsetWidth, 800);
        if (this.images[0] && this.images[0].complete) {
            const imgAspect = this.images[0].width / this.images[0].height;
            const canvasHeight = containerWidth / imgAspect;
            
            this.canvas.width = containerWidth;
            this.canvas.height = canvasHeight;
            this.canvas.style.height = canvasHeight + 'px';
            
            console.log(`Canvas size: ${this.canvas.width}x${this.canvas.height}`);
        }
    }
    
    loadImages() {
        for (let i = 1; i <= this.totalFrames; i++) {
            const img = new Image();
            img.onload = () => {
                this.imagesLoaded++;
                console.log(`Loaded ${this.imagesLoaded}/${this.totalFrames}`);
                if (this.imagesLoaded === 1) {
                    // 第一张图片加载后设置canvas尺寸
                    this.updateCanvasSize();
                }
                if (this.imagesLoaded === this.totalFrames) {
                    console.log('All images loaded');
                    this.drawFrame(0);
                    this.addEventListeners();
                }
            };
            img.onerror = () => {
                console.error(`Failed to load: sequence/frame_${i.toString().padStart(3, '0')}.png`);
            };
            img.src = `sequence/frame_${i.toString().padStart(3, '0')}.png`;
            this.images.push(img);
        }
    }
    
    addEventListeners() {
        this.addWheelListener();
        this.addTouchListeners();
    }
    
    addWheelListener() {
        this.wheelHandler = (e) => {
            e.preventDefault();
            this.handleScroll(e.deltaY > 0 ? 2 : -2);
        };
        document.addEventListener('wheel', this.wheelHandler, { passive: false });
    }
    
    addTouchListeners() {
        let startY = 0;
        
        document.addEventListener('touchstart', (e) => {
            startY = e.touches[0].clientY;
        });
        
        this.touchMoveHandler = (e) => {
            e.preventDefault();
            const deltaY = startY - e.touches[0].clientY;
            this.handleScroll(deltaY * 0.1);
            startY = e.touches[0].clientY;
        };
        document.addEventListener('touchmove', this.touchMoveHandler, { passive: false });
    }
    
    handleScroll(delta) {
        if (!this.isEffectComplete) {
            this.effectProgress = Math.max(0, Math.min(100, this.effectProgress + delta));
            this.updateSequence();
            
            if (this.effectProgress >= 100) {
                this.isEffectComplete = true;
                document.body.style.overflow = 'auto';
                this.heroSection.style.position = 'relative';
                this.removeEventListeners();
            }
        }
    }
    
    removeEventListeners() {
        document.removeEventListener('wheel', this.wheelHandler);
        document.removeEventListener('touchmove', this.touchMoveHandler);
    }
    
    updateSequence() {
        const frameProgress = Math.min(1, this.effectProgress / 100); // 0-100% 用于序列播放
        this.currentFrame = Math.floor(frameProgress * (this.totalFrames - 1));
        this.drawFrame(this.currentFrame);
    }
    
    drawFrame(frameIndex) {
        if (this.images[frameIndex] && this.images[frameIndex].complete) {
            // 填充背景色
            this.ctx.fillStyle = '#f9f2f2';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            const img = this.images[frameIndex];
            const canvasAspect = this.canvas.width / this.canvas.height;
            const imgAspect = img.width / img.height;
            
            let drawWidth, drawHeight, offsetX, offsetY;
            
            if (imgAspect > canvasAspect) {
                // 图片更宽，以canvas宽度为准
                drawWidth = this.canvas.width;
                drawHeight = this.canvas.width / imgAspect;
                offsetX = 0;
                offsetY = 0; // 顶部对齐
            } else {
                // 图片更高，以canvas高度为准
                drawHeight = this.canvas.height;
                drawWidth = this.canvas.height * imgAspect;
                offsetX = (this.canvas.width - drawWidth) / 2;
                offsetY = 0;
            }
            
            this.ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
        }
    }
    

    

}

document.addEventListener('DOMContentLoaded', () => {
    window.scrollEffectInstance = new ScrollEffect();
});

window.addEventListener('resize', () => {
    const scrollEffect = window.scrollEffectInstance;
    if (scrollEffect) {
        scrollEffect.updateCanvasSize();
    }
});

