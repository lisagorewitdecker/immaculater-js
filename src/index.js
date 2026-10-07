export const pb = require("./pyatdl_pb.js");
var sha1Module = require("sha1");
var req = require("request");
var rp = require("request-promise-native");
var crypto = require("crypto");

// DLC require('crypto') and you can say crypto.createHash('sha1').update(bytes).digest(); and avoid the 'sha1' dependency

function makeSaneMergeToDoListRequest() {
    var req = new pb.MergeToDoListRequest([]);
    req.setSanityCheck("18369614221190020847");
    return req;
}

export function sha1(someBytes) {
    return sha1Module(someBytes);
}

// Returns a pb.MergeToDoListRequest that has no to-do list in it. You will
// therefore, when you use it to call the mergeprotobufs API, receive the
// latest thing the backend knows about (which would overwrite any of your
// changes, so you'd better not have any).
export function makeMergeToDoListRequestToReadLatestBecauseWeHaveNoToDoListYet() {
    return makeSaneMergeToDoListRequest();
}

// DLC MergeToDoListRequest that passes in the hash only to see if the backend
// has more recent data

// Returns a pb.MergeToDoListRequest that wraps the given pb.ToDoList and is
// based on a previous MergeToDoListResponse.
export function makeMergeToDoListRequestToMergeOursWithTheirs(
    ourTdl,
    previousSha1Checksum
) {
    if (!previousSha1Checksum.match(/^[a-f0-9]{40}$/)) {
	throw new Error("bad previousSha1Checksum");
    }
    var req = makeSaneMergeToDoListRequest();
    req.setPreviousSha1Checksum(previousSha1Checksum);
    var cksum = new pb.ChecksumAndData([]);
    cksum.setPayloadIsZlibCompressed(false);
    const ourTdlBytes = ourTdl.serializeBinary();
    cksum.setPayload(ourTdlBytes);
    cksum.setPayloadLength(ourTdlBytes.length);
    cksum.setSha1Checksum(sha1(ourTdlBytes));
    req.setLatest(cksum);
    return req;
}

// DLC explain error handling... throws what?
export function callMergeProtoBufsApi(request, success, error, auth) {
    if (!(request instanceof pb.MergeToDoListRequest)) {
	throw new TypeError("bad type of request");
    }
    var options = {
	url: "https://immaculater.herokuapp.com/todo/mergeprotobufs",
	method: "POST",
	pathname: "/todo/mergeprotobufs",
	path: "/todo/mergeprotobufs",
	body: request.serializeBinary(),
	json: false,
	headers: {
	    "Content-Type": "application/x-protobuf"
	}
    };
    if (auth) {
	options.auth = auth;
    }
    rp(options)
	.then(function(parsedBody) {
	    var resp = new pb.MergeToDoListResponse.deserializeBinary(parsedBody);
	    if (resp.getSanityCheck() !== 100) {
		error("invalid response; try again");
		return;
	    }
	    success(resp.getSha1Checksum(), resp.getToDoList());
	})
	.catch(function(err) {
	    console.log("DLC here 000" + err);
	    error("DLC error is " + err);
	});
}

// return new pb.MergeToDoListResponse([]); // DLC NOOOOOOO! call //
