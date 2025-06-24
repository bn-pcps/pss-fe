export function formatFileSize(n: number, decimals = 1, nUnit = 'B'): string {
	if (n === 0) return '0 ' + nUnit;
	// const k = 1024;
	const k = 1000;
	const dm = decimals < 0 ? 0 : decimals;
	const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

	// Find the starting index based on nUnit
	let startIndex = sizes.findIndex(
		(unit) =>
			unit.toLowerCase() === nUnit.toLowerCase() ||
			(unit === 'Bytes' && nUnit.toLowerCase() === 'b')
	);
	if (startIndex === -1) startIndex = 0; // Default to Bytes if not found

	const i = Math.floor(Math.log(n) / Math.log(k));
	const unitIndex = startIndex + i;

	// Calculate the value in the current unit
	const value = n / Math.pow(k, i);

	// If the value is very close to the next unit (within 0.1), round up
	if (value > 0.9 && value < 1) {
		return '1 ' + (sizes[unitIndex] || sizes[sizes.length - 1]);
	}

	return parseFloat(value.toFixed(dm)) + ' ' + (sizes[unitIndex] || sizes[sizes.length - 1]);
}
