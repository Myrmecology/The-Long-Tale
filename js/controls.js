/**
 * controls.js
 * ============================================
 * Manages all UI controls and user interactions for the Hoberman Sphere.
 * 
 * Handles:
 * - Start/Stop animation button
 * - Speed slider
 * - Color picker for sphere color
 * - Material type selector
 * - Background selector
 * - Auto-rotate toggle
 * - Glow effect toggle
 * - Stats display toggle
 * - Fullscreen toggle
 * - Mouse orbit controls
 * - Zoom controls
 */

class Controls {
    /**
     * Initialize controls
     * @param {HobermanSphere} hobermanSphere - The Hoberman sphere instance
     * @param {THREE.Camera} camera - The Three.js camera
     * @param {HTMLElement} renderer - The renderer DOM element
     * @param {THREE.Scene} scene - The Three.js scene
     */
    constructor(hobermanSphere, camera, renderer, scene) {
        this.sphere = hobermanSphere;
        this.camera = camera;
        this.renderer = renderer;
        this.scene = scene;
        
        // Orbit controls for mouse interaction
        this.orbitControls = null;
        
        // UI elements
        this.toggleBtn = document.getElementById('toggle-btn');
        this.speedSlider = document.getElementById('speed-slider');
        this.speedDisplay = document.getElementById('speed-display');
        this.colorPicker = document.getElementById('color-picker');
        this.materialSelector = document.getElementById('material-type');
        this.backgroundSelector = document.getElementById('background-type');
        this.autoRotateToggle = document.getElementById('auto-rotate-toggle');
        this.glowToggle = document.getElementById('glow-toggle');
        this.statsToggle = document.getElementById('stats-toggle');
        this.fullscreenBtn = document.getElementById('fullscreen-btn');
        this.statsDisplay = document.getElementById('stats-display');
        
        // Animation state
        this.isAnimating = false;
        
        // Glow effect state
        this.glowEnabled = false;
        
        // Initialize everything
        this.initOrbitControls();
        this.initUIControls();
        
        console.log('Controls initialized');
    }
    
    /**
     * Initialize Three.js OrbitControls for camera manipulation
     */
    initOrbitControls() {
        // Manual orbit control implementation
        this.mouse = {
            isDragging: false,
            previousX: 0,
            previousY: 0,
            currentX: 0,
            currentY: 0
        };
        
        this.cameraRotation = {
            theta: 0, // Horizontal rotation
            phi: Math.PI / 4, // Vertical rotation (45 degrees)
            radius: 25 // Distance from center (increased for larger sphere)
        };
        
        // Mouse event listeners
        this.renderer.addEventListener('mousedown', (e) => this.onMouseDown(e));
        this.renderer.addEventListener('mousemove', (e) => this.onMouseMove(e));
        this.renderer.addEventListener('mouseup', (e) => this.onMouseUp(e));
        this.renderer.addEventListener('wheel', (e) => this.onMouseWheel(e));
        
        // Touch event listeners for mobile
        this.renderer.addEventListener('touchstart', (e) => this.onTouchStart(e));
        this.renderer.addEventListener('touchmove', (e) => this.onTouchMove(e));
        this.renderer.addEventListener('touchend', (e) => this.onTouchEnd(e));
        
        // Initial camera position
        this.updateCameraPosition();
    }
    
    /**
     * Update camera position based on spherical coordinates
     */
    updateCameraPosition() {
        this.camera.position.x = this.cameraRotation.radius * Math.sin(this.cameraRotation.phi) * Math.cos(this.cameraRotation.theta);
        this.camera.position.y = this.cameraRotation.radius * Math.cos(this.cameraRotation.phi);
        this.camera.position.z = this.cameraRotation.radius * Math.sin(this.cameraRotation.phi) * Math.sin(this.cameraRotation.theta);
        this.camera.lookAt(0, 0, 0);
    }
    
    /**
     * Mouse down event handler
     */
    onMouseDown(event) {
        this.mouse.isDragging = true;
        this.mouse.previousX = event.clientX;
        this.mouse.previousY = event.clientY;
    }
    
