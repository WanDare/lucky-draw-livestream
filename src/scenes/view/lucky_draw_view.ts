export class LuckyDrawView {
  scene: Phaser.Scene;
  startButton!: Phaser.GameObjects.Image;
  background1!: Phaser.GameObjects.Image;
  background2!: Phaser.GameObjects.Image;
  gamescreen!: Phaser.GameObjects.Image | null;
  bubblegun!: Phaser.GameObjects.Image | null;
  prizenet!: Phaser.GameObjects.Image | null;
  thumbnail!: Phaser.GameObjects.Image;
  transitionOverlay!: Phaser.GameObjects.Rectangle | null;

  onStart?: () => void;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  preload() {
    const images = [
      ["background1", "assets/images/luckygame.png"],
      ["background2", "assets/images/streaming.png"],
      ["Thumbnail", "assets/images/thumbnail.png"],
      ["Gamescreen", "assets/images/game_screen.png"],
      ["Bubblegun", "assets/images/bubble_gun.png"],
      ["Start", "assets/images/start_button.png"],
      ["Opennet", "assets/images/open_net.png"],
      ["Net", "assets/images/net.png"],
      ["Rope", "assets/images/rope.png"],
      ["Prizenet", "assets/images/prize_net.png"],
    ];
    images.forEach(([key, path]) => this.scene.load.image(key, path as string));
  }

  createLayout(_centerX: number, _centerY: number) {
    this.background1 = this.scene.add
      .image(360, 512, "background1")
      .setOrigin(0.5)
      .setDisplaySize(720, 1024)
      .setDepth(-1);

    this.background2 = this.scene.add
      .image(1080, 512, "background2")
      .setOrigin(0.5)
      .setDisplaySize(720, 1024)
      .setDepth(-1);

    this.thumbnail = this.scene.add
      .image(360, 512, "Thumbnail")
      .setOrigin(0.5)
      .setDisplaySize(516, 728)
      .setDepth(1);

    this.startButton = this.scene.add
      .image(360, 960, "Start")
      .setOrigin(0.5)
      .setDisplaySize(150, 80)
      .setDepth(1)
      .setInteractive({ useHandCursor: false });

    this.gamescreen = null;
    this.bubblegun = null;
    this.prizenet = null;

    this.transitionOverlay = this.scene.add
      .rectangle(720, 512, 1440, 1024, 0x000000, 1)
      .setDepth(100)
      .setAlpha(0);

    this.startButton.on("pointerdown", () => {
      if (this.onStart) this.onStart();
    });
  }

  showGameScreen() {
    this.transitionOverlay?.setAlpha(0);
    this.scene.tweens.add({
      targets: this.transitionOverlay,
      alpha: 1,
      duration: 400,
      onComplete: () => {
        this.background1.setVisible(false);
        this.startButton.setVisible(false);
        this.thumbnail.setVisible(false);

        this.gamescreen = this.scene.add
          .image(360, 512, "Gamescreen")
          .setOrigin(0.5)
          .setDisplaySize(720, 1024)
          .setAlpha(0)
          .setDepth(2);

        this.scene.tweens.add({
          targets: this.gamescreen,
          alpha: 1,
          duration: 400,
          ease: "Quad.easeIn",
        });

        this.bubblegun = this.scene.add
          .image(360, 860, "Bubblegun")
          .setOrigin(0.5)
          .setDisplaySize(0, 0)
          .setDepth(2);

        this.prizenet = this.scene.add
          .image(360, 200, "Prizenet")
          .setOrigin(0.5)
          .setDisplaySize(790, 660)
          .setDepth(3);

        this.scene.tweens.add({
          targets: this.bubblegun,
          displayWidth: 183,
          displayHeight: 214,
          duration: 450,
          ease: "Back.Out",
          onComplete: () => {
            this.scene.tweens.add({
              targets: this.transitionOverlay,
              alpha: 0,
              duration: 200,
            });
          },
        });

        this.scene.tweens.add({
          targets: this.transitionOverlay,
          alpha: 0,
          duration: 200,
        });
      },
    });
  }
}
