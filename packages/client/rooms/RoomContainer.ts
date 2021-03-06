import Room from './Room'
import FurnitureSprite from '../furniture/sprite'
import RoomAvatar from "../avatar/avatar";

/**
 * This class contains all the player and furni sprites
 */
export default class RoomContainer extends Phaser.GameObjects.Container {

	private readonly heightmap: number[][]

	public fundationsContainer: Phaser.GameObjects.Container
	public spritesContainer: Phaser.GameObjects.Container

	public _scene: Room

	private static realTileWidth = 64
	private static realTileHeight = 32
	private static tileWidth = RoomContainer.realTileWidth / 2
	private static tileHeight = RoomContainer.realTileHeight / 2

	public constructor(
		scene: Room,
		heightmap: number[][],
		private readonly door: [number, number]
	) {
		super(scene)

		this.heightmap = heightmap;

		this._scene = scene

		this.fundationsContainer = new Phaser.GameObjects.Container(scene)
		this.spritesContainer = new Phaser.GameObjects.Container(scene)

		this.add(this.fundationsContainer)
		this.add(this.spritesContainer)

		this.initializeRoomHeightmap(this.fundationsContainer, this.door, this.heightmap)
	}

	/**
     * 0, 0
     */
	private transpose(a: number[][]): any {
		return Object.keys(a[0]).map((c: any) => {
			return a.map((r: number[]): any => {
				return r[c];
			});
		});
	}

	private mirror(a: number[][]): any {
		return a.map((arr) => { return arr.reverse() })
	}

