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
      count: 6,
      label: "Stage 1: ចាប់យកឲបាន 15 Ticket",
      winner: "អ្នកឈ្នះរង្វាន់",
    },
    {
      count: 3,
      label: "Stage 2: ចាប់យកឲបាន 9 Ticket",
      winner: "អ្នកឈ្នះរង្វាន់",
    },
    {
      count: 2,
      label: "Final Stage: ចាប់យកឲបាន 6 Ticket",
      winner: "អ្នកឈ្នះរង្វាន់",
    },
  ];

  stagePrizes = [
    { image: "Prize", name: "Sakkin Aajiro Small Box", value: "34 ​​រង្វាន់" },
    { image: "Prize2", name: "Sakkin Aajiro Box", value: "24 ​រង្វាន់" },
    { image: "Prize3", name: "IPHONE 16 PRO MAX", value: "1 ​​រង្វាន់" },
  ];

  private currentStage = 0;
  private maxCollect = 0;

  private ballPairs: {
    ball: Phaser.GameObjects.Image;
    tween: Phaser.Tweens.Tween;
  }[] = [];

  private ballSpawnTimer?: Phaser.Time.TimerEvent;
  private maxBallsOnScreen = 20;

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
    this.view.showStageLabel?.(this.stages[stageIdx].label);

    this.view.showGameScreen(() => this.startInfiniteBallDrop());
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

  startInfiniteBallDrop() {
    if (this.ballSpawnTimer) {
      this.ballSpawnTimer.remove(false);
      this.ballSpawnTimer = undefined;
    }

    const spawnBalls = () => {
      if (this.model.getPrizes().length >= this.maxCollect) {
        if (this.ballSpawnTimer) {
          this.ballSpawnTimer.remove(false);
          this.ballSpawnTimer = undefined;
        }
        return;
      }

      while (
        this.ballPairs.length < this.maxBallsOnScreen &&
        this.model.getPrizes().length < this.maxCollect
      ) {
        this.spawnBall();
      }

      this.scene.time.addEvent({
        delay: 0,
        callback: spawnBalls,
      });
    };

    spawnBalls();
  }

  spawnBall() {
    const x = Phaser.Math.Between(20, 675);
    const y = 170;

    const ball = this.scene.add
      .image(x, y, "Ball")
      .setOrigin(0.5)
      .setDisplaySize(70, 70)
      .setDepth(2)
      .setInteractive({ useHandCursor: true });

    ball.setAngle(Phaser.Math.Between(-45, 45));

    const ballTween = this.scene.tweens.add({
      targets: ball,
      y: 1000,

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
    this.pauseAllBalls();
    this.view.showPrizeCongratulation(prize);

    const destX = 900 + (this.model.getPrizes().length % 3) * 240;
    const destY = 270 + Math.floor(this.model.getPrizes().length / 3) * 95;

    const flyBall = this.scene.add
      .image(ball.x, ball.y, "Ball")
      .setOrigin(0.5)
      .setDisplaySize(70, 70)
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
