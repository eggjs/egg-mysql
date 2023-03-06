import { execSync } from 'node:child_process';

execSync('mysql -uroot -h 127.0.0.1 -e "create database IF NOT EXISTS test;"');
execSync('mysql -uroot -h 127.0.0.1 test < test/npm_auth.sql');
console.log('create table success');
