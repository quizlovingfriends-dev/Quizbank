/**
 * container.js — Foundational Service Registry (DI Container)
 * The single source of truth for all application services.
 */

class Container {
  constructor() {
    this.services = new Map();
  }

  register(name, instance) {
    this.services.set(name, instance);
    console.log(`[DI] Registered Service: ${name}`);
  }

  get(name) {
    const service = this.services.get(name);
    if (!service) throw new Error(`[DI] Service not found: ${name}`);
    return service;
  }
}

export const container = new Container();
