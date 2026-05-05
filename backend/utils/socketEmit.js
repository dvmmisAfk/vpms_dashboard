// utils/socketEmit.js

function emitCheckEvent(req, payload) {
  const io = req.app && req.app.get("io");
  if (io) io.emit("check-event", payload);
}

module.exports = { emitCheckEvent };
