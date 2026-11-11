import { useEffect, useState } from "preact/hooks";

import { HardwareCombobox } from "@/components/gta/hardware-combobox";

import { MANUAL_INPUT_CLASS } from "@/constants/gta/manual-input-class";

import { scoreCpu } from "@/lib/hardware/score-cpu";
import { scoreGpu } from "@/lib/hardware/score-gpu";
import { suggestCpus, suggestGpus } from "@/lib/hardware/suggest-hardware";
import {
	EMPTY_MANUAL_SPECS,
	type ManualSpecs,
} from "@/lib/machine/manual-specs";

interface ManualSpecsFormProps {
	value: ManualSpecs;
	onSubmit: (specs: ManualSpecs) => void;
}

const INPUT_CLASS = MANUAL_INPUT_CLASS;
// Enough to cover a model's variants (Ti, SUPER, XT) without a scrolling list.
const SUGGESTION_COUNT = 6;

function searchCpus(text: string) {
	return suggestCpus(text, SUGGESTION_COUNT);
}

function searchGpus(text: string) {
	return suggestGpus(text, SUGGESTION_COUNT);
}

function isCpu(text: string) {
	return scoreCpu(text) !== null;
}

function isGpu(text: string) {
	return scoreGpu(text) !== null;
}

// Fallback for when detection leaves gaps and the visitor would rather type than run a script.
export function ManualSpecsForm({ value, onSubmit }: ManualSpecsFormProps) {
	const [draft, setDraft] = useState(toDraft(value));

	// Saved, linked or agent-entered specs arrive after mount; show them in the fields.
	useEffect(() => {
		setDraft(toDraft(value));
	}, [value]);

	function update(field: keyof Draft, text: string) {
		setDraft({ ...draft, [field]: text });
	}

	function submit(event: Event) {
		event.preventDefault();
		onSubmit(fromDraft(draft));
	}

	function clear() {
		setDraft(toDraft(EMPTY_MANUAL_SPECS));
		onSubmit(EMPTY_MANUAL_SPECS);
	}

	return (
		<form
			class="flex flex-col gap-4"
			aria-label="Enter your PC specs"
			onSubmit={submit}
		>
			<p class="text-muted-foreground text-sm sm:text-xs">
				Fill in only what you know; it replaces what was detected. Stays in this
				browser.
			</p>
			<div class="grid gap-3 sm:grid-cols-2">
				<Field
					id="manual-cpuModel"
					label="CPU model"
					hint="e.g. Ryzen 5 3600 or Core i7-9700K"
				>
					<HardwareCombobox
						id="manual-cpuModel"
						name="cpuModel"
						listLabel="CPU suggestions"
						value={draft.cpuModel}
						onChange={(text) => update("cpuModel", text)}
						search={searchCpus}
						isRecognised={isCpu}
					/>
				</Field>
				<Field
					id="manual-gpuName"
					label="GPU model"
					hint="e.g. GeForce RTX 3060 or RX 6600"
				>
					<HardwareCombobox
						id="manual-gpuName"
						name="gpuName"
						listLabel="GPU suggestions"
						value={draft.gpuName}
						onChange={(text) => update("gpuName", text)}
						search={searchGpus}
						isRecognised={isGpu}
					/>
				</Field>
				<Field id="manual-ramGb" label="RAM (GB)" hint="Total installed memory">
					<input
						class={INPUT_CLASS}
						type="number"
						min="0.1"
						step="any"
						inputMode="decimal"
						value={draft.ramGb}
						id="manual-ramGb"
						aria-describedby="manual-ramGb-hint"
						name="ramGb"
						onInput={(event) => update("ramGb", event.currentTarget.value)}
					/>
				</Field>
				<Field
					id="manual-vramGb"
					label="Video memory (GB)"
					hint="Your GPU's own VRAM"
				>
					<input
						class={INPUT_CLASS}
						type="number"
						min="0.1"
						step="any"
						inputMode="decimal"
						value={draft.vramGb}
						id="manual-vramGb"
						aria-describedby="manual-vramGb-hint"
						name="vramGb"
						onInput={(event) => update("vramGb", event.currentTarget.value)}
					/>
				</Field>
				<Field
					id="manual-diskFreeGb"
					label="Free disk space (GB)"
					hint="On the drive you would install to"
				>
					<input
						class={INPUT_CLASS}
						type="number"
						min="0.1"
						step="any"
						inputMode="decimal"
						value={draft.diskFreeGb}
						id="manual-diskFreeGb"
						aria-describedby="manual-diskFreeGb-hint"
						name="diskFreeGb"
						onInput={(event) => update("diskFreeGb", event.currentTarget.value)}
					/>
				</Field>
			</div>
			<div class="flex flex-wrap items-center gap-2">
				<button
					type="submit"
					class="glass inline-flex h-10 cursor-pointer items-center rounded-full px-4 font-medium text-foreground text-sm transition-colors hover:border-accent/40 hover:text-accent focus-visible:outline-2 focus-visible:outline-accent sm:h-8"
				>
					Check my PC
				</button>
				<button
					type="button"
					onClick={clear}
					class="h-10 cursor-pointer px-2 text-muted-foreground text-sm transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-accent sm:h-8"
				>
					Clear
				</button>
			</div>
		</form>
	);
}

interface FieldProps {
	id: string;
	label: string;
	hint: string;
	children: preact.ComponentChildren;
}

function Field({ id, label, hint, children }: FieldProps) {
	return (
		<div class="flex flex-col gap-1.5">
			<label for={id} class="font-medium text-foreground text-sm">
				{label}
			</label>
			{children}
			<span id={`${id}-hint`} class="text-muted-foreground text-xs">
				{hint}
			</span>
		</div>
	);
}

interface Draft {
	cpuModel: string;
	gpuName: string;
	ramGb: string;
	vramGb: string;
	diskFreeGb: string;
}

function toDraft(specs: ManualSpecs): Draft {
	return {
		cpuModel: specs.cpuModel ?? "",
		gpuName: specs.gpuName ?? "",
		ramGb: specs.ramGb?.toString() ?? "",
		vramGb: specs.vramGb?.toString() ?? "",
		diskFreeGb: specs.diskFreeGb?.toString() ?? "",
	};
}

function fromDraft(draft: Draft): ManualSpecs {
	return {
		cpuModel: draft.cpuModel.trim() || null,
		gpuName: draft.gpuName.trim() || null,
		ramGb: toPositive(draft.ramGb),
		vramGb: toPositive(draft.vramGb),
		diskFreeGb: toPositive(draft.diskFreeGb),
	};
}

function toPositive(text: string): number | null {
	const number = Number(text);
	return text.trim() !== "" && Number.isFinite(number) && number > 0
		? number
		: null;
}
