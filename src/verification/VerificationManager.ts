import aws, { SNS, AWSError } from "aws-sdk";
import { PublishInput, PublishResponse } from "aws-sdk/clients/sns";
import { injectable } from "inversify";
import { AppConfiguration } from "../config/Configuration";
import { LoggerFactory } from "../logger/LoggerFactory";
import { VerificationTokenFactory } from "./VerificationTokenFactory";

@injectable()
export class VerificationManager {
    private amazonSNS: SNS;
    private appName: string;
    private logger = LoggerFactory.getLogger(module);
    readonly tokenFactory: VerificationTokenFactory;

    constructor(config: AppConfiguration, tokenFactory: VerificationTokenFactory) {
        const configData = config.get();
        const region: string = configData.aws.region;
        const attributes: { [key: string]: string } = configData.auth.smsAttributes;
        this.amazonSNS = new aws.SNS({ region });
        this.amazonSNS.setSMSAttributes({ attributes });
        this.tokenFactory = tokenFactory;
        this.appName = configData.application.name;

        this.sendVerificationToken = this.sendVerificationToken.bind(this);
    }

    public sendVerificationToken(phoneNumber: string, token: string): void {
        // todo: refactor to use local sns instance with switched urls in config rather than env detection
        if (process.env.NODE_ENV === "development") {
            this.logger.warn(`SMS is disabled with NODE_ENV == "development". Not sending token ${token} to phone number ${phoneNumber}.`);
            return;
        }

        const params: PublishInput = {
            Message: `Your ${this.appName} token is: ${token}`,
            PhoneNumber: `+${phoneNumber}`,
        };

        this.amazonSNS.publish(params, (err: AWSError, data: PublishResponse) => {
            if (err) {
                this.logger.error(`Error sending SMS message to phone number ${phoneNumber}: ${err}`);
            } else {
                this.logger.info(
                    `Success sending verification token: ${token} to phone number: ${phoneNumber}, recieved SNS message ID: ${data.MessageId}`,
                );
            }
        });
    }

    public getVerificationToken(): string {
        return this.tokenFactory.getVerificationToken();
    }
}
