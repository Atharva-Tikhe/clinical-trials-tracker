<script lang="ts">
	const nctIds = [
    'NCT07587242',
	'NCT05670730',
	'NCT06244082',
	'NCT07038824',
	'NCT07682129',
	'NCT07037862',
	'NCT04906460',
	'NCT07209332',
	'NCT06280209',
	'NCT07573631',
	'NCT07608432',
	'NCT05524883',
	'NCT05996003',
	];
	// 'NCT06280209'

	type Trial = {
		nctId: string;
		title: string;
		status: string;
		lastUpdate: string;
		startDate?: string;
		completionDate?: string;
		conditions: string[];
		briefSummary?: string;
		studyType?: string;
		phase?: string;
	};

	let trials: Trial[] = $state([]);
	let loading: boolean = $state(true);
	let error: string = $state('');

	async function fetchTrials() {
		loading = true;
		error = '';

		try {
			const results = await Promise.all(
				nctIds.map(async (nctId) => {
					const response = await fetch(
            `/api/trials/${encodeURIComponent(nctId)}`
					);

					if (!response.ok) {
						throw new Error(`Failed to fetch ${nctId}`);
					}

					const study = await response.json();
					const protocol = study.protocolSection;

					return {
						nctId: protocol.identificationModule?.nctId,
						title: protocol.identificationModule?.briefTitle,
						status: protocol.statusModule?.overallStatus,
						lastUpdate: protocol.statusModule?.lastUpdatePostDateStruct?.date,
						startDate:
							protocol.statusModule?.startDateStruct?.date,
						completionDate:
							protocol.statusModule?.completionDateStruct?.date,
						conditions:
							protocol.conditionsModule?.conditions ?? [],
						briefSummary:
							protocol.descriptionModule?.briefSummary,
						studyType:
							protocol.designModule?.studyType,
						phase:
							protocol.designModule?.phases?.join(', ')
					};
				})
			);

			trials = results;
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to fetch trials';
		} finally {
			loading = false;
		}
	}

	function statusClass(status: string) {
		return status.toLowerCase().replaceAll('_', '-');
	}

	function formatDate(date?: string) {
		if (!date) return '—';

		return new Intl.DateTimeFormat('en-GB', {
			day: 'numeric',
			month: 'short',
			year: 'numeric'
		}).format(new Date(date));
	}

	fetchTrials();
</script>

<svelte:head>
	<title>Clinical Trials</title>
</svelte:head>

<div class="trials">
	<header>
		<h1>Clinical Trials</h1>
		<p>{nctIds.length} trials</p>
	</header>

	{#if loading}
		<p>Loading trials...</p>
	{:else if error}
		<p class="error">{error}</p>
	{:else}
		<div class="trial-grid">
			{#each trials as trial}
				<article class="trial-card">
					<div class="card-header">
						<div>
							<a
								class="nct-id"
								href={`https://clinicaltrials.gov/study/${trial.nctId}`}
								target="_blank"
								rel="noopener noreferrer"
							>
								{trial.nctId}
							</a>

							<h2>{trial.title}</h2>
						</div>

						<span class={`status ${statusClass(trial.status)}`}>
							{trial.status.replaceAll('_', ' ')}
						</span>
					</div>

					{#if trial.briefSummary}
						<p class="summary">
							{trial.briefSummary}
						</p>
					{/if}

					<div class="metadata">
						<div>
							<span>Last updated</span>
							<strong>{formatDate(trial.lastUpdate)}</strong>
						</div>

						<div>
							<span>Study type</span>
							<strong>{trial.studyType ?? '—'}</strong>
						</div>

						<div>
							<span>Phase</span>
							<strong>{trial.phase ?? '—'}</strong>
						</div>

						<div>
							<span>Start date</span>
							<strong>{formatDate(trial.startDate)}</strong>
						</div>

						<div>
							<span>Completion</span>
							<strong>{formatDate(trial.completionDate)}</strong>
						</div>
					</div>

					{#if trial.conditions.length}
						<div class="conditions">
							{#each trial.conditions as condition}
								<span>{condition}</span>
							{/each}
						</div>
					{/if}
				</article>
			{/each}
		</div>
	{/if}
</div>

<style>
	.trials {
		max-width: 1200px;
		margin: 0 auto;
		padding: 2rem;
	}

	header {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		margin-bottom: 1.5rem;
	}

	header h1 {
		margin: 0;
	}

	header p {
		color: #666;
	}

	.trial-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(450px, 1fr));
		gap: 1rem;
	}

	.trial-card {
		padding: 1.25rem;
		border: 1px solid #ddd;
		border-radius: 12px;
		background: white;
	}

	.card-header {
		display: flex;
		justify-content: space-between;
		gap: 1rem;
	}

	.nct-id {
		font-size: 0.85rem;
		font-weight: 600;
		color: #555;
	}

	h2 {
		margin: 0.4rem 0 0;
		font-size: 1.15rem;
	}

	.status {
		height: fit-content;
		padding: 0.35rem 0.65rem;
		border-radius: 999px;
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: capitalize;
		white-space: nowrap;
		background: #eee;
	}

	.status.recruiting {
		background: #dcfce7;
		color: #166534;
	}

	.status.active-not-recruiting {
		background: #dbeafe;
		color: #1e40af;
	}

	.status.completed {
		background: #e5e7eb;
		color: #374151;
	}

	.status.not-yet-recruiting {
		background: #fef3c7;
		color: #92400e;
	}

	.summary {
		margin: 1rem 0;
		line-height: 1.5;
		color: #555;
	}

	.metadata {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 0.75rem;
		padding: 1rem 0;
		border-top: 1px solid #eee;
		border-bottom: 1px solid #eee;
	}

	.metadata div {
		display: flex;
		flex-direction: column;
		gap: 0.2rem;
	}

	.metadata span {
		font-size: 0.75rem;
		color: #888;
	}

	.metadata strong {
		font-size: 0.9rem;
	}

	.conditions {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem;
		margin-top: 1rem;
	}

	.conditions span {
		padding: 0.3rem 0.55rem;
		border-radius: 6px;
		background: #f3f4f6;
		font-size: 0.75rem;
	}

	.error {
		color: #b91c1c;
	}

	@media (max-width: 600px) {
		.trials {
			padding: 1rem;
		}

		.trial-grid {
			grid-template-columns: 1fr;
		}

		.card-header {
			flex-direction: column;
		}
	}
</style>
