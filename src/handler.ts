import { handler as kitHandler } from "HANDLER_DEST";
import { Handler } from "aws-lambda";
import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import http from "node:http";

const BROWSER = await puppeteer.launch({
  args: await puppeteer.defaultArgs({ args: chromium.args, headless: "shell" }),
  defaultViewport: {
    width: 800,
    height: 1200,
    deviceScaleFactor: 1,
    hasTouch: false,
    isLandscape: false,
    isMobile: false,
  },
  executablePath: await chromium.executablePath(),
  headless: "shell",
});

const S3 = new S3Client();

await new Promise<void>((resolve, reject) => {
  const server = http.createServer(kitHandler);
  server.once("error", reject);
  server.listen(8000, "127.0.0.1", () => resolve());
});

export const handler: Handler = async (event) => {
  const url = new URL(event.template, "http://127.0.0.1:8000/");
  url.searchParams.append("data", JSON.stringify(event.data));

  const page = await BROWSER.newPage();

  try {
    const response = await page.goto(url.href, {
      waitUntil: ["domcontentloaded", "networkidle0"],
      timeout: 10000,
    });

    if (!response?.ok()) {
      throw new Error(
        `Template request failed: ${response?.status() ?? "no response"} ${
          url.pathname
        }`,
      );
    }

    page.on("console", (message) => {
      console.log(`[browser:${message.type()}] ${message.text()}`);
    });

    page.on("pageerror", (error) => {
      console.error("[browser:pageerror]", error);
    });

    page.on("requestfailed", (request) => {
      console.error("[browser:requestfailed]", {
        url: request.url(),
        error: request.failure()?.errorText,
      });
    });

    page.on("response", (response) => {
      if (response.status() >= 400) {
        console.error("[browser:http]", response.status(), response.url());
      }
    });

    await new Promise((resolve) => setTimeout(resolve, 1000));
    await page.bringToFront();
    await page.evaluate(() => document.fonts.ready);

    console.log(
      "PDF page diagnostics:",
      await page.evaluate(() => ({
        title: document.title,
        text: document.body?.innerText.slice(0, 1_000),
        htmlLength: document.documentElement.outerHTML.length,
        bodyWidth: document.body?.scrollWidth,
        bodyHeight: document.body?.scrollHeight,
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
        fontsStatus: document.fonts.status,
      })),
    );

    await S3.send(
      new PutObjectCommand({
        Bucket: event.bucket,
        Key: event.key,
        Body: await page.pdf({
          format: "A4",
          printBackground: true,
          waitForFonts: false,
        }),
        ContentType: "application/pdf",
      }),
    );

    return `${event.bucket}/${event.key}`;
  } finally {
    await page.close().catch((error) => {
      console.error("Failed to close page", error);
    });
  }
};
