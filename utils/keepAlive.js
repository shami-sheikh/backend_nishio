const keepAlive = () => {
  const url = "https://backend-nishio-89z1.onrender.com";
  setInterval(async () => {
    try {
      await fetch(url);
      console.log("Keep-alive ping sent");
    } catch (err) {
      console.error("Keep-alive failed:", err.message);
    }
  }, 14 * 60 * 1000);
};

export default keepAlive;