export const friendlyTimeEn = (since: Date, onFriendlyTimeChanged: (newTime: string, originalTime: Date) => void) => {
	const msPassed = Date.now() - since.getTime();
	const setFriendlyTimeTo = (newValue: string, msUntilNextCalculation?: number) => {
		onFriendlyTimeChanged(newValue, since);
		if (msUntilNextCalculation != null && msUntilNextCalculation > 0) {
			setTimeout(() => friendlyTimeEn(since, onFriendlyTimeChanged), msUntilNextCalculation);
		}
	}
	const minuteInMs = 60000;
	const hourInMs = 60 * minuteInMs;
	const dayInMs = 24 * hourInMs;
	if (msPassed < minuteInMs) {
		setFriendlyTimeTo(`seconds ago`, minuteInMs - msPassed);
	} else if (msPassed < hourInMs) {
		const minutes = Math.floor(msPassed/minuteInMs);
		setFriendlyTimeTo(`${minutes} minute${ minutes > 1 ? 's' : ''} ago`, minuteInMs - (msPassed % minuteInMs));
	} else if (msPassed < dayInMs) {
		const hours = Math.floor(msPassed/hourInMs);
		setFriendlyTimeTo(`${hours} hour${ hours > 1 ? 's' : ''} ago`, hourInMs - (msPassed % hourInMs));
	} else if (msPassed < 14 * dayInMs) {
		const days = Math.floor(msPassed/dayInMs);
		setFriendlyTimeTo(`${days} day${ days > 1 ? 's' : ''} ago`, dayInMs - (msPassed % dayInMs));
	} else {
		setFriendlyTimeTo(since.toLocaleString('en-US', {dateStyle: "long",timeStyle: "short"}));
	}
}