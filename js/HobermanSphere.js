/**
 * HobermanSphere.js
 * ============================================
 * Main class for creating and managing the complete Hoberman Sphere.
 * 
 * This implementation creates an authentic Hoberman sphere using radial
 * scissor linkages that expand and contract from a central point.
 * The sphere is based on an icosahedron geometry for optimal distribution.
 */

class HobermanSphere {
    /**
     * Creates a Hoberman Sphere
     * @param {THREE.Scene} scene - The Three.js scene
     * @param {Object} options - Configuration options
     */
    constructor(scene, options = {}) {
        this.scene = scene;
        
        // Configuration
        this.config = {
            minRadius: options.minRadius || 2,
            maxRadius: options.maxRadius || 8,
            strutRadius: options.strutRadius || 0.08,
            subdivisions: options.subdivisions || 2, // Icosahedron subdivisions
            color: options.color || 0x00aaff,
            materialType: options.materialType || 'metallic'
        };
        
        // Animation state
        this.expansionFactor = 0.5; // 0 = fully contracted, 1 = fully expanded
        this.isAnimating = false;
        this.animationSpeed = 0.3; // Speed of breathing animation
        
        // Rotation state
        this.rotationSpeed = 0.2;
        this.pitchSpeed = 0.1;
        this.currentPitch = 0;
        
        // Scissor links array
        this.scissorLinks = [];
        
        // Main group to hold all sphere components
        this.sphereGroup = new THREE.Group();
        this.scene.add(this.sphereGroup);
        
        // Material
        this.material = this.createMaterial(this.config.color, this.config.materialType);
        
        // Build the sphere
        this.buildSphere();
    }
    
    /**
     * Create material based on type
     * @param {number} color - Hex color value
     * @param {string} type - Material type ('metallic', 'matte', 'glossy')
     * @returns {THREE.Material}
     */
    createMaterial(color, type) {
        let material;
        
        switch(type) {
            case 'metallic':
                material = new THREE.MeshStandardMaterial({
                    color: color,
                    metalness: 0.9,
                    roughness: 0.2,
                    emissive: color,
                    emissiveIntensity: 0.1
                });
                break;
                
            case 'matte':
                material = new THREE.MeshStandardMaterial({
                    color: color,
                    metalness: 0.0,
                    roughness: 0.9,
                    emissive: color,
                    emissiveIntensity: 0.05
                });
                break;
                
            case 'glossy':
                material = new THREE.MeshStandardMaterial({
                    color: color,
                    metalness: 0.3,
                    roughness: 0.1,
                    emissive: color,
                    emissiveIntensity: 0.15
                });
                break;
                
            default:
                material = new THREE.MeshStandardMaterial({
                    color: color,
                    metalness: 0.9,
                    roughness: 0.2
                });
        }
        
        return material;
    }
    
    /**
     * Build the complete Hoberman sphere structure
     */
    buildSphere() {
        // Create icosahedron geometry as base structure
        const geometry = new THREE.IcosahedronGeometry(1, this.config.subdivisions);
        const vertices = geometry.attributes.position.array;
        
        // Convert vertices to Vector3 array
        const vertexPositions = [];
        for (let i = 0; i < vertices.length; i += 3) {
            vertexPositions.push(new THREE.Vector3(
                vertices[i],
                vertices[i + 1],
                vertices[i + 2]
            ));
        }
        
        // Remove duplicate vertices
        const uniqueVertices = this.removeDuplicateVertices(vertexPositions);
        
        // Create scissor links from center to each vertex
        uniqueVertices.forEach(vertex => {
            this.createRadialScissorLink(vertex);
        });
        
        // Create connecting struts between adjacent vertices
        this.createConnectingStruts(uniqueVertices);
        
        console.log(`Hoberman Sphere built with ${this.scissorLinks.length} scissor links`);
    }
    
    /**
     * Remove duplicate vertices from array
     * @param {Array<THREE.Vector3>} vertices - Array of vertices
     * @returns {Array<THREE.Vector3>} Unique vertices
     */
    removeDuplicateVertices(vertices) {
        const unique = [];
        const threshold = 0.0001;
        
        vertices.forEach(v => {
            const isDuplicate = unique.some(u => 
                u.distanceTo(v) < threshold
            );
            if (!isDuplicate) {
                unique.push(v);
            }
        });
        
        return unique;
    }
    
    /**
     * Create a radial scissor link from center to vertex
     * @param {THREE.Vector3} vertex - Target vertex position
     */
    createRadialScissorLink(vertex) {
        const centerPoint = new THREE.Vector3(0, 0, 0);
        const direction = vertex.clone().normalize();
        const midPoint = direction.clone().multiplyScalar(this.config.maxRadius * 0.5);
        
        // Calculate strut length based on max radius
        const strutLength = this.config.maxRadius * 0.5;
        
        // Create scissor link
        const scissorLink = new ScissorLink(
            this.sphereGroup,
            midPoint,
            direction,
            strutLength,
            this.config.strutRadius,
            this.material
        );
        
        this.scissorLinks.push(scissorLink);
    }
    
    /**
     * Create connecting struts between adjacent vertices
     * @param {Array<THREE.Vector3>} vertices - Array of vertex positions
     */
    createConnectingStruts(vertices) {
        const connectionThreshold = 1.2; // Distance threshold for connections
        
        // Create thin connecting cylinders between nearby vertices
        for (let i = 0; i < vertices.length; i++) {
            for (let j = i + 1; j < vertices.length; j++) {
                const distance = vertices[i].distanceTo(vertices[j]);
                
                if (distance < connectionThreshold) {
                    // These vertices should be connected
                    this.createConnectionStrut(vertices[i], vertices[j]);
                }
            }
        }
    }
    
