/**
 * main.js
 * ============================================
 * Main entry point for the Hoberman Sphere application.
 * 
 * Initializes:
 * - Three.js scene, camera, and renderer
 * - Lighting system
 * - Hoberman Sphere
 * - Controls
 * - Stats tracking
 * - Post-processing effects (glow)
 * - Animation loop
 */

// Global variables
let scene, camera, renderer;
let hobermanSphere, controls;
let clock;

// Stats tracking
let stats = {
    fps: 60,
    frameCount: 0,
    lastTime: performance.now()
};

// Post-processing for glow effect
let composer, bloomPass;
let glowEnabled = false;

/**
 * Initialize the entire application
 */
function init() {
    console.log('Initializing Hoberman Sphere Application...');
    
    // Create Three.js clock for delta time
    clock = new THREE.Clock();
    
    // Initialize scene
    initScene();
    
    // Initialize camera
    initCamera();
    
    // Initialize renderer
    initRenderer();
    
    // Initialize lighting
    initLighting();
    
    // Create Hoberman Sphere
    createHobermanSphere();
    
    // Initialize controls
    initControls();
    
    // Initialize post-processing (glow effect)
    initPostProcessing();
    
    // Handle window resize
    window.addEventListener('resize', onWindowResize, false);
    
    // Start animation loop
    animate();
    
    console.log('Application initialized successfully!');
}

/**
 * Initialize the Three.js scene
 */
function initScene() {
    scene = new THREE.Scene();
    
    // Set background color (dark space-like background)
    scene.background = new THREE.Color(0x0a0a0a);
    
    // Optional: Add fog for depth
    scene.fog = new THREE.Fog(0x0a0a0a, 40, 120);
}

/**
 * Initialize the camera
 */
function initCamera() {
    const aspectRatio = window.innerWidth / window.innerHeight;
    camera = new THREE.PerspectiveCamera(
        60,           // Field of view
        aspectRatio,  // Aspect ratio
        0.1,          // Near clipping plane
        1000          // Far clipping plane
    );
    
    // Initial camera position (will be controlled by Controls)
    camera.position.set(0, 5, 25);
    camera.lookAt(0, 0, 0);
}

/**
 * Initialize the WebGL renderer
 */
function initRenderer() {
    renderer = new THREE.WebGLRenderer({
        antialias: true,        // Smooth edges
        alpha: true,            // Transparent background support
        powerPreference: 'high-performance'
    });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Optimize for retina displays
    
    // Enable shadows for realistic lighting
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    // Set tone mapping for better color representation
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    
    // Append renderer to the DOM
    const container = document.getElementById('canvas-container');
    container.appendChild(renderer.domElement);
}

/**
 * Initialize lighting system
 */
function initLighting() {
    // Ambient light - provides base illumination
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);
    
    // Main directional light (key light)
    const directionalLight1 = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight1.position.set(10, 10, 10);
    directionalLight1.castShadow = true;
    directionalLight1.shadow.mapSize.width = 2048;
    directionalLight1.shadow.mapSize.height = 2048;
    scene.add(directionalLight1);
    
    // Fill light (opposite side)
    const directionalLight2 = new THREE.DirectionalLight(0x4466ff, 0.4);
    directionalLight2.position.set(-10, 5, -10);
    scene.add(directionalLight2);
    
    // Rim light (from below for dramatic effect)
    const directionalLight3 = new THREE.DirectionalLight(0xff6644, 0.3);
    directionalLight3.position.set(0, -10, 5);
    scene.add(directionalLight3);
    
    // Point lights for dynamic highlights
    const pointLight1 = new THREE.PointLight(0x00aaff, 1.5, 50);
    pointLight1.position.set(15, 15, 15);
    scene.add(pointLight1);
    
    const pointLight2 = new THREE.PointLight(0xff00aa, 1.0, 50);
    pointLight2.position.set(-15, 10, -15);
    scene.add(pointLight2);
    
    // Hemisphere light for ambient color variation
    const hemisphereLight = new THREE.HemisphereLight(
        0x4466ff,  // Sky color
        0x002244,  // Ground color
        0.3
    );
    scene.add(hemisphereLight);
}

/**
 * Create the Hoberman Sphere
 */
function createHobermanSphere() {
    hobermanSphere = new HobermanSphere(scene, {
        minRadius: 1.5,       // Smaller minimum for dramatic effect
        maxRadius: 10,        // Larger maximum for FULL expansion
        strutRadius: 0.08,
        subdivisions: 2,      // Full complexity
        color: 0x00aaff,
        materialType: 'metallic'
    });
    
    console.log('Hoberman Sphere created');
}

/**
 * Initialize controls
 */
function initControls() {
    controls = new Controls(
        hobermanSphere,
        camera,
        renderer.domElement,
        scene
    );
    
    console.log('Controls initialized');
}

/**
 * Initialize post-processing for glow effect
 * Note: Using basic implementation since EffectComposer requires additional imports
 */
function initPostProcessing() {
    // Placeholder for glow effect
    // In a production app, you'd use THREE.EffectComposer with UnrealBloomPass
    // For now, we'll simulate glow by increasing emissive intensity
    glowEnabled = false;
    console.log('Post-processing initialized (glow ready)');
}

/**
 * Apply or remove glow effect
 */
function updateGlowEffect() {
    const shouldGlow = controls.isGlowEnabled();
    
    if (shouldGlow !== glowEnabled) {
        glowEnabled = shouldGlow;
        
        // Traverse sphere and update emissive intensity
        hobermanSphere.getGroup().traverse((child) => {
            if (child.isMesh && child.material) {
                if (glowEnabled) {
                    child.material.emissiveIntensity = 0.4;
                } else {
                    child.material.emissiveIntensity = 0.1;
                }
                child.material.needsUpdate = true;
            }
        });
        
        console.log(`Glow effect ${glowEnabled ? 'enabled' : 'disabled'}`);
    }
}

/**
 * Update stats display
 */
function updateStats() {
    // Calculate FPS
    stats.frameCount++;
    const currentTime = performance.now();
    const elapsed = currentTime - stats.lastTime;
    
    if (elapsed >= 1000) {
        stats.fps = Math.round((stats.frameCount * 1000) / elapsed);
        stats.frameCount = 0;
        stats.lastTime = currentTime;
        
        // Update FPS display
        document.getElementById('fps-value').textContent = stats.fps;
    }
    
    // Update expansion percentage
    const expansion = Math.round(hobermanSphere.getExpansionFactor() * 100);
    document.getElementById('expansion-value').textContent = expansion + '%';
    
    // Update speed display
    const speed = hobermanSphere.animationSpeed.toFixed(1);
    document.getElementById('speed-value').textContent = speed + 'x';
}

/**
 * Handle window resize
 */
function onWindowResize() {
    // Update camera aspect ratio
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    
    // Update renderer size
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
}

/**
 * Animation loop
 */
function animate() {
    requestAnimationFrame(animate);
    
    // Get delta time
    const deltaTime = clock.getDelta();
    
    // Update Hoberman Sphere
    if (hobermanSphere) {
        hobermanSphere.update(deltaTime);
    }
    
    // Update controls
    if (controls) {
        controls.update(deltaTime);
    }
    
    // Update glow effect
    updateGlowEffect();
    
    // Update stats
    updateStats();
    
    // Render the scene
    renderer.render(scene, camera);
}

/**
 * Start the application when DOM is loaded
 */
document.addEventListener('DOMContentLoaded', () => {
    init();
});