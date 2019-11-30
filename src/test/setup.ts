module.exports = async () => {
  process.env.TEST_HOST = "http://localhost:4000";
  process.env.NODE_ENV = "test";
};
