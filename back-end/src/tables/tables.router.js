/**
 * Defines the router for reservation resources.
 *
 * @type {Router}
 */

 const router = require("express").Router();
 const controller = require("./tables.controller");
 const methodNotAllowed = require("../errors/methodNotAllowed"); //if methods for requests do not exist
 
 // router.route("/:reservation_id").post(controller.create).all(methodNotAllowed);
 router.route("/").get(controller.list).post(controller.create).all(methodNotAllowed);
 router.route("/:table_id/seat").put(controller.update).delete(controller.delete).all(methodNotAllowed);
 
 module.exports = router;
 