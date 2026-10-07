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
	makeMergeToDoListRequestToMergeOursWithTheirs("foo", null);
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


it("DLC part 1! calling mergeprotobufs with nothing, getting something, adding to it, and calling it again", (done) => {
/*
b'\nq\n,\x08\x00\x12\x1d\x08\xeb\xec\xa5\x87\x91\xd4\xe4\x02\x10\xff\xff\xff\xff\xff\xff\xff\xff\xff\x01\x18\x8f\xa5\xa6\x87\x91\xd4\xe4\x02\x1a\x07\n\x05inbox \x01\x10\x00\x18\x01"=\n9\x08\x00\x12\x1d\x08\xb4\xa4\xa6\x87\x91\xd4\xe4\x02\x10\xff\xff\xff\xff\xff\xff\xff\xff\xff\x01\x18\x86\xb3\xd6\xec\x94\xd4\xe4\x02\x1a\x0c\n\ntest event \x9e\xb0\xcf\xfd\xb6\xfb\xea\xdb0\x18\x00\x12\xd7\x04\n\'\x08\x00\x12\x1d\x08\xea\xed\xa5\x87\x91\xd4\xe4\x02\x10\xff\xff\xff\xff\xff\xff\xff\xff\xff\x01\x18\xa5\x87\xa6\x87\x91\xd4\xe4\x02\x1a\x02\n\x00 \x02\x1a\xe7\x03\nP\x08\x00\x12\x1d\x08\xad\x86\xa6\x87\x91\xd4\xe4\x02\x10\xff\xff\xff\xff\xff\xff\xff\xff\xff\x01\x18\xc9\x91\xa6\x87\x91\xd4\xe4\x02\x1a"\n learn how to use this to-do list \xed\x88\xb7\xa2\xac\xfb\xee\xb6\xa2\x01\x10\x00\x18\x01"{\nw\x08\x00\x12\x1d\x08\xf0\x89\xa6\x87\x91\xd4\xe4\x02\x10\xff\xff\xff\xff\xff\xff\xff\xff\xff\x01\x18\xb5\xbb\xd6\xec\x94\xd4\xe4\x02\x1aI\nGWatch the video on the "Help" page -- find it on the top navigation bar \xd2\xcf\xbb\x85\xe8\xdf\xc4\xe1\x91\x01\x18\x00"e\na\x08\x00\x12\x1d\x08\xb3\x8d\xa6\x87\x91\xd4\xe4\x02\x10\xff\xff\xff\xff\xff\xff\xff\xff\xff\x01\x18\xff\xbc\xd6\xec\x94\xd4\xe4\x02\x1a4\n2Read the book "Getting Things Done" by David Allen \xd2\xe9\xe9\xa9\xcf\xbc\xe5\xd4\x18\x18\x00"\xaa\x01\n\xa5\x01\x08\x00\x12\x1d\x08\xf0\x90\xa6\x87\x91\xd4\xe4\x02\x10\xff\xff\xff\xff\xff\xff\xff\xff\xff\x01\x18\xd7\xbe\xd6\xec\x94\xd4\xe4\x02\x1ax\nvAfter reading the book, try out a Weekly Review -- on the top navigation bar, find it underneath the "Other" drop-down \xad\x88\xfb\xee\xe6\xee\x8c\xf8e\x18\x00\x1aB\n<\x08\x00\x12\x1d\x08\xe2\x83\xa6\x87\x91\xd4\xe4\x02\x10\xff\xff\xff\xff\xff\xff\xff\xff\xff\x01\x18\xcb\x84\xa6\x87\x91\xd4\xe4\x02\x1a\x0f\n\rmiscellaneous \xd2\xab\xdd\xd2\xab\xc9\x8b\x8fn\x10\x00\x18\x01\x1a\xee\x03\n8\x08\x00\x12\x1d\x08\xf8\xbf\xd6\xec\x94\xd4\xe4\x02\x10\xff\xff\xff\xff\xff\xff\xff\xff\xff\x01\x18\xd5\xc0\xd6\xec\x94\xd4\xe4\x02\x1a\n\n\x08Contexts \x86\xfd\x9f\x9d\x9d\xca\x9e\x8d\x94\x01\x12=\n9\x08\x00\x12\x1d\x08\x81\xf3\xa5\x87\x91\xd4\xe4\x02\x10\xff\xff\xff\xff\xff\xff\xff\xff\xff\x01\x18\xeb\xf3\xa5\x87\x91\xd4\xe4\x02\x1a\x0b\n\t@computer \xda\xe8\xdc\x9b\x93\xa2\x8e\xd8\xf1\x01\x10\x01\x129\n5\x08\x00\x12\x1d\x08\xb0\xf5\xa5\x87\x91\xd4\xe4\x02\x10\xff\xff\xff\xff\xff\xff\xff\xff\xff\x01\x18\xf9\xf5\xa5\x87\x91\xd4\xe4\x02\x1a\x08\n\x06@phone \xdd\x87\x8e\x85\xbf\xf5\xc0\xc42\x10\x01\x128\n4\x08\x00\x12\x1d\x08\xaa\xf7\xa5\x87\x91\xd4\xe4\x02\x10\xff\xff\xff\xff\xff\xff\xff\xff\xff\x01\x18\xf1\xf7\xa5\x87\x91\xd4\xe4\x02\x1a\x07\n\x05@home \xf0\xab\x9a\x87\xaa\x8d\x96\xe74\x10\x01\x128\n4\x08\x00\x12\x1d\x08\x9f\xf9\xa5\x87\x91\xd4\xe4\x02\x10\xff\xff\xff\xff\xff\xff\xff\xff\xff\x01\x18\xe6\xf9\xa5\x87\x91\xd4\xe4\x02\x1a\x07\n\x05@work \xa0\xb8\x84\xa1\xd9\xae\xb9\xfe\x01\x10\x01\x12>\n:\x08\x00\x12\x1d\x08\x93\xfb\xa5\x87\x91\xd4\xe4\x02\x10\xff\xff\xff\xff\xff\xff\xff\xff\xff\x01\x18\xd9\xfb\xa5\x87\x91\xd4\xe4\x02\x1a\x0c\n\n@the store \xd2\x9a\xa5\xde\x9e\xdc\x8e\xa6\xf0\x01\x10\x01\x12B\n>\x08\x00\x12\x1d\x08\xa0\xfd\xa5\x87\x91\xd4\xe4\x02\x10\xff\xff\xff\xff\xff\xff\xff\xff\xff\x01\x18\xe9\x81\xa6\x87\x91\xd4\xe4\x02\x1a\x10\n\x0e@someday/maybe \xba\xcf\x92\xed\x95\xce\xcb\x82\x87\x01\x10\x00\x12@\n<\x08\x00\x12\x1d\x08\xaf\x80\xa6\x87\x91\xd4\xe4\x02\x10\xff\xff\xff\xff\xff\xff\xff\xff\xff\x01\x18\xa6\x82\xa6\x87\x91\xd4\xe4\x02\x1a\x0e\n\x0c@waiting for \x8b\xff\xc6\x8b\x88\x9c\xa2\xd7\xc4\x01\x10\x00'
inbox {
  common {
    is_deleted: false
    timestamp {
      ctime: 1568595354678891
      dtime: -1
      mtime: 1568595354686095
    }
    metadata {
      name: "inbox"
    }
    uid: 1
  }
  is_complete: false
  is_active: true
  actions {
    common {
      is_deleted: false
      timestamp {
        ctime: 1568595354686004
        dtime: -1
        mtime: 1568596372593030
      }
      metadata {
        name: "test event"
      }
      uid: 3510463393518835742
    }
    is_complete: false
  }
}
root {
  common {
    is_deleted: false
    timestamp {
      ctime: 1568595354679018
      dtime: -1
      mtime: 1568595354682277
    }
    metadata {
      name: ""
    }
    uid: 2
  }
  projects {
    common {
      is_deleted: false
      timestamp {
        ctime: 1568595354682157
        dtime: -1
        mtime: 1568595354683593
      }
      metadata {
        name: "learn how to use this to-do list"
      }
      uid: -6742526518833068947
    }
    is_complete: false
    is_active: true
    actions {
      common {
        is_deleted: false
        timestamp {
          ctime: 1568595354682608
          dtime: -1
          mtime: 1568596372594101
        }
        metadata {
          name: "Watch the video on the \"Help\" page -- find it on the top navigation bar"
        }
        uid: -7943484433461483566
      }
      is_complete: false
    }
    actions {
      common {
        is_deleted: false
        timestamp {
          ctime: 1568595354683059
          dtime: -1
          mtime: 1568596372594303
        }
        metadata {
          name: "Read the book \"Getting Things Done\" by David Allen"
        }
        uid: 1777116338573702354
      }
      is_complete: false
    }
    actions {
      common {
        is_deleted: false
        timestamp {
          ctime: 1568595354683504
          dtime: -1
          mtime: 1568596372594519
        }
        metadata {
          name: "After reading the book, try out a Weekly Review -- on the top navigation bar, find it underneath the \"Other\" drop-down"
        }
        uid: 7345427575983752237
      }
      is_complete: false
    }
  }
  projects {
    common {
      is_deleted: false
      timestamp {
        ctime: 1568595354681826
        dtime: -1
        mtime: 1568595354681931
      }
      metadata {
        name: "miscellaneous"
      }
      uid: 7934830491962136018
    }
    is_complete: false
    is_active: true
  }
}
ctx_list {
  common {
    is_deleted: false
    timestamp {
      ctime: 1568596372594680
      dtime: -1
      mtime: 1568596372594773
    }
    metadata {
      name: "Contexts"
    }
    uid: -7774767314839798138
  }
  contexts {
    common {
      is_deleted: false
      timestamp {
        ctime: 1568595354679681
        dtime: -1
        mtime: 1568595354679787
      }
      metadata {
        name: "@computer"
      }
      uid: -1031261568627166118
    }
    is_active: true
  }
  contexts {
    common {
      is_deleted: false
      timestamp {
        ctime: 1568595354679984
        dtime: -1
        mtime: 1568595354680057
      }
      metadata {
        name: "@phone"
      }
      uid: 3641445810717295581
    }
    is_active: true
  }
  contexts {
    common {
      is_deleted: false
      timestamp {
        ctime: 1568595354680234
        dtime: -1
        mtime: 1568595354680305
      }
      metadata {
        name: "@home"
      }
      uid: 3805075950163891696
    }
    is_active: true
  }
  contexts {
    common {
      is_deleted: false
      timestamp {
        ctime: 1568595354680479
        dtime: -1
        mtime: 1568595354680550
      }
      metadata {
        name: "@work"
      }
      uid: 143241581328145440
    }
    is_active: true
  }
  contexts {
    common {
      is_deleted: false
      timestamp {
        ctime: 1568595354680723
        dtime: -1
        mtime: 1568595354680793
      }
      metadata {
        name: "@the store"
      }
      uid: -1131464664378946222
    }
    is_active: true
  }
  contexts {
    common {
      is_deleted: false
      timestamp {
        ctime: 1568595354680992
        dtime: -1
        mtime: 1568595354681577
      }
      metadata {
        name: "@someday/maybe"
      }
      uid: -8717510439268472902
    }
    is_active: false
  }
  contexts {
    common {
      is_deleted: false
      timestamp {
        ctime: 1568595354681391
        dtime: -1
        mtime: 1568595354681638
      }
      metadata {
        name: "@waiting for"
      }
      uid: -4274328498502254709
    }
    is_active: false
  }
}
DLC
 */
    var firstReq = makeMergeToDoListRequestToReadLatestBecauseWeHaveNoToDoListYet();
    var firstResponse = callMergeProtoBufsApi(
	firstReq,
	function(sha1Checksum, todolist) {
	    expect(sha1Checksum).toBe("DLC");
	    expect(todolist).toBeInstanceOf(pb.MergeToDoListResponse);
	    // DLC more tests about todolist
	    done();
	},
	function(description) {
	    expect(description).toBe("Unable to call mergeprotobufs API");
	    done();
	}
    );
});


it("DLC part two! calling mergeprotobufs with nothing, getting something, adding to it, and calling it again", (done) => {
    // DLC NOW break this test case into pieces so that jest waits for done to be called
    const previousHash = "DLC figure out from part1";
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
    var secondResponse = callMergeProtoBufsApi(secondReq, "DLC this is fucked");
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