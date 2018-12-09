// import * as THREE from '../node_modules/three'

const TABLE_SIZE = { w: 120, h: 8, d: 60 }
const TABLE_LEG_POS = { x: 50, y: -15, z: 20 }

function GameWorld(id) {
    this.id = id
    this.scene = new THREE.Scene()
    this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000)
    this.mejaGroup = new THREE.Group()

    this.renderer = new THREE.WebGLRenderer({ antialias: true })
    this.renderer.shadowMap.enabled = true
    this.renderer.setClearColor(0xFFFFFF)
    this.renderer.setSize(window.innerWidth, window.innerHeight)

    this.referee = new THREE.Group()

    this.camera.position.x = 0
    this.camera.position.y = 60
    this.camera.position.z = 100
    this.camera.lookAt(this.scene.position)
    document.getElementById('WebGL-output').appendChild(this.renderer.domElement)
}

GameWorld.prototype.createLighting = function () {
    let light = new THREE.AmbientLight(0x111111, 0.2)
    this.scene.add(light)

    let dirLight = new THREE.DirectionalLight(0xffffff, 1.0)
    dirLight.color.setHSL(0.1, 1, 0.95)
    dirLight.position.set(-1, 1.75, 1)
    dirLight.position.multiplyScalar(30)
    dirLight.castShadow = true
    this.scene.add(dirLight)

    let dirLight2 = new THREE.DirectionalLight(0xffffff, 1.0)
    dirLight2.color.setHSL(0.1, 1, 0.95)
    dirLight2.position.set(1, 1.75, 1)
    dirLight2.position.multiplyScalar(30)
    dirLight2.castShadow = true
    this.scene.add(dirLight2)
}

GameWorld.prototype.createSetMeja = function () {
    // buat bagian meja utama (ada map lapangan)
    let loader = new THREE.TextureLoader()
    loader.load('assets/tennis_court_grass.jpg', (function (texture) {
        let mainMejaGeom = new THREE.BoxGeometry(TABLE_SIZE.w, TABLE_SIZE.h, TABLE_SIZE.d)
        let textureFace = new THREE.MeshLambertMaterial({})
        textureFace.map = texture
        let materials = [
            new THREE.MeshLambertMaterial({ color: 0x565243 }),
            new THREE.MeshLambertMaterial({ color: 0x565243 }),
            textureFace,
            new THREE.MeshLambertMaterial({ color: 0x565243 }),
            new THREE.MeshLambertMaterial({ color: 0x565243 }),
            new THREE.MeshLambertMaterial({ color: 0x565243 }),
        ]
        let meja = new THREE.Mesh(mainMejaGeom, materials)
        meja.position.set(0, 0, 0)
        meja.castShadow = true
        meja.receiveShadow = true
        meja.name = 'mejaUtama'
        this.mejaGroup.add(meja)
    }).bind(this))

    // buat tepian meja
    let smaller = new THREE.Mesh(
        new THREE.BoxGeometry(TABLE_SIZE.w, TABLE_SIZE.h + 4, TABLE_SIZE.d),
        new THREE.MeshLambertMaterial({ color: 0x542a07 }))

    let bigger = new THREE.Mesh(
        new THREE.BoxGeometry(TABLE_SIZE.w + 5, TABLE_SIZE.h + 4, TABLE_SIZE.d + 5),
        new THREE.MeshLambertMaterial({ color: 0x542a07 }))

    let biggerBSP = new ThreeBSP(bigger)
    let cubeBSP = new ThreeBSP(smaller)
    let resultBSP = biggerBSP.subtract(cubeBSP)
    let border = resultBSP.toMesh()
    border.position.set(0, 2, 0)
    border.material = new THREE.MeshLambertMaterial({ color: 0x565243 })
    border.geometry.computeFaceNormals()
    border.geometry.computeVertexNormals()
    border.name = 'tepianMeja'
    this.mejaGroup.add(border)

    // buat kaki meja
    let positions = [[-1, 1], [1, 1], [1, -1], [-1, -1]]
    positions.forEach(position => {
        let tableLeg = new THREE.Mesh(
            new THREE.BoxGeometry(8, 30, 8),
            new THREE.MeshLambertMaterial({ color: 0x352421 }))
        tableLeg.castShadow = true
        tableLeg.position.set(TABLE_LEG_POS.x * position[0], TABLE_LEG_POS.y, TABLE_LEG_POS.z * position[1])
        tableLeg.name = `kakiMeja${position[0]}${position[1]}`
        this.mejaGroup.add(tableLeg)
    })
    this.scene.add(this.mejaGroup)
}

