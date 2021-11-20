/**
 * Defines the router for reservation resources.
 *
 * @type {Router}
 */

const router = require("express").Router();
const controller = require("./reservations.controller");
const methodNotAllowed = require("../errors/methodNotAllowed"); //if methods for requests do not exist

// router.route("/:reservation_id").post(controller.create).all(methodNotAllowed);
router.route("/").get(controller.list).post(controller.create).all(methodNotAllowed);
router.route("/:reservation_Id").get(controller.read).put(controller.update).all(methodNotAllowed);
router.route("/:reservation_Id/status").put(controller.updateStatus).all(methodNotAllowed);

module.exports = router;