	private initializeRoomHeightmap(container: Phaser.GameObjects.Container, door: [number, number], heightmap: number[][]) {

		heightmap = this.transpose(this.mirror(heightmap))

		for (let y = 0;y < heightmap.length;y++) {

			for (let x = 0;x < heightmap[y].length;x++) {
				const tileData = heightmap[y][x]

				let screenX = this.getScreenX(x, y)
				let screenY = this.getScreenY(x, y)

				if (tileData !== -1) {

					let floorSprite: Phaser.GameObjects.Image
					let stairRight: Phaser.GameObjects.Image
					let stairTopRight: Phaser.GameObjects.Image
					let stairTopLeft: Phaser.GameObjects.Image
					let stairLeft: Phaser.GameObjects.Image
					let stairBottomLeft: Phaser.GameObjects.Image
					let stairCenter: Phaser.GameObjects.Image
					let stairBottomRight: Phaser.GameObjects.Image

					if (this.isRightStair(tileData, heightmap, y, x)) {
						stairRight = this._scene.add.image(screenX - 1, screenY - (tileData * 32), 'stairs_right')
						stairRight.setOrigin(0, 0)
						stairRight.setInteractive({ pixelPerfect: true })
					}

					else if (this.isLeftStair(tileData, heightmap, y, x)) {
						stairTopRight = this._scene.add.image(screenX + 24, screenY - (tileData * 32), 'stairs_top_right')
						stairTopRight.setOrigin(0, 0)
						stairTopRight.setInteractive({ pixelPerfect: true })
					}

					else if (this.isTopStair(tileData, heightmap[y], x)) {
						stairTopLeft = this._scene.add.image(screenX, screenY - (tileData * 32), 'stairs_top_left')
						stairTopLeft.setOrigin(0, 0)
						stairTopLeft.setInteractive({ pixelPerfect: true })
					}

					else if (this.isBottomStair(tileData, heightmap[y],x )) {
						stairLeft = this._scene.add.image(screenX - 1, screenY - (tileData * 32), 'stairs_left')
						stairLeft.setOrigin(0, 0)
						stairLeft.setInteractive({ pixelPerfect: true })
					}

					else if (this.isTopRightStair(tileData, heightmap, y, x)) {
						stairBottomLeft = this._scene.add.image(screenX, screenY - (tileData * 32) - 15, 'stairs_bottom_left')
						stairBottomLeft.setOrigin(0, 0)
						stairBottomLeft.setInteractive({ pixelPerfect: true })
					}

					else if (this.isTopLeftStair(tileData, heightmap, y, x)) {
						stairCenter = this._scene.add.image(screenX - 1, screenY - (tileData * 32), 'stairs_center')
						stairCenter.setOrigin(0, 0)
						stairCenter.setInteractive({ pixelPerfect: true })
					}

					else if (this.isBottomLeftStair(tileData, heightmap, y, x)) {
						stairBottomRight = this._scene.add.image(screenX, screenY - (tileData * 32) - 15, 'stairs_bottom_right')
						stairBottomRight.setOrigin(0, 0)
						stairBottomRight.setInteractive({ pixelPerfect: true })
					}

					else {
						floorSprite = this._scene.add.image(screenX, screenY - (tileData * 32) + 32, 'tile')
						floorSprite.setOrigin(0, 0)
						floorSprite.setInteractive({ pixelPerfect: true })
					}

					if (x === door[0] && y === door[1]) {
						// console.log(tileX, tileY)
						let door = this._scene.add.image(screenX, screenY - 122, 'door')
						door.setOrigin(0, 0)

						let doorFloor = this._scene.add.image(screenX, screenY - 15, 'door_floor')
						doorFloor.setOrigin(0, 0)

						container.add(doorFloor)
						container.add(door)

					} else {
						if (x < 1) {
							let leftWallSprite = this._scene.add.image(screenX - 8, screenY - 122, 'wall_l')
							leftWallSprite.setOrigin(0, 0)

							container.add(leftWallSprite)
						}

						if (y < 1) {

							let rightWallSprite = this._scene.add.image(screenX + 32, screenY - 122, 'wall_r')
							rightWallSprite.setOrigin(0, 0)

							container.add(rightWallSprite)
						}
					}

					let floorSpriteHover: Phaser.GameObjects.Image

					if (floorSprite !== undefined) {
						floorSprite.on('pointerover', () => {
							floorSpriteHover = this._scene.add.image(floorSprite.x, floorSprite.y - 3, 'tile_hover')
							floorSpriteHover.setOrigin(0, 0)
						})

						floorSprite.on('pointerdown', () => {
							const cartTileCoords = this._scene.isometricToCartesian({ x: floorSprite.x, y: floorSprite.y, z: 0 })
							const destination = this._scene.cartesianToCoords(cartTileCoords)
                            
							this._scene.engine.socket.emit('move', { x: destination.x, y: destination.y })
						})

						floorSprite.on('pointerout', () => {
							floorSpriteHover.destroy()
						})

						container.add(floorSprite)

					}

					if (stairRight !== undefined) {

						stairRight.on('pointerover', () => {
							floorSpriteHover = this._scene.add.image(stairRight.x, stairRight.y - 3 + 32, 'tile_hover')
							floorSpriteHover.setOrigin(0, 0)
						})

						// stairRight.on('pointerdown', () => {
						//     var cartTileCoords = this._scene.isometricToCartesian({ x: stairRight.x, y: stairRight.y, z: 0 })
						//     var destination = this._scene.cartesianToCoords(cartTileCoords)

						//     // this._scene.socket.emit('movePlayer', { x: destination.x, y: destination.y })
						// })

						stairRight.on('pointerout', () => {
							floorSpriteHover.destroy()
						})

						container.add(stairRight)
					}

					if (stairTopRight !== undefined) {

						stairTopRight.on('pointerover', () => {
							floorSpriteHover = this._scene.add.image(stairTopRight.x, stairTopRight.y - 3 + 32, 'tile_hover')
							floorSpriteHover.setOrigin(0, 0)
						})

						// stairRight.on('pointerdown', () => {
						//     var cartTileCoords = this._scene.isometricToCartesian({ x: stairRight.x, y: stairRight.y, z: 0 })
						//     var destination = this._scene.cartesianToCoords(cartTileCoords)

						//     // this._scene.socket.emit('movePlayer', { x: destination.x, y: destination.y })
						// })

						stairTopRight.on('pointerout', () => {
							floorSpriteHover.destroy()
						})

						container.add(stairTopRight)
					}

					if (stairTopLeft !== undefined) {
						stairTopLeft.on('pointerover', () => {
							floorSpriteHover = this._scene.add.image(stairTopLeft.x, stairTopLeft.y - 3, 'tile_hover')
							floorSpriteHover.setOrigin(0, 0)
						})

						// stairRight.on('pointerdown', () => {
						//     var cartTileCoords = this._scene.isometricToCartesian({ x: stairRight.x, y: stairRight.y, z: 0 })
						//     var destination = this._scene.cartesianToCoords(cartTileCoords)

						//     // this._scene.socket.emit('movePlayer', { x: destination.x, y: destination.y })
						// })

						stairTopLeft.on('pointerout', () => {
							floorSpriteHover.destroy()
						})

						container.add(stairTopLeft)
					}

					if (stairLeft !== undefined) {
						stairLeft.on('pointerover', () => {
							floorSpriteHover = this._scene.add.image(stairLeft.x, stairLeft.y - 3 + 32, 'tile_hover')
							floorSpriteHover.setOrigin(0, 0)
						})

						// stairRight.on('pointerdown', () => {
						//     var cartTileCoords = this._scene.isometricToCartesian({ x: stairRight.x, y: stairRight.y, z: 0 })
						//     var destination = this._scene.cartesianToCoords(cartTileCoords)

						//     // this._scene.socket.emit('movePlayer', { x: destination.x, y: destination.y })
						// })

						stairLeft.on('pointerout', () => {
							floorSpriteHover.destroy()
						})

						container.add(stairLeft)
					}

					if (stairBottomLeft !== undefined) {
						stairBottomLeft.on('pointerover', () => {
							floorSpriteHover = this._scene.add.image(stairBottomLeft.x, stairBottomLeft.y - 3 + 32, 'tile_hover')
							floorSpriteHover.setOrigin(0, 0)
						})

						// stairRight.on('pointerdown', () => {
						//     var cartTileCoords = this._scene.isometricToCartesian({ x: stairRight.x, y: stairRight.y, z: 0 })
						//     var destination = this._scene.cartesianToCoords(cartTileCoords)

						//     // this._scene.socket.emit('movePlayer', { x: destination.x, y: destination.y })
						// })

						stairBottomLeft.on('pointerout', () => {
							floorSpriteHover.destroy()
						})

						container.add(stairBottomLeft)
					}

					if (stairCenter !== undefined) {
						stairCenter.on('pointerover', () => {
							floorSpriteHover = this._scene.add.image(stairCenter.x, stairCenter.y - 3 + 32, 'tile_hover')
							floorSpriteHover.setOrigin(0, 0)
						})

						// stairRight.on('pointerdown', () => {
						//     var cartTileCoords = this._scene.isometricToCartesian({ x: stairRight.x, y: stairRight.y, z: 0 })
						//     var destination = this._scene.cartesianToCoords(cartTileCoords)

						//     // this._scene.socket.emit('movePlayer', { x: destination.x, y: destination.y })
						// })

						stairCenter.on('pointerout', () => {
							floorSpriteHover.destroy()
						})

						container.add(stairCenter)
					}

					if (stairBottomRight !== undefined) {
						stairBottomRight.on('pointerover', () => {
							floorSpriteHover = this._scene.add.image(stairBottomRight.x, stairBottomRight.y - 3 + 16, 'tile_hover')
							floorSpriteHover.setOrigin(0, 0)
						})

						// stairRight.on('pointerdown', () => {
						//     var cartTileCoords = this._scene.isometricToCartesian({ x: stairRight.x, y: stairRight.y, z: 0 })
						//     var destination = this._scene.cartesianToCoords(cartTileCoords)

						//     // this._scene.socket.emit('movePlayer', { x: destination.x, y: destination.y })
						// })

						stairBottomRight.on('pointerout', () => {
							floorSpriteHover.destroy()
						})

						container.add(stairBottomRight)
					}


				}
			}
		}
	}

