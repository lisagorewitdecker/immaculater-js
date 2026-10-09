jest.mock("request-promise-native", () => jest.fn(() => new Promise(() => {})));

const {
    callMergeProtoBufsApi,
    makeMergeToDoListRequestToReadLatestBecauseWeHaveNoToDoListYet
} = require("../src/index");
const requestPromise = require("request-promise-native");

test("does not send authentication by default", () => {
    const request = makeMergeToDoListRequestToReadLatestBecauseWeHaveNoToDoListYet();
    callMergeProtoBufsApi(request, jest.fn(), jest.fn());

    expect(requestPromise.mock.calls[0][0]).not.toHaveProperty("auth");
});

test("uses authentication explicitly provided by the caller", () => {
    const request = makeMergeToDoListRequestToReadLatestBecauseWeHaveNoToDoListYet();
    const auth = { username: "provided-user", password: "provided-password" };
    callMergeProtoBufsApi(request, jest.fn(), jest.fn(), auth);

    expect(requestPromise).toHaveBeenCalledWith(
	expect.objectContaining({ auth })
    );
});
