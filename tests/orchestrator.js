import retry from "async-retry";

async function waitForAllServices() {
  await waitForWebServer();

  async function waitForWebServer() {
    return retry(fetchStatusPage, {
      retries: 100,
      maxRetryTime: 5000, // 5 seconds
    });

    async function fetchStatusPage() {
      const response = await fetch("http://localhost:3000/api/v1/status");
      const responseBody = await response.json();
      if (!responseBody || responseBody.status !== "ok") {
        throw new Error("Web server is not ready");
      }
    }
  }
}

export default {
  waitForAllServices,
};