	private isRightStair(currentTile: number, heightmap: number[][], currentTileRowNumber: number, currentTileIndex: number): boolean {
		const rightTile = this.getRightTile(heightmap, currentTileRowNumber, currentTileIndex)
		const deltaTile = rightTile - currentTile

		return deltaTile === 1
	}

	private getRightTile(heightmap: number[][], currentTileRowNumber: number, currentTileIndex: number): number {
		const rightTileRow = currentTileRowNumber - 1

		if (heightmap[rightTileRow] !== undefined) {
			return heightmap[rightTileRow][currentTileIndex]
		}
	}

	private isLeftStair(currentTile: number, heightmap: number[][], currentTileRowNumber: number, currentTileIndex: number): boolean {
		const leftTile = this.getLeftTile(heightmap, currentTileRowNumber, currentTileIndex)
		const deltaTile = leftTile - currentTile

		return deltaTile === 1
	}

	private getLeftTile(heightmap: number[][], currentTileRowNumber: number, currentTileIndex: number): number {
		const leftTileRow = currentTileRowNumber + 1

		if (heightmap[leftTileRow] !== undefined) {
			return heightmap[leftTileRow][currentTileIndex]
		}
	}

	private isTopStair(currentTile: number, currentTileRow: number[], currentTileIndex: number): boolean {
		const topTile = this.getTopTile(currentTileRow, currentTileIndex)
		const deltaTile = topTile - currentTile

		return deltaTile === 1
	}