    /**
     * Mouse move event handler
     */
    onMouseMove(event) {
        if (!this.mouse.isDragging) return;
        
        const deltaX = event.clientX - this.mouse.previousX;
        const deltaY = event.clientY - this.mouse.previousY;
        
        // Update camera rotation
        this.cameraRotation.theta += deltaX * 0.01;
        this.cameraRotation.phi += deltaY * 0.01;
        
        // Clamp phi to prevent flipping
        this.cameraRotation.phi = Math.max(0.1, Math.min(Math.PI - 0.1, this.cameraRotation.phi));
        
        this.updateCameraPosition();
        
        this.mouse.previousX = event.clientX;
        this.mouse.previousY = event.clientY;
    }
    
    /**
     * Mouse up event handler
     */
    onMouseUp(event) {
        this.mouse.isDragging = false;
    }
    
    /**
     * Mouse wheel event handler for zoom
     */
    onMouseWheel(event) {
        event.preventDefault();
        
        const zoomSpeed = 0.1;
        const delta = event.deltaY > 0 ? 1 : -1;
        
        this.cameraRotation.radius += delta * zoomSpeed * this.cameraRotation.radius * 0.1;
        this.cameraRotation.radius = Math.max(12, Math.min(60, this.cameraRotation.radius));
        
        this.updateCameraPosition();
    }
    
    /**
     * Touch start event handler
     */
    onTouchStart(event) {
        if (event.touches.length === 1) {
            this.mouse.isDragging = true;
            this.mouse.previousX = event.touches[0].clientX;
            this.mouse.previousY = event.touches[0].clientY;
        }
    }
    
    /**
     * Touch move event handler
     */
    onTouchMove(event) {
        if (!this.mouse.isDragging || event.touches.length !== 1) return;
        
        event.preventDefault();
        
        const deltaX = event.touches[0].clientX - this.mouse.previousX;
        const deltaY = event.touches[0].clientY - this.mouse.previousY;
        
        this.cameraRotation.theta += deltaX * 0.01;
        this.cameraRotation.phi += deltaY * 0.01;
        
        this.cameraRotation.phi = Math.max(0.1, Math.min(Math.PI - 0.1, this.cameraRotation.phi));
        
        this.updateCameraPosition();
        
        this.mouse.previousX = event.touches[0].clientX;
        this.mouse.previousY = event.touches[0].clientY;
    }
    
    /**
     * Touch end event handler
     */
    onTouchEnd(event) {
        this.mouse.isDragging = false;
    }
    
    /**
     * Initialize UI control event listeners
     */
    initUIControls() {
        // Toggle animation button
        this.toggleBtn.addEventListener('click', () => {
            this.toggleAnimation();
        });
        
        // Speed slider
        this.speedSlider.addEventListener('input', (e) => {
            this.updateSpeed(parseFloat(e.target.value));
        });
        
        // Color picker
        this.colorPicker.addEventListener('input', (e) => {
            this.updateColor(e.target.value);
        });
        
        // Material type selector
        this.materialSelector.addEventListener('change', (e) => {
            this.updateMaterialType(e.target.value);
        });
        
        // Background selector
        this.backgroundSelector.addEventListener('change', (e) => {
            this.updateBackground(e.target.value);
        });
        
        // Auto-rotate toggle
        this.autoRotateToggle.addEventListener('change', (e) => {
            this.toggleAutoRotate(e.target.checked);
        });
        
        // Glow effect toggle
        this.glowToggle.addEventListener('change', (e) => {
            this.toggleGlow(e.target.checked);
        });
        
        // Stats toggle
        this.statsToggle.addEventListener('change', (e) => {
            this.toggleStats(e.target.checked);
        });
        
        // Fullscreen button
        this.fullscreenBtn.addEventListener('click', () => {
            this.toggleFullscreen();
        });
    }
    
    /**
     * Toggle animation on/off
     */
    toggleAnimation() {
        this.isAnimating = !this.isAnimating;
        
        if (this.isAnimating) {
            this.sphere.startAnimation();
            this.toggleBtn.textContent = 'Pause Animation';
            this.toggleBtn.style.background = 'linear-gradient(135deg, #ff4444 0%, #cc0000 100%)';
        } else {
            this.sphere.stopAnimation();
            this.toggleBtn.textContent = 'Start Animation';
            this.toggleBtn.style.background = 'linear-gradient(135deg, #00aaff 0%, #0077cc 100%)';
        }
    }
    
