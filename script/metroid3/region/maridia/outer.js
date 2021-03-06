// Maridia: Outer
function canEnterMaridiaOuter() {
	let ret = canEnterNorfairWest() && canUsePowerBombs();
	if(trackerData.mapLogic == "casualLogic") {
		ret = ret && canSwimSM();
	} else {
		ret = ret && (canSwimSM() || (has("hijump") && (has("springball") || has("ice"))));
	}
	return ret;
}
chests.metroid3[69] = {
	name: "Missile (green Maridia shinespark) " + mini("gravity") + mini("speed"),
	x: "601",
	y: "565",
	isOpened: false,
	isAvailable: function () {
		const availability = new Availability();
		if(canEnterMaridiaOuter() && canSwimSM() && canDashSM()) {
			availability.tourneyLogic = "available";
		}
		if(canEnterMaridiaOuter() && canDashSM()) {
			availability.casualLogic = "available";
		}
		return availability;
	}
};
chests.metroid3[70] = {
	name: "Super Missile (green Maridia)",
	x: "619",
	y: "547",
	isOpened: false,
	isAvailable: function () {
		const availability = new Availability();
		if(canEnterMaridiaOuter()) {
			availability.tourneyLogic = "available";
			availability.casualLogic = "available";
		}
		return availability;
	}
};
chests.metroid3[71] = {
	name: "Energy Tank, Mama turtle",
	x: "745",
	y: "565",
	isOpened: false,
	isAvailable: function () {
		const availability = new Availability();
		if(canEnterMaridiaOuter() && (canFlySM() || canDashSM() || canGrappleSM())) {
			availability.tourneyLogic = "available";
			availability.casualLogic = "available";
		}
		return availability;
	}
};
chests.metroid3[72] = {
	name: "Missile (green Maridia tatori)",
	x: "763",
	y: "583",
	isOpened: false,
	isAvailable: function () {
		const availability = new Availability();
		if(canEnterMaridiaOuter()) {
			availability.tourneyLogic = "available";
			availability.casualLogic = "available";
		}
		return availability;
	}
};

