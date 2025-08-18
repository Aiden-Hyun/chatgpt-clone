export class ProgressTracker {
  private previousFacetCoverage = 0;
  private iterationsWithoutProgress = 0;

  reset(): void {
    this.previousFacetCoverage = 0;
    this.iterationsWithoutProgress = 0;
  }

  update(currentCoverage: number): { progressed: boolean; stop: boolean; iterationsWithoutProgress: number } {
    if (currentCoverage <= this.previousFacetCoverage) {
      this.iterationsWithoutProgress++;
      const stop = this.iterationsWithoutProgress >= 3;
      return { progressed: false, stop, iterationsWithoutProgress: this.iterationsWithoutProgress };
    }
    this.previousFacetCoverage = currentCoverage;
    this.iterationsWithoutProgress = 0;
    return { progressed: true, stop: false, iterationsWithoutProgress: 0 };
  }
}


