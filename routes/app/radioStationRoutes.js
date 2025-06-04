const express = require("express");
const router = express.Router();
const controller = require("../../controllers/app/radioStationController");

router.post("/add-stations", controller.addRadioStation);
router.get("/get-stations", controller.getAllStations);
router.put("update/:id", controller.updateStation);
router.delete("delete/:id", controller.deleteStation);
router.patch("/:id/toggle", controller.toggleActive);

module.exports = router;
