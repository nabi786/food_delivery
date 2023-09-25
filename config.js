const config = require("./package.json").projectConfig;

module.exports = {
  mongoConfig: {
    // connectionUrl: "mongodb://localhost:27017/",
    // connectionUrl: config.mongoConnectionUrl,
    connectionUrl: 'mongodb+srv://rehanpardesi2018:rehanpardesi2018@cluster0.mm70gdo.mongodb.net/?retryWrites=true&w=majority',
    database: "foodelivery_db",
    collections: {
      USERS: "users",
      RESTAURANT: "restaurant",
      CARTS: "carts",
      FOODS: "foods",
      BOOKMARKS: "bookmarks",
    },
  },
  serverConfig: {
    // ip: config.serverIp,
    port: config.serverPort,
  },
  tokenSecret: "foodelivery_secret",
};
