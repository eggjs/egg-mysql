'use strict';

const co = require('co');
const fs = require('fs');
const path = require('path');

module.exports = function(agent) {
  agent.mysql1 = agent.mysql.createInstance(agent.config.mysql1);
  const done = agent.readyCallback('agent-mysql');
  const p = path.join(__dirname, 'run/agent_result.json');
  fs.existsSync(p) && fs.unlinkSync(p);

  co(function* () {
    const result = yield agent.mysql1.query('select now() as currentTime;');
    fs.writeFileSync(p, JSON.stringify(result));
  }).then(done, done);
};
