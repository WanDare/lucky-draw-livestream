export interface PrizeInfo {
  phone: any;
  id: number;
  name: string;
  description: string;
}

export class PrizeModel {
  private collected: PrizeInfo[] = [];

  addPrize(prize: PrizeInfo) {
    this.collected.push(prize);
  }

  getPrizes(): PrizeInfo[] {
    return [...this.collected];
  }

  clearPrizes() {
    this.collected = [];
  }

  setPrizes(prizes: PrizeInfo[]) {
    this.collected = [...prizes];
  }
}
