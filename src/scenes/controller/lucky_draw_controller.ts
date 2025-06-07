import type { PrizeModel, PrizeInfo } from "../model/lucky_draw_model";
import type { LuckyDrawView } from "../view/lucky_draw_view";

export class LuckyDrawController {
  private model: PrizeModel;
  private view: LuckyDrawView;
  private scene: Phaser.Scene;

  // Stage config
  private stages = [
    { count: 15, label: "Stage 1: Collect 15" },
    { count: 9, label: "Stage 2: Collect 9" },
    { count: 6, label: "Final Stage: Collect 6" },
  ];
  private currentStage = 0;
  private maxCollect = 0;

  constructor(model: PrizeModel, view: LuckyDrawView, scene: Phaser.Scene) {
    this.model = model;
    this.view = view;
    this.scene = scene;

    this.view.onStart = () => this.onStartGame();
  }

  onStartGame() {
    this.currentStage = 0;
    this.startStage(this.currentStage);
  }

  startStage(stageIdx: number) {
    this.model.clearPrizes();
    this.view.renderPrizePanel(this.model.getPrizes());

    this.maxCollect = this.stages[stageIdx].count;

    // Optionally show stage label, could add a view method for banners, etc
    this.view.showStageLabel?.(this.stages[stageIdx].label);

    // Drop way more balls than you need, to allow missed clicks
    this.view.showGameScreen(() => this.dropBalls(this.maxCollect * 7));
  }

  dropBalls(count: number = 10) {
    for (let i = 0; i < count; i++) {
      const x = Phaser.Math.Between(20, 675);
      const y = -40;
      const ball = this.scene.add
        .image(x, y, "Ball")
        .setOrigin(0.5)
        .setDisplaySize(250, 250)
        .setDepth(5)
        .setInteractive({ useHandCursor: true });

      const prizeName = "LEE SIVE HENG";
      const prizePhone = "855 96XXXXXX98";

      this.scene.tweens.add({
        targets: ball,
        y: 1000,
        ease: "Sine.easeInOut",
        duration: Phaser.Math.Between(15000, 4500),
        delay: Phaser.Math.Between(0, 700),
        onComplete: () => {
          if (ball.active) ball.destroy();
        },
      });

      ball.on("pointerdown", () => {
        if (this.model.getPrizes().length >= this.maxCollect) return; // prevent over-collect
        ball.disableInteractive();
        this.collectPrizeWithAnimation(ball, {
          name: prizeName,
          phone: prizePhone,
        });
      });
    }
  }

  collectPrizeWithAnimation(ball: Phaser.GameObjects.Image, prize: PrizeInfo) {
    const destX = 900 + (this.model.getPrizes().length % 3) * 240;
    const destY = 270 + Math.floor(this.model.getPrizes().length / 3) * 95;

    const flyBall = this.scene.add
      .image(ball.x, ball.y, "Ball")
      .setOrigin(0.5)
      .setDisplaySize(70, 70)
      .setDepth(20);

    this.scene.tweens.add({
      targets: flyBall,
      x: destX,
      y: destY,
      scale: 1.3,
      alpha: 0.6,
      duration: 700,
      ease: "Cubic.easeIn",
      onComplete: () => {
        flyBall.destroy();
        this.model.addPrize(prize);
        this.view.renderPrizePanel(this.model.getPrizes());
        if (this.model.getPrizes().length >= this.maxCollect) {
          this.onStageComplete();
        }
      },
    });

    this.scene.tweens.add({
      targets: ball,
      scale: 1.4,
      alpha: 0,
      duration: 200,
      onComplete: () => ball.destroy(),
    });
  }

  onStageComplete() {
    this.currentStage += 1;
    if (this.currentStage < this.stages.length) {

      this.view.showStageComplete?.(() => {
        this.startStage(this.currentStage);
      });
    } else {
      this.view.showGameComplete?.();
    }
  }
}
