import { ExecutionEnvironment } from "@/types/executor";
import { PageToHtmlTask } from "../task/PagetoHtml";

export async function PageToHtmlExecutor(
  environment: ExecutionEnvironment<typeof PageToHtmlTask>
): Promise<boolean> {
  try {
    const websiteURL = environment.getInput("Web page");
    // const html = await environment.getPage()!.content();
    // environment.setOutputs("HTML", html);
    // console.log("HTML", html);
    return true;
  } catch (error: any) {
    environment.log.error("Error in LaunchBrowserExecutor " + error.message);
    return false;
  }
}
