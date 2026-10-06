import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params, fetch }) => {
	const nctId = params.nctId.toUpperCase();

	if (!/^NCT\d+$/.test(nctId)) {
		return json({ error: 'Invalid NCT ID' }, { status: 400 });
	}

	try {
		const response = await fetch(
			`https://clinicaltrials.gov/api/v2/studies/${nctId}`
		);

		if (!response.ok) {
			return json(
				{ error: `ClinicalTrials.gov returned ${response.status}` },
				{ status: response.status }
			);
		}

		const trial = await response.json();

		return json(trial);
	} catch (error) {
		console.error(error);

		return json(
			{ error: 'Failed to fetch trial' },
			{ status: 500 }
		);
	}
};
