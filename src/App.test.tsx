import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import App from './App';
import qualis from './fixtures/simulator-v0.3/QUALIS/confirmed_simulated_graph.json';
import giFixture from './diagnostic/auxiliary/fixtures/gi-full-valid.json';
import giAuxiliaryEntities from './diagnostic/auxiliary/fixtures/gi-minimal-compatible.json';
import gd from './diagnostic/auxiliary/fixtures/gd-minimal-compatible.json';
import gdMismatch from './diagnostic/auxiliary/fixtures/gd-mismatch.json';
import diagnostic from './diagnostic/fixtures/diagnostic-output-v0.1.2-viewmodel-rich.json';
import pilot from './diagnostic/fixtures/pilot-r01/diagnostic-output-v0.1.2-pilot-r01.json';
import pilotGi from './diagnostic/fixtures/pilot-r01/gi-pilot-r01-minimal.json';
import pilotGd from './diagnostic/fixtures/pilot-r01/gd-pilot-r01-minimal.json';

const gi = {
  ...structuredClone(giFixture),
  graph_ref: 'graph-minimal',
  graph_version: '1',
  entities: [...structuredClone(giFixture.entities), ...structuredClone(giAuxiliaryEntities.entities.slice(0, 2))],
};

const artifactFile = (artifact: unknown, name: string) => ({
  name,
  size: 1024,
  text: vi.fn().mockResolvedValue(JSON.stringify(artifact)),
});