GameWorld.prototype.createReferee = function () {
    //kepala wasit
    let headMaterial = [
        new THREE.MeshLambertMaterial({
            map: new THREE.TextureLoader().load('assets/head_right.jpg')
        }),
        new THREE.MeshLambertMaterial({
            map: new THREE.TextureLoader().load('assets/head_left.jpg')
        }),
        new THREE.MeshLambertMaterial({
            map: new THREE.TextureLoader().load('assets/head_top.jpg')
        }),
        new THREE.MeshLambertMaterial({
            map: new THREE.TextureLoader().load('assets/head_bottom.jpg')
        }),
        new THREE.MeshLambertMaterial({
            map: new THREE.TextureLoader().load('assets/head_front.jpg')
        }),
        new THREE.MeshLambertMaterial({
            map: new THREE.TextureLoader().load('assets/head_back.jpg')
        })
    ]
    let refHead = new THREE.Mesh(new THREE.BoxGeometry(15, 15, 15), headMaterial)
    refHead.name = 'refHead'
    refHead.position.set(0, 30, -60)
    refHead.castShadow = true
    this.referee.add(refHead)

    //badan wasit
    let bodyMaterial = [
        new THREE.MeshLambertMaterial({
            map: new THREE.TextureLoader().load('assets/body_right.jpg')
        }),
        new THREE.MeshLambertMaterial({
            map: new THREE.TextureLoader().load('assets/body_left.jpg')
        }),
        new THREE.MeshLambertMaterial({
            map: new THREE.TextureLoader().load('assets/body_top.jpg')
        }),
        new THREE.MeshLambertMaterial({
            map: new THREE.TextureLoader().load('assets/body_bottom.jpg')
        }),
        new THREE.MeshLambertMaterial({
            map: new THREE.TextureLoader().load('assets/body_front.jpg')
        }),
        new THREE.MeshLambertMaterial({
            map: new THREE.TextureLoader().load('assets/body_back.jpg')
        })
    ]
    let refBody = new THREE.Mesh(new THREE.BoxGeometry(35, 25, 5), bodyMaterial)
    refBody.name = 'refBody'
    refBody.position.set(0, 10, -60)
    refBody.castShadow = true
    this.referee.add(refBody)

    //kaki wasit
    let legMaterial = [
        new THREE.MeshLambertMaterial({
            map: new THREE.TextureLoader().load('assets/leg_right.jpg')
        }),
        new THREE.MeshLambertMaterial({
            map: new THREE.TextureLoader().load('assets/leg_left.jpg')
        }),
        new THREE.MeshLambertMaterial({
            map: new THREE.TextureLoader().load('assets/leg_bottom.jpg')
        }),
        new THREE.MeshLambertMaterial({
            map: new THREE.TextureLoader().load('assets/leg_bottom.jpg')
        }),
        new THREE.MeshLambertMaterial({
            map: new THREE.TextureLoader().load('assets/leg_front.jpg')
        }),
        new THREE.MeshLambertMaterial({
            map: new THREE.TextureLoader().load('assets/leg_back.jpg')
        })
    ]
    let refLeg = new THREE.Mesh(new THREE.BoxGeometry(15, 25, 5), legMaterial)
    refLeg.name = 'refLeg'
    refLeg.position.set(0, -15, -60)
    refLeg.castShadow = true
    this.referee.add(refLeg)

    this.scene.add(this.referee)
}

GameWorld.prototype.initWorld = function () {
    this.createSetMeja()
    this.createLighting()
    this.createReferee()
}

GameWorld.prototype.render = function () {
    requestAnimationFrame(this.render.bind(this))
    this.renderer.render(this.scene, this.camera)
}

window.onload = function () {
    let temp = new GameWorld(1)
    temp.initWorld()
    temp.render()
    console.log(temp)
}