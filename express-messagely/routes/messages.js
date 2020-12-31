const Router = require("express").Router;
const User = require("../models/user");
const Message = require("../models/message");
const { ensureLoggedIn, ensureCorrectUser } = require("../middleware/auth");
const ExpressError = require("../expressError");

const router = new Router();

/** GET /:id - get detail of message.
 *
 * => {message: {id,
 *               body,
 *               sent_at,
 *               read_at,
 *               from_user: {username, first_name, last_name, phone},
 *               to_user: {username, first_name, last_name, phone}}
 *
 * Make sure that the currently-logged-in users is either the to or from user.
 *
 **/
router.get("/:id", ensureLoggedIn, async (req, res, next) => {
  try {
    let m = await Message.get(req.params.id);
    if (
      m.from_user.username !== req.user.username &&
      m.to_user.username !== req.user.username
    ) {
      throw new ExpressError("Unauthorized", 401);
    }
    return res.json({ m });
  } catch (e) {
    return next(e);
  }
});
/** POST / - post message.
 *
 * {to_username, body} =>
 *   {message: {id, from_username, to_username, body, sent_at}}
 *
 **/

router.post("/", ensureLoggedIn, async (req, res, next) => {
  try {
    let { to_username, body } = req.body;
    let m = await Message.create(req.user.username, to_username, body);
    return res.json({ m });
  } catch (e) {
    return next(e);
  }
});
/** POST/:id/read - mark message as read:
 *
 *  => {message: {id, read_at}}
 *
 * Make sure that the only the intended recipient can mark as read.
 *
 **/
router.post("/:id/read", ensureLoggedIn, async (req, res, next) => {
  try {
    let m = await Message.get(req.params.id);
    if (req.user.username !== m.to_user.username) {
      throw new ExpressError("Unauthorized", 401);
    }
    let result = await Message.markRead(req.params.id);
    return res.json({ result });
  } catch (e) {
    return next(e);
  }
});

module.exports = router;