describe('App artifact import integration', () => {
  const loadPilot = async (name = 'diagnostic-output-v0.1.2-pilot-r01.json') => {
    fireEvent.click(screen.getByRole('button', { name: 'Diagnostic Output' }));
    fireEvent.change(screen.getByLabelText('Cargar Diagnostic Output'), { target: { files: [artifactFile(pilot, name)] } });
    await waitFor(() => expect(screen.getByText(new RegExp(`PRIMARY: Diagnostic Output · ${name}`))).toBeInTheDocument());
  };

  it('shows the stabilized renderer version', () => {
    render(<App />);
    expect(screen.getByText('v0.2.0')).toBeInTheDocument();
  });

  it('offers an explicit canonical Diagnostic Output route while retaining legacy', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Diagnostic Output' }));
    expect(screen.getByTestId('diagnostic-graph-canvas')).toBeInTheDocument();
    expect(screen.getByText('ID: claim-supported')).toBeInTheDocument();
    expect(screen.getByText('ID: step-rich')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('input-1');

    fireEvent.click(screen.getByRole('button', { name: 'Legacy' }));
    expect(screen.getByText(/PRIMARY: Legacy · QUALIS · Demo incluida/)).toBeInTheDocument();
    expect(screen.getByTestId('graph-canvas')).toBeInTheDocument();
  });

  it('offers the structural subview only for FULL_GI and restores diagnosis when removed', async () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Diagnostic Output' }));
    expect(screen.queryByRole('button', { name: 'Mapa estructural G_I' })).not.toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Cargar G_I'), { target: { files: [artifactFile(giFixture, 'full-gi.json')] } });
    await waitFor(() => expect(screen.getByRole('button', { name: 'Mapa estructural G_I' })).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: 'Mapa estructural G_I' }));
    expect(screen.getByTestId('gi-structural-graph-canvas')).toBeInTheDocument();
    expect(screen.queryByTestId('diagnostic-graph-canvas')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Diagnóstico' }));
    expect(screen.getByText('Def_e: TRUE')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Mapa estructural G_I' }));
    fireEvent.click(screen.getByRole('button', { name: 'Quitar G_I' }));
    await waitFor(() => expect(screen.queryByRole('button', { name: 'Mapa estructural G_I' })).not.toBeInTheDocument());
    expect(screen.getByTestId('diagnostic-graph-canvas')).toBeInTheDocument();
  });

  it('does not offer a structural map for MINIMAL_AUXILIARY_GI', async () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Diagnostic Output' }));
    fireEvent.change(screen.getByLabelText('Cargar G_I'), { target: { files: [artifactFile(giAuxiliaryEntities, 'minimal-gi.json')] } });
    await waitFor(() => expect(screen.getByText(/G_I:.*minimal-gi\.json/)).toBeInTheDocument());
    expect(screen.queryByRole('button', { name: 'Mapa estructural G_I' })).not.toBeInTheDocument();
    expect(screen.getByTestId('diagnostic-graph-canvas')).toBeInTheDocument();
  });

  it('allows a mismatched FULL_GI map while preserving its mismatch warning', async () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Diagnostic Output' }));
    fireEvent.change(screen.getByLabelText('Cargar G_I'), { target: { files: [artifactFile(giFixture, 'mismatch-full.json')] } });
    await waitFor(() => expect(screen.getByText('LOADED_MISMATCH')).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: 'Mapa estructural G_I' }));
    expect(screen.getByText(/no coincide con el Diagnostic Output activo/)).toBeInTheDocument();
    expect(screen.getByText(/sin overlay diagnóstico/)).toBeInTheDocument();
    expect(screen.queryByRole('checkbox', { name: 'Mostrar diagnóstico' })).not.toBeInTheDocument();
  });

  it('recomputes a compatible FULL_GI overlay when Diagnostic Output changes', async () => {
    const compatible = structuredClone(diagnostic);
    compatible.run_metadata.graph_ref = giFixture.graph_ref;
    compatible.run_metadata.graph_version = giFixture.graph_version;
    compatible.claim_defendibility[0].claim_id = 'C1';
    compatible.inference_step_states[0].inference_step_id = 'I1';
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Diagnostic Output' }));
    fireEvent.change(screen.getByLabelText('Cargar Diagnostic Output'), { target: { files: [artifactFile(compatible, 'compatible.json')] } });
    fireEvent.change(screen.getByLabelText('Cargar G_I'), { target: { files: [artifactFile(giFixture, 'full-gi.json')] } });
    await waitFor(() => expect(screen.getByRole('button', { name: 'Mapa estructural G_I' })).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: 'Mapa estructural G_I' }));
    expect(screen.getByRole('checkbox', { name: 'Mostrar diagnóstico' })).toBeChecked();
    expect(screen.getByText(`Def_e: ${compatible.claim_defendibility[0].def_e_value}`)).toBeInTheDocument();
    expect(screen.getByText(`Active_e: ${compatible.inference_step_states[0].active_state}`)).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Cargar Diagnostic Output'), { target: { files: [artifactFile(diagnostic, 'mismatch.json')] } });
    await waitFor(() => expect(screen.queryByRole('checkbox', { name: 'Mostrar diagnóstico' })).not.toBeInTheDocument());
    expect(screen.getByTestId('gi-structural-graph-canvas')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Cargar Diagnostic Output'), { target: { files: [artifactFile(compatible, 'compatible-again.json')] } });
    await waitFor(() => expect(screen.getByRole('checkbox', { name: 'Mostrar diagnóstico' })).toBeChecked());
  });

  it('keeps the structural map visible but blocks an ambiguous diagnostic overlay until replaced', async () => {
    const compatible = structuredClone(diagnostic);
    compatible.run_metadata.graph_ref = giFixture.graph_ref;
    compatible.run_metadata.graph_version = giFixture.graph_version;
    compatible.claim_defendibility[0].claim_id = 'C1';
    const ambiguous = structuredClone(compatible);
    ambiguous.claim_defendibility.push(structuredClone(ambiguous.claim_defendibility[0]));
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Diagnostic Output' }));
    fireEvent.change(screen.getByLabelText('Cargar Diagnostic Output'), { target: { files: [artifactFile(compatible, 'compatible-initial.json')] } });
    fireEvent.change(screen.getByLabelText('Cargar G_I'), { target: { files: [artifactFile(giFixture, 'full-gi.json')] } });
    await waitFor(() => expect(screen.getByRole('button', { name: 'Mapa estructural G_I' })).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: 'Mapa estructural G_I' }));
    expect(screen.getByRole('checkbox', { name: 'Mostrar diagnóstico' })).toBeChecked();
    fireEvent.change(screen.getByLabelText('Cargar Diagnostic Output'), { target: { files: [artifactFile(ambiguous, 'ambiguous.json')] } });
    await waitFor(() => expect(screen.queryByRole('checkbox', { name: 'Mostrar diagnóstico' })).not.toBeInTheDocument());
    expect(screen.getByTestId('gi-structural-graph-canvas')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent('Diagnostic Output contiene IDs diagnósticos duplicados');

    fireEvent.change(screen.getByLabelText('Cargar Diagnostic Output'), { target: { files: [artifactFile(compatible, 'compatible.json')] } });
    await waitFor(() => expect(screen.getByRole('checkbox', { name: 'Mostrar diagnóstico' })).toBeChecked());
    expect(screen.queryByText(/IDs diagnósticos duplicados/)).not.toBeInTheDocument();
  });

  it('keeps the previous artifact visible after schema validation fails', async () => {
    render(<App />);
    expect(screen.getByText(/PRIMARY: Legacy · QUALIS · Demo incluida/)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'SciTesis · Graph Renderer' })).toBeInTheDocument();
    expect(screen.getByText('Detalles')).toBeInTheDocument();
    expect(screen.getByLabelText('Cargar Legacy artifact')).toBeInTheDocument();
    const details = screen.getByText('Detalles').closest('details');
    expect(details).not.toHaveAttribute('open');
    fireEvent.click(screen.getByText('Detalles'));
    expect(details).toHaveAttribute('open');
    expect(screen.getByText('contract_version')).toBeInTheDocument();

    const invalid = { ...qualis, case_id: '' };
    fireEvent.change(screen.getByLabelText('Cargar Legacy artifact'), {
      target: { files: [artifactFile(invalid, 'invalid.json')] },
    });

    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('SCHEMA_VALIDATION_FAILED'));
    expect(screen.getByText(/PRIMARY: Legacy · QUALIS · Demo incluida/)).toBeInTheDocument();
    expect(screen.getByText(qualis.case_id)).toBeInTheDocument();
  });

  it('replaces the artifact and clears a previous error after a later valid load', async () => {
    render(<App />);
    const input = screen.getByLabelText('Cargar Legacy artifact');

    fireEvent.change(input, {
      target: { files: [artifactFile({ ...qualis, case_id: '' }, 'invalid.json')] },
    });
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('SCHEMA_VALIDATION_FAILED'));

    const valid = { ...qualis, case_id: 'QUALIS-RELOADED', execution_id: 'EXEC-RELOADED' };
    fireEvent.change(input, { target: { files: [artifactFile(valid, 'valid.json')] } });

    await waitFor(() => expect(screen.getByText(/PRIMARY: Legacy · valid.json/)).toBeInTheDocument());
    expect(screen.getByText('QUALIS-RELOADED')).toBeInTheDocument();
    expect(screen.getByText('EXEC-RELOADED')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('preserves the previous artifact when schema passes but the adapter rejects a missing endpoint', async () => {
    render(<App />);
    const broken = structuredClone(qualis);
    broken.relations[0].source_id = 'MISSING-ENDPOINT';

    fireEvent.change(screen.getByLabelText('Cargar Legacy artifact'), {
      target: { files: [artifactFile(broken, 'missing-endpoint.json')] },
    });

    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('ADAPTER_REJECTED_ARTIFACT'));
    expect(screen.getByRole('alert')).toHaveTextContent('missing endpoint');
    expect(screen.getByText(/PRIMARY: Legacy · QUALIS · Demo incluida/)).toBeInTheDocument();
    expect(screen.getByText(qualis.case_id)).toBeInTheDocument();
  });

  it('loads G_I and G_D independently and opens a read-only auxiliary inspector', async () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Diagnostic Output' }));
    expect(screen.getByLabelText('Cargar G_I')).toBeInTheDocument();
    expect(screen.getByLabelText('Cargar G_D')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Cargar G_I'), { target: { files: [artifactFile(gi, 'gi.json')] } });
    fireEvent.change(screen.getByLabelText('Cargar G_D'), { target: { files: [artifactFile(gd, 'gd.json')] } });
    await waitFor(() => expect(screen.getAllByText('LOADED_COMPATIBLE')).toHaveLength(2));
    fireEvent.click(screen.getByRole('button', { name: /STEP_TO_TARGET de transition:/ }));
    expect(screen.getByRole('region', { name: 'Provenance refs' })).toHaveTextContent('RESOLVED');
    expect(screen.getByRole('region', { name: 'Provenance refs' })).toHaveTextContent('GI');
    fireEvent.click(screen.getByRole('button', { name: 'Inspeccionar referencia provenance-1' }));
    expect(screen.getByRole('heading', { name: 'AUXILIARY REFERENCE' })).toBeInTheDocument();
    expect(screen.getAllByText('graph-minimal').length).toBeGreaterThan(0);
    expect(screen.getByText('Explicit structural provenance')).toBeInTheDocument();
    expect(screen.queryByText('ID: claim-extra')).not.toBeInTheDocument();
  });

  it('shows mismatch, keeps literal refs, and removing one auxiliary preserves the other', async () => {
    render(<App />); fireEvent.click(screen.getByRole('button', { name: 'Diagnostic Output' }));
    fireEvent.change(screen.getByLabelText('Cargar G_I'), { target: { files: [artifactFile(gi, 'gi.json')] } });
    fireEvent.change(screen.getByLabelText('Cargar G_D'), { target: { files: [artifactFile(gdMismatch, 'gd-mismatch.json')] } });
    await waitFor(() => expect(screen.getByText('LOADED_MISMATCH')).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: 'Inspeccionar trazabilidad del run' }));
    expect(screen.getByRole('region', { name: 'Diagnostic condition refs' })).toHaveTextContent('condition-1');
    expect(screen.getByRole('region', { name: 'Diagnostic condition refs' })).toHaveTextContent('AUXILIARY_MISMATCH');
    fireEvent.click(screen.getByRole('button', { name: 'Quitar G_I' }));
    expect(screen.getByText('G_I: NOT_LOADED')).toBeInTheDocument();
    expect(screen.getByText('LOADED_MISMATCH')).toBeInTheDocument();
    expect(screen.getByText('ID: claim-supported')).toBeInTheDocument();
  });

  it('routes each primary input only to its explicitly selected contract and preserves the prior valid artifact', async () => {
    render(<App />);
    fireEvent.change(screen.getByLabelText('Cargar Legacy artifact'), { target: { files: [artifactFile(diagnostic, 'diagnostic-renamed.json')] } });
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Legacy Confirmed Simulated Graph'));
    expect(screen.getByText(/QUALIS · Demo incluida/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Diagnostic Output' }));
    fireEvent.change(screen.getByLabelText('Cargar Diagnostic Output'), { target: { files: [artifactFile(qualis, 'banana.json')] } });
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Diagnostic Output: schema validation failed'));
    expect(screen.getByText('ID: claim-supported')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Diagnostic Output' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('loads a real Diagnostic Output file and keeps independent primary state across mode changes', async () => {
    render(<App />);
    const changedLegacy = { ...qualis, case_id: 'LEGACY-A' };
    fireEvent.change(screen.getByLabelText('Cargar Legacy artifact'), { target: { files: [artifactFile(changedLegacy, 'legacy-a.json')] } });
    await waitFor(() => expect(screen.getByText(/legacy-a.json/)).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: 'Diagnostic Output' }));
    const changedDiagnostic = structuredClone(diagnostic);
    changedDiagnostic.run_metadata.run_id = 'RUN-FROM-FILE';
    fireEvent.change(screen.getByLabelText('Cargar Diagnostic Output'), { target: { files: [artifactFile(changedDiagnostic, 'banana.json')] } });
    await waitFor(() => expect(screen.getByText(/banana.json/)).toBeInTheDocument());
    fireEvent.click(screen.getByText('Detalles'));
    expect(screen.getByText('RUN-FROM-FILE')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Legacy' }));
    expect(screen.getByText(/legacy-a.json/)).toBeInTheDocument();
    expect(screen.getByText('LEGACY-A')).toBeInTheDocument();
  });

  it('keeps valid primaries after malformed JSON and never exposes auxiliaries in Legacy mode', async () => {
    render(<App />);
    expect(screen.queryByLabelText('Cargar G_I')).not.toBeInTheDocument();
    const malformed = { name: 'broken.json', size: 2, text: vi.fn().mockResolvedValue('{') };
    fireEvent.change(screen.getByLabelText('Cargar Legacy artifact'), { target: { files: [malformed] } });
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('INVALID_JSON'));
    expect(screen.getByText(/QUALIS · Demo incluida/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Diagnostic Output' }));
    expect(screen.getByLabelText('Cargar G_I')).toBeInTheDocument();
  });

  it('reclassifies retained auxiliaries for a new output and preserves them after a failed load', async () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Diagnostic Output' }));
    fireEvent.change(screen.getByLabelText('Cargar G_I'), { target: { files: [artifactFile(gi, 'gi.json')] } });
    fireEvent.change(screen.getByLabelText('Cargar G_D'), { target: { files: [artifactFile(gd, 'gd.json')] } });
    await waitFor(() => expect(screen.getAllByText('LOADED_COMPATIBLE')).toHaveLength(2));

    const invalidFullGi = structuredClone(gi);
    invalidFullGi.relations[0].source_id = 'missing-source';
    fireEvent.change(screen.getByLabelText('Cargar G_I'), { target: { files: [artifactFile(invalidFullGi, 'bad-gi.json')] } });
    await waitFor(() => expect(screen.getByText(/carga nueva fallida: INVALID_GI_ARTIFACT/)).toBeInTheDocument());
    expect(screen.getAllByText('LOADED_COMPATIBLE')).toHaveLength(2);

    fireEvent.change(screen.getByLabelText('Cargar G_I'), { target: { files: [artifactFile(gi, 'gi-reloaded.json')] } });
    await waitFor(() => expect(screen.queryByText(/carga nueva fallida: INVALID_GI_ARTIFACT/)).not.toBeInTheDocument());
    expect(screen.getByText(/G_I:.*gi-reloaded\.json/)).toBeInTheDocument();

    const other = structuredClone(diagnostic);
    other.run_metadata.graph_ref = 'other-graph';
    other.run_metadata.diagnostic_graph_ref = 'other-diagnostic-graph';
    fireEvent.change(screen.getByLabelText('Cargar Diagnostic Output'), { target: { files: [artifactFile(other, 'other.json')] } });
    await waitFor(() => expect(screen.getAllByText('LOADED_MISMATCH')).toHaveLength(2));
    fireEvent.change(screen.getByLabelText('Cargar Diagnostic Output'), { target: { files: [artifactFile(diagnostic, 'original.json')] } });
    await waitFor(() => expect(screen.getAllByText('LOADED_COMPATIBLE')).toHaveLength(2));
  });

  it('imports PILOT-R01 through App and exposes its mixed states and empty frontier inspectors', async () => {
    render(<App />);
    await loadPilot();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    fireEvent.click(screen.getByText('Detalles'));
    expect(screen.getByText('PILOT-R01-RUN-001')).toBeInTheDocument();
    expect(screen.getByText('ID: C1')).toBeInTheDocument();
    expect(screen.getByText('Def_e: TRUE')).toBeInTheDocument();
    expect(screen.getAllByText('Def_e: UNKNOWN')).toHaveLength(3);
    expect(screen.getAllByText('Def_e: FALSE')).toHaveLength(2);
    expect(screen.getByText('Active_e: ACTIVE')).toBeInTheDocument();
    expect(screen.getAllByText('Active_e: INACTIVE')).toHaveLength(2);
    expect(screen.getAllByText('Active_e: UNKNOWN')).toHaveLength(3);
    expect(screen.queryByText('Frontier member')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Inspeccionar defendability frontier' }));
    const frontier = screen.getByRole('heading', { name: 'DEFENDABILITY FRONTIER' }).closest('aside');
    expect(frontier).toHaveTextContent('Member claim IDs[]');
    expect(frontier).toHaveTextContent('Frontier cardinality0');
    expect(frontier).toHaveTextContent('Frontier statusREVIEW_REQUIRED');

    fireEvent.click(screen.getByRole('button', { name: 'Inspeccionar breakpoint BP-R01-AGE' }));
    expect(screen.getByRole('heading', { name: 'BREAKPOINT' }).closest('aside')).toHaveTextContent('GD-R01-AGE-CONDITION');
    fireEvent.click(screen.getByRole('button', { name: /Inspeccionar downstream effect downstream:BP-R01-AGE:C4:0/ }));
    const downstream = screen.getByRole('heading', { name: 'DOWNSTREAM EFFECT' }).closest('aside');
    expect(downstream).toHaveTextContent('Target claim IDC4');
    expect(downstream).toHaveTextContent('Affected stateAFFECTED');
    expect(downstream).toHaveTextContent('Materialized downstream effect from BP-R01-AGE.');
  });

  it('routes PILOT-R01 by selected contract rather than filename and exposes literal unresolved traces', async () => {
    render(<App />);
    await loadPilot('anything.json');
    expect(screen.getByText(/PRIMARY: Diagnostic Output · anything.json/)).toBeInTheDocument();
    expect(screen.getByText('ID: C1')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /STEP_TO_TARGET de transition:GI-R01-PROV-C1:I1:C1:0/ }));
    const refs = screen.getByRole('region', { name: 'Provenance refs' });
    expect(refs).toHaveTextContent('GI-R01-PROV-C1');
    expect(refs).toHaveTextContent('UNRESOLVED');
    fireEvent.click(screen.getByRole('button', { name: 'Inspeccionar review required item review:RR-R01-EMPATHY' }));
    expect(screen.getByText('Empathy scoring requires human review.')).toBeInTheDocument();
  });

  it('loads PILOT auxiliaries through file inputs, resolves their refs, and removal restores unresolved', async () => {
    render(<App />);
    await loadPilot();
    fireEvent.change(screen.getByLabelText('Cargar G_I'), { target: { files: [artifactFile(pilotGi, 'gi-pilot.json')] } });
    fireEvent.change(screen.getByLabelText('Cargar G_D'), { target: { files: [artifactFile(pilotGd, 'gd-pilot.json')] } });
    await waitFor(() => expect(screen.getAllByText('LOADED_COMPATIBLE')).toHaveLength(2));
    fireEvent.click(screen.getByRole('button', { name: /STEP_TO_TARGET de transition:GI-R01-PROV-C1:I1:C1:0/ }));
    const refs = screen.getByRole('region', { name: 'Provenance refs' });
    expect(refs).toHaveTextContent('RESOLVED');
    expect(refs).toHaveTextContent('GI');
    fireEvent.click(screen.getByRole('button', { name: 'Inspeccionar referencia GI-R01-PROV-C1' }));
    expect(screen.getByRole('heading', { name: 'AUXILIARY REFERENCE' }).closest('aside')).toHaveTextContent('SIMULATED-PROVISIONAL-R01-RUN-001-GI-v1');
    fireEvent.click(screen.getByRole('button', { name: 'Quitar G_I' }));
    expect(refs).toHaveTextContent('UNRESOLVED');
    expect(screen.getByText('ID: C1')).toBeInTheDocument();
  });
});

