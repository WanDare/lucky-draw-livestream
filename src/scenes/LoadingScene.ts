import Phaser from "phaser";

export default class LoadingScene extends Phaser.Scene {
  private progressBar!: Phaser.GameObjects.Graphics;
  private progressBox!: Phaser.GameObjects.Graphics;
  private loadingText!: Phaser.GameObjects.Text;
  private percentText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: "LoadingScene" });
  }

  preload() {
    const { width, height } = this.cameras.main;

    this.progressBox = this.add.graphics();
    this.progressBox.fillStyle(0x222222, 0.8);
    this.progressBox.fillRect(width / 2 - 170, height / 2 - 30, 340, 60);
    this.progressBar = this.add.graphics();

    this.loadingText = this.make
      .text({
        x: width / 2,
        y: height / 2 - 50,
        text: "Loading...",
        style: {
          font: "bold 28px Arial",
          color: "#ffffff",
          align: "center",
        },
      })
      .setOrigin(0.5);

    this.percentText = this.make
      .text({
        x: width / 2,
        y: height / 2,
        text: "0%",
        style: {
          font: "24px Arial",
          color: "#ffffff",
          align: "center",
          shadow: {
            offsetX: 1,
            offsetY: 1,
            color: "#000000",
            blur: 2,
            stroke: false,
            fill: true,
          },
        },
      })
      .setOrigin(0.5);

    for (let i = 0; i < 30; i++) {
      this.load.image(`dummy${i}`, "assets/images/ticket_prize.png");
    }

    this.load.on("progress", (value: number) => {
      this.progressBar.clear();
      this.progressBar.fillStyle(0x03792a, 1);
      this.progressBar.fillRect(
        width / 2 - 160,
        height / 2 - 15,
        320 * value,
        30
      );
      this.percentText.setText(`${Math.floor(value * 100)}%`);
    });

    let loadComplete = false;
    let minTimePassed = false;

    this.load.on("complete", () => {
      loadComplete = true;
      checkReady.call(this);
    });

    this.time.delayedCall(1500, () => {
      minTimePassed = true;
      checkReady.call(this);
    });

    const checkReady = () => {
      if (loadComplete && minTimePassed) {
        this.progressBar.destroy();
        this.progressBox.destroy();
        this.loadingText.destroy();
        this.percentText.destroy();
        this.scene.start("LuckyDrawScene");
      }
    };
  }
}
