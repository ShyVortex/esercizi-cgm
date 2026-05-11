export type RouteHandler = (params?: any) => void;

interface Route {
  path: string;
  handler: RouteHandler;
}

export class Router {
  private routes: Route[] = [];

  constructor(_rootElementId?: string) {
    window.addEventListener('hashchange', () => this.handleRouteChange());
  }

  public addRoute(path: string, handler: RouteHandler) {
    this.routes.push({ path, handler });
  }

  public navigate(path: string) {
    window.location.hash = path;
  }

  public handleRouteChange() {
    const hash = window.location.hash.slice(1) || '/';
    
    // Find matching route
    // Simple exact match for now, could be extended for params like /post/:id
    const route = this.routes.find(r => {
      // Handle dynamic routes like /post/:id
      const routeParts = r.path.split('/');
      const hashParts = hash.split('/');
      
      if (routeParts.length !== hashParts.length) return false;
      
      return routeParts.every((part, i) => part.startsWith(':') || part === hashParts[i]);
    });

    if (route) {
      const params: any = {};
      const routeParts = route.path.split('/');
      const hashParts = hash.split('/');
      
      routeParts.forEach((part, i) => {
        if (part.startsWith(':')) {
          params[part.slice(1)] = hashParts[i];
        }
      });
      
      route.handler(params);
    } else {
      console.error(`No route found for ${hash}`);
      // Fallback to home
      this.navigate('/');
    }
  }

  public start() {
    this.handleRouteChange();
  }
}
