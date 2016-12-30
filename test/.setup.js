'use strict';

const execSync = require('child_process').execSync;

execSync('mysql -uroot -e "create database IF NOT EXISTS test;"');
execSync('mysql -uroot test < test/npm_auth.sql');
console.log('create table success');