it('imports the integration-rich pair and fail-closes then restores overlay state on version mismatch', async () => {
  const richGi = (await import('./diagnostic/fixtures/integration-rich/gi-full-integration-rich.json')).default;
  const richDiagnostic = (await import('./diagnostic/fixtures/integration-rich/diagnostic-output-v0.1.2-integration-rich.json')).default;
  render(<App />);
  fireEvent.click(screen.getByRole('button', { name: 'Diagnostic Output' }));
  fireEvent.change(screen.getByLabelText('Cargar Diagnostic Output'), { target: { files: [artifactFile(richDiagnostic, 'integration-rich-diagnostic.json')] } });
  fireEvent.change(screen.getByLabelText('Cargar G_I'), { target: { files: [artifactFile(richGi, 'integration-rich-gi.json')] } });
  await waitFor(() => expect(screen.getByRole('button', { name: 'Mapa estructural G_I' })).toBeInTheDocument());
  fireEvent.click(screen.getByRole('button', { name: 'Mapa estructural G_I' }));
  expect(screen.getByText(/Overlay diagnóstico exact-ID disponible/)).toBeInTheDocument();
  expect(screen.getByRole('status')).toHaveTextContent('30/30 nodos · 36/36 relaciones · 4 conectores diagnósticos visibles');
  const mismatch = structuredClone(richDiagnostic);
  mismatch.run_metadata.graph_version = '2.0';
  fireEvent.change(screen.getByLabelText('Cargar Diagnostic Output'), { target: { files: [artifactFile(mismatch, 'integration-rich-mismatch.json')] } });
  await waitFor(() => expect(screen.queryByRole('checkbox', { name: 'Mostrar diagnóstico' })).not.toBeInTheDocument());
  expect(screen.getByTestId('gi-structural-graph-canvas')).toBeInTheDocument();
  expect(screen.queryAllByRole('button', { name: /Inspeccionar conector diagnóstico/ })).toHaveLength(0);
  fireEvent.change(screen.getByLabelText('Cargar Diagnostic Output'), { target: { files: [artifactFile(richDiagnostic, 'integration-rich-compatible-again.json')] } });
  await waitFor(() => expect(screen.getByRole('checkbox', { name: 'Mostrar diagnóstico' })).toBeChecked());
  expect(screen.getAllByRole('button', { name: /Inspeccionar conector diagnóstico/ })).toHaveLength(4);
});
