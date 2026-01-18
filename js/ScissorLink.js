/**
 * ScissorLink.js
 * ============================================
 * Represents a single scissor linkage unit for the Hoberman Sphere.
 * Each scissor link consists of two crossing struts connected at a central pivot.
 * 
 * The scissor mechanism allows for radial expansion and contraction while
 * maintaining structural integrity and geometric relationships.
 */

class ScissorLink {
    /**
     * Creates a scissor linkage unit
     * @param {THREE.Scene} scene - The Three.js scene
     * @param {THREE.Vector3} position - Center position of the scissor link
     * @param {THREE.Vector3} axis - Orientation axis for the scissor
     * @param {number} length - Length of each strut
     * @param {number} radius - Radius of the struts
     * @param {THREE.Material} material - Material for rendering
     */
    constructor(scene, position, axis, length, radius, material) {
        this.scene = scene;
        this.position = position.clone();
        this.axis = axis.clone().normalize();
        this.strutLength = length;
        this.strutRadius = radius;
        this.material = material;
        
        // Expansion factor (0 = collapsed, 1 = fully expanded)
        this.expansionFactor = 0.5;
        
        // Strut geometries and meshes
        this.strut1 = null;
        this.strut2 = null;
        
        // Pivot joint
        this.pivot = null;
        
        // Connection points (endpoints of the scissor)
        this.endpoints = {
            top1: new THREE.Vector3(),
            top2: new THREE.Vector3(),
            bottom1: new THREE.Vector3(),
            bottom2: new THREE.Vector3()
        };
        
        // Initialize the scissor link
        this.initialize();
    }
    
    /**
     * Initialize the scissor link geometry and add to scene
     */
    initialize() {
        // Create strut geometry (cylindrical bars)
        const strutGeometry = new THREE.CylinderGeometry(
            this.strutRadius,
            this.strutRadius,
            this.strutLength,
            8
        );
        
        // Create two crossing struts
        this.strut1 = new THREE.Mesh(strutGeometry, this.material);
        this.strut2 = new THREE.Mesh(strutGeometry, this.material);
        
        // Create pivot joint (sphere at intersection)
        const pivotGeometry = new THREE.SphereGeometry(this.strutRadius * 2, 16, 16);
        this.pivot = new THREE.Mesh(pivotGeometry, this.material);
        
        // Add to scene
        this.scene.add(this.strut1);
        this.scene.add(this.strut2);
        this.scene.add(this.pivot);
        
        // Position the scissor link
        this.updateGeometry();
    }
    
    /**
     * Update the scissor link geometry based on expansion factor
     * This calculates the positions and rotations of all components
     */
    updateGeometry() {
        // Calculate the angle of opening based on expansion
        // At expansion = 0, scissors are closed (angle = 0)
        // At expansion = 1, scissors are open (angle = 90 degrees)
        const openAngle = this.expansionFactor * Math.PI / 2;
        
        // Calculate perpendicular axes for positioning struts
        const perpAxis1 = new THREE.Vector3();
        const perpAxis2 = new THREE.Vector3();
        
        // Create perpendicular vectors to the main axis
        if (Math.abs(this.axis.y) < 0.9) {
            perpAxis1.crossVectors(this.axis, new THREE.Vector3(0, 1, 0));
        } else {
            perpAxis1.crossVectors(this.axis, new THREE.Vector3(1, 0, 0));
        }
        perpAxis1.normalize();
        perpAxis2.crossVectors(this.axis, perpAxis1).normalize();
        
        // Calculate strut positions and rotations
        const halfLength = this.strutLength / 2;
        const offset = halfLength * Math.sin(openAngle);
        
        // Strut 1 position and rotation
        const strut1Pos = this.position.clone().add(
            perpAxis1.clone().multiplyScalar(offset)
        );
        this.strut1.position.copy(strut1Pos);
        this.strut1.quaternion.setFromUnitVectors(
            new THREE.Vector3(0, 1, 0),
            this.axis
        );
        this.strut1.rotateOnAxis(perpAxis2, openAngle);
        
        // Strut 2 position and rotation
        const strut2Pos = this.position.clone().add(
            perpAxis1.clone().multiplyScalar(-offset)
        );
        this.strut2.position.copy(strut2Pos);
        this.strut2.quaternion.setFromUnitVectors(
            new THREE.Vector3(0, 1, 0),
            this.axis
        );
        this.strut2.rotateOnAxis(perpAxis2, -openAngle);
        
        // Pivot position (center point)
        this.pivot.position.copy(this.position);
        
        // Update endpoint positions for connections to other links
        this.updateEndpoints(openAngle, halfLength, perpAxis1, perpAxis2);
    }
    
    /**
     * Update the positions of connection endpoints
     * @param {number} openAngle - Current opening angle
     * @param {number} halfLength - Half the strut length
     * @param {THREE.Vector3} perpAxis1 - First perpendicular axis
     * @param {THREE.Vector3} perpAxis2 - Second perpendicular axis
     */
    updateEndpoints(openAngle, halfLength, perpAxis1, perpAxis2) {
        const offset = halfLength * Math.sin(openAngle);
        const height = halfLength * Math.cos(openAngle);
        
        // Top endpoints (positive axis direction)
        this.endpoints.top1.copy(this.position)
            .add(this.axis.clone().multiplyScalar(height))
            .add(perpAxis1.clone().multiplyScalar(offset));
            
        this.endpoints.top2.copy(this.position)
            .add(this.axis.clone().multiplyScalar(height))
            .add(perpAxis1.clone().multiplyScalar(-offset));
        
        // Bottom endpoints (negative axis direction)
        this.endpoints.bottom1.copy(this.position)
            .add(this.axis.clone().multiplyScalar(-height))
            .add(perpAxis1.clone().multiplyScalar(offset));
            
        this.endpoints.bottom2.copy(this.position)
            .add(this.axis.clone().multiplyScalar(-height))
            .add(perpAxis1.clone().multiplyScalar(-offset));
    }
    
    /**
     * Set the expansion factor and update geometry
     * @param {number} factor - Expansion factor (0-1)
     */
    setExpansion(factor) {
        this.expansionFactor = Math.max(0, Math.min(1, factor));
        this.updateGeometry();
    }
    
    /**
     * Update the material of all components
     * @param {THREE.Material} material - New material
     */
    updateMaterial(material) {
        this.material = material;
        this.strut1.material = material;
        this.strut2.material = material;
        this.pivot.material = material;
    }
    
    /**
     * Remove the scissor link from the scene
     */
    dispose() {
        this.scene.remove(this.strut1);
        this.scene.remove(this.strut2);
        this.scene.remove(this.pivot);
        
        this.strut1.geometry.dispose();
        this.strut2.geometry.dispose();
        this.pivot.geometry.dispose();
    }
    
    /**
     * Get the current radius from center based on expansion
     * @returns {number} Current radius
     */
    getCurrentRadius() {
        const openAngle = this.expansionFactor * Math.PI / 2;
        return (this.strutLength / 2) * Math.cos(openAngle);
    }
}