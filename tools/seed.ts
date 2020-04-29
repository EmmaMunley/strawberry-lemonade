import { subMinutes, addSeconds } from "date-fns";
import { Database } from "../src/database/Database";
import { VerificationTokenFactory } from "../src/verification/VerificationTokenFactory"
import { dependencies } from "../src/dependencies/inversify.config";
import { LoggerFactory } from "../src/logger/LoggerFactory";
import { MemberDal, PostDal, MoodDal, UserDal, CommunityDal } from "../src/dal";
import { isLeft } from "fp-ts/lib/Either";
import { ErrorResponse } from "../src/error/ErrorResponses";
import { AppConfiguration } from "../src/config/Configuration";
import { CommunityMoodWithId } from "../src/types/mood/Mood";
import { testUsers, communityNames } from "./test-data";
import { Pool } from "../src/database/pool/Pool";

const config = dependencies.resolve(AppConfiguration).get();
const logger = dependencies.resolve(LoggerFactory).getLogger("seed-script");
const pool = dependencies.resolve(Pool);
const userDal = dependencies.resolve(UserDal);
const communityDal = dependencies.resolve(CommunityDal);
const moodDal = dependencies.resolve(MoodDal);
const memberDal = dependencies.resolve(MemberDal);
const postDal = dependencies.resolve(PostDal);
const db = dependencies.resolve(Database);
const tokenFactory = dependencies.resolve(VerificationTokenFactory);

const selfDestruct = (error: ErrorResponse) => { throw new Error(JSON.stringify(error)) };

// one password for everyone
const password = "Password1!"
// one phone number for everyone
const phoneNumber = "15555555555";

const userNames = {
        alden: "alden",
        brejuro23: "brejuro23",
        ...testUsers.map(u => ({[u]: u}))
}

const userNameToId: { [key: string]: string } = {}
const communityNameToId: { [key: string]: string } = {}
const postIds: string[] = [];

const communities = [
        { community: {  name: communityNames.golang, description: "A place for gophers to gather and share.", public: true }, owner: userNames.alden },
        { community: {  name: communityNames.typescript, description: "Type typescript here.", public: true }, owner:userNames.alden },
        { community: {  name: communityNames.swift, description: "For pioneers in the swift world.", public: true }, owner: userNames.brejuro23 },
        { community: {  name: communityNames.gym, description: "For the shredded and the yolked among us.", public: true }, owner: userNames.brejuro23 },
        { community: {  name: communityNames.band, description: "Please don't join.", public: true }, owner: userNames.alden },
        { community: {  name: communityNames.google, description: "Join after leetcoding for 300 hours.", public: true }, owner: userNames.brejuro23 }
]

const users = [
        { username: userNames.alden, password, phoneNumber },
        { username: userNames.brejuro23, password, phoneNumber },
        ...testUsers.map(u => ({ username: u, password, phoneNumber}))
]

const members = [
        { username: userNames.alden, communityName: communityNames.gym },
        { username: userNames.alden, communityName: communityNames.swift },
        { username: userNames.alden, communityName: communityNames.google },
        { username: userNames.brejuro23, communityName: communityNames.golang },
        { username: userNames.brejuro23, communityName: communityNames.typescript }
]

const posts = [
        // alden posts
        { username: userNames.alden, communityName: communityNames.google, body: "So bummed about the Pixel 4 :(", moodValue: 0.4},
        { username: userNames.alden, communityName: communityNames.google, body: "HIRE ME!!!", moodValue: 0.9},
        { username: userNames.alden, communityName: communityNames.golang, body: "Go go golang!", moodValue: 1.0},
        // brejuro posts
        { username: userNames.brejuro23, communityName: communityNames.swift, body: "Seems crazy that you need a PhD to use back-buttons in this language", moodValue: 0.8},
        { username: userNames.brejuro23, communityName: communityNames.swift, body: "Pioneering the future of swift as we know it...", moodValue:0.6},
        { username: userNames.brejuro23, communityName: communityNames.golang, body: "Wish I knew Go... ;/" , moodValue:0.2},
]

async function seed() {
        try {
                await dropViews();
                await dropTables();
                await initializeDatabase();
                await populateUsers()
                await populateCommunities()
                await populateMembers();
                await populatePosts();
                await populateLikes();
                await populateMoodHistory();
        } catch(error) {
                logger.error(`Failed to complete seeding -- partial seeding occurred. ${error}`);
        } finally {
                process.exit(0);
        }
}

async function populateUsers() {
        const token = tokenFactory.getVerificationToken();
        let count = 0;
        const userResults = await Promise.all(users.map(async u =>  {
                const user = await userDal.createUser(u, token)
                count++;
                const percentage = 100 *  count/users.length;
                printInPlace(`Seeded ${percentage.toFixed(2)}% of users...`)
                if (count == users.length) clearLine();
                return user;
        }));
        await Promise.all(userResults.map(async u => {
                if (isLeft(u)) {
                        return selfDestruct(u.left);
                }
                const user = u.right;
                userNameToId[user.username] = user.id;
                const verified = await userDal.verifyUser({ userId: user.id, verificationToken: token });
                return verified;
        }))
        logger.info("Finished seeding users");
}

