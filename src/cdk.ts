import { Construct } from "constructs";
import { NodejsFunction, OutputFormat } from "aws-cdk-lib/aws-lambda-nodejs";
import {
  Architecture,
  Code,
  IFunction,
  LayerVersion,
  Runtime,
} from "aws-cdk-lib/aws-lambda";
import { fileURLToPath } from "url";
import { Duration } from "aws-cdk-lib";
import { RetentionDays } from "aws-cdk-lib/aws-logs";
import { IPrincipal } from "aws-cdk-lib/aws-iam";

export interface PdfServiceProps {
  timeout: Duration;
  logRetention: RetentionDays;
  reservedConcurrentExecutions: number;
}

export class PdfService extends Construct implements IFunction {
  readonly grantPrincipal: IPrincipal;
  readonly functionName: any;
  readonly functionArn: any;
  readonly isBoundToVpc: any;
  readonly latestVersion: any;
  readonly permissionsNode: any;
  readonly architecture: any;
  readonly resourceArnsForGrantInvoke: any;
  readonly connections: any;
  readonly stack: any;
  readonly env: any;
  readonly applyRemovalPolicy: any;
  readonly addEventSourceMapping: any;
  readonly addPermission: any;
  readonly addToRolePolicy: any;
  readonly grantInvoke: any;
  readonly grantInvokeLatestVersion: any;
  readonly grantInvokeVersion: any;
  readonly grantInvokeUrl: any;
  readonly grantInvokeCompositePrincipal: any;
  readonly metric: any;
  readonly metricDuration: any;
  readonly metricErrors: any;
  readonly metricInvocations: any;
  readonly metricThrottles: any;
  readonly addEventSource: any;
  readonly configureAsyncInvoke: any;
  readonly addFunctionUrl: any;

  constructor(scope: Construct, id: string, props: PdfServiceProps) {
    super(scope, id);

    const puppeteerLayer = new LayerVersion(this, "PuppeteerLayer", {
      code: Code.fromAsset(
        fileURLToPath(new URL("./puppeteer-layer.zip", import.meta.url).href),
      ),
      compatibleArchitectures: [Architecture.X86_64],
    });

    const lambda = new NodejsFunction(this, "Server", {
      ...props,
      architecture: Architecture.X86_64,
      runtime: Runtime.NODEJS_22_X,
      memorySize: 1024,
      entry: fileURLToPath(
        new URL("./handler/lambda.js", import.meta.url).href,
      ),
      layers: [puppeteerLayer],
      bundling: {
        minify: true,
        sourcesContent: false,
        format: OutputFormat.ESM,
        mainFields: ["module", "main"],
        target: "esnext",
        esbuildArgs: {
          "--conditions": "module",
        },
        commandHooks: {
          afterBundling: (_: string, outputDir: string): string[] => [
            `cp -r ${fileURLToPath(
              new URL("./handler/server", import.meta.url).href,
            )} ${outputDir}/server && cp -r ${fileURLToPath(
              new URL("./handler/client", import.meta.url).href,
            )} ${outputDir}/client`,
          ],
          beforeBundling: () => [],
          beforeInstall: () => [],
        },
        externalModules: ["@sparticuz", "puppeteer-core"],
      },
    });

    this.grantPrincipal = lambda.grantPrincipal;
    this.functionName = lambda.functionName;
    this.functionArn = lambda.functionArn;
    this.isBoundToVpc = lambda.isBoundToVpc;
    this.latestVersion = lambda.latestVersion;
    this.permissionsNode = lambda.permissionsNode;
    this.architecture = lambda.architecture;
    this.resourceArnsForGrantInvoke = lambda.resourceArnsForGrantInvoke;
    this.connections = lambda.isBoundToVpc ? lambda.connections : undefined;
    this.stack = lambda.stack;
    this.env = lambda.env;
    this.applyRemovalPolicy = lambda.applyRemovalPolicy;
    this.addEventSourceMapping = lambda.addEventSourceMapping;
    this.addPermission = lambda.addPermission;
    this.addToRolePolicy = lambda.addToRolePolicy;
    this.grantInvoke = lambda.grantInvoke;
    this.grantInvokeLatestVersion = lambda.grantInvokeLatestVersion;
    this.grantInvokeVersion = lambda.grantInvokeVersion;
    this.grantInvokeUrl = lambda.grantInvokeUrl;
    this.grantInvokeCompositePrincipal = lambda.grantInvokeCompositePrincipal;
    this.metric = lambda.metric;
    this.metricDuration = lambda.metricDuration;
    this.metricErrors = lambda.metricErrors;
    this.metricInvocations = lambda.metricInvocations;
    this.metricThrottles = lambda.metricThrottles;
    this.addEventSource = lambda.addEventSource;
    this.configureAsyncInvoke = lambda.configureAsyncInvoke;
    this.addFunctionUrl = lambda.addFunctionUrl;
  }
}
