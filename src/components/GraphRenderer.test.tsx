import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { fixtures } from '../fixtures/cases';
import { buildDiagnosticGraphViewModel } from '../graph/adapter';
import { GraphRenderer } from './GraphRenderer';
describe('GraphRenderer',()=>{
  it.each(['C34','C30','C36','ADV-WI01-15'])('renders %s without errors',id=>{render(<GraphRenderer model={buildDiagnosticGraphViewModel(fixtures[id].candidate,fixtures[id].diagnosis)}/>);expect(screen.getByTestId('graph-canvas')).toBeInTheDocument();expect(screen.getByTitle('Fit view')).toBeInTheDocument()});
  it('selects, filters, and collapses nodes',()=>{render(<GraphRenderer model={buildDiagnosticGraphViewModel(fixtures.C34.candidate,fixtures.C34.diagnosis)}/>);fireEvent.click(screen.getByText('Mejora el outcome A'));expect(screen.getByText('C34-C09-S1')).toBeInTheDocument();fireEvent.click(screen.getByLabelText('Alternar C34-C09'));expect(screen.queryByText('Mejora el outcome A')).not.toBeInTheDocument();fireEvent.click(screen.getByLabelText('EVIDENCE'));expect(screen.getByLabelText('EVIDENCE')).not.toBeChecked();fireEvent.click(screen.getByLabelText('Solo claims problemáticos'));expect(screen.getByLabelText('Solo claims problemáticos')).toBeChecked()});
});