function printInPlace(statement: string): void {
        process.stdout.clearLine(0);
        process.stdout.cursorTo(0);
        process.stdout.write(statement);
}

function clearLine(): void {
        printInPlace("");
}

async function populateCommunities() {
        let total = communities.length;
        for (let i = 0; i < total; i++) {
                const communityData = communities[i];
                const ownerId = userNameToId[communityData.owner];
                const communityResult = await communityDal.createCommunity({ ...communityData.community, ownerId });
                if (isLeft(communityResult)) return selfDestruct(communityResult.left);
                const community = communityResult.right;
                communityNameToId[community.name] = community.id; 
                const percentage = 100 *  i/total;
                // todo - generalize the seeding percentage
                printInPlace(`Seeded ${percentage.toFixed(2)}% of communities...`)
        }
        clearLine();
        logger.info("Finished seeding communities");
}

async function populateMembers() {
        for(let i = 0; i < members.length; i++) {
                const memberData = members[i];
                const communityId = communityNameToId[memberData.communityName];
                const userId = userNameToId[memberData.username];
                await memberDal.addMember(userId, communityId);
        }
        // Populate test users in every community
        for (let i = 0; i < testUsers.length; i++) {
                const userId = userNameToId[testUsers[i]];
                const communities = Object.values(communityNames);
                for (let j = 0; j < communities.length; j++) {
                        const communityId = communityNameToId[communities[j]];
                        await memberDal.addMember(userId, communityId);
                }
        }
        logger.info("Finished seeding members");
}

async function populatePosts() {
        const ids = await Promise.all(posts.map(async post => {
                const { username, communityName, body, moodValue } = post;
                const communityIds = [communityNameToId[communityName]];
                const userId = userNameToId[username];
                const createPostResult = await postDal.createPost({ userId, body, communityIds,  moodValue });
                return createPostResult.postId;
        }));        
        postIds.push(...ids);
        logger.info("Finished seeding posts");
}

async function populateMoodHistory() {
        const intervalMinutes = config.mood.submissionTimeoutMinutes;
        const dataPoints = 100;

        const communityIds = Object.values(communityNameToId)
        let count = 0;
        let total = communityIds.length
        for (const communityId of communityIds) {
                await generateMoodHistory(communityId, intervalMinutes, dataPoints, count, total);
                count++;
        };
        clearLine();
        logger.info("Finished seeding mood history");
}

async function populateLikes() {
        const userIds = Object.values(userNameToId)
        const communityIds = Object.values(communityNameToId);
        let count = 0;
        const total = userIds.length * postIds.length * communityIds.length;
       for (const userId of userIds) {
               await Promise.all(postIds.map(async postId => {
                        await Promise.all(communityIds.map(async communityId => {
                                await postDal.likePost(postId, communityId, userId);
                                count++;
                                const percentage = 100 *  count/total;
                                printInPlace(`Seeded ${percentage.toFixed(2)}% of likes...`)
                        }));
                }));
        }
        clearLine();
        logger.info("Finished seeding likes");
}

async function generateMoodHistory(communityId: string, intervalMinutes: number, dataPoints: number, count: number, total: number) {
        const start = subMinutes(new Date(), dataPoints * intervalMinutes);
        let lastValue = 0.5;
        for (let i = 0; i < dataPoints; i++) {
                const { moodValue, delta } = getMoodValue(lastValue);
                const mood: CommunityMoodWithId = {
                        moodValue,
                        delta,
                        communityId,
                        submissionCount: Math.floor(Math.random() * 980) + 20,  // 20 - 999
                        calculatedAt: addSeconds(start, i * intervalMinutes * 60).toISOString(),
                }
                lastValue = moodValue;   
                await moodDal.createCommunityMoodHistory(mood); 

                const percentage =  (i + dataPoints * count )/ (total * dataPoints) * 100;
                printInPlace(`Seeded ${percentage.toFixed(2)}% of mood history...`)
        }
}

function getMoodValue(lastValue: number) {
        let delta = Math.random() * 0.3;
        let sign;
        if (lastValue - delta < 0) {
                sign = 1;
        } else if (lastValue + delta > 1) {
                sign = -1;
        } else {
                sign = Math.random() > 0.5 ? 1 : -1;
        }
        delta *= sign;
        const moodValue = lastValue + delta;
        return { moodValue, delta };
}

async function initializeDatabase() {
        await db.initialize();
}

async function dropViews() {    
        const viewNames = Object.values(config.postgres.viewNames);
        await Promise.all(viewNames.map(async view => 
                await pool.query(`DROP VIEW IF EXISTS ${view}`)
        ))
        logger.info("Dropped views");
}

async function dropTables() {
        const tables = config.postgres.tables;
        const reversedDependencyOrder = [
                tables.moodsHistoryTable.name,
                tables.moodsTable.name,
                tables.likesTable.name,
                tables.membersTable.name,
                tables.postCommunitiesTable.name,
                tables.communitiesTable.name,
                tables.postsTable.name,
                tables.usersTable.name,
        ];
        for(const tableName of reversedDependencyOrder) {
                await pool.query(`DROP TABLE IF EXISTS ${tableName}`)
        }
        logger.info("Dropped tables");
}

seed();

