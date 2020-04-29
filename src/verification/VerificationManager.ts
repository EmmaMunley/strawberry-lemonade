import aws, { SNS, AWSError } from "aws-sdk";
import { PublishInput, PublishResponse } from "aws-sdk/clients/sns";
import { injectable } from "inversify";
import { AppConfiguration } from "../config/Configuration";
import { LoggerFactory } from "../logger/LoggerFactory";
import { VerificationTokenFactory } from "./VerificationTokenFactory";
import { Logger } from "winston";

@injectable()
export class VerificationManager {
    private amazonSNS: SNS;
    private logger: Logger;
    readonly tokenFactory: VerificationTokenFactory;

    constructor(config: AppConfiguration, tokenFactory: VerificationTokenFactory, loggerFactory: LoggerFactory) {
        const configData = config.get();
        const region = configData.aws.region;
        const endpoint = configData.aws.sns.endpoint;
        const attributes = configData.auth.smsAttributes;
        this.amazonSNS = new aws.SNS({ region, endpoint });
        this.amazonSNS.setSMSAttributes({ attributes });
        this.tokenFactory = tokenFactory;
        this.logger = loggerFactory.getLogger(module);
        this.sendVerificationToken = this.sendVerificationToken.bind(this);
    }

    public sendVerificationToken(phoneNumber: string, token: string): void {
        const params: PublishInput = {
            Message: `Your Commoodity verification token is: ${token}`,
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
