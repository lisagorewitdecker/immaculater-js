// DLC const pb = require('./index');

console.log('cDLC 1');
import index from './index';

var blankCompletedAction = {
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

test('Creating a new Action', () => {
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

    expect(a.toObject()).toEqual({"common": undefined, "ctx": undefined, "isComplete": true});
    var ser = a.serializeBinary();
    expect(ser.length).toEqual(2);
    var aa = new index.pb.Action(ser);
    expect(aa.toObject()).toEqual(blankCompletedAction);
});

test('Creating a new Action that is complete but otherwise blank', () => {
    var a = new index.pb.Action([]);
    a.setIsComplete(true);
    var common = new index.pb.Common([]);
    a.setCommon(common);
    var ctx = new index.pb.Context([]);
    a.setCtx(ctx);
    expect(a.toObject()).toEqual(blankCompletedAction);
    var ser = a.serializeBinary();
    expect(ser.length).toEqual(6);
    var aa = new index.pb.Action(ser);
    expect(aa.toObject()).toEqual(blankCompletedAction);
});

test(`TODO(lgd): test deserialization, serialization, and CRUD operations for folders, project, actions, context, notes`, () => {
    const haystack = ["needle"];
    expect(haystack.indexOf("needle")).toBe(0);
});

test("TODO(lgd): this is just an example", () => {
    expect(() => {
	throw new Error("Something went wrong.");
    }).toThrow();
});