    /**
     * Create a thin connecting strut between two points
     * @param {THREE.Vector3} point1 - First point
     * @param {THREE.Vector3} point2 - Second point
     */
    createConnectionStrut(point1, point2) {
        const direction = new THREE.Vector3().subVectors(point2, point1);
        const length = direction.length();
        const midpoint = new THREE.Vector3().addVectors(point1, point2).multiplyScalar(0.5);
        
        const geometry = new THREE.CylinderGeometry(
            this.config.strutRadius * 0.5,
            this.config.strutRadius * 0.5,
            length,
            6
        );
        
        const strut = new THREE.Mesh(geometry, this.material);
        strut.position.copy(midpoint);
        
        // Orient the strut
        const axis = new THREE.Vector3(0, 1, 0);
        strut.quaternion.setFromUnitVectors(axis, direction.normalize());
        
        // Store reference for updates
        strut.userData.isConnectionStrut = true;
        strut.userData.point1 = point1.clone();
        strut.userData.point2 = point2.clone();
        
        this.sphereGroup.add(strut);
    }
    
    /**
     * Update the expansion of all scissor links
     * @param {number} factor - Expansion factor (0-1)
     */
    setExpansion(factor) {
        this.expansionFactor = Math.max(0, Math.min(1, factor));
        
        // Update all scissor links
        this.scissorLinks.forEach(link => {
            link.setExpansion(this.expansionFactor);
        });
        
        // Update connection struts
        this.updateConnectionStruts();
    }
    
    /**
     * Update positions of connection struts based on current expansion
     */
    updateConnectionStruts() {
        this.sphereGroup.children.forEach(child => {
            if (child.userData.isConnectionStrut) {
                const point1 = child.userData.point1.clone();
                const point2 = child.userData.point2.clone();
                
                // Scale points based on expansion
                const currentRadius = this.config.minRadius + 
                    (this.config.maxRadius - this.config.minRadius) * this.expansionFactor;
                const scaleFactor = currentRadius / this.config.maxRadius;
                
                point1.multiplyScalar(scaleFactor);
                point2.multiplyScalar(scaleFactor);
                
                // Update strut position and orientation
                const direction = new THREE.Vector3().subVectors(point2, point1);
                const length = direction.length();
                const midpoint = new THREE.Vector3().addVectors(point1, point2).multiplyScalar(0.5);
                
                child.position.copy(midpoint);
                child.scale.y = length / child.geometry.parameters.height;
                
                const axis = new THREE.Vector3(0, 1, 0);
                child.quaternion.setFromUnitVectors(axis, direction.normalize());
            }
        });
    }
    
    /**
     * Update sphere material color
     * @param {number} color - Hex color value
     */
    updateColor(color) {
        this.config.color = color;
        this.material.color.setHex(color);
        this.material.emissive.setHex(color);
        this.material.needsUpdate = true;
    }
    
    /**
     * Update sphere material type
     * @param {string} type - Material type ('metallic', 'matte', 'glossy')
     */
    updateMaterialType(type) {
        this.config.materialType = type;
        
        // Create new material
        const newMaterial = this.createMaterial(this.config.color, type);
        
        // Update all scissor links
        this.scissorLinks.forEach(link => {
            link.updateMaterial(newMaterial);
        });
        
        // Update connection struts
        this.sphereGroup.children.forEach(child => {
            if (child.userData.isConnectionStrut) {
                child.material = newMaterial;
            }
        });
        
        // Replace old material
        this.material.dispose();
        this.material = newMaterial;
    }
    
    /**
     * Start the breathing animation
     */
    startAnimation() {
        this.isAnimating = true;
    }
    
    /**
     * Stop the breathing animation
     */
    stopAnimation() {
        this.isAnimating = false;
    }
    
    /**
     * Toggle animation state
     */
    toggleAnimation() {
        this.isAnimating = !this.isAnimating;
    }
    
    /**
     * Update method called every frame
     * @param {number} deltaTime - Time since last frame
     */
    update(deltaTime) {
        if (this.isAnimating) {
            // Breathing animation (expansion/contraction)
            const breathingCycle = Math.sin(Date.now() * 0.001 * this.animationSpeed) * 0.5 + 0.5;
            this.setExpansion(breathingCycle);
            
            // Rotation with changing pitch
            this.sphereGroup.rotation.y += this.rotationSpeed * deltaTime;
            
            // Update pitch angle over time
            this.currentPitch += this.pitchSpeed * deltaTime;
            this.sphereGroup.rotation.x = Math.sin(this.currentPitch) * 0.4;
            this.sphereGroup.rotation.z = Math.cos(this.currentPitch * 0.7) * 0.3;
        }
    }
    
    /**
     * Get the sphere group for external manipulation
     * @returns {THREE.Group}
     */
    getGroup() {
        return this.sphereGroup;
    }
    
    /**
     * Clean up and dispose of resources
     */
    dispose() {
        this.scissorLinks.forEach(link => link.dispose());
        this.scissorLinks = [];
        
        this.sphereGroup.children.forEach(child => {
            if (child.geometry) child.geometry.dispose();
            if (child.material) child.material.dispose();
        });
        
        this.scene.remove(this.sphereGroup);
        this.material.dispose();
    }
}