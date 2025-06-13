import Phaser from "phaser";
import LoadingScene from "./scenes/LoadingScene";
import LuckyDrawScene from "./scenes/LuckyDrawScene";

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 1920,
  height: 1080,
  backgroundColor: "#538b3c",
  scene: [LuckyDrawScene, LoadingScene],
  parent: "game",
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 1920,
    height: 1080,
  },
};

new Phaser.Game(config);
