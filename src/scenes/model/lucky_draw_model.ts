export interface PrizeInfo {
  phone: any;
  id: number;
  name: string;
  description: string;
}

export class PrizeModel {
  private collected: PrizeInfo[] = [];
  private preloadedWinners: PrizeInfo[] = []; 

  // ✅ Add prize during gameplay
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

  // ✅ Set preloaded winners from fetch or file
  setPreloadedWinners(winners: PrizeInfo[]) {
    this.preloadedWinners = winners;
  }

  // ✅ Get preloaded winners
  getPreloadedWinners(): PrizeInfo[] {
    return this.preloadedWinners;
  }

  // ✅ (Optional) Remove already-picked winner to prevent reuse
  removePreloadedWinnerById(id: number) {
    this.preloadedWinners = this.preloadedWinners.filter((p) => p.id !== id);
  }
}
