import {
  pb,
  makeMergeToDoListRequestToReadLatestBecauseWeHaveNoToDoListYet,
  makeMergeToDoListRequestToMergeOursWithTheirs,
  callMergeProtoBufsApi,
  sha1
} from "./index";

function exampleAction(text) {
  var a = new pb.Action([]);
  var common = new pb.Common([]);
  var ts = new pb.Timestamp([]);
  ts.setCtime("37");
  common.setTimestamp(ts);
  var metadata = new pb.Metadata([]);
  // test emoji support, four-byte unicode codepoints:
  if (typeof text === "undefined") {
    metadata.setName("cliches are so trite -- invent a new ❤❤❤ aphorism");
  } else {
    metadata.setName(text);
  }
  common.setMetadata(metadata);
  a.setCommon(common);
  return a;
}

function exampleInbox() {
  var inbox = new pb.Project([]);
  inbox.setActionsList([exampleAction()]);
  return inbox;
}

function exampleToDoList() {
  var tdl = new pb.ToDoList([]);
  tdl.setInbox(exampleInbox());
  return tdl;
}

const blankCompletedAction = {
  common: {
    isDeleted: undefined,
    metadata: undefined,
    timestamp: undefined,
    uid: undefined
  },
  ctx: {
    common: undefined,
    isActive: undefined
  },
  isComplete: true
};

test("Creating a new Action, writing it, reading it back", () => {
  var a = new pb.Action([]);
  a.setIsComplete(false);
  var common = new pb.Common([]);
  common.setIsDeleted(true);
  var ts = new pb.Timestamp([]);
  ts.setCtime("37");
  ts.setDtime("38");
  common.setTimestamp(ts);
  a.setCommon(common);
  var metadata = new pb.Metadata([]);
  common.setMetadata(metadata);
  metadata.setName("buy soymilk");
  metadata.setNote("unsweetened preferred");
  var ctx = new pb.Context([]);
  var ctxCommon = new pb.Common([]);
  ctxCommon.setUid("-2485513351100272937");
  // NOTE: this is the only field in 'Action.ctx' that matters, the UID. Full
  // Contexts live in the ContextList:
  ctx.setCommon(ctxCommon);
  a.setCtx(ctx);

  var ser = a.serializeBinary();
  expect(ser.length).toEqual(65);
  var aa = new pb.Action.deserializeBinary(ser);
  const gold = {
    common: {
      isDeleted: true,
      metadata: {
        name: "buy soymilk",
        note: "unsweetened preferred"
      },
      timestamp: {
        ctime: "37",
        dtime: "38",
        mtime: undefined
      },
      uid: undefined
    },
    ctx: {
      common: {
        isDeleted: undefined,
        metadata: undefined,
        timestamp: undefined,
        uid: "-2485513351100272937"
      },
      isActive: undefined
    },
    isComplete: false
  };
  expect(aa.toObject()).toEqual(gold);
});

test("Creating a new Action that is complete except for a Timestamp but otherwise blank", () => {
  var a = new pb.Action([]);
  a.setIsComplete(true);
  var common = new pb.Common([]);
  a.setCommon(common);
  var ctx = new pb.Context([]);
  a.setCtx(ctx);
  expect(a.toObject()).toEqual(blankCompletedAction);
  var ser = a.serializeBinary();
  expect(ser.length).toEqual(6);
  var aa = new pb.Action.deserializeBinary(ser);
  expect(aa.toObject()).toEqual(blankCompletedAction);
});

test("makeMergeToDoListRequestToReadLatestBecauseWeHaveNoToDoListYet", () => {
  var req = makeMergeToDoListRequestToReadLatestBecauseWeHaveNoToDoListYet();
  expect(req).toBeInstanceOf(pb.MergeToDoListRequest);
  const gold = {
    latest: undefined,
    newData: false,
    previousSha1Checksum: undefined,
    sanityCheck: "18369614221190020847"
  };
  expect(req.toObject()).toEqual(gold);
});

test("makeMergeToDoListRequestToMergeOursWithTheirs", () => {
  expect(() => {
    makeMergeToDoListRequestToMergeOursWithTheirs("foo", undefined);
  }).toThrow(TypeError);

  expect(() => {
    makeMergeToDoListRequestToMergeOursWithTheirs("foo", "bad sha1");
  }).toThrow("bad previousSha1Checksum");

  var req = makeMergeToDoListRequestToMergeOursWithTheirs(
    exampleToDoList(),
    "3737373737373737373737373737373737373737" // DLC use the real sha1
  );
  expect(req).toBeInstanceOf(pb.MergeToDoListRequest);
  const gold = {
    latest: {
      payload:
        "CkMiQQo/EgIIJRo5CjdjbGljaGVzIGFyZSBzbyB0cml0ZSAtLSBpbnZlbnQgYSBuZXcg4p2k4p2k4p2kIGFwaG9yaXNt",
      payloadIsZlibCompressed: false,
      payloadLength: 69,
      sha1Checksum: "e0bfad56e54b9972147b1a1e678a8341a9f40b18"
    },
    newData: false,
    sanityCheck: "18369614221190020847",
    previousSha1Checksum: "3737373737373737373737373737373737373737"
  };
  expect(req.toObject()).toEqual(gold);
});

it("calling mergeprotobufs with nothing, getting something, adding to it, and calling it again", async () => {
  var firstReq = makeMergeToDoListRequestToReadLatestBecauseWeHaveNoToDoListYet();
  var firstResponse = await callMergeProtoBufsApi(
    firstReq,
    function(description) {
      throw new Error(
        `the error callback has been called but the success callback should be called; description = ${description}`
      );
    },
    function(sha1Checksum, todolist) {
        throw new Error(
            `TODO(lgd): sha1Checksum = ${sha1Checksum}`
          );
    }
  );
  expect(firstResponse).toBeInstanceOf(pb.MergeToDoListResponse);
  const previousHash = firstResponse.sha1Checksum;
  expect(previousHash).toEqual("DLC the hash");
  expect(
    firstResponse
      .getToDoList()
      .getInbox()
      .getActionsList()[0]
      .getCommon()
      .getMetadata().name
  ).toEqual("buy soymilk");

  // Now add an action:
  firstResponse
    .getToDoList()
    .getInbox()
    .getActionsList()
    .push(exampleAction("new action"));

  // DLC make a new MergeToDoListRequest that includes firstResponse.getToDoList()
  var secondReq = "DLC TODO";

  const sha1HashOfMutatedToDoList = sha1(
    firstResponse.getToDoList().serializeBinary()
  );
  var secondResponse = callMergeProtoBufsApi(secondReq);
  // DLC expect that this response is the same as what we sent. it should not even have a
  expect(secondResponse.hasToDoList()).toBeFalsy();
  expect(secondResponse.previousSha1Checksum).toEqual(
    sha1HashOfMutatedToDoList
  );
});
// DLC (user) => { return user.name; }
test(`TODO(lgd): test deserialization, serialization, and CRUD operations for folders, project, actions, context, notes`, () => {
  expect("TODO").toEqual("TODO");
});

/*
    expect(() => {
	throw new Error("Something went wrong.");
    }).toThrow();
    const haystack = ["needle"];
    expect(haystack.indexOf("needle")).toBe(0);
*/

// DLC do not make it a runtime dependency but in tests let's use
// https://github.com/brotchie/protobuf-textformat (which is circa 2014 and
// uses an ancient fork of https://www.npmjs.com/package/protobufjs) to
// prettyprint text format protobufs for tests that are easier to read.
