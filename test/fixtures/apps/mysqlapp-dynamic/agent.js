'use strict';

const fs = require('fs');
const path = require('path');

module.exports = function(agent) {
  agent.mysql1 = agent.mysql.createInstance(agent.config.mysql1);
  const done = agent.readyCallback('agent-mysql');
  const p = path.join(__dirname, 'run/agent_result.json');
  fs.existsSync(p) && fs.unlinkSync(p);

  (async () => {
    const result = await agent.mysql1.query('select now() as currentTime;');
    fs.writeFileSync(p, JSON.stringify(result));
  })().then(done).catch(done);
};
