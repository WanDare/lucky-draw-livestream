import Phaser from "phaser";
import type { PrizeInfo } from "../model/lucky_draw_model";

export class LuckyDrawView {
  scene: Phaser.Scene;
  // UI Elements
  startButton!: Phaser.GameObjects.Image;
  background1!: Phaser.GameObjects.Image;
  background2!: Phaser.GameObjects.Image;
  gamescreen!: Phaser.GameObjects.Image | null;
  bubblegun!: Phaser.GameObjects.Image | null;
  prizenet!: Phaser.GameObjects.Image | null;
  thumbnail!: Phaser.GameObjects.Image;
  transitionOverlay!: Phaser.GameObjects.Rectangle | null;
  collectedPrizeGraphics: Phaser.GameObjects.Container[] = [];
  // Event
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
      ["Ball", "/assets/images/ball_prize.png"],
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
      .setInteractive({
        useHandCursor: false,
        cursor: "url('/assets/images/cursor_hand.png'), pointer",
      });

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

  showGameScreen(dropBalls: () => void) {
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
              onComplete: dropBalls,
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

  showStageLabel?(label: string) {
    const text = this.scene.add
      .text(720, 80, label, {
        font: "bold 38px Arial",
        color: "#fff080",
        align: "center",
      })
      .setOrigin(0.5)
      .setDepth(200);
    this.scene.tweens.add({
      targets: text,
      alpha: 0,
      delay: 1200,
      duration: 400,
      onComplete: () => text.destroy(),
    });
  }

  showStageComplete?(onDone: () => void) {
    const text = this.scene.add
      .text(720, 512, "STAGE COMPLETE!", {
        font: "bold 54px Arial",
        color: "#00ffae",
        align: "center",
      })
      .setOrigin(0.5)
      .setDepth(200);
    this.scene.tweens.add({
      targets: text,
      alpha: 0,
      delay: 900,
      duration: 500,
      onComplete: () => {
        text.destroy();
        onDone();
      },
    });
  }

  showGameComplete?() {
    const text = this.scene.add
      .text(720, 512, "YOU WIN!", {
        font: "bold 60px Arial",
        color: "#FFD700",
        align: "center",
      })
      .setOrigin(0.5)
      .setDepth(200);
  }

  renderPrizePanel(prizes: PrizeInfo[]) {
    this.collectedPrizeGraphics.forEach((c) => c.destroy());
    this.collectedPrizeGraphics = [];

    const columns = 3;
    const cardSpacingX = 240;
    const cardSpacingY = 95;
    const baseX = 840;
    const baseY = 270;

    prizes.forEach((prize, i) => {
      const col = i % columns;
      const row = Math.floor(i / columns);
      const x = baseX + col * cardSpacingX;
      const y = baseY + row * cardSpacingY;
      const card = this.createPrizeCard(x, y, prize);
      this.collectedPrizeGraphics.push(card);
    });
  }

  createPrizeCard(
    x: number,
    y: number,
    prize: PrizeInfo
  ): Phaser.GameObjects.Container {
    const width = 220;
    const height = 65;
    const borderRadius = 16;

    // Draw rounded rectangle with glow
    const cardBg = this.scene.add.graphics();
    cardBg.lineStyle(4, 0xf9ffb2, 0.85);
    cardBg.strokeRoundedRect(
      -width / 2,
      -height / 2,
      width,
      height,
      borderRadius
    );
    cardBg.fillStyle(0x214e16, 1);
    cardBg.fillRoundedRect(
      -width / 2,
      -height / 2,
      width,
      height,
      borderRadius
    );

    // Name text
    const nameText = this.scene.add
      .text(0, -13, prize.name, {
        font: "bold 18px Arial",
        color: "#ffffff",
        align: "center",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    // Phone text
    const phoneText = this.scene.add
      .text(0, 15, prize.phone, {
        font: "bold 20px Arial",
        color: "#ffffff",
        align: "center",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    // Group together
    const container = this.scene.add.container(x, y, [
      cardBg,
      nameText,
      phoneText,
    ]);
    container.setDepth(22);
    // Pop-in animation
    container.setScale(0.7).setAlpha(0);
    this.scene.tweens.add({
      targets: container,
      alpha: 1,
      scale: 1,
      duration: 200,
      ease: "Back.Out",
    });

    return container;
  }
}