	private getTopTile(currentTileRow: number[], currentTileIndex: number): number {
		if (currentTileRow !== undefined) {
			return currentTileRow[currentTileIndex + 1]
		}
	}

	private getBottomTile(currentTileRow: number[], currentTileIndex: number): number {
		if (currentTileRow !== undefined) {
			return currentTileRow[currentTileIndex - 1]
		}
	}

	private isBottomStair(currentTile: number, currentTileRow: number[], currentTileIndex: number): boolean {
		const bottomTile = this.getBottomTile(currentTileRow, currentTileIndex)
		const deltaTile = bottomTile - currentTile

		return deltaTile === 1
	}

	private getTopRightTile(heightmap: number[][], currentTileRowNumber: number, currentTileIndex: number): number {
		const topRow = currentTileRowNumber - 1

		if (heightmap[topRow] !== undefined) {
			return heightmap[topRow][currentTileIndex + 1]
		}
	}

	private isTopRightStair(currentTile: number, heightmap: number[][], currentTileRowNumber: number, currentTileIndex: number): boolean {
		const topRightTile = this.getTopRightTile(heightmap, currentTileRowNumber, currentTileIndex)
		const deltaTile = topRightTile - currentTile

		return deltaTile === 1
	}

	private getTopLeftTile(heightmap: number[][], currentTileRowNumber: number, currentTileIndex: number): number {
		const topRow = currentTileRowNumber - 1

		if (heightmap[topRow] !== undefined) {
			return heightmap[topRow][currentTileIndex - 1]
		}
	}

	private isTopLeftStair(currentTile: number, heightmap: number[][], currentTileRowNumber: number, currentTileIndex: number): boolean {
		const topLeftTile = this.getTopLeftTile(heightmap, currentTileRowNumber, currentTileIndex)
		const deltaTile = topLeftTile - currentTile

		return deltaTile === 1
	}

	private getBottomLeftTile(heightmap: number[][], currentTileRowNumber: number, currentTileIndex: number): number {
		const topRow = currentTileRowNumber + 1

		if (heightmap[topRow] !== undefined) {
			return heightmap[topRow][currentTileIndex - 1]
		}
	}

	private isBottomLeftStair(currentTile: number, heightmap: number[][], currentTileRowNumber: number, currentTileIndex: number): boolean {
		const bottomLeftTile = this.getBottomLeftTile(heightmap, currentTileRowNumber, currentTileIndex)
		const deltaTile = bottomLeftTile - currentTile

		return deltaTile === 1
	}

	private getScreenX(x: number, y: number): number {
		return x * RoomContainer.tileWidth - y * RoomContainer.tileWidth
	}

	private getScreenXWithZ(x: number, y: number, z: number): number {
		return this.getScreenX(x, y)
	}

	private getScreenY(x: number, y: number): number {
		return x * RoomContainer.tileHeight + y * RoomContainer.tileHeight
	}

	private getScreenYWithZ(x: number, y: number, z: number): number {
		return this.getScreenY(x, y) - z * RoomContainer.tileWidth
	}

	private getScreenZ(z: number): number {
		return z * RoomContainer.tileHeight
	}

	public addFurnitureSprite(furnitureSprite: FurnitureSprite, roomX: number, roomY: number, roomZ: number) {
		// Offset / Positioning of each Furniture (Container)
		furnitureSprite.x = this.getScreenX(roomX, roomY) + 32
		furnitureSprite.y = this.getScreenY(roomX, roomY) + 16
		furnitureSprite.y -= this.getScreenZ(roomZ)

		furnitureSprite.setDepth(roomX + roomY + roomZ)

		furnitureSprite.setInteractive({ pixelPerfect: true })

		this.spritesContainer.add(furnitureSprite)
		this.spritesContainer.sort('depth')

	}

	public addRoomAvatar(roomAvatar: RoomAvatar) {
		// Offset / Positioning of each Furniture (Container)

		roomAvatar.setDepth(roomAvatar.x + roomAvatar.y + roomAvatar.z)

		let tmpX = roomAvatar.RenderPos.x
		let tmpY = roomAvatar.RenderPos.y

		roomAvatar.x = tmpX
		roomAvatar.y = tmpY

		this.spritesContainer.add(roomAvatar)
		this.spritesContainer.sort('depth')
	}

	public start() {
		this.spritesContainer.getAll().forEach((furnitureSprite) => {
			(furnitureSprite as FurnitureSprite).start()
		})
	}

	public stop() {
		this.spritesContainer.getAll().forEach((furnitureSprite) => {
			(furnitureSprite as FurnitureSprite).stop()
		})
	}
}
