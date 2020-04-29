import TestFactory from "../test-utils/TestFactory";
import chai, { expect } from "chai";
import axios from "axios";
import { CreateUserDTO } from "../../src/dto/user/CreateUserDto";
import { UserDetails } from "../../src/types/user/User";

describe("UserController /user", () => {
    function mockCreateUserDTO(): CreateUserDTO {
        return { username: "alden", password: "Password1!", phoneNumber: "8004442222" };
    }

    async function createUser(user = mockCreateUserDTO()): Promise<UserDetails> {
        const response = await axios.post(TestFactory.route("user"), user);
        return response.data;
    }

    before(async () => {
        await TestFactory.init();
    });

    afterEach(async () => {
        await TestFactory.getPool().query("DELETE FROM USERS;");
    });

    after(async () => {
        await TestFactory.close();
    });

    describe("POST /", () => {
        it("responds with created user json", done => {
            const user = mockCreateUserDTO();
            chai.request(TestFactory.route("user"))
                .post("/")
                .send(user)
                .end((_, res) => {
                    expect(res).to.have.status(201);
                    expect(res).to.have.header("Content-Type", "application/json; charset=utf-8");

                    expect(res.body.id).is.a("string");
                    expect(res.body.username).to.equal(user.username);
                    expect(res.body.imageExists).to.be.false;
                    expect(res.body.createdAt).is.a("string");
                    done();
                });
        });
    });

    describe("POST /login", () => {
        it("logs in the user", async () => {
            const user = mockCreateUserDTO();
            const userDetails = await createUser(user);
            const res = await chai
                .request(TestFactory.route("user"))
                .post(`/login`)
                .send({ username: user.username, password: user.password });

            expect(res).to.have.status(200);
            expect(res).to.have.header("Content-Type", "application/json; charset=utf-8");

            expect(res.body.id).to.equal(userDetails.id);
            expect(res.body.username).to.equal(userDetails.username);
            expect(res.body.createdAt).to.equal(userDetails.createdAt);
            expect(res.body.imageExists).to.equal(userDetails.imageExists);
            expect(res.body.bio).to.equal(userDetails.bio);
        });
    });
});
