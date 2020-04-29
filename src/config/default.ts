export const config = {
    mood: {
        moodCalculationIntervalSeconds: 10,
        submissionTimeoutMinutes: 0.5,
        moodWindowMinutes: 60,
    },
    posts: {
        maxPostsPerFetch: 100,
        postExpirationMinutes: 60,
    },
    communities: {
        maxCommunitiesPerFetch: 50,
    },
    log: {
        level: "debug",
    },
    // Name of the application
    application: {
        name: "commoodity",
        rootDir: "src",
        sqlDir: "sql",
    },
    auth: {
        saltRounds: 10,
        // Matches string starting with a character, followed by alphanumerics, with total length between 2 and 20 inclusive
        usernameRegex: /^(?=.{2,20}$)([a-zA-Z]+[a-zA-Z0-9]*$)/i,
        /* Matches string with at least one lower and uppercase character, one special character, and one number
                 with total length between 7 and 20 inclusive */
        passwordRegex: /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{7,30}$/i,
        smsAttributes: {
            DefaultSMSType: "Transactional",
            DefaultSenderID: "PinTalk",
            MonthlySpendLimit: "5", // in USD
        },
    },
    postgres: {
        tables: {
            usersTable: {
                name: "users",
                timestampsEnabled: true,
            },
            communitiesTable: {
                name: "communities",
                timestampsEnabled: true,
            },
            membersTable: {
                name: "members",
                timestampsEnabled: true,
            },
            postsTable: {
                name: "posts",
                timestampsEnabled: true,
            },
            moodsTable: {
                name: "community_moods",
                timestampsEnabled: true,
            },
            moodsHistoryTable: {
                name: "community_moods_history",
                timestampsEnabled: true,
            },
            postCommunitiesTable: {
                name: "post_communities",
                timestampsEnabled: true,
            },
            likesTable: {
                name: "likes",
                timestampsEnabled: true,
            },
        },
        viewNames: {
            membersDetailed: "members_detailed",
            likesDetailed: "likes_detailed",
            postsDetailed: "posts_detailed",
        },
        pool: {
            database: "commoodity",
            user: "postgres",
            password: "password",
            host: "localhost",
            port: 5432,
            max: 128, // set pool max size to 20
            min: 16, // set min pool size to 4
            idleTimeoutMillis: 5000, // close idle clients after 1 second
            connectionTimeoutMillis: 10000, // return an error after 1 second if connection could not be established
        },
    },
    aws: {
        region: "us-east-1",
        s3: {
            url: "http://localhost:4572",
            bucket: "commoodity",
        },
        sns: {
            endpoint: "http://localhost:4575",
        },
    },
    verification: {
        tokenLength: 6,
    },
    jwt: {
        // expire in 5 years
        expirationSeconds: 60 * 60 * 24 * 365 * 5,
        secret: "mush-head",
    },
    port: process.env.PORT || 4040,
};
