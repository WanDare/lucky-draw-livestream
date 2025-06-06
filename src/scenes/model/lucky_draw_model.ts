type Prize = {
  name: string;
  image: string;
};

export class PrizeModel {
  prizes: Prize[] = [
    { name: "Jelly 1 Stick", image: "prize1" },
    { name: "Jelly 1 Box", image: "prize2" },
    { name: "Voucher 10$", image: "prize3" },
    { name: "Umbrella", image: "prize4" },
    { name: "Sakkin Veggie", image: "prize5" },
    { name: "Tote Bag", image: "prize6" },
    { name: "Mini Fan", image: "prize7" },
    { name: "Voucher $5", image: "prize3" },
  ];

  getPrize(index: number): Prize {
    return this.prizes[index];
  }

  getRandomIndex(): number {
    return Phaser.Math.Between(0, this.prizes.length - 1);
  }

  getPrizeCount(): number {
    return this.prizes.length;
  }
}
