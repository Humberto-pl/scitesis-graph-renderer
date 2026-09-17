import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import minimalFixture from '../diagnostic/fixtures/diagnostic-output-v0.1.2-minimal-valid.json';
import { adaptDiagnosticGraphForRender } from '../diagnostic/diagnosticGraphRenderAdapter';
import { buildDiagnosticGraphViewModel } from '../diagnostic/diagnosticGraphViewModel';
import { loadDiagnosticOutput } from '../diagnostic/diagnosticOutputLoader';
import { DiagnosticGraphRenderer } from './DiagnosticGraphRenderer';

describe('DiagnosticGraphRenderer', () => {
  it('renders canonical claim and inference fields without collapsing UNKNOWN and REVIEW_REQUIRED', () => {
    const model = adaptDiagnosticGraphForRender(buildDiagnosticGraphViewModel(loadDiagnosticOutput(minimalFixture)));
    render(<DiagnosticGraphRenderer model={model} />);
    expect(screen.getByText('CLAIM')).toBeInTheDocument();
    expect(screen.getByText('INFERENCE STEP')).toBeInTheDocument();
    expect(screen.getByText('ID: claim-minimal')).toBeInTheDocument();
    expect(screen.getByText('ID: step-minimal')).toBeInTheDocument();
    expect(screen.getByText('Def_e: UNKNOWN')).toBeInTheDocument();
    expect(screen.getByText('Active_e: UNKNOWN')).toBeInTheDocument();
    expect(screen.getAllByText('Status: REVIEW_REQUIRED')).toHaveLength(2);
  });
});
