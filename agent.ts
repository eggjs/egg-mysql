import type { Agent, IBoot } from 'egg';
import { initPlugin } from './lib/mysql';

export default class AgentBootHook implements IBoot {
  private readonly agent: Agent;
  constructor(agent: Agent) {
    this.agent = agent;
  }

  configDidLoad() {
    if (this.agent.config.mysql.agent) {
      initPlugin(this.agent);
    }
  }
}
