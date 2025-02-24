import puppeteer from "puppeteer";
import { LaunchBrowserTask } from "../task/LaunchBrowser";
import chromium from "@sparticuz/chromium";
import { ExecutionEnvironment } from "@/types/executor";
import { waitFor } from "@/lib/helper/waitFor";
export async function LaunchBrowserExecutor(
  environment: ExecutionEnvironment<typeof LaunchBrowserTask>
): Promise<boolean> {
  try {
    const websiteUrl = environment.getInput("Website Url");
    console.log("Launching Browser", websiteUrl);
    let Browser = null;
    if (process.env.NODE_ENV === "production") {
      Browser = await puppeteer.launch({
        args: [...chromium.args, "--no-sandbox", "--disable-setuid-sandbox"],
        headless: chromium.headless,
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath(),
      });
    } else {
      Browser = await puppeteer.launch({
        headless: true,
      });
    }
    // const Browser = await puppeteer.launch({
    //   headless: true,
    // });
    environment.log.info("Browser started successfully");
    environment.setBrowser(Browser);
    const page = await Browser.newPage();
    await waitFor(3000);
    await page.goto(websiteUrl);
    environment.setPage(page);
    environment.log.info(`Opened page at: ${websiteUrl}`);
    // await Browser.close();
    return true;
  } catch (error: any) {
    environment.log.error("Error in LaunchBrowserExecutor " + error.message);
    return false;
  }
}
