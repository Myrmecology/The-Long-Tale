# Hoberman Sphere - Interactive 3D Simulation
# FOR a video demo of this project, please visit: https://www.youtube.com/watch?v=tKCsCnQRAgs

A stunning, interactive 3D Hoberman Sphere implementation using Three.js with authentic scissor linkage mechanics, realistic materials, and smooth animations.

## Features

- **True Scissor Linkage Mechanics** - Authentic Hoberman sphere physics with radial scissor links
- **Breathing Animation** - Smooth expansion and contraction cycles
- **Dynamic Rotation** - Continuous rotation with changing pitch angles
- **Interactive Controls** - Mouse/touch drag to rotate, scroll to zoom
- **Material System** - Toggle between Metallic, Matte, and Glossy materials
- **Color Customization** - Real-time color picker for sphere customization
- **NASA-Grade Graphics** - WebGL-powered rendering with PBR materials and advanced lighting
- **Responsive Design** - Works on desktop and mobile devices

## Technologies Used

- **Three.js** (r128) - 3D graphics library
- **WebGL** - Hardware-accelerated graphics
- **Vanilla JavaScript** - No frameworks, pure ES6+
- **HTML5 & CSS3** - Modern web standards

## Project Structure
```
hoberman-sphere/
├── index.html              # Main HTML file
├── css/
│   └── style.css          # Styling and UI design
├── js/
│   ├── main.js            # Application entry point
│   ├── HobermanSphere.js  # Main sphere class with mechanics
│   ├── ScissorLink.js     # Individual scissor linkage component
│   └── controls.js        # UI and mouse/touch controls
└── README.md              # Project documentation
```

## Getting Started

### Prerequisites

- Modern web browser with WebGL support (Chrome, Firefox, Safari, Edge)
- Local web server (optional, but recommended)

### Installation

1. Clone or download this repository
2. Navigate to the project directory
3. Open `index.html` in your web browser

**OR** use a local server:
```bash
# Using Python 3
python -m http.server 8000

# Using Node.js (http-server)
npx http-server

# Using PHP
php -S localhost:8000
```

Then navigate to `http://localhost:8000` in your browser.

## Usage

### Controls

- **Left Click + Drag** - Rotate the camera view around the sphere
- **Scroll Wheel** - Zoom in and out
- **Start/Pause Button** - Toggle the breathing animation
- **Color Picker** - Change the sphere color in real-time
- **Material Selector** - Switch between Metallic, Matte, and Glossy materials

### Customization

You can modify the sphere parameters in `js/main.js`:
```javascript
hobermanSphere = new HobermanSphere(scene, {
    minRadius: 2,          // Minimum collapsed radius
    maxRadius: 8,          // Maximum expanded radius
    strutRadius: 0.08,     // Thickness of struts
    subdivisions: 2,       // Complexity level (0-3)
    color: 0x00aaff,       // Initial color (hex)
    materialType: 'metallic' // 'metallic', 'matte', or 'glossy'
});
```

## Architecture

### ScissorLink.js

Implements individual scissor linkage units with:
- Pivot joint mechanics
- Crossing strut geometry
- Endpoint calculations
- Expansion/contraction physics

### HobermanSphere.js

Main sphere class that:
- Creates radial scissor links based on icosahedron geometry
- Manages connecting struts between vertices
- Handles breathing animation
- Controls rotation with changing pitch
- Updates materials and colors

### controls.js

Manages all user interactions:
- Custom orbit controls implementation
- Mouse and touch event handling
- UI element event listeners
- Camera positioning with spherical coordinates

### main.js

Application orchestration:
- Three.js scene initialization
- Multi-light lighting system
- Renderer configuration
- Animation loop
- Window resize handling

## Performance

The application is optimized for smooth performance:
- Efficient geometry updates
- Proper material reuse
- Delta time-based animations
- Pixel ratio optimization for retina displays
- Shadow mapping with PCF soft shadows

## Browser Compatibility

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers with WebGL support

## License

This project is open source and available for educational and personal use.

## Acknowledgments

- Inspired by Chuck Hoberman's original Hoberman Sphere design
- Three.js community for excellent documentation
- WebGL for making browser-based 3D graphics possible

## Future Enhancements

Potential improvements:
- Physics-based collision detection
- VR/AR support
- Export functionality (screenshots, 3D models)
- Custom subdivision patterns
- Sound effects synchronized with expansion
- Multiple sphere configurations

## Contributing

Feel free to fork this project and submit pull requests for improvements!

## Author

Created with passion for 3D graphics and mechanical design.

---

**Enjoy exploring the mesmerizing geometry of the Hoberman Sphere! 🎯**
Happy coding 