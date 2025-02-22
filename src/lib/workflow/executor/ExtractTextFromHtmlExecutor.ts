import { ExecutionEnvironment } from "@/types/executor";
import * as cheerio from "cheerio";
import { ExtractTextFromElementTask } from "../task/ExtractTextFromElement";
export async function ExtractTextFromHtmlExecutor(
  environment: ExecutionEnvironment<typeof ExtractTextFromElementTask>
): Promise<boolean> {
  try {
    const selector = environment.getInput("Selector");
    if (!selector) {
      environment.log.error("Selector not defined");
      return false;
    }
    const html = environment.getInput("Html");
    if (!html) {
      return false;
    }
    const $ = cheerio.load(html);
    const ele = $(selector);
    if (!ele) {
      environment.log.error("Element not found");
      return false;
    }
    const extractedText = $.text(ele);
    if (!extractedText) {
      environment.log.error("Element has no text");
      return false;
    }
    environment.setOutputs("Extracted text", extractedText);
    return true;
  } catch (error: any) {
    environment.log.error("Error in LaunchBrowserExecutor " + error.message);
    return false;
  }
}
