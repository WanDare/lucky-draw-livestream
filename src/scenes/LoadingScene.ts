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

    // Loading text
    this.loadingText = this.make
      .text({
        x: width / 2,
        y: height / 2 - 50,
        text: "Loading...",
        style: {
          font: "28px GROBOLD",
          color: "#593D28",
          align: "center",
        },
      })
      .setOrigin(0.5);

    // Percent text
    this.percentText = this.make
      .text({
        x: width / 2,
        y: height / 2,
        text: "0%",
        style: {
          font: "24px GROBOLD",
          color: "#03792A",
          align: "center",
        },
      })
      .setOrigin(0.5);

    // Progress bar
    this.progressBar = this.add.graphics();

    // Listen to progress
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

    this.load.on("complete", () => {
      this.progressBar.destroy();
      this.progressBox.destroy();
      this.loadingText.destroy();
      this.percentText.destroy();
      // Add a short delay for smoothness, then start main game
      this.time.delayedCall(250, () => {
        this.scene.start("SpinScene");
      });
    });
  }
}
