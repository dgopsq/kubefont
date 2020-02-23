import React, { createRef } from 'react'
import * as THREE from 'three'

interface IKubefontProps {
  text: string
  textFontUrl: string
  textColor: string
  cameraDistance: number

  cubesColor: string
  particlesNumber: number
  scattering: number

  backgroundColor: string

  useGyroscope: boolean
  GyroscopeRequestComponent?: (makeRequest: () => void) => React.ReactNode
}

interface IKubefontState {
  gyroscopeGranted: boolean
}

class Kubefont extends React.Component<IKubefontProps, IKubefontState> {
  // The HTML container
  private readonly containerRef = createRef<HTMLDivElement>()

  // Internal scattering value
  private readonly scatteringLevel = 400

  // Coordinates used in the movement events
  private readonly devicePosition = new THREE.Vector2()
  private readonly deviceRotation = new THREE.Vector2()

  private gyroscopeFirstPosition: THREE.Vector2 | null = null

  // Default props
  static defaultProps = {
    textColor: '#dddddd',
    cameraDistance: 400,

    cubesColor: '#dddddd',
    particlesNumber: 50,
    scattering: 1.5,

    backgroundColor: '#000000',

    useGyroscope: false,
  }

  // Component state
  readonly state: IKubefontState = {
    gyroscopeGranted: false,
  }

  /**
   * Convert a color string in HEX format into
   * an HEX number
   */
  private _hexStrToNum(str: string) {
    return parseInt(str.substr(1), 16)
  }

  /**
   * A function that wraps ThreeJS's FontLoader method
   * using promises
   */
  private _loadFont(font: string) {
    return new Promise<THREE.Font>(resolve => {
      const loader = new THREE.FontLoader()
      loader.load(font, font => resolve(font))
    })
  }

  /**
   * Generate the text mesh
   */
  private _generateTextMesh(text: string, font: THREE.Font, color: number) {
    const textGeometry = new THREE.TextGeometry(text, {
      font: font,
      size: 70,
      height: 10,
      curveSegments: 100,
      bevelEnabled: false,
    })

    const textMaterial = new THREE.MeshPhongMaterial({
      color: color,
      emissive: color,
      emissiveIntensity: 0.8,
    })

    const textMesh = new THREE.Mesh(textGeometry, textMaterial)
    textMesh.geometry.center()

    return textMesh
  }

  /**
   * Generate the cube mesh
   */
  private _generateCubeMesh(color: number) {
    const cubeGeometry = new THREE.BoxBufferGeometry(20, 20, 20)

    const cubeMaterial = new THREE.MeshLambertMaterial({
      color: color,
      emissive: color,
      emissiveIntensity: 0.2,
    })

    const cubeMesh = new THREE.Mesh(cubeGeometry, cubeMaterial)

    return cubeMesh
  }

  /**
   * Randomize the position and rotation of a mesh
   */
  private _randomPositionMesh(
    mesh: THREE.Mesh,
    scattering: number,
    scatteringLevel: number,
  ) {
    mesh.position.x =
      Math.random() * scatteringLevel * scattering -
      (scatteringLevel * scattering) / 2
    mesh.position.y =
      Math.random() * scatteringLevel * scattering -
      (scatteringLevel * scattering) / 2
    mesh.position.z =
      Math.random() * scatteringLevel * scattering -
      (scatteringLevel * scattering) / 2

    mesh.rotation.x = Math.random() * 1 * Math.PI
    mesh.rotation.y = Math.random() * 1 * Math.PI
    mesh.rotation.z = Math.random() * 1 * Math.PI

    return mesh
  }

  /**
   * Handle the mouse movement
   */
  private _handleMouseMove(event: MouseEvent) {
    if (!this.containerRef.current) return
    const container = this.containerRef.current

    const hwx = container.clientWidth / 2
    const hwy = container.clientHeight / 2

    const dx = event.clientX - hwx
    const dy = event.clientY - hwy

    const panSpeed = 0.2
    const rotateSpeed = 0.001

    this.devicePosition.x = 1 - dx * panSpeed
    this.devicePosition.y = 1 - dy * panSpeed

    this.deviceRotation.x = dy * rotateSpeed
    this.deviceRotation.y = -dx * rotateSpeed
  }

