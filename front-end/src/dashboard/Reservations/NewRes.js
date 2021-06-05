import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import ErrorAlert from "../../layout/ErrorAlert";
import { createReservation, formatPhoneNumber } from "../../utils/api";


export default function NewRes() {
	const history = useHistory();
	const [errors, setErrors] = useState(null);
	const [formData, setFormData] = useState({
		first_name: "",
		last_name: "",
		mobile_number: "",
		reservation_date: "",
		reservation_time: "",
		people: 0,
	});

	//create a date error handle
	//change all functions to be named correctly
	function timeTravel() {
		const foundErrors = [];
		const reservationUTC = new Date(`${formData.reservation_date} ${formData.reservation_time} GMT-0400`);

		const closedTimes = formData.reservation_time;
		if (reservationUTC.getDay() === 2) {
			foundErrors.push("Ya done goofed");
		}
		if (reservationUTC.getTime() < Date.now()) {
			foundErrors.push("place reservation in the future, Doc");
		}
		if (closedTimes.localeCompare("10:30") === -1) {
			foundErrors.push("Closed at this time")
		}
		if (closedTimes.localeCompare("21:30") === 1) {
			foundErrors.push("Closed at this time");
		}
		if (closedTimes.localeCompare("21:00") === 1) {
			foundErrors.push("Closed at this time");
		}
		return foundErrors;
	}

	function handleChange({ target }) {
		setFormData({ ...formData, [target.name]: target.value });
	}

	let phoneNumberFormatter = ({ target }) => {
		const formattedInputValue = formatPhoneNumber(target.value);
		setFormData({
			...formData,
			mobile_number: formattedInputValue,
		});
	};

	 function handleSubmit(event) {
		event.preventDefault();
		setErrors(null);
		const err = timeTravel();
		if (!err.length) {
			createReservation(formData);
			history.push(`/dashboard?date=${formData.reservation_date}`);
		}
		setErrors({ message: `error ${err.join(", ")}` });
	}

	return (
		<div>
			
			<form>
				{errors ? <ErrorAlert error={errors} /> : null}
				<label htmlFor="first_name">First Name:&nbsp;</label>
				<input name="first_name"
					id="first_name"
					type="text"
					onChange={handleChange}
					value={formData.first_name}
					required
				/>
				<label htmlFor="last_name">Last Name:&nbsp;</label>
				<input name="last_name"
					id="last_name"
					type="text"
					onChange={handleChange}
					value={formData.last_name}
					required
				/>
				<label htmlFor="mobile_number">Enter your phone number:</label>
				<input
					type="tel"
					id="mobile_number"
					name="mobile_number"
					pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}"
					onChange={phoneNumberFormatter}
					value={formData.mobile_number}
					required
				/>
				<label htmlFor="reservation_date">Choose a day:</label>
				<input
					name="reservation_date"
					id="reservation_date"
					type="date"
					onChange={handleChange}
					value={formData.reservation_date}
					required
				/>
				<label htmlFor="reservation_time">Pick a time:</label>
				<input
					name="reservation_time"
					id="reservation_time"
					type="time"
					onChange={handleChange}
					value={formData.reservation_time}
					required
				/>
				<label htmlFor="people">How many people?:</label>
				<input
					type="number"
					id="people"
					name="people"
					min="1"
					onChange={handleChange}
					value={formData.people}
					required
				/>
				<button type="submit" onClick={handleSubmit}> Submit </button>
				<button type="button" onClick={history.goBack}> Cancel </button>
			</form>
		</div>
	);
}
