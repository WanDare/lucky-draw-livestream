import { API_BASE_URL } from "../utils/constants";
import type { PrizeModel, PrizeInfo } from "../model/lucky_draw_model";
import type { LuckyDrawView } from "../view/lucky_draw_view";

export class LuckyDrawController {
  private model: PrizeModel;
  private view: LuckyDrawView;
  private scene: Phaser.Scene;
  private isCollectingPrize = false;

  private stages = [
    {
      count: 18,
      label: "Stage 1: ចាប់យកឲបាន 18 Ticket",
      winner: "អ្នកឈ្នះរង្វាន់",
    },
    {
      count: 12,
      label: "Stage 2: ចាប់យកឲបាន 12 Ticket",
      winner: "អ្នកឈ្នះរង្វាន់",
    },
    {
      count: 1,
      label: "Final Stage: ចាប់យកឲបាន 1 Ticket",
      winner: "អ្នកឈ្នះរង្វាន់",
    },
  ];

  stagePrizes = [
    { image: "Prize", name: "Gift Yellow Box", value: "18 ​​រង្វាន់" },
    { image: "Prize2", name: "Sakkin Aojiru Box", value: "12 ​រង្វាន់" },
    { image: "Prize3", name: "IPHONE 16 PRO MAX", value: "1 ​​រង្វាន់" },
  ];

  private currentStage = 0;
  private maxCollect = 0;

  private ballPairs: {
    ball: Phaser.GameObjects.Image;
    tween: Phaser.Tweens.Tween;
  }[] = [];

  private ballSpawnTimer?: Phaser.Time.TimerEvent;

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

    if (this.ballSpawnTimer) {
      this.ballSpawnTimer.remove(false);
      this.ballSpawnTimer = undefined;
    }
  }

  onStartGame() {
    this.currentStage = 0;
    this.curtainStageTransition(() => this.startStage(this.currentStage));
  }

  startStage(stageIdx: number) {
    this.clearAllBalls();

    this.model.clearPrizes();
    this.view.renderPrizePanel(this.model.getPrizes());
    this.maxCollect = this.stages[stageIdx].count;

    this.view.showStageLabel?.(stageIdx);

    this.view.showGameScreen(() => this.startInfiniteBallDrop());
    this.view.showStagePrize(this.stagePrizes[stageIdx]);
  }

  async fetchRandomPrizeInfo(): Promise<PrizeInfo> {
    const res = await fetch(
      `${API_BASE_URL}/7f5f5d5f-168b-404c-bec0-d226ccc4763e`
    );
    if (!res.ok) throw new Error("Failed to fetch prize info");
    const data = await res.json();
    if (Array.isArray(data)) {
      return data[Math.floor(Math.random() * data.length)];
    }
    return data as PrizeInfo;
  }

  startInfiniteBallDrop() {
    if (this.ballSpawnTimer) {
      this.ballSpawnTimer.remove(false);
      this.ballSpawnTimer = undefined;
    }

    this.ballSpawnTimer = this.scene.time.addEvent({
      delay: 300,
      loop: true,
      callback: () => {
        if (this.model.getPrizes().length >= this.maxCollect) {
          this.ballSpawnTimer?.remove(false);
          this.ballSpawnTimer = undefined;
          return;
        }
        this.spawnBall();
      },
    });
  }

  spawnBall() {
    const gameWidth = this.scene.scale.width;
    const gameHeight = this.scene.scale.height;

    // Responsive random spawn area (horizontal span, top vertical)
    const x = Phaser.Math.Between(gameWidth * 0.015, gameWidth * 0.47);
    const y = gameHeight * 0.16;

    const ballSize = Math.max(gameWidth, gameHeight) * 0.07; // About 70-100px on large screens

    const ball = this.scene.add
      .image(x, y, "Ball")
      .setOrigin(0.5)
      .setDisplaySize(ballSize, ballSize)
      .setDepth(2)
      .setInteractive({ useHandCursor: true });

    ball.setAngle(Phaser.Math.Between(-45, 45));

    const ballTween = this.scene.tweens.add({
      targets: ball,
      y: gameHeight * 0.98,
      angle: Phaser.Math.Between(-270, 270),
      ease: "Sine.easeInOut",
      duration: Phaser.Math.Between(8500, 15000),
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

  collectPrizeWithAnimation(ball: Phaser.GameObjects.Image, prize: PrizeInfo) {
    const gameWidth = this.scene.scale.width;
    const gameHeight = this.scene.scale.height;
    this.pauseAllBalls();
    this.view.showPrizeCongratulation(prize);

    // Responsive grid destination (matches renderPrizePanel layout)
    const columns = 3;
    const cardWidth = gameWidth * 0.14;
    const cardHeight = gameHeight * 0.063;
    const gap = gameWidth * 0.007;
    const baseX = gameWidth * 0.6;
    const baseY = gameHeight * 0.32;
    const idx = this.model.getPrizes().length;
    const col = idx % columns;
    const row = Math.floor(idx / columns);
    const destX = baseX + col * (cardWidth + gap);
    const destY = baseY + row * (cardHeight + gap);

    const flyBall = this.scene.add
      .image(ball.x, ball.y, "Ball")
      .setOrigin(0.5)
      .setDisplaySize(cardHeight, cardHeight)
      .setDepth(100);

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
    if (this.ballSpawnTimer && !this.ballSpawnTimer.paused) {
      this.ballSpawnTimer.paused = true;
    }
  }

  resumeAllBalls() {
    this.ballPairs.forEach((pair) => {
      if (pair.ball.active && pair.tween && pair.tween.paused) {
        pair.tween.resume();
        pair.ball.setInteractive({ useHandCursor: true });
      }
    });
    if (this.ballSpawnTimer && this.ballSpawnTimer.paused) {
      this.ballSpawnTimer.paused = false;
    }
  }

  onStageComplete() {
    this.clearAllBalls();
    const prizesThisStage = this.model.getPrizes();

    this.view.collectedPrizeGraphics.forEach((c) => c.destroy());
    this.view.collectedPrizeGraphics = [];

    this.view.slideOutPeople(() => {
      this.view.showStageWinnersPanel(prizesThisStage, () => {
        this.currentStage += 1;
        if (this.currentStage < this.stages.length) {
          this.model.clearPrizes();
          this.curtainStageTransition(() => this.startStage(this.currentStage));
        } else {
          this.curtainStageTransition(() => {
            this.view.showGameComplete?.();
          });
        }
      });
    });
  }

  private curtainStageTransition(action: () => void) {
    this.view.closeCurtain(() => {
      action();
      this.view.openCurtain();
    });
  }
}
