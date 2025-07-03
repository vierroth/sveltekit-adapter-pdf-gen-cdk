import { handler as kitHandler } from "HANDLER_DEST";
import { Handler } from "aws-lambda";
import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import http from "node:http";

const BROWSER = await puppeteer.launch({
  args: puppeteer.defaultArgs({ args: chromium.args, headless: "shell" }),
  defaultViewport: {
    width: 800,
    height: 0,
    hasTouch: false,
    isLandscape: false,
    isMobile: false,
  },
  executablePath: await chromium.executablePath(),
  headless: "shell",
});

const S3 = new S3Client();

http.createServer(kitHandler).listen(8000, "127.0.0.1");

export const handler: Handler = async (event) => {
  const url = new URL(event.template, "http://127.0.0.1:8000/");
  url.searchParams.append("data", JSON.stringify(event.data));

  const page = await BROWSER.newPage();
  await page.goto(url.href, {
    waitUntil: ["load", "networkidle0"],
  });
  await S3.send(
    new PutObjectCommand({
      Bucket: event.bucket,
      Key: event.key,
      Body: await page.pdf({
        format: "A4",
        printBackground: true,
      }),
    }),
  );
  await page.close();

  return `${event.bucket}/${event.key}`;
};
