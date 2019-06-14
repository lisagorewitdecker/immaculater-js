import index from './index';

const blankCompletedAction = {
    "common": {
	"isDeleted": undefined,
	"metadata": undefined,
	"timestamp": undefined,
	"uid": undefined,
    },
    "ctx": {
	"common": undefined,
	"isActive": undefined,
    },
    "isComplete": true
};

test('Creating a new Action, writing it, reading it back', () => {
    var a = new index.pb.Action([]);
    a.setIsComplete(false);
    var common = new index.pb.Common([]);
    common.setIsDeleted(true);
    var ts = new index.pb.Timestamp([]);
    ts.setCtime("37");
    ts.setDtime("38");
    common.setTimestamp(ts);
    a.setCommon(common);
    var metadata = new index.pb.Metadata([]);
    common.setMetadata(metadata);
    metadata.setName("buy soymilk");
    metadata.setNote("unsweetened preferred");
    var ctx = new index.pb.Context([]);
    var ctxCommon = new index.pb.Common([]);
    ctxCommon.setUid("-2485513351100272937");
    // NOTE: this is the only field in 'Action.ctx' that matters, the UID. Full
    // Contexts live in the ContextList:
    ctx.setCommon(ctxCommon);
    a.setCtx(ctx);

    var ser = a.serializeBinary();
    expect(ser.length).toEqual(65);
    var aa = new index.pb.Action.deserializeBinary(ser);
    const gold = {
	"common": {
	    "isDeleted": true,
	    "metadata": {
		"name": "buy soymilk", "note": "unsweetened preferred"
	    }, "timestamp": {
		"ctime": "37", "dtime": "38", "mtime": undefined
	    }, "uid": undefined
	},
	"ctx": {
	    "common": {
		"isDeleted": undefined, "metadata": undefined, "timestamp": undefined, "uid": "-2485513351100272937"
	    },
	    "isActive": undefined
	},
	"isComplete": false
    };
    expect(aa.toObject()).toEqual(gold);
});

test('Creating a new Action that is complete except for a Timestamp but otherwise blank', () => {
    var a = new index.pb.Action([]);
    a.setIsComplete(true);
    var common = new index.pb.Common([]);
    a.setCommon(common);
    var ctx = new index.pb.Context([]);
    a.setCtx(ctx);
    expect(a.toObject()).toEqual(blankCompletedAction);
    var ser = a.serializeBinary();
    expect(ser.length).toEqual(6);
    var aa = new index.pb.Action.deserializeBinary(ser);
    expect(aa.toObject()).toEqual(blankCompletedAction);
});

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
