import { API_BASE_URL } from "../utils/constants";
import type { PrizeModel, PrizeInfo } from "../model/lucky_draw_model";
import type { LuckyDrawView } from "../view/lucky_draw_view";

export class LuckyDrawController {
  private model: PrizeModel;
  private view: LuckyDrawView;
  private scene: Phaser.Scene;
  private isCollectingPrize = false;

  private stages = [
    { count: 15, label: "Stage 1: Collect 15 Ticket" },
    { count: 9, label: "Stage 2: Collect 9 Ticket" },
    { count: 6, label: "Final Stage: Collect 6 Ticket" },
  ];

  stagePrizes = [
    { image: "Prize", name: "Sakkin Aajiro Small Box", value: "34 ​​រង្វាន់" },
    { image: "Prize2", name: "Sakkin Aajiro Box", value: "24 ​រង្វាន់" },
    { image: "Prize3", name: "$10 Gift Card", value: "12 ​​រង្វាន់" },
  ];
  private currentStage = 0;
  private maxCollect = 0;

  private ballPairs: {
    ball: Phaser.GameObjects.Image;
    tween: Phaser.Tweens.Tween;
  }[] = [];

  constructor(model: PrizeModel, view: LuckyDrawView, scene: Phaser.Scene) {
    this.model = model;
    this.view = view;
    this.scene = scene;

    this.view.onStart = () => this.onStartGame();
    this.view.onPopupClosed = () => {
      this.isCollectingPrize = false;
      this.resumeAllBalls();
    };
  }

  clearAllBalls() {
    this.ballPairs.forEach((pair) => {
      if (pair.tween && pair.tween.isPlaying()) {
        pair.tween.stop();
      }
      if (pair.ball && pair.ball.active) {
        pair.ball.destroy();
      }
    });
    this.ballPairs = [];
  }

  onStartGame() {
    this.currentStage = 0;
    this.startStage(this.currentStage);
  }

  startStage(stageIdx: number) {
    this.clearAllBalls();

    this.model.clearPrizes();
    this.view.renderPrizePanel(this.model.getPrizes());
    this.maxCollect = this.stages[stageIdx].count;
    this.view.showStageLabel?.(this.stages[stageIdx].label);
    this.view.showGameScreen(() => this.dropBalls(this.maxCollect * 20));
    this.view.showStagePrize(this.stagePrizes[stageIdx]);
  }

  async fetchRandomPrizeInfo(): Promise<PrizeInfo> {
    const res = await fetch(
      `${API_BASE_URL}/064452bf-cb44-41ff-babb-824d7051cfde`
    );
    if (!res.ok) throw new Error("Failed to fetch prize info");
    const data = await res.json();
    if (Array.isArray(data)) {
      return data[Math.floor(Math.random() * data.length)];
    }
    return data as PrizeInfo;
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

      const ballTween = this.scene.tweens.add({
        targets: ball,
        y: 1000,
        ease: "Sine.easeInOut",
        duration: Phaser.Math.Between(25000, 4500),
        delay: Phaser.Math.Between(0, 700),
        onComplete: () => {
          this.ballPairs = this.ballPairs.filter((pair) => pair.ball !== ball);
          if (ball.active) ball.destroy();
        },
      });

      this.ballPairs.push({ ball, tween: ballTween });

      ball.on("pointerdown", async () => {
        if (
          this.isCollectingPrize ||
          this.model.getPrizes().length >= this.maxCollect
        )
          return;
        this.isCollectingPrize = true;
        ball.disableInteractive();
        try {
          const prize = await this.fetchRandomPrizeInfo();
          this.collectPrizeWithAnimation(ball, prize);
        } catch (e) {
          ball.setInteractive({ useHandCursor: true });
          this.isCollectingPrize = false;
          console.error("Prize fetch failed", e);
        }
      });
    }
  }

  collectPrizeWithAnimation(ball: Phaser.GameObjects.Image, prize: PrizeInfo) {
    this.pauseAllBalls();
    this.view.showPrizeCongratulation(prize);

    const destX = 900 + (this.model.getPrizes().length % 3) * 240;
    const destY = 270 + Math.floor(this.model.getPrizes().length / 3) * 95;

    const flyBall = this.scene.add
      .image(ball.x, ball.y, "Ball")
      .setOrigin(0.5)
      .setDisplaySize(90, 90)
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
      onComplete: () => {
        ball.destroy();
        this.ballPairs = this.ballPairs.filter((pair) => pair.ball !== ball);
      },
    });
  }

  pauseAllBalls() {
    this.ballPairs.forEach((pair) => {
      if (pair.ball.active && pair.tween && !pair.tween.paused) {
        pair.tween.pause();
        pair.ball.disableInteractive();
      }
    });
  }

  resumeAllBalls() {
    this.ballPairs.forEach((pair) => {
      if (pair.ball.active && pair.tween && pair.tween.paused) {
        pair.tween.resume();
        pair.ball.setInteractive({ useHandCursor: true });
      }
    });
  }

  onStageComplete() {
    this.clearAllBalls();
    const prizesThisStage = this.model.getPrizes();

    // Show the winner panel (collected prizes/winners)
    this.view.showStageWinnersPanel(prizesThisStage, () => {
      this.currentStage += 1;
      if (this.currentStage < this.stages.length) {
        this.model.clearPrizes();
        this.startStage(this.currentStage);
      } else {
        this.view.showGameComplete?.();
      }
    });
  }
}
