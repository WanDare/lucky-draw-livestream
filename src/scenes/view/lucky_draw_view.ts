export class LuckyDrawView {
  scene: Phaser.Scene;
  private onRefresh?: () => void;
  // UI components
  wheel!: Phaser.GameObjects.Image;
  frame!: Phaser.GameObjects.Image;
  energy!: Phaser.GameObjects.Image;
  spinButton!: Phaser.GameObjects.Sprite;
  numberText!: Phaser.GameObjects.Text;

  // Popup components
  popupOverlay!: Phaser.GameObjects.Rectangle;
  resultPopupBg!: Phaser.GameObjects.Image;
  resultPrizeImg?: Phaser.GameObjects.Image;
  resultPopupText!: Phaser.GameObjects.Text;
  resultYouWonText!: Phaser.GameObjects.Text;
  resultCloseBtn!: Phaser.GameObjects.Image;

  // Side buttons, you can further modularize these if desired
  leftPanel: Phaser.GameObjects.Image[] = [];
  rightPanel: Phaser.GameObjects.Image[] = [];

  constructor(scene: Phaser.Scene, onRefresh?: () => void) {
    this.scene = scene;
    this.onRefresh = onRefresh;
  }

  preload() {
    // Images, motions, prizes...
    const images = [
      // Core
      ["background1", "assets/images/luckygame.png"],
      ["background2", "assets/images/streaming.png"],
      ["Thumbnail", "assets/images/thumbnail.png"],
      // Controls
      ["Start", "assets/images/start_button.png"],
      ["Reset", "assets/icons/reset.png"],
      ["Refresh", "assets/icons/refresh.png"],
      ["Soundoff", "assets/icons/sound_off.png"],
      ["Soundon", "assets/icons/sound_on.png"],
      ["Fullscreen", "assets/icons/fullscreen.png"],
      ["Gift", "assets/icons/gift.png"],
      ["Energy", "assets/images/energy.png"],
      ["Increase", "assets/icons/increase.png"],
      ["Decrease", "assets/icons/decrease.png"],
      ["Divider", "assets/images/divider.png"],
      // Motions
      ["spin_1", "assets/motions/motion1.png"],
      ["spin_2", "assets/motions/motion2.png"],
      ["spin_3", "assets/motions/motion3.png"],
      ["spin_4", "assets/motions/motion4.png"],
      // Prizes
      ["prize1", "assets/prizes/prize1.png"],
      ["prize2", "assets/prizes/prize2.png"],
      ["prize3", "assets/prizes/prize3.png"],
      ["prize4", "assets/prizes/prize4.png"],
      ["prize5", "assets/prizes/prize5.png"],
      ["prize6", "assets/prizes/prize6.png"],
      ["prize7", "assets/prizes/prize7.png"],
    ];
    images.forEach(([key, path]) => this.scene.load.image(key, path as string));
  }

  createLayout(centerX: number, centerY: number) {
    this.scene.add
      .image(360, 512, "background1")
      .setOrigin(0.5)
      .setDisplaySize(720, 1024)
      .setDepth(-1);

    this.scene.add
      .image(1080, 512, "background2")
      .setOrigin(0.5)
      .setDisplaySize(720, 1024)
      .setDepth(-1);

    this.scene.add
      .image(360, 512, "Thumbnail")
      .setOrigin(0.5)
      .setDisplaySize(516, 728)
      .setDepth(1);

    this.scene.add
      .image(360, 960, "Start")
      .setOrigin(0.5)
      .setDisplaySize(150, 80)
      .setDepth(1);
  }
}
