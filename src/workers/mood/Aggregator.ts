import { LoggerFactory } from "../../logger/LoggerFactory";
import { injectable } from "inversify";
import { AppConfiguration } from "../../config/Configuration";
import { clearInterval, setInterval } from "timers";
import { PostDal, MoodDal } from "../../dal";
import { PostMood, CommunityMoodWithId } from "../../types/mood/Mood";
import { Logger } from "winston";

// todo: WNS This aggregator worker should probably be a standalone service
@injectable()
export default class MoodAggregator {
    private calculationIntervalSeconds: number;
    private postDal: PostDal;
    private moodDal: MoodDal;
    private intervalWorker?: NodeJS.Timeout;
    private logger: Logger;

    constructor(config: AppConfiguration, postDal: PostDal, moodDal: MoodDal, loggerFactory: LoggerFactory) {
        const moodConfig = config.get().mood;
        this.postDal = postDal;
        this.moodDal = moodDal;
        this.calculationIntervalSeconds = moodConfig.moodCalculationIntervalSeconds;
        this.aggregate = this.aggregate.bind(this);
        this.logger = loggerFactory.getLogger(module);
    }

    start(): void {
        if (this.intervalWorker === undefined) {
            this.intervalWorker = setInterval(this.aggregate, this.calculationIntervalSeconds * 1000);
            this.logger.info("Mood aggregation worker started");
        }
    }

    stop(): void {
        if (this.intervalWorker !== undefined) {
            clearInterval(this.intervalWorker);
        }
    }

    private async aggregate(): Promise<void> {
        try {
            // todo - make this a cursor, getting all posts within a window could be massive. WILL NOT SCALE (WNS)
            const moods = await this.postDal.getMoodsWithinWindow();
            if (moods.length == 0) {
                return;
            }
            const sums = this.sumCommunityMood(moods);
            Object.keys(sums).forEach(async communityId => {
                const currentCommunityMood = await this.moodDal.getCommunityMood(communityId);
                const { sum, count } = sums[communityId];
                const averageMood = sum / count;
                if (currentCommunityMood === undefined) {
                    const newCommunityMood: CommunityMoodWithId = this.createCommunityMood(communityId, averageMood, count, 0);
                    await this.moodDal.createCommunityMood(newCommunityMood);
                } else {
                    const newCommunityMood: CommunityMoodWithId = this.createCommunityMood(
                        communityId,
                        averageMood,
                        count,
                        currentCommunityMood.moodValue - averageMood,
                    );
                    await this.moodDal.updateCommunityMood(newCommunityMood);
                }
            });
        } catch (error) {
            this.logger.error(`Error aggregating moods: ${error}`);
        }
    }

    private createCommunityMood(communityId: string, moodValue: number, submissionCount: number, delta: number): CommunityMoodWithId {
        return {
            communityId,
            moodValue,
            submissionCount,
            delta,
            calculatedAt: new Date().toISOString(),
        };
    }

    private sumCommunityMood(moods: PostMood[]): { [key: string]: { count: number; sum: number } } {
        const sums: { [key: string]: { count: number; sum: number } } = {};
        moods.forEach(({ communityId, moodValue }) => {
            const data = sums[communityId];
            if (data === undefined) {
                sums[communityId] = { count: 1, sum: moodValue };
            } else {
                sums[communityId].count++;
                sums[communityId].sum += moodValue;
            }
        });
        return sums;
    }
}