  /**
   * Handle the device orientation (gyroscope)
   */
  private _handleDeviceMove(event: DeviceOrientationEvent) {
    const alpha = event.alpha || 0
    const beta = event.beta || 0

    const cx = (alpha + 150) % 360
    const cy = (beta + 150) % 360

    if (this.gyroscopeFirstPosition === null) {
      this.gyroscopeFirstPosition = new THREE.Vector2(cx, cy)
    }

    const dx = -(cx - this.gyroscopeFirstPosition.x)
    const dy = -(cy - this.gyroscopeFirstPosition.y)

    const panSpeed = 0.5
    const rotateSpeed = 0.05

    this.devicePosition.x = dx * panSpeed
    this.devicePosition.y = dy * panSpeed

    this.deviceRotation.x = -dy * rotateSpeed
    this.deviceRotation.y = -dx * rotateSpeed
  }

  /**
   * Helper method to get the gyroscope permission
   * and set the event
   */
  private _setGyroscopeEvent() {
    const requestPermission = (window.DeviceOrientationEvent as any)
      .requestPermission

    if (typeof requestPermission === 'function') {
      requestPermission()
        .then((permission: string) => {
          if (permission !== 'granted')
            return Promise.reject('DeviceOrientationEvent not granted')

          window.addEventListener(
            'deviceorientation',
            this._handleDeviceMove.bind(this),
          )

          this.setState({ gyroscopeGranted: true })

          return Promise.resolve()
        })
        .catch(console.warn)
    } else {
      this.setState({ gyroscopeGranted: true })

      window.addEventListener(
        'deviceorientation',
        this._handleDeviceMove.bind(this),
      )
    }
  }

  /**
   * Initialize all the events
   */
  private _setEvents(container: HTMLDivElement) {
    if (this.props.useGyroscope && window.DeviceOrientationEvent)
      this._setGyroscopeEvent()
    else
      container.addEventListener('mousemove', this._handleMouseMove.bind(this))
  }

  async componentDidMount() {
    const { props } = this

    if (!this.containerRef.current) return
    const container = this.containerRef.current

    // Initialize the scene
    const scene = new THREE.Scene()
    const hexSceneBackground = this._hexStrToNum(props.backgroundColor)
    scene.fog = new THREE.FogExp2(hexSceneBackground, 0.0025)

    // Initialize the camera
    const camera = new THREE.PerspectiveCamera(
      75,
      container.clientWidth / container.clientHeight,
      0.1,
      1000,
    )

    // Initialize the renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
    })

    renderer.setClearColor(0x000000)
    renderer.setSize(container.clientWidth, container.clientHeight)
    renderer.setSize(container.clientWidth, container.clientHeight)
    container.appendChild(renderer.domElement)

    //Text
    const textFont = await this._loadFont(props.textFontUrl)
    const hexTextColor = this._hexStrToNum(props.textColor)
    const text = this._generateTextMesh(props.text, textFont, hexTextColor)

    scene.add(text)

    // Center the camera to the text
    camera.position.x = text.position.x
    camera.position.y = text.position.y - 200
    camera.position.z = props.cameraDistance

    // Particles
    const hexCubeColor = this._hexStrToNum(props.cubesColor)

    for (let i = 0; i < props.particlesNumber; i++) {
      const cubeMesh = this._generateCubeMesh(hexCubeColor)
      const positionedCube = this._randomPositionMesh(
        cubeMesh,
        props.scattering,
        this.scatteringLevel,
      )

      scene.add(positionedCube)
    }

    // Lights
    const centerLight = new THREE.PointLight(0xffffff, 2)

    centerLight.position
      .set(camera.position.x, camera.position.y, camera.position.z)
      .normalize()

    scene.add(centerLight)

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate)

      camera.position.x = this.devicePosition.x
      camera.position.y = this.devicePosition.y

      camera.rotation.x = this.deviceRotation.x
      camera.rotation.y = this.deviceRotation.y

      renderer.render(scene, camera)
    }

    animate()

    // Initialize all the events
    this._setEvents(container)
  }

  render() {
    const { props, state } = this

    return (
      <div
        ref={this.containerRef}
        className='wrapper'
        style={{ position: 'relative', width: '100%', height: '100%' }}
      >
        {props.useGyroscope &&
          !state.gyroscopeGranted &&
          props.GyroscopeRequestComponent &&
          props.GyroscopeRequestComponent(this._setGyroscopeEvent.bind(this))}
      </div>
    )
  }
}

export default Kubefont
