import type { ComponentType } from "preact";
import { useEffect, useState } from "preact/hooks";

import type { ManualSpecs } from "@/lib/machine/manual-specs";

interface LazyManualSpecsFormProps {
	value: ManualSpecs;
	onSubmit: (specs: ManualSpecs) => void;
}

// The form pulls in the hardware datasets (~110KB). It sits in a closed <details>, so loading it
// after hydration keeps that parse cost off the critical path without any visible shift.
export function LazyManualSpecsForm(props: LazyManualSpecsFormProps) {
	const [Form, setForm] =
		useState<ComponentType<LazyManualSpecsFormProps> | null>(null);

	useEffect(() => {
		let cancelled = false;
		void import("@/components/gta/manual-specs-form").then((module) => {
			if (!cancelled) setForm(() => module.ManualSpecsForm);
		});
		return () => {
			cancelled = true;
		};
	}, []);

	return Form ? (
		<Form {...props} />
	) : (
		<div class="min-h-64" aria-hidden="true" />
	);
}
