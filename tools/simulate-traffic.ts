import { testUsers, communityNames } from "./test-data";
import { dependencies } from "../src/dependencies/inversify.config";
import { MoodDal, CommunityDal, UserDal, PostDal } from "../src/dal";
import { isRight } from "fp-ts/lib/Either";
import { LoggerFactory } from "../src/logger/LoggerFactory";
import { AppConfiguration } from "../src/config/Configuration";

const moodDal = dependencies.resolve(MoodDal);
const communityDal = dependencies.resolve(CommunityDal);
const postDal = dependencies.resolve(PostDal);
const userDal = dependencies.resolve(UserDal);
const config = dependencies.resolve(AppConfiguration).get();
const logger = dependencies.resolve(LoggerFactory).getLogger('simulate-traffic');

const communities = Object.values(communityNames);
const timeoutSeconds = config.mood.submissionTimeoutMinutes * 60;
const interval = (timeoutSeconds * 1000) / testUsers.length;
let userIndex = 0;

const communityIds: string[] = [];
const userIds: string[] = [];

async function start() {
    try {
        await getCommunityIds();
        await getUserIds();
        setInterval(simulate, interval);
    } catch (error) {
        console.log(error);
    }

}

async function getCommunityIds() {
    const ids = await Promise.all(communities.map(name => communityDal.getCommunityId(name)))
    logger.info(`Fetched community ids ${ids.length}`);
    communityIds.push(...ids);
}

async function getUserIds() {
   const ids = await Promise.all(testUsers.map(name => userDal.getUserId(name)));
   logger.info(`Fetched user ids ${userIds.length}`);
   userIds.push(...ids);
}

async function simulate() {
    try {
        if (userIndex == testUsers.length) userIndex = 0;
        const userId = userIds[userIndex];

        for (let i = 0; i < communityIds.length; i++) {
            const moodValue = getMoodValue(i);
            await postDal.createPost({ userId, communityIds, body: `I'm happy to be alive, and I'm number ${userIndex}`, moodValue })
        }
        userIndex++;
    } catch (error) {
        logger.error(`Error submitting mood: ${error}`);
    }
}

function getMoodValue(communityIndex: number) {
    const isEvenCommunity = communityIndex % 2 == 0;
    // every 3 minutes
    const isFlipMinute = new Date().getSeconds() % 20 == 0;
    let min: number;
    let max: number;
    if (isEvenCommunity) {
        min = isFlipMinute ? 0.4 : 0.1;
        max = isFlipMinute ? 0.9 : 0.4;
    } else {
        min = isFlipMinute ? 0.1: 0.65;
        max = isFlipMinute ? 0.35 : 0.99;
    }
    return (Math.random() * (max-min)) + min;
}

start();

