declare module 'egg' {
  interface Application {
    mysql: any;
  }

  interface EggAppConfig {
    mysql: any;
  }
}