    /**
     * Update animation speed
     * @param {number} speed - Speed value from slider
     */
    updateSpeed(speed) {
        this.sphere.setAnimationSpeed(speed);
        this.speedDisplay.textContent = speed.toFixed(1) + 'x';
        console.log(`Animation speed: ${speed.toFixed(1)}x`);
    }
    
    /**
     * Update sphere color
     * @param {string} hexColor - Hex color string (e.g., '#00aaff')
     */
    updateColor(hexColor) {
        // Convert hex string to number
        const colorValue = parseInt(hexColor.replace('#', ''), 16);
        this.sphere.updateColor(colorValue);
    }
    
    /**
     * Update material type
     * @param {string} type - Material type ('metallic', 'matte', 'glossy')
     */
    updateMaterialType(type) {
        this.sphere.updateMaterialType(type);
        console.log(`Material type changed to: ${type}`);
    }
    
    /**
     * Update background
     * @param {string} type - Background type
     */
    updateBackground(type) {
        switch(type) {
            case 'space':
                this.scene.background = new THREE.Color(0x0a0a0a);
                break;
            case 'gradient':
                this.scene.background = new THREE.Color(0x1a1a2e);
                break;
            case 'blue':
                this.scene.background = new THREE.Color(0x001a33);
                break;
            case 'purple':
                this.scene.background = new THREE.Color(0x1a0a2e);
                break;
            case 'black':
                this.scene.background = new THREE.Color(0x000000);
                break;
            default:
                this.scene.background = new THREE.Color(0x0a0a0a);
        }
        console.log(`Background changed to: ${type}`);
    }
    
    /**
     * Toggle auto-rotation
     * @param {boolean} enabled - Whether auto-rotation is enabled
     */
    toggleAutoRotate(enabled) {
        this.sphere.setAutoRotate(enabled);
        console.log(`Auto-rotate: ${enabled ? 'ON' : 'OFF'}`);
    }
    
    /**
     * Toggle glow effect
     * @param {boolean} enabled - Whether glow is enabled
     */
    toggleGlow(enabled) {
        this.glowEnabled = enabled;
        // This will be handled in main.js with post-processing
        console.log(`Glow effect: ${enabled ? 'ON' : 'OFF'}`);
    }
    
    /**
     * Get glow enabled state
     * @returns {boolean}
     */
    isGlowEnabled() {
        return this.glowEnabled;
    }
    
    /**
     * Toggle stats display
     * @param {boolean} enabled - Whether stats should be shown
     */
    toggleStats(enabled) {
        if (enabled) {
            this.statsDisplay.classList.remove('hidden');
        } else {
            this.statsDisplay.classList.add('hidden');
        }
        console.log(`Stats display: ${enabled ? 'ON' : 'OFF'}`);
    }
    
    /**
     * Toggle fullscreen mode
     */
    toggleFullscreen() {
        if (!document.fullscreenElement && 
            !document.webkitFullscreenElement && 
            !document.mozFullScreenElement) {
            // Enter fullscreen
            const elem = document.documentElement;
            if (elem.requestFullscreen) {
                elem.requestFullscreen();
            } else if (elem.webkitRequestFullscreen) {
                elem.webkitRequestFullscreen();
            } else if (elem.mozRequestFullScreen) {
                elem.mozRequestFullScreen();
            }
            this.fullscreenBtn.textContent = '⛶ Exit Fullscreen';
        } else {
            // Exit fullscreen
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            }
            this.fullscreenBtn.textContent = '⛶ Fullscreen';
        }
    }
    
    /**
     * Get camera for external access
     * @returns {THREE.Camera}
     */
    getCamera() {
        return this.camera;
    }
    
    /**
     * Update method called every frame
     * @param {number} deltaTime - Time since last frame
     */
    update(deltaTime) {
        // Additional control updates can go here if needed
    }
}