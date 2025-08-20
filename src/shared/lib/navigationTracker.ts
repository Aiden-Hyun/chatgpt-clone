// src/shared/lib/navigationTracker.ts

class NavigationTracker {
  private previousRoute: string | null = null;

  setPreviousRoute(route: string) {
    this.previousRoute = route;
  }

  getPreviousRoute(): string | null {
    return this.previousRoute;
  }

  clearPreviousRoute() {
    this.previousRoute = null;
  }
}

export const navigationTracker = new NavigationTracker();
